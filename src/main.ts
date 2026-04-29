/// <reference path="../shims.d.ts" />
import * as a1lib from "alt1/base";
import DialogReader from "alt1/dialog";
import type { DialogButton } from "alt1/dialog";
import { normalize, QUESTION_MAP, OPTIONS_MAP } from "./quiz-data";

const STALE_DIALOG_MS = 2000;
const OVERLAY_GROUP = "nhq";
const OVERLAY_DURATION_MS = 1500;
const HIGHLIGHT_COLOR = a1lib.mixColor(0, 220, 60, 255);
const TICK_INTERVAL_MS = 600;

const reader = new DialogReader();

const state = {
	lastAnswer: null as string | null,
	lastAnswerAt: 0,
	dialogMissingAt: 0,
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

function tick() {
	if (!a1lib.hasAlt1) return;
	if (!alt1.rsLinked) {
		setStatus("RuneScape window not linked.");
		return;
	}

	const found = reader.find();
	if (!found) {
		const now = Date.now();
		if (state.dialogMissingAt === 0) state.dialogMissingAt = now;
		if (now - state.dialogMissingAt > STALE_DIALOG_MS) {
			clearOverlay();
		}
		setStatus("Watching for quiz dialog...");
		return;
	}
	state.dialogMissingAt = 0;

	const result = reader.read();
	if (!result) {
		setStatus("Dialog found but could not read.");
		return;
	}

	// Continue dialog — question is being shown
	if (result.text && result.text.length > 0) {
		const questionText = result.text.join(" ");
		const key = normalize(questionText);
		const answer = QUESTION_MAP.get(key);
		if (answer) {
			state.lastAnswer = answer;
			state.lastAnswerAt = Date.now();
			setStatus("Question detected.");
			setAnswer(answer);
		} else {
			setStatus("Watching...");
		}
		return;
	}

	// Options dialog — answer buttons visible
	if (result.opts && result.opts.length >= 2) {
		const opts = result.opts;

		// Primary: match by option triplet (stateless, robust to OCR drift on question text)
		const tripletKey = opts.map(o => normalize(o.text)).sort().join("|");
		let answer = OPTIONS_MAP.get(tripletKey) ?? state.lastAnswer;

		if (!answer) {
			setStatus("Options visible but answer not recognized.");
			return;
		}

		const normAnswer = normalize(answer);
		const target = opts.find(o => normalize(o.text) === normAnswer);

		if (target) {
			highlight(target);
			setStatus("Highlighting answer.");
			setAnswer(answer);
		} else {
			setStatus(`Could not match answer button for: ${answer}`);
		}
	}
}

function highlight(btn: DialogButton) {
	alt1.overLaySetGroup(OVERLAY_GROUP);
	alt1.overLayRect(
		HIGHLIGHT_COLOR,
		btn.buttonx,
		btn.y - 2,
		btn.width + 40,
		22,
		OVERLAY_DURATION_MS,
		2
	);
	alt1.overLayText(
		">",
		HIGHLIGHT_COLOR,
		14,
		btn.buttonx - 15,
		btn.y,
		OVERLAY_DURATION_MS
	);
}

function clearOverlay() {
	if (typeof alt1 !== "undefined") {
		alt1.overLayClearGroup(OVERLAY_GROUP);
	}
	state.lastAnswer = null;
	setAnswer(null);
}

function init() {
	const installDiv = document.getElementById("install");
	if (a1lib.hasAlt1) {
		alt1.identifyAppUrl("https://proxify.github.io/alt1-natural-history-quiz/appconfig.json");
		if (installDiv) installDiv.classList.add("hidden");
		setStatus("Watching for quiz dialog...");
		setInterval(tick, alt1.captureInterval ?? TICK_INTERVAL_MS);
	} else {
		setStatus("Open this page inside Alt1 to use it.");
	}
}

init();
