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

const SCAN_X_FRAC = 0.60;
const SCAN_W_FRAC = 0.30;
const SCAN_Y_FRAC = 0.28;
const SCAN_H_FRAC = 0.60;

// Text is pure white (confirmed rgb(255,255,255) from diagnostic).
// Include orange/gold for frame elements that might bleed into text area.
const COLORS: OCR.ColortTriplet[] = [
    [255, 255, 255],
    [240, 240, 240],
    [220, 220, 220],
    [200, 200, 200],
    [180, 180, 180],
    [255, 200, 0],
    [255, 160, 40],
    [240, 200, 120],
];

const ALL_FONTS: OCR.FontDefinition[] = [
    cbFont22, cbFont20, cbFont18, cbFont16, cbFont14, cbFont12, cbFont10,
    font12, font10, font9allcaps, font8allcaps, font8mono, font8,
];

const NOISE_RE = /^[*!\s]+$/;

// Options are THREE STACKED VERTICAL buttons (confirmed from pixel data).
// capY = floor(1106 * 0.28) = 309.
// Option 1 text: screen y=854-870 → local y=545-561. Scan ly=533-573.
// Option 2 text: screen y=892-916 → local y=583-607. Scan ly=571-617.
// Option 3 text: screen y=928-952 → local y=619-643. Scan ly=607-655.
const ROW_BANDS = [
    { ly0: 533, ly1: 573 },
    { ly0: 571, ly1: 617 },
    { ly0: 607, ly1: 655 },
];

// Space-insensitive fallback: "Hard shell" → "hardshell" is still unique in the quiz.
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

    return scanOptionRows(buf, capX, capY, capW);
}

// CandidateLine: a non-noise text found at a specific scan position.
interface CandidateLine {
    text: string;
    ly: number;
    font: OCR.FontDefinition;
    frags: OCR.TextFragment[];
}

function scanOptionRows(buf: ImageData, capX: number, capY: number, capW: number): DisplayCaseResult | null {
    // For each of the 3 known row bands, collect candidate texts from all fonts × colors.
    const perRow: CandidateLine[][] = [[], [], []];

    for (const font of ALL_FONTS) {
        const maxW = Math.max(capW - font.width, 1);
        for (const color of COLORS) {
            for (let rowIdx = 0; rowIdx < ROW_BANDS.length; rowIdx++) {
                const { ly0, ly1 } = ROW_BANDS[rowIdx];
                for (let ly = ly0; ly <= ly1; ly++) {
                    const r = OCR.findReadLine(buf, font, [color], 0, ly, maxW, font.height);
                    if (!r || !r.text.trim() || NOISE_RE.test(r.text) || r.text.trim().length < 2) continue;
                    const t = r.text.trim();
                    // Deduplicate by text string within this row.
                    if (perRow[rowIdx].some(c => c.text === t)) continue;
                    perRow[rowIdx].push({ text: t, ly, font, frags: r.fragments });
                }
            }
        }
    }

    // Log what was found in each row band (throttled externally by logDiagnostics).
    for (let i = 0; i < perRow.length; i++) {
        if (perRow[i].length > 0) {
            console.log(`[NHQ-DC] Row${i + 1} candidates:`, perRow[i].map(c => `"${c.text}"(ly=${capY + c.ly},h=${c.font.height})`).join("  "));
        }
    }

    // Try every combination of (row0 candidate, row1 candidate, row2 candidate).
    for (const c0 of perRow[0]) {
        for (const c1 of perRow[1]) {
            for (const c2 of perRow[2]) {
                const texts = [c0.text, c1.text, c2.text];
                const answer = tryMatch(texts);
                if (answer) {
                    console.log(`[NHQ-DC] MATCH! "${answer}": "${texts.join('" | "')}"`);
                    return buildResult(answer, [c0, c1, c2], capX, capY, capW);
                }
            }
        }
    }

    // Also try pairs (in case one row had no candidates) — scan question area.
    const byQuestion = scanQuestionArea(buf, capX, capY, capW);
    if (byQuestion) return byQuestion;

    return null;
}

function tryMatch(texts: string[]): string | null {
    const normed = texts.map(normalize);
    const key = [...normed].sort().join("|");
    const answer = OPTIONS_MAP.get(key);
    if (answer) return answer;

    const nsKey = texts.map(t => normalize(t).replace(/\s+/g, "")).sort().join("|");
    return NOSPACE_MAP.get(nsKey) ?? null;
}

