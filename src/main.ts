/// <reference path="../shims.d.ts" />
import * as a1lib from "alt1/base";
import { normalize } from "./quiz-data";
import { scanDisplayCase, DisplayCaseResult } from "./display-case-reader";

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

function highlightOption(result: DisplayCaseResult) {
    const normAnswer = normalize(result.answer);
    const target = result.options.find(o => normalize(o.text) === normAnswer);
    if (!target) return;

    alt1.overLaySetGroup(OVERLAY_GROUP);
    alt1.overLayRect(
        HIGHLIGHT_COLOR,
        target.screenX,
        target.screenY,
        target.screenW,
        result.lineHeight,
        OVERLAY_MS,
        2
    );
    alt1.overLayText(
        ">",
        HIGHLIGHT_COLOR,
        14,
        target.screenX - 15,
        target.screenY + 2,
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

    const result = scanDisplayCase(img);
    if (!result) {
        const now = Date.now();
        if (state.missingAt === 0) {
            state.missingAt = now;
            console.log(`[NHQ] Display case not found. RS: ${img.width}x${img.height}`);
        }
        if (now - state.missingAt > STALE_MS) {
            clearOverlay();
        }
        setStatus("Watching for display case...");
        return;
    }

    state.missingAt = 0;
    setAnswer(result.answer);
    setStatus("Answer: " + result.answer);
    highlightOption(result);
}

function init() {
    const installDiv = document.getElementById("install");

    console.log("[NHQ] hasAlt1:", a1lib.hasAlt1);
    console.log("[NHQ] typeof alt1:", typeof alt1);

    if (a1lib.hasAlt1) {
        console.log("[NHQ] rsLinked:", alt1.rsLinked);
        console.log("[NHQ] version:", alt1.version);
        console.log("[NHQ] permissionPixel:", alt1.permissionPixel);
        console.log("[NHQ] permissionOverlay:", alt1.permissionOverlay);
        console.log("[NHQ] permissionGameState:", alt1.permissionGameState);
        console.log("[NHQ] rsWidth:", alt1.rsWidth, "rsHeight:", alt1.rsHeight);
        alt1.identifyAppUrl("https://proxify.github.io/alt1-natural-history-quiz/appconfig.json");
        if (installDiv && alt1.permissionPixel) {
            installDiv.classList.add("hidden");
        }
        setStatus(alt1.permissionPixel ? "Watching for display case..." : "Click '+ Add to Alt1' above, then grant permissions.");
        setInterval(tick, alt1.captureInterval ?? TICK_MS);
    } else {
        setStatus("Open this page inside Alt1 to use it.");
    }
}

init();
