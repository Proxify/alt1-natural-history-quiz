/// <reference path="../shims.d.ts" />
import DialogReader from "alt1/dialog";
import type { DialogButton } from "alt1/dialog";
import * as a1lib from "alt1/base";
import { normalize, OPTIONS_MAP, QUESTION_MAP } from "./quiz-data";

const reader = new DialogReader();

export interface QuizMatch {
    answer: string;
    button: DialogButton | null;
}

export function scanForQuiz(img: a1lib.ImgRef): QuizMatch | null {
    const pos = reader.find(img);
    if (!pos) return null;

    const result = reader.read(img);
    if (!result) return null;

    if (result.opts && result.opts.length >= 2) {
        const answer = matchOptions(result.opts.map(o => o.text));
        if (!answer) return null;
        const button = result.opts.find(b => normalize(b.text) === normalize(answer)) ?? null;
        return { answer, button };
    }

    if (result.text) {
        for (const line of result.text) {
            const answer = QUESTION_MAP.get(normalize(line));
            if (answer) return { answer, button: null };
        }
    }

    return null;
}

function matchOptions(texts: string[]): string | null {
    const key = texts.map(normalize).sort().join("|");
    return OPTIONS_MAP.get(key) ?? null;
}