function buildResult(
    answer: string,
    lines: CandidateLine[],
    capX: number,
    capY: number,
    capW: number,
): DisplayCaseResult {
    const normAnswer = normalize(answer);
    return {
        answer,
        lineHeight: lines[0].font.height,
        options: lines.map(line => {
            const xstart = line.frags.length > 0 ? line.frags[0].xstart : 0;
            const xend = line.frags.length > 0 ? line.frags[line.frags.length - 1].xend : capW;
            return {
                text: line.text,
                screenX: capX + xstart,
                screenY: capY + line.ly - line.font.basey,
                screenW: Math.max(xend - xstart + 10, 50),
            };
        }),
    };
}

// Secondary: try to read the question text in the upper panel → QUESTION_MAP.
// Question is at local y≈0-240. Step every 2px.
function scanQuestionArea(buf: ImageData, capX: number, capY: number, capW: number): DisplayCaseResult | null {
    for (const font of ALL_FONTS) {
        const maxW = Math.max(capW - font.width, 1);
        for (const color of COLORS) {
            for (let ly = 10; ly <= 240; ly += 2) {
                const r = OCR.findReadLine(buf, font, [color], 0, ly, maxW, font.height);
                if (!r || r.text.trim().length < 8 || NOISE_RE.test(r.text)) continue;
                const answer = QUESTION_MAP.get(normalize(r.text));
                if (answer) {
                    console.log(`[NHQ-DC] QUESTION MATCH: "${r.text}" → "${answer}" ly=${capY + ly} font.h=${font.height}`);
                    return {
                        answer,
                        lineHeight: font.height,
                        options: [{ text: answer, screenX: capX, screenY: capY + ly, screenW: capW }],
                    };
                }
                if (r.text.trim().length > 10) {
                    console.log(`[NHQ-Q] ly=${capY + ly} font.h=${font.height} col=${color}: "${r.text}"`);
                }
            }
        }
    }
    return null;
}

// ─── Diagnostics (throttled to every 8s) ─────────────────────────────────────

let _lastDiag = 0;

function logDiagnostics(buf: ImageData, capX: number, capY: number, capW: number) {
    const now = Date.now();
    if (now - _lastDiag < 8000) return;
    _lastDiag = now;

    const W = buf.width;
    const H = buf.height;
    const data = buf.data;

    // Top-8 bright color buckets across full capture.
    const buckets = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r < 150 && g < 150 && b < 150) continue;
        const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const topColors = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    console.log(`[NHQ-DC] Color buckets (capX=${capX},capY=${capY}):`, topColors.map(([k, n]) => `${k}×${n}`).join("  "));

    // Per-row bright pixel count: shows text rows vs borders.
    const rowSummary: string[] = [];
    for (let y = 0; y < H; y++) {
        let cnt = 0;
        for (let x = 0; x < Math.min(capW, W); x++) {
            const i = (y * W + x) * 4;
            if ((data[i] + data[i + 1] + data[i + 2]) / 3 > 120) cnt++;
        }
        if (cnt >= 4) rowSummary.push(`y=${capY + y}(${cnt})`);
    }
    console.log("[NHQ-DC] Bright rows (v>120):", rowSummary.join(" ") || "(none)");

    // Exact RGB of top-20 brightest pixels in each option row band.
    for (let ri = 0; ri < ROW_BANDS.length; ri++) {
        const { ly0, ly1 } = ROW_BANDS[ri];
        const samples: Array<{ v: number; r: number; g: number; b: number; sx: number; sy: number }> = [];
        for (let ly = ly0; ly <= ly1 && ly < H; ly++) {
            for (let lx = 0; lx < Math.min(capW, W); lx++) {
                const i = (ly * W + lx) * 4;
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const v = (r + g + b) / 3;
                if (v > 100) samples.push({ v, r, g, b, sx: capX + lx, sy: capY + ly });
            }
        }
        samples.sort((a, b) => b.v - a.v);
        console.log(`[NHQ-DC] Row${ri + 1} top-10 RGB:`,
            samples.slice(0, 10).map(p => `rgb(${p.r},${p.g},${p.b})@(${p.sx},${p.sy})`).join("  "));
    }
}
