/// <reference path="../shims.d.ts" />
import * as a1lib from "alt1/base";
import { scanForQuiz, QuizMatch } from "./display-case-reader";

const STALE_MS = 2000;
const OVERLAY_GROUP = "nhq";
const OVERLAY_MS = 1500;
const HIGHLIGHT_COLOR = a1lib.mixColor(0, 220, 60, 255);
const TICK_MS = 600;

const state = {
    missingAt: 0,
};

function el(id: string): HTMLElement {
    return document.getElementById(id)!;
}

function setStatus(msg: string) {
    el("status").textContent = msg;
}

function setAnswer(text: string | null) {
    const div = el("answer");
    if (text) {
        div.textContent = "Answer: " + text;
        div.classList.add("visible");
    } else {
        div.classList.remove("visible");
    }
}

function highlightAnswer(match: QuizMatch) {
    if (!match.button) return;
    const btn = match.button;
    alt1.overLaySetGroup(OVERLAY_GROUP);
    alt1.overLayRect(
        HIGHLIGHT_COLOR,
        btn.buttonx,
        btn.y - 2,
        btn.width + 40,
        22,
        OVERLAY_MS,
        2
    );
    alt1.overLayText(
        ">",
        HIGHLIGHT_COLOR,
        14,
        btn.buttonx - 15,
        btn.y,
        OVERLAY_MS
    );
}

function clearOverlay() {
    if (typeof alt1 !== "undefined") {
        alt1.overLayClearGroup(OVERLAY_GROUP);
    }
    setAnswer(null);
}

function tick() {
    if (!a1lib.hasAlt1) return;
    if (!alt1.permissionPixel || !alt1.permissionOverlay) {
        setStatus("Not installed. Click '+ Add to Alt1' and grant permissions.");
        return;
    }
    if (!alt1.rsLinked) {
        setStatus("RuneScape window not linked. Try switching Alt1 capture mode to OpenGL.");
        return;
    }

    const img = a1lib.captureHoldFullRs();
    if (!img) {
        setStatus("Capture failed.");
        return;
    }

    const match = scanForQuiz(img);
    if (!match) {
        const now = Date.now();
        if (state.missingAt === 0) state.missingAt = now;
        if (now - state.missingAt > STALE_MS) clearOverlay();
        setStatus("Watching for dialog...");
        return;
    }

    state.missingAt = 0;
    setAnswer(match.answer);
    setStatus("Answer: " + match.answer);
    highlightAnswer(match);
}

function init() {
    const installDiv = document.getElementById("install");

    if (a1lib.hasAlt1) {
        alt1.identifyAppUrl("https://proxify.github.io/alt1-natural-history-quiz/appconfig.json");
        if (installDiv && alt1.permissionPixel) {
            installDiv.classList.add("hidden");
        }
        setStatus(alt1.permissionPixel ? "Watching for dialog..." : "Click '+ Add to Alt1' above, then grant permissions.");
        setInterval(tick, alt1.captureInterval ?? TICK_MS);
    } else {
        setStatus("Open this page inside Alt1 to use it.");
    }
}

init();
