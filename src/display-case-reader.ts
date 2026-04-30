/// <reference path="../shims.d.ts" />
import * as a1lib from "alt1/base";
import * as OCR from "alt1/ocr";
import { normalize, OPTIONS_MAP } from "./quiz-data";

const font12 = require("alt1/fonts/aa_12px_mono") as OCR.FontDefinition;
const font10 = require("alt1/fonts/aa_10px_mono") as OCR.FontDefinition;
const font9allcaps = require("alt1/fonts/aa_9px_mono_allcaps") as OCR.FontDefinition;
const font8allcaps = require("alt1/fonts/aa_8px_mono_allcaps") as OCR.FontDefinition;
const font8mono = require("alt1/fonts/aa_8px_mono") as OCR.FontDefinition;

// Right half of screen center — the Display Case text panel (question + options) is always
// on the right side of the window. Starting at 46% skips the creature display on the left.
const SCAN_X_FRAC = 0.46;
const SCAN_W_FRAC = 0.18;
const SCAN_Y_FRAC = 0.28;
const SCAN_H_FRAC = 0.44;

// Options text appears white/gray (~220-240,220-240,220-240) based on color diagnostic.
// Orange (~255,160,40) is the interface frame/border, not the text itself.
const COLORS: OCR.ColortTriplet[] = [
    [255, 255, 255],
    [220, 220, 220],
    [200, 200, 200],
    [240, 240, 240],
    [255, 160, 40],
    [255, 144, 20],
];

// Noise-only strings returned by OCR when it finds bright pixels but no char match
const NOISE_RE = /^[*!\s]+$/;

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

    logTopColors(buf, capX, capY);
    logRowProfile(buf, capX, capY);

    for (const font of [font12, font10, font9allcaps, font8allcaps, font8mono]) {
        for (const color of COLORS) {
            const result = tryFont(buf, font, color, capX, capY, capW, capH);
            if (result) return result;
        }
    }
    return null;
}

let _lastColorLog = 0;

function logTopColors(buf: ImageData, capX: number, capY: number) {
    const now = Date.now();
    if (now - _lastColorLog < 5000) return;
    _lastColorLog = now;

    const buckets = new Map<string, number>();
    const data = buf.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r < 180 && g < 180 && b < 180) continue;
        const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const top = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    console.log(`[NHQ-DC] Bright pixel colors (capX=${capX},capY=${capY}):`, top.map(([k, n]) => `${k}×${n}`).join("  "));
}

// Log which rows have clusters of pixels — finds where the option text lines are.
function logRowProfile(buf: ImageData, capX: number, capY: number) {
    try {
        const W = buf.width;
        const H = buf.height;
        const data = buf.data;

        interface RowInfo { y: number; count: number; minX: number; maxX: number; }
        const grayInfo: RowInfo[] = [];
        const orangeInfo: RowInfo[] = [];

        for (let y = 0; y < H; y++) {
            let gray = 0, orange = 0, gMinX = W, gMaxX = 0, oMinX = W, oMaxX = 0;
            for (let x = 0; x < W; x++) {
                const i = (y * W + x) * 4;
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const isGray = r > 140 && g > 140 && b > 140 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
                const isOrange = r > 200 && g > 100 && g < 200 && b < 80;
                if (isGray) { gray++; gMinX = Math.min(gMinX, x); gMaxX = Math.max(gMaxX, x); }
                if (isOrange) { orange++; oMinX = Math.min(oMinX, x); oMaxX = Math.max(oMaxX, x); }
            }
            if (gray >= 2) grayInfo.push({ y: capY + y, count: gray, minX: capX + gMinX, maxX: capX + gMaxX });
            if (orange >= 4) orangeInfo.push({ y: capY + y, count: orange, minX: capX + oMinX, maxX: capX + oMaxX });
        }

        // Top 20 rows by pixel count (text rows have ~5-10px, frame has 40-77px)
        const topGray = grayInfo.sort((a, b) => b.count - a.count).slice(0, 20);
        const topOrange = orangeInfo.sort((a, b) => b.count - a.count).slice(0, 20);

        console.log("[NHQ-DC] Top gray rows:", topGray.map(r => `y=${r.y}(${r.count}px,x=${r.minX}-${r.maxX})`).join(" ") || "(none)");
        console.log("[NHQ-DC] Top orange rows:", topOrange.map(r => `y=${r.y}(${r.count}px,x=${r.minX}-${r.maxX})`).join(" ") || "(none)");
    } catch (e) {
        console.log("[NHQ-DC] logRowProfile error:", e);
    }
}

function tryFont(
    buf: ImageData,
    font: OCR.FontDefinition,
    color: OCR.ColortTriplet,
    capX: number,
    capY: number,
    capW: number,
    capH: number,
): DisplayCaseResult | null {
    const lines: Array<{ text: string; localY: number; x0: number; x1: number }> = [];

    // Step through every possible text baseline in the scan region.
    // Using font.height as step size gives full coverage with no gaps.
    for (
        let ly = font.basey;
        ly < capH - (font.height - font.basey);
        ly += font.height
    ) {
        const r = OCR.findReadLine(buf, font, [color], 0, ly, capW - font.width, font.height);
        if (!r || !r.text.trim() || NOISE_RE.test(r.text)) continue;

        const frags = r.fragments;
        const x0 = frags.length > 0 ? frags[0].xstart : 0;
        const x1 = frags.length > 0 ? frags[frags.length - 1].xend : x0 + 60;
        lines.push({ text: r.text.trim(), localY: ly, x0, x1 });
    }

    if (lines.length === 0) return null;

    // Sliding window: any 3 consecutive lines that form a known option triplet
    for (let i = 0; i <= lines.length - 3; i++) {
        const triplet = [lines[i], lines[i + 1], lines[i + 2]];
        const key = triplet.map(l => normalize(l.text)).sort().join("|");
        const answer = OPTIONS_MAP.get(key);
        if (!answer) continue;

        console.log(`[NHQ-DC] Match! answer="${answer}"`, triplet.map(l => `"${l.text}"`));
        return {
            answer,
            lineHeight: font.height,
            options: triplet.map(l => ({
                text: l.text,
                screenX: capX + l.x0,
                screenY: capY + l.localY - font.basey,
                screenW: Math.max(l.x1 - l.x0 + 10, 60),
            })),
        };
    }

    // Force to string so the console doesn't show a lazy Array(N) reference
    const lineStr = lines.map(l => `"${l.text}" @y=${capY + l.localY - font.basey} x=${capX + l.x0}-${capX + l.x1}`).join(", ");
    console.log(`[NHQ-DC] ${lines.length} line(s), no triplet match (font.h=${font.height} color=${color}): ${lineStr}`);
    return null;
}
