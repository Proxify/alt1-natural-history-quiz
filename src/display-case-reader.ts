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

// Options: THREE STACKED VERTICAL buttons (confirmed pixel data).
// capY ≈ floor(1106*0.28) = 309.
// Row 1 text: screen y=854-870 → local y=545-561. OCR band: 533-560.
// Row 2 text: screen y=892-916 → local y=583-607. OCR band: 577-607.
// Row 3 text: screen y=928-952 → local y=619-643. OCR band: 617-643.
const ROW_BANDS = [
    { ly0: 533, ly1: 560 },
    { ly0: 577, ly1: 607 },
    { ly0: 617, ly1: 643 },
];

// Tight bands for pixel-width measurement (exclude border rows).
const MEAS_BANDS = [
    { ly0: 545, ly1: 561 },
    { ly0: 583, ly1: 607 },
    { ly0: 619, ly1: 643 },
];

// Pure-white threshold: option text pixels are rgb(255,255,255).
// "20/820" (shadow=true chatbox font) renders at ~v=150-200, filtered by v>220.
const PW_THRESHOLD = 220;

// Space-insensitive fallback OPTIONS_MAP.
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

    // Primary: OCR scan each row band with 1px step.
    const ocrResult = scanOptionRows(buf, capX, capY, capW);
    if (ocrResult) return ocrResult;

    // Secondary: pixel-width fingerprinting against known option triplets.
    return matchByPixelWidth(buf, capX, capY, capW);
}

// ─── OCR scan ─────────────────────────────────────────────────────────────────

interface CandidateLine {
    text: string;
    ly: number;
    font: OCR.FontDefinition;
    frags: OCR.TextFragment[];
}

function scanOptionRows(buf: ImageData, capX: number, capY: number, capW: number): DisplayCaseResult | null {
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
                    if (perRow[rowIdx].some(c => c.text === t)) continue;
                    perRow[rowIdx].push({ text: t, ly, font, frags: r.fragments });
                }
            }
        }
    }

    for (let i = 0; i < perRow.length; i++) {
        if (perRow[i].length > 0)
            console.log(`[NHQ-DC] Row${i + 1} OCR:`, perRow[i].map(c => `"${c.text}"(ly=${capY + c.ly},h=${c.font.height})`).join("  "));
    }

    for (const c0 of perRow[0]) {
        for (const c1 of perRow[1]) {
            for (const c2 of perRow[2]) {
                const texts = [c0.text, c1.text, c2.text];
                const answer = tryMatch(texts);
                if (answer) {
                    console.log(`[NHQ-DC] OCR MATCH! "${answer}": "${texts.join('" | "')}"`);
                    return buildResult(answer, [c0, c1, c2], capX, capY, capW);
                }
            }
        }
    }
    return null;
}

function tryMatch(texts: string[]): string | null {
    const key = texts.map(normalize).sort().join("|");
    const ans = OPTIONS_MAP.get(key);
    if (ans) return ans;
    const nsKey = texts.map(t => normalize(t).replace(/\s+/g, "")).sort().join("|");
    return NOSPACE_MAP.get(nsKey) ?? null;
}

