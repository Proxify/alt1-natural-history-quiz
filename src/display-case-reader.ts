/// <reference path="../shims.d.ts" />
import * as a1lib from "alt1/base";
import * as OCR from "alt1/ocr";
import { normalize, OPTIONS_MAP, QUESTION_MAP, QUIZ_DATA } from "./quiz-data";

const font12 = require("alt1/fonts/aa_12px_mono") as OCR.FontDefinition;
const font10 = require("alt1/fonts/aa_10px_mono") as OCR.FontDefinition;
const font9allcaps = require("alt1/fonts/aa_9px_mono_allcaps") as OCR.FontDefinition;
const font8allcaps = require("alt1/fonts/aa_8px_mono_allcaps") as OCR.FontDefinition;
const font8mono = require("alt1/fonts/aa_8px_mono") as OCR.FontDefinition;
const font8 = require("alt1/fonts/aa_8px") as OCR.FontDefinition;
const cbFont22 = require("alt1/fonts/chatbox/22pt") as OCR.FontDefinition;
const cbFont20 = require("alt1/fonts/chatbox/20pt") as OCR.FontDefinition;
const cbFont18 = require("alt1/fonts/chatbox/18pt") as OCR.FontDefinition;
const cbFont16 = require("alt1/fonts/chatbox/16pt") as OCR.FontDefinition;
const cbFont14 = require("alt1/fonts/chatbox/14pt") as OCR.FontDefinition;
const cbFont12 = require("alt1/fonts/chatbox/12pt") as OCR.FontDefinition;
const cbFont10 = require("alt1/fonts/chatbox/10pt") as OCR.FontDefinition;

// Capture the full right panel (past the vertical divider at ~60% width).
const SCAN_X_FRAC = 0.60;
const SCAN_W_FRAC = 0.30;
const SCAN_Y_FRAC = 0.28;
const SCAN_H_FRAC = 0.60;

// All color candidates — white/gray range + orange + warm gold.
const COLORS: OCR.ColortTriplet[] = [
    [255, 255, 255],
    [240, 240, 240],
    [220, 220, 220],
    [200, 200, 200],
    [180, 180, 180],
    [255, 160, 40],
    [255, 144, 20],
    [240, 200, 120],
    [200, 180, 140],
    [160, 140, 100],
];

const ALL_FONTS: OCR.FontDefinition[] = [
    cbFont22, cbFont20, cbFont18, cbFont16, cbFont14, cbFont12, cbFont10,
    font12, font10, font9allcaps, font8allcaps, font8mono, font8,
];

const NOISE_RE = /^[*!\s]+$/;

// Option text confirmed at screen y≈854-870. capY≈309 → local y≈545-561.
// Scan y=510-595 (1-pixel step) to guarantee hitting any font baseline.
const OPT_LY0 = 510;
const OPT_LY1 = 595;

// Question text is in the upper portion of the DC panel (local y≈0-240).
const Q_LY0 = 10;
const Q_LY1 = 240;

// Space-insensitive OPTIONS_MAP for when fragment reassembly loses intra-word spaces.
// "Hard shell" → "hardshell" → still unique within the quiz.
const NOSPACE_MAP: Map<string, string> = new Map(
    QUIZ_DATA.map(e => [
        [e.options[0], e.options[1], e.options[2]]
            .map(o => normalize(o).replace(/\s+/g, ""))
            .sort()
            .join("|"),
        e.answer,
    ])
);

export interface DisplayCaseResult {
    answer: string;
    lineHeight: number;
    options: Array<{
        text: string;
        screenX: number;
        screenY: number;
        screenW: number;
    }>;
}

export function scanDisplayCase(img: a1lib.ImgRef): DisplayCaseResult | null {
    const sw = img.width;
    const sh = img.height;
    const capX = Math.floor(sw * SCAN_X_FRAC);
    const capY = Math.floor(sh * SCAN_Y_FRAC);
    const capW = Math.floor(sw * SCAN_W_FRAC);
    const capH = Math.floor(sh * SCAN_H_FRAC);

    const buf = img.toData(capX, capY, capW, capH);

    logDiagnostics(buf, capX, capY, capW);

    // Primary: scan option row (bottom buttons) with 1px y step.
    const byOption = scanArea(buf, capX, capY, capW, OPT_LY0, OPT_LY1, true);
    if (byOption) return byOption;

    // Secondary: scan question area to identify via QUESTION_MAP.
    const byQuestion = scanArea(buf, capX, capY, capW, Q_LY0, Q_LY1, false);
    if (byQuestion) return byQuestion;

    return null;
}

