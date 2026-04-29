/// <reference path="../shims.d.ts" />
import * as a1lib from "alt1/base";
import * as OCR from "alt1/ocr";
import { normalize, OPTIONS_MAP } from "./quiz-data";

const font12 = require("alt1/fonts/aa_12px_mono") as OCR.FontDefinition;
const font10 = require("alt1/fonts/aa_10px_mono") as OCR.FontDefinition;

// Center region of screen — Display Case window always appears here.
// 25% width × 35% height scan; adjust if users have moved the window far off-center.
const SCAN_X_FRAC = 0.38;
const SCAN_W_FRAC = 0.26;
const SCAN_Y_FRAC = 0.28;
const SCAN_H_FRAC = 0.44;

// White and slightly-warm-white — RS3 interface text is one of these
const COLORS: OCR.ColortTriplet[] = [
    [255, 255, 255],
    [240, 225, 205],
];

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

    for (const font of [font12, font10]) {
        for (const color of COLORS) {
            const result = tryFont(buf, font, color, capX, capY, capW, capH);
            if (result) return result;
        }
    }
    return null;
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
        if (!r || !r.text.trim()) continue;

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

    console.log(
        `[NHQ-DC] ${lines.length} line(s) found but no triplet match`,
        `(font.h=${font.height} color=${color}):`,
        lines.map(l => `"${l.text}"`),
    );
    return null;
}