function buildResult(answer: string, lines: CandidateLine[], capX: number, capY: number, capW: number): DisplayCaseResult {
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

// ─── Pixel-width fingerprinting ───────────────────────────────────────────────

interface RowMeasure {
    lxMin: number;  // leftmost pure-white pixel (local x)
    lxMax: number;  // rightmost pure-white pixel (local x)
    count: number;  // total pure-white pixels
}

function measureRow(buf: ImageData, ly0: number, ly1: number, capW: number): RowMeasure {
    const W = buf.width;
    const data = buf.data;
    let lxMin = capW, lxMax = 0, count = 0;
    for (let ly = ly0; ly <= ly1 && ly < buf.height; ly++) {
        for (let lx = 0; lx < Math.min(capW, W); lx++) {
            const i = (ly * W + lx) * 4;
            const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (v > PW_THRESHOLD) {
                count++;
                if (lx < lxMin) lxMin = lx;
                if (lx > lxMax) lxMax = lx;
            }
        }
    }
    return { lxMin, lxMax, count };
}

// Estimate pixel width of a text string using cbFont14 character widths as proxy.
// The actual game font may differ in scale but proportions should be similar.
function estimateWidth(text: string): number {
    let w = 0;
    for (const ch of text) {
        if (ch === ' ') { w += cbFont14.spacewidth; continue; }
        const ci = cbFont14.chars.find((c: OCR.Charinfo) => c.chr === ch)
            ?? cbFont14.chars.find((c: OCR.Charinfo) => c.chr === ch.toLowerCase())
            ?? cbFont14.chars.find((c: OCR.Charinfo) => c.chr === ch.toUpperCase());
        w += ci ? ci.width : 8;
    }
    return w;
}

function matchByPixelWidth(buf: ImageData, capX: number, capY: number, capW: number): DisplayCaseResult | null {
    const measures = MEAS_BANDS.map(b => measureRow(buf, b.ly0, b.ly1, capW));

    // Log measurements
    console.log("[NHQ-W] Row measurements (v>220):",
        measures.map((m, i) =>
            `Row${i + 1}: x=${capX + m.lxMin}-${capX + m.lxMax}(${m.lxMax - m.lxMin}px) n=${m.count}`
        ).join("  "));

    const widths = measures.map(m => Math.max(m.lxMax - m.lxMin, 0));
    const counts = measures.map(m => m.count);
    const totW = widths.reduce((s, v) => s + v, 0);
    const totC = counts.reduce((s, v) => s + v, 0);

    if (totW < 20 || totC < 30) {
        console.log("[NHQ-W] Insufficient bright pixels — display case not open?");
        return null;
    }

    const ratW = widths.map(w => w / totW);
    const ratC = counts.map(c => c / totC);

    const perms: Array<[number, number, number]> = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    type Candidate = { answer: string; score: number; perm: number[] };
    const candidates: Candidate[] = [];

    for (const entry of QUIZ_DATA) {
        const expW = entry.options.map(o => estimateWidth(o));
        const totEW = expW.reduce((s, v) => s + v, 0);
        if (totEW === 0) continue;

        for (const perm of perms) {
            let score = 0;
            for (let ri = 0; ri < 3; ri++) {
                const oi = perm[ri];
                const dw = ratW[ri] - expW[oi] / totEW;
                // Also use count ratio (weight 0.5) as second signal
                const dc = ratC[ri] - expW[oi] / totEW;
                score += dw * dw + dc * dc * 0.5;
            }
            candidates.push({ answer: entry.answer, score, perm: [...perm] });
        }
    }

    candidates.sort((a, b) => a.score - b.score);
    const best = candidates[0];

    // Check if best is clearly better than the next different answer
    const nextDiff = candidates.find(c => c.answer !== best.answer);
    const gap = nextDiff ? nextDiff.score - best.score : 0;
    const relGap = nextDiff ? gap / nextDiff.score : 0;

    // Log top-3 distinct answers
    const top3: string[] = [];
    for (const c of candidates) {
        if (!top3.includes(c.answer)) top3.push(c.answer);
        if (top3.length >= 3) break;
    }
    console.log(`[NHQ-W] Top answers: ${top3.join(", ")} | best="${best.answer}" score=${best.score.toFixed(4)} gap=${relGap.toFixed(3)}`);

    // Only use if confidently better than alternatives
    if (relGap < 0.20) {
        console.log("[NHQ-W] Low confidence — not returning a result.");
        return null;
    }

    // Find the quiz entry that produced the best match
    const entry = QUIZ_DATA.find(e => e.answer === best.answer)!;
    const perm = best.perm;
    const optionRows = MEAS_BANDS.map((band, ri) => {
        const oi = perm[ri];
        return {
            text: entry.options[oi],
            screenX: capX + measures[ri].lxMin,
            screenY: capY + band.ly0 + Math.floor((band.ly1 - band.ly0) / 2),
            screenW: Math.max(measures[ri].lxMax - measures[ri].lxMin + 10, 50),
        };
    });

    console.log(`[NHQ-W] WIDTH MATCH: "${best.answer}"`);
    return { answer: best.answer, lineHeight: 14, options: optionRows };
}

// ─── Diagnostics ─────────────────────────────────────────────────────────────

let _lastDiag = 0;

function logDiagnostics(buf: ImageData, capX: number, capY: number, capW: number) {
    const now = Date.now();
    if (now - _lastDiag < 8000) return;
    _lastDiag = now;

    const W = buf.width;
    const H = buf.height;
    const data = buf.data;

    // Color histogram of full capture
    const buckets = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r < 150 && g < 150 && b < 150) continue;
        const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const topColors = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    console.log(`[NHQ-DC] Color buckets (capX=${capX},capY=${capY}):`,
        topColors.map(([k, n]) => `${k}×${n}`).join("  "));

    // Per-row bright pixel count
    const rowSummary: string[] = [];
    for (let y = 0; y < H; y++) {
        let cnt = 0;
        for (let x = 0; x < Math.min(capW, W); x++) {
            const i = (y * W + x) * 4;
            if ((data[i] + data[i + 1] + data[i + 2]) / 3 > 120) cnt++;
        }
        if (cnt >= 4) rowSummary.push(`y=${capY + y}(${cnt})`);
    }
    console.log("[NHQ-DC] Bright rows:", rowSummary.join(" ") || "(none)");

    // Per-row pure-white pixel count and x-extent for option area
    for (let ri = 0; ri < MEAS_BANDS.length; ri++) {
        const { ly0, ly1 } = MEAS_BANDS[ri];
        let minX = capW, maxX = 0, cnt = 0;
        for (let ly = ly0; ly <= ly1 && ly < H; ly++) {
            for (let lx = 0; lx < Math.min(capW, W); lx++) {
                const i = (ly * W + lx) * 4;
                const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (v > PW_THRESHOLD) {
                    cnt++;
                    if (lx < minX) minX = lx;
                    if (lx > maxX) maxX = lx;
                }
            }
        }
        console.log(`[NHQ-DC] Row${ri + 1} pure-white (v>220): x=${capX + minX}-${capX + maxX}(${maxX - minX}px) count=${cnt}`);
    }
}