// splitByX: given a findReadLine result, split characters into 3 groups by x position.
// div1 and div2 are local-buffer x dividers between the 3 option buttons.
function splitByX(
    r: { text: string; fragments: OCR.TextFragment[] },
    div1: number,
    div2: number,
): [string, string, string] {
    const groups: [string[], string[], string[]] = [[], [], []];
    let prevFrag: OCR.TextFragment | null = null;

    for (const frag of r.fragments) {
        const btn = frag.xstart < div1 ? 0 : frag.xstart < div2 ? 1 : 2;
        const prevBtn = prevFrag === null ? -1 : prevFrag.xstart < div1 ? 0 : prevFrag.xstart < div2 ? 1 : 2;
        // If the previous char was in the same button and r.text has a space between them, add it.
        if (prevFrag !== null && btn === prevBtn && frag.index > prevFrag.index + 1) {
            groups[btn].push(" ");
        }
        groups[btn].push(frag.text);
        prevFrag = frag;
    }

    return groups.map(g => g.join("").trim()) as [string, string, string];
}

// scanArea: 1-pixel step scan through a local y range, all fonts × colors.
// isOptionArea=true → tries to split into 3 buttons and match OPTIONS_MAP.
// isOptionArea=false → reads full-width line and tries QUESTION_MAP.
function scanArea(
    buf: ImageData,
    capX: number,
    capY: number,
    capW: number,
    ly0: number,
    ly1: number,
    isOptionArea: boolean,
): DisplayCaseResult | null {
    // Option buttons span roughly the left 72% of the capture width.
    // At 1918px: capW=575, buttons at local x=0-404 → div at 135 and 270.
    const div1 = Math.floor(capW * 0.235);
    const div2 = Math.floor(capW * 0.470);
    const scanW = isOptionArea
        ? Math.floor(capW * 0.72)  // just the 3 buttons
        : capW - 5;                // full panel width

    for (const font of ALL_FONTS) {
        const maxW = Math.max(scanW - font.width, 1);
        for (const color of COLORS) {
            for (let ly = ly0; ly <= ly1; ly++) {
                const r = OCR.findReadLine(buf, font, [color], 0, ly, maxW, font.height);
                if (!r || !r.text.trim() || NOISE_RE.test(r.text)) continue;
                if (r.fragments.length < 2) continue;

                if (isOptionArea) {
                    const result = tryOptionMatch(r, font, color, ly, capX, capY, div1, div2);
                    if (result) return result;
                } else {
                    const result = tryQuestionMatch(r, font, color, ly, capX, capY, capW, div1, div2);
                    if (result) return result;
                }
            }
        }
    }
    return null;
}

function tryOptionMatch(
    r: { text: string; fragments: OCR.TextFragment[] },
    font: OCR.FontDefinition,
    color: OCR.ColortTriplet,
    ly: number,
    capX: number,
    capY: number,
    div1: number,
    div2: number,
): DisplayCaseResult | null {
    const [t0, t1, t2] = splitByX(r, div1, div2);
    const texts = [t0, t1, t2];

    // Full key (with spaces)
    const key = texts.map(normalize).sort().join("|");
    const answer = OPTIONS_MAP.get(key);
    if (answer) {
        console.log(`[NHQ-DC] MATCH key="${key}" → "${answer}" ly=${capY + ly} font.h=${font.height} col=${color}`);
        return buildResult(answer, texts, font, ly, capX, capY, div1, div2);
    }

    // Space-stripped fallback
    const nsKey = texts.map(t => normalize(t).replace(/\s+/g, "")).sort().join("|");
    const nsAnswer = NOSPACE_MAP.get(nsKey);
    if (nsAnswer) {
        console.log(`[NHQ-DC] NOSPACE MATCH nsKey="${nsKey}" → "${nsAnswer}" ly=${capY + ly} font.h=${font.height} col=${color}`);
        return buildResult(nsAnswer, texts, font, ly, capX, capY, div1, div2);
    }

    // Method 2: split r.text by double+ spaces
    const byGap = r.text.split(/\s{2,}/).map(s => s.trim()).filter(s => s.length > 1 && !NOISE_RE.test(s));
    if (byGap.length >= 3) {
        const gapKey = byGap.slice(0, 3).map(normalize).sort().join("|");
        const gapAnswer = OPTIONS_MAP.get(gapKey) ?? NOSPACE_MAP.get(
            byGap.slice(0, 3).map(t => normalize(t).replace(/\s+/g, "")).sort().join("|")
        );
        if (gapAnswer) {
            console.log(`[NHQ-DC] GAP MATCH → "${gapAnswer}" ly=${capY + ly} font.h=${font.height} col=${color}: "${byGap.slice(0, 3).join(" | ")}"`);
            return buildResult(gapAnswer, byGap.slice(0, 3), font, ly, capX, capY, div1, div2);
        }
    }

    // Log for diagnostics
    if (texts.some(t => t.length > 2) || byGap.length > 0) {
        console.log(
            `[NHQ-OPT] ly=${capY + ly} font.h=${font.height} col=${color}:`,
            `pos="${texts.join(" | ")}"`,
            byGap.length > 1 ? `gap="${byGap.join(" | ")}"` : "",
            `raw="${r.text}"`,
        );
    }

    return null;
}

function tryQuestionMatch(
    r: { text: string; fragments: OCR.TextFragment[] },
    font: OCR.FontDefinition,
    color: OCR.ColortTriplet,
    ly: number,
    capX: number,
    capY: number,
    capW: number,
    div1: number,
    div2: number,
): DisplayCaseResult | null {
    const normQ = normalize(r.text);
    const answer = QUESTION_MAP.get(normQ);
    if (answer) {
        console.log(`[NHQ-DC] QUESTION MATCH "${r.text}" → "${answer}" ly=${capY + ly} font.h=${font.height}`);
        // For a question match we don't have option positions — synthesize a result with no highlight
        // The caller will show the answer text even without a screen highlight.
        const syntheticOptions = [{ text: answer, screenX: capX, screenY: capY + ly, screenW: capW }];
        return { answer, lineHeight: font.height, options: syntheticOptions };
    }
    if (r.text.trim().length > 8 && !NOISE_RE.test(r.text)) {
        console.log(`[NHQ-Q] ly=${capY + ly} font.h=${font.height} col=${color}: "${r.text}"`);
    }
    return null;
}

function buildResult(
    answer: string,
    texts: string[],
    font: OCR.FontDefinition,
    ly: number,
    capX: number,
    capY: number,
    div1: number,
    div2: number,
): DisplayCaseResult {
    const xOffsets = [0, div1, div2];
    const btnW = div1;
    return {
        answer,
        lineHeight: font.height,
        options: texts.slice(0, 3).map((text, i) => ({
            text,
            screenX: capX + xOffsets[i],
            screenY: capY + ly - font.basey,
            screenW: btnW,
        })),
    };
}

// ─── Diagnostics ──────────────────────────────────────────────────────────────

let _lastDiag = 0;

function logDiagnostics(buf: ImageData, capX: number, capY: number, capW: number) {
    const now = Date.now();
    if (now - _lastDiag < 6000) return;
    _lastDiag = now;

    const W = buf.width;
    const H = buf.height;
    const data = buf.data;

    // Top-8 bright color buckets in the full capture area
    const buckets = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r < 150 && g < 150 && b < 150) continue;
        const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const topColors = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    console.log(`[NHQ-DC] Bright color buckets (capX=${capX},capY=${capY}):`,
        topColors.map(([k, n]) => `${k}×${n}`).join("  "));

    // Per-row bright pixel count — shows where text lives
    const rowSummary: string[] = [];
    for (let y = 0; y < H; y++) {
        let cnt = 0;
        for (let x = 0; x < Math.min(capW, W); x++) {
            const i = (y * W + x) * 4;
            if ((data[i] + data[i + 1] + data[i + 2]) / 3 > 120) cnt++;
        }
        if (cnt >= 4) rowSummary.push(`y=${capY + y}(${cnt})`);
    }
    console.log("[NHQ-DC] Rows with ≥4 bright pixels (v>120):", rowSummary.join(" ") || "(none)");

    // Exact RGB of top-20 brightest pixels in the confirmed option area (local y=510-595)
    const samples: Array<{ v: number; r: number; g: number; b: number; sx: number; sy: number }> = [];
    for (let ly = OPT_LY0; ly <= OPT_LY1 && ly < H; ly++) {
        for (let lx = 0; lx < Math.min(Math.floor(capW * 0.72), W); lx++) {
            const i = (ly * W + lx) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const v = (r + g + b) / 3;
            if (v > 100) samples.push({ v, r, g, b, sx: capX + lx, sy: capY + ly });
        }
    }
    samples.sort((a, b) => b.v - a.v);
    console.log("[NHQ-DC] Option area top-20 pixel RGB:",
        samples.slice(0, 20).map(p => `rgb(${p.r},${p.g},${p.b})@(${p.sx},${p.sy})`).join("  "));
}
