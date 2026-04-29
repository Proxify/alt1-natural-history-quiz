/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main.ts"
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/// <reference path="../shims.d.ts" />
const a1lib = __importStar(__webpack_require__(/*! alt1/base */ "./node_modules/alt1/dist/base/index.js"));
const dialog_1 = __importDefault(__webpack_require__(/*! alt1/dialog */ "./node_modules/alt1/dist/dialog/index.js"));
const quiz_data_1 = __webpack_require__(/*! ./quiz-data */ "./src/quiz-data.ts");
const STALE_DIALOG_MS = 2000;
const OVERLAY_GROUP = "nhq";
const OVERLAY_DURATION_MS = 1500;
const HIGHLIGHT_COLOR = a1lib.mixColor(0, 220, 60, 255);
const TICK_INTERVAL_MS = 600;
const reader = new dialog_1.default();
const state = {
    lastAnswer: null,
    lastAnswerAt: 0,
    dialogMissingAt: 0,
};
function el(id) {
    return document.getElementById(id);
}
function setStatus(msg) {
    el("status").textContent = msg;
}
function setAnswer(text) {
    const div = el("answer");
    if (text) {
        div.textContent = "Answer: " + text;
        div.classList.add("visible");
    }
    else {
        div.classList.remove("visible");
    }
}
function tick() {
    var _a;
    if (!a1lib.hasAlt1)
        return;
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
        setStatus("Capture failed — RS window not captured.");
        return;
    }
    const found = reader.find(img);
    if (!found) {
        const now = Date.now();
        if (state.dialogMissingAt === 0) {
            state.dialogMissingAt = now;
            console.log(`[NHQ] Dialog not found. RS size: ${img.width}x${img.height}`);
        }
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
        const key = (0, quiz_data_1.normalize)(questionText);
        const answer = quiz_data_1.QUESTION_MAP.get(key);
        if (answer) {
            state.lastAnswer = answer;
            state.lastAnswerAt = Date.now();
            setStatus("Question detected.");
            setAnswer(answer);
        }
        else {
            setStatus("Watching...");
        }
        return;
    }
    // Options dialog — answer buttons visible
    if (result.opts && result.opts.length >= 2) {
        const opts = result.opts;
        // Primary: match by option triplet (stateless, robust to OCR drift on question text)
        const tripletKey = opts.map(o => (0, quiz_data_1.normalize)(o.text)).sort().join("|");
        let answer = (_a = quiz_data_1.OPTIONS_MAP.get(tripletKey)) !== null && _a !== void 0 ? _a : state.lastAnswer;
        if (!answer) {
            setStatus("Options visible but answer not recognized.");
            return;
        }
        const normAnswer = (0, quiz_data_1.normalize)(answer);
        const target = opts.find(o => (0, quiz_data_1.normalize)(o.text) === normAnswer);
        if (target) {
            highlight(target);
            setStatus("Highlighting answer.");
            setAnswer(answer);
        }
        else {
            setStatus(`Could not match answer button for: ${answer}`);
        }
    }
}
function highlight(btn) {
    alt1.overLaySetGroup(OVERLAY_GROUP);
    alt1.overLayRect(HIGHLIGHT_COLOR, btn.buttonx, btn.y - 2, btn.width + 40, 22, OVERLAY_DURATION_MS, 2);
    alt1.overLayText(">", HIGHLIGHT_COLOR, 14, btn.buttonx - 15, btn.y, OVERLAY_DURATION_MS);
}
function clearOverlay() {
    if (typeof alt1 !== "undefined") {
        alt1.overLayClearGroup(OVERLAY_GROUP);
    }
    state.lastAnswer = null;
    setAnswer(null);
}
function init() {
    var _a;
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
        console.log("[NHQ] calling identifyAppUrl...");
        alt1.identifyAppUrl("https://proxify.github.io/alt1-natural-history-quiz/appconfig.json");
        console.log("[NHQ] identifyAppUrl called");
        // Only hide install panel once the app has actually been granted permissions
        if (installDiv && alt1.permissionPixel) {
            installDiv.classList.add("hidden");
        }
        setStatus(alt1.permissionPixel ? "Watching for quiz dialog..." : "Click '+ Add to Alt1' above, then grant permissions.");
        setInterval(tick, (_a = alt1.captureInterval) !== null && _a !== void 0 ? _a : TICK_INTERVAL_MS);
    }
    else {
        setStatus("Open this page inside Alt1 to use it.");
    }
}
init();


/***/ },

/***/ "./src/quiz-data.ts"
/*!**************************!*\
  !*** ./src/quiz-data.ts ***!
  \**************************/
(__unused_webpack_module, exports) {

"use strict";

// All 84 questions from the Varrock Museum Natural History Quiz
// Source: https://runescape.wiki/w/Natural_history_quiz
// Spellings are verbatim from the wiki (do NOT correct "Sarcopterghii", "Chilli"/"Chili" etc.)
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OPTIONS_MAP = exports.QUESTION_MAP = exports.QUIZ_DATA = void 0;
exports.normalize = normalize;
exports.QUIZ_DATA = [
    // Lizard
    { question: "How does a lizard regulate body heat?", options: ["Chilli sauce", "Fire", "Sunlight"], answer: "Sunlight" },
    { question: "Who discovered how to kill lizards?", options: ["Admiral Bake", "The Slayer Masters", "The Wise Old Man"], answer: "The Slayer Masters" },
    { question: "How many eyes does a lizard have?", options: ["Two", "Three", "Six"], answer: "Three" },
    { question: "What order do lizards belong to?", options: ["Mammal", "Squamata", "Insecta"], answer: "Squamata" },
    { question: "What happens when a lizard becomes cold?", options: ["It becomes sleepy", "It becomes aggressive", "It explodes"], answer: "It becomes sleepy" },
    { question: "Lizard skin is made of the same substance as?", options: ["Hair", "Bone", "Wood"], answer: "Hair" },
    // Battle Tortoise
    { question: "What is the name of the oldest tortoise ever recorded?", options: ["Healthorg", "Mibbiwocket", "Snookums"], answer: "Mibbiwocket" },
    { question: "What is a tortoise's favourite food?", options: ["Sharks", "Kebabs", "Vegetables"], answer: "Vegetables" },
    { question: "Name the explorer who discovered the world's oldest tortoise.", options: ["Admiral Bake", "Captain Cook", "Ensign Chef"], answer: "Admiral Bake" },
    { question: "How does the tortoise protect itself?", options: ["Thick skin", "Magic", "Hard shell"], answer: "Hard shell" },
    { question: "If a tortoise had twenty rings on its shell, how old would it be?", options: ["Ten years", "Twenty years", "Sixty years"], answer: "Twenty years" },
    { question: "Which race breeds tortoises for battle?", options: ["Gnomes", "Orks", "Elves"], answer: "Gnomes" },
    // Dragon
    { question: "What is considered a delicacy by dragons?", options: ["Adventurers", "Runite", "Cheese"], answer: "Runite" },
    { question: "What is the best defense against a dragon's attack?", options: ["Anti-dragon-breath shield", "Rune plate", "Cats"], answer: "Anti-dragon-breath shield" },
    { question: "How long do dragons live?", options: ["Fifty years", "Forever", "Unknown"], answer: "Unknown" },
    { question: "Which of these is not a type of dragon?", options: ["Coloured", "Elemental", "Ferrous"], answer: "Elemental" },
    { question: "What is the favoured territory of a dragon?", options: ["Swamps", "Old battle sites", "Lumbridge Castle"], answer: "Old battle sites" },
    { question: "Approximately how many feet tall do dragons stand?", options: ["Twelve", "Six", "Ten"], answer: "Twelve" },
    // Wyvern
    { question: "How did the wyverns die out?", options: ["Climate change", "Disease", "Marauding adventurers"], answer: "Climate change" },
    { question: "How many legs does a wyvern have?", options: ["Two", "Five", "Six"], answer: "Two" },
    { question: "Where have wyvern bones been found?", options: ["Ape Atoll", "Al Kharid", "Asgarnia"], answer: "Asgarnia" },
    { question: "Which genus does the wyvern theoretically belong to?", options: ["Invertebrates", "Reptiles", "Mammals"], answer: "Reptiles" },
    { question: "What are the wyverns' closest relations?", options: ["Lizards", "Snakes", "Dragons"], answer: "Dragons" },
    { question: "What is the ambient temperature of wyvern bones?", options: ["Room temperature", "Below room temperature", "Above room temperature"], answer: "Below room temperature" },
    // Snail
    { question: "What is special about the shell of the giant Morytanian snail?", options: ["It glows in the dark", "It is very tasty", "It is resistant to acid"], answer: "It is resistant to acid" },
    { question: "How do Morytanian snails capture their prey?", options: ["Aggressive marketing", "Spitting acid", "Hex them until they glow"], answer: "Spitting acid" },
    { question: "Which of these is a snail byproduct?", options: ["Fireproof oil", "A musical instrument", "Snail-a-cola"], answer: "Fireproof oil" },
    { question: "What does 'Achatina Acidia' mean?", options: ["Giant acid-spitting snail", "Acid-spitting snail", "Giant cheese-spitting snail"], answer: "Acid-spitting snail" },
    { question: "How do snails move?", options: ["Flapping their wings", "Contracting and stretching", "Hopping about"], answer: "Contracting and stretching" },
    { question: "What is the 'trapdoor,' which snails use to cover the entrance to their shells called?", options: ["An operculum", "A caldarium", "A tavernium"], answer: "An operculum" },
    // Snake
    { question: "What is snake venom adapted from?", options: ["Ear wax", "Stomach acid", "Saliva"], answer: "Stomach acid" },
    { question: "Aside from their noses, what do snakes use to smell?", options: ["Tongue", "Eyes", "Ears"], answer: "Tongue" },
    { question: "If a snake sticks its tongue out at you, what is it doing?", options: ["Being rude", "Seeing how you taste", "Seeing how you smell"], answer: "Seeing how you smell" },
    { question: "If some snakes use venom to kill their prey, what do other snakes use?", options: ["Fire", "Constriction", "Magic"], answer: "Constriction" },
    { question: "Lizards and snakes belong to the same order - what is it?", options: ["Squamata", "Insecta", "Sarcopterghii"], answer: "Squamata" },
    { question: "Which habitat do snakes prefer?", options: ["The desert", "The ocean", "Anywhere"], answer: "Anywhere" },
    // Sea Slug
    { question: "We assume that sea slugs have a stinging organ on their soft skin - what is it called?", options: ["Nematocysts", "Hematocysts", "Pematocysts"], answer: "Nematocysts" },
    { question: "Why has the museum never examined a live sea slug?", options: ["The sea slugs are shy", "The researchers keep vanishing", "Sea slugs are extinct"], answer: "The researchers keep vanishing" },
    { question: "What do we think the sea slug feeds upon?", options: ["Blood", "Seaweed", "Insects"], answer: "Seaweed" },
    { question: "What are the two fangs presumed to be used for?", options: ["Defense or display", "Attacking prey", "Latching on to objects"], answer: "Defense or display" },
    { question: "Off of which coastline would you find sea slugs?", options: ["Karamja", "Miscellania", "Ardougne"], answer: "Ardougne" },
    { question: "In what way are sea slugs similar to snails?", options: ["They eat lettuce", "They move very slowly", "They have a hard shell"], answer: "They have a hard shell" },
    // Monkey
    { question: "Which type of primates do monkeys belong to?", options: ["Simian", "Hominid", "Lagomorpha"], answer: "Simian" },
    { question: "Which have the lighter colour: Karamjan or Harmless monkeys?", options: ["They are the same", "Karamjan", "Harmless"], answer: "Harmless" },
    { question: "Monkeys love bananas. What else do they like to eat?", options: ["Chilli", "Seaweed", "Bitternuts"], answer: "Bitternuts" },
    { question: "There are two known families of monkeys. One is Karamjan, the other is...?", options: ["Pointless", "Harmless", "Hairless"], answer: "Harmless" },
    { question: "What colour mohawk do Karamjan monkeys have?", options: ["Red", "Blue", "Green"], answer: "Red" },
    { question: "What have Karamjan monkeys taken a deep dislike to?", options: ["Seaweed", "Chili", "Taxes"], answer: "Seaweed" },
    // Kalphite Queen
    { question: "Kalphites are ruled by a...?", options: ["King", "Pasha", "Caliph"], answer: "Pasha" },
    { question: "What is the lowest caste in kalphite society?", options: ["Prince", "Soldier", "Worker"], answer: "Worker" },
    { question: "What are the armoured plates on a kalphite called?", options: ["Hauberk", "Lamellae", "Shield"], answer: "Lamellae" },
    { question: "Are kalphites carnivores, herbivores, or omnivores?", options: ["Omnivores", "Herbivores", "Carnivores"], answer: "Carnivores" },
    { question: "What are kalphites assumed to have evolved from?", options: ["Scarab beetles", "Penguins", "Dragons"], answer: "Scarab beetles" },
    { question: "Name the prominent figure in kalphite mythology?", options: ["Postie Pete", "Scabaras", "Jorral the Historian"], answer: "Scabaras" },
    // Terrorbird
    { question: "What is a terrorbird's preferred food?", options: ["Anything", "Pizza", "Vegetables"], answer: "Anything" },
    { question: "Who uses terrorbirds as mounts?", options: ["Dwarves", "Gnomes", "Goblins"], answer: "Gnomes" },
    { question: "Where do terrorbirds get most of their water?", options: ["Streams and rivers", "Licking trees", "Eating plants"], answer: "Eating plants" },
    { question: "How many claws do terrorbirds have?", options: ["Two", "Four", "Six"], answer: "Four" },
    { question: "What do terrorbirds eat to aid digestion?", options: ["Blurite", "Stones", "Paper"], answer: "Stones" },
    { question: "How many teeth do terrorbirds have?", options: ["28", "14", "0"], answer: "0" },
    // Penguin
    { question: "Which sense do penguins rely on when hunting?", options: ["Smell", "Taste", "Sight"], answer: "Sight" },
    { question: "Which skill seems unusual for the penguins to possess?", options: ["Planning", "Fishing", "Sleeping"], answer: "Planning" },
    { question: "How do penguins keep warm?", options: ["A layer of fat", "Vigorous exercise", "Magic"], answer: "A layer of fat" },
    { question: "What is the preferred climate for penguins?", options: ["Cold", "Hot", "Damp"], answer: "Cold" },
    { question: "Describe the behaviour of penguins?", options: ["Social", "Asocial", "Hive"], answer: "Social" },
    { question: "When do penguins fast?", options: ["Just before dawn", "During breeding", "During the night"], answer: "During breeding" },
    // Mole
    { question: "What habitat do moles prefer?", options: ["Subterranean", "Any", "Subaquatic"], answer: "Subterranean" },
    { question: "Why are moles considered to be an agricultural pest?", options: ["They dig holes", "They eat food meant for livestock", "They attack farmers"], answer: "They dig holes" },
    { question: "Who discovered giant moles?", options: ["Sir Tiffy Cashien", "Ak-Haranu", "Wyson the Gardener"], answer: "Wyson the Gardener" },
    { question: "What would you call a group of young moles?", options: ["A litter", "A mess", "A labour"], answer: "A labour" },
    { question: "What is a mole's favourite food?", options: ["Insects and other invertebrates", "Humans and gnomes", "Seeds and plant roots"], answer: "Insects and other invertebrates" },
    { question: "Which family do moles belong to?", options: ["The Malpidae family", "The Talpidae family", "The Falpidae family"], answer: "The Talpidae family" },
    // Camel
    { question: "What is produced by feeding chilli to a camel?", options: ["An irate camel", "Toxic dung", "An undead bactrian"], answer: "Toxic dung" },
    { question: "If an ugthanki has one, how many does a bactrian have?", options: ["One", "Two", "Four"], answer: "Two" },
    { question: "Camels: herbivore, carnivore or omnivore?", options: ["Herbivore", "Carnivore", "Omnivore"], answer: "Omnivore" },
    { question: "What is the usual mood for a camel?", options: ["Annoyed", "Bemused", "Cheerful"], answer: "Annoyed" },
    { question: "Where would you find an ugthanki?", options: ["Al Kharid", "Morytania", "Nowhere"], answer: "Al Kharid" },
    { question: "Which camel byproduct is known to be very nutritious?", options: ["Milk", "Dung", "Meat"], answer: "Milk" },
    // Leech
    { question: "What is the favoured habitat of leeches?", options: ["Water", "Desert", "Trees"], answer: "Water" },
    { question: "What shape is the inside of a leech's mouth?", options: ["Star-shaped", "X-shaped", "Y-shaped"], answer: "Y-shaped" },
    { question: "Which of these is not eaten by leeches?", options: ["Meat", "Apples", "Blood"], answer: "Apples" },
    { question: "What contributed to the giant growth of Morytanian leeches?", options: ["Environment", "Healthy living", "Magic"], answer: "Environment" },
    { question: "What is special about the Morytanian leeches?", options: ["They sing", "They attack by jumping", "They have legs"], answer: "They attack by jumping" },
    { question: "How does a leech change when it feeds?", options: ["It turns blue", "It starts singing", "It doubles in size"], answer: "It doubles in size" },
];
function normalize(s) {
    return s
        .toLowerCase()
        .replace(/[‘’“”]/g, "'") // smart quotes → straight
        .replace(/[^a-z0-9 ]/g, " ") // strip all non-alphanum (apostrophes, punctuation, dashes)
        .replace(/\s+/g, " ")
        .trim();
}
function makeOptionsKey(a, b, c) {
    return [normalize(a), normalize(b), normalize(c)].sort().join("|");
}
exports.QUESTION_MAP = new Map(exports.QUIZ_DATA.map(e => [normalize(e.question), e.answer]));
exports.OPTIONS_MAP = new Map(exports.QUIZ_DATA.map(e => [makeOptionsKey(e.options[0], e.options[1], e.options[2]), e.answer]));
if (exports.OPTIONS_MAP.size !== exports.QUIZ_DATA.length) {
    console.error(`OPTIONS_MAP collision! Expected ${exports.QUIZ_DATA.length} entries, got ${exports.OPTIONS_MAP.size}. Two questions share the same option triplet.`);
}


/***/ },

/***/ "?fe7a"
/*!************************!*\
  !*** canvas (ignored) ***!
  \************************/
() {

/* (ignored) */

/***/ },

/***/ "?a2a9"
/*!*********************************!*\
  !*** electron/common (ignored) ***!
  \*********************************/
() {

/* (ignored) */

/***/ },

/***/ "?d50e"
/*!***********************!*\
  !*** sharp (ignored) ***!
  \***********************/
() {

/* (ignored) */

/***/ },

/***/ "./node_modules/alt1/dist/base/index.js"
/*!**********************************************!*\
  !*** ./node_modules/alt1/dist/base/index.js ***!
  \**********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory((function webpackLoadOptionalExternalModule() { try { return __webpack_require__(/*! sharp */ "?d50e"); } catch(e) {} }()), (function webpackLoadOptionalExternalModule() { try { return __webpack_require__(/*! canvas */ "?fe7a"); } catch(e) {} }()), (function webpackLoadOptionalExternalModule() { try { return __webpack_require__(/*! electron/common */ "?a2a9"); } catch(e) {} }()));
	else // removed by dead control flow
{}
})(globalThis, (__WEBPACK_EXTERNAL_MODULE_sharp__, __WEBPACK_EXTERNAL_MODULE_canvas__, __WEBPACK_EXTERNAL_MODULE_electron_common__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/base/alt1api.ts"
/*!*****************************!*\
  !*** ./src/base/alt1api.ts ***!
  \*****************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ },

/***/ "./src/base/declarations.ts"
/*!**********************************!*\
  !*** ./src/base/declarations.ts ***!
  \**********************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ },

/***/ "./src/base/imagedata-extensions.ts"
/*!******************************************!*\
  !*** ./src/base/imagedata-extensions.ts ***!
  \******************************************/
(__unused_webpack_module, exports, __nested_webpack_require_2022__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ImageData = void 0;
const a1lib = __importStar(__nested_webpack_require_2022__(/*! ./index */ "./src/base/index.ts"));
const nodeimports = __importStar(__nested_webpack_require_2022__(/*! ./nodepolyfill */ "./src/base/nodepolyfill.ts"));
(function () {
    var globalvar = (typeof self != "undefined" ? self : (typeof __nested_webpack_require_2022__.g != "undefined" ? __nested_webpack_require_2022__.g : null));
    var filltype = typeof globalvar.ImageData == "undefined";
    var fillconstr = filltype;
    if (!filltype) {
        var oldconstr = globalvar.ImageData;
        try {
            let data = new Uint8ClampedArray(4);
            data[0] = 1;
            let a = new globalvar.ImageData(data, 1, 1);
            fillconstr = a.data[0] != 1;
        }
        catch (e) {
            fillconstr = true;
        }
    }
    if (fillconstr) {
        var constr = function ImageDataShim() {
            var i = 0;
            var data = (arguments[i] instanceof Uint8ClampedArray ? arguments[i++] : null);
            var width = arguments[i++];
            var height = arguments[i++];
            if (filltype) {
                if (!data) {
                    data = new Uint8ClampedArray(width * height * 4);
                }
                this.width = width;
                this.height = height;
                this.data = data;
            }
            else if (fillconstr) {
                //WARNING This branch of code does not use the same pixel data backing store
                //(problem with wasm, however all wasm browser have a native constructor (unless asm.js is used))
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                var imageData = ctx.createImageData(width, height);
                if (data) {
                    imageData.data.set(data);
                }
                return imageData;
            }
            // else {
            // 	//oh no...
            // 	//we need this monstrocity in order to call the native constructor with variable number of args
            // 	//when es5 transpile is enable (that strips the spread operator)
            // 	return new (Function.prototype.bind.apply(oldconstr, [null,...arguments]));
            // }
        };
        if (!filltype) {
            constr.prototype = globalvar.ImageData.prototype;
        }
        globalvar.ImageData = constr;
        exports.ImageData = constr;
    }
    else {
        exports.ImageData = globalvar.ImageData;
    }
})();
//Recast into a drawable imagedata class on all platforms, into a normal browser ImageData on browsers or a node-canvas imagedata on nodejs
exports.ImageData.prototype.toDrawableData = function () {
    if (typeof document == "undefined") {
        return nodeimports.imageDataToDrawable(this);
    }
    else {
        return this;
    }
};
exports.ImageData.prototype.putImageData = function (buf, cx, cy) {
    for (var dx = 0; dx < buf.width; dx++) {
        for (var dy = 0; dy < buf.height; dy++) {
            var i1 = (dx + cx) * 4 + (dy + cy) * 4 * this.width;
            var i2 = dx * 4 + dy * 4 * buf.width;
            this.data[i1] = buf.data[i2];
            this.data[i1 + 1] = buf.data[i2 + 1];
            this.data[i1 + 2] = buf.data[i2 + 2];
            this.data[i1 + 3] = buf.data[i2 + 3];
        }
    }
};
exports.ImageData.prototype.pixelOffset = function (x, y) {
    return x * 4 + y * this.width * 4;
};
//creates a hash of a portion of the buffer used to check for changes
exports.ImageData.prototype.getPixelHash = function (rect) {
    if (!rect) {
        rect = new a1lib.Rect(0, 0, this.width, this.height);
    }
    var hash = 0;
    for (var x = rect.x; x < rect.x + rect.width; x++) {
        for (var y = rect.y; y < rect.y + rect.height; y++) {
            var i = x * 4 + y * 4 * this.width;
            hash = (((hash << 5) - hash) + this.data[i]) | 0;
            hash = (((hash << 5) - hash) + this.data[i + 1]) | 0;
            hash = (((hash << 5) - hash) + this.data[i + 2]) | 0;
            hash = (((hash << 5) - hash) + this.data[i + 3]) | 0;
        }
    }
    return hash;
};
exports.ImageData.prototype.clone = function (rect) {
    let res = new exports.ImageData(rect.width, rect.height);
    this.copyTo(res, rect.x, rect.y, rect.width, rect.height, 0, 0);
    return res;
};
exports.ImageData.prototype.show = function (x = 5, y = 5, zoom = 1) {
    if (typeof document == "undefined") {
        console.error("need a document to show an imagedata object");
        return;
    }
    var imgs = document.getElementsByClassName("debugimage");
    while (imgs.length > exports.ImageData.prototype.show.maxImages) {
        imgs[0].remove();
    }
    var el = this.toImage();
    el.classList.add("debugimage");
    el.style.position = "absolute";
    el.style.zIndex = "1000";
    el.style.left = x / zoom + "px";
    el.style.top = y / zoom + "px";
    el.style.background = "purple";
    el.style.cursor = "pointer";
    el.style.imageRendering = "pixelated";
    el.style.outline = "1px solid #0f0";
    el.style.width = (this.width == 1 ? 100 : this.width) * zoom + "px";
    el.style.height = (this.height == 1 ? 100 : this.height) * zoom + "px";
    el.onclick = function () { el.remove(); };
    document.body.appendChild(el);
    return el;
};
exports.ImageData.prototype.show.maxImages = 10;
exports.ImageData.prototype.toImage = function (rect) {
    if (!rect) {
        rect = new a1lib.Rect(0, 0, this.width, this.height);
    }
    if (typeof document != "undefined") {
        var el = document.createElement("canvas");
        el.width = rect.width;
        el.height = rect.height;
    }
    else {
        el = nodeimports.createCanvas(rect.width, rect.height);
    }
    var ctx = el.getContext("2d");
    ctx.putImageData(this.toDrawableData(), -rect.x, -rect.y);
    return el;
};
exports.ImageData.prototype.getPixel = function (x, y) {
    var i = x * 4 + y * 4 * this.width;
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
};
exports.ImageData.prototype.getPixelValueSum = function (x, y) {
    var i = x * 4 + y * 4 * this.width;
    return this.data[i] + this.data[i + 1] + this.data[i + 2];
};
exports.ImageData.prototype.getPixelInt = function (x, y) {
    var i = x * 4 + y * 4 * this.width;
    return (this.data[i + 3] << 24) + (this.data[i + 0] << 16) + (this.data[i + 1] << 8) + (this.data[i + 2] << 0);
};
exports.ImageData.prototype.getColorDifference = function (x, y, r, g, b, a = 255) {
    var i = x * 4 + y * 4 * this.width;
    return Math.abs(this.data[i] - r) + Math.abs(this.data[i + 1] - g) + Math.abs(this.data[i + 2] - b) * a / 255;
};
exports.ImageData.prototype.setPixel = function (x, y, ...color) {
    var r, g, b, a;
    var [r, g, b, a] = (Array.isArray(color[0]) ? color[0] : color);
    var i = x * 4 + y * 4 * this.width;
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a == undefined ? 255 : a;
};
exports.ImageData.prototype.setPixelInt = function (x, y, color) {
    var i = x * 4 + y * 4 * this.width;
    this.data[i] = (color >> 24) & 0xff;
    this.data[i + 1] = (color >> 16) & 0xff;
    this.data[i + 2] = (color >> 8) & 0xff;
    this.data[i + 3] = (color >> 0) & 0xff;
};
exports.ImageData.prototype.toFileBytes = function (format, quality) {
    if (typeof HTMLCanvasElement != "undefined") {
        return new Promise(d => this.toImage().toBlob(b => {
            var r = new FileReader();
            r.readAsArrayBuffer(b);
            r.onload = () => d(new Uint8Array(r.result));
        }, format, quality));
    }
    else {
        return nodeimports.imageDataToFileBytes(this, format, quality);
    }
};
exports.ImageData.prototype.toPngBase64 = function () {
    if (typeof HTMLCanvasElement != "undefined") {
        var str = this.toImage().toDataURL("image/png");
        return str.slice(str.indexOf(",") + 1);
    }
    else {
        throw new Error("synchronous image conversion not supported in nodejs, try using ImageData.prototype.toFileBytes");
    }
};
exports.ImageData.prototype.pixelCompare = function (buf, x = 0, y = 0, max) {
    return a1lib.ImageDetect.simpleCompare(this, buf, x, y, max);
};
exports.ImageData.prototype.copyTo = function (target, sourcex, sourcey, width, height, targetx, targety) {
    //convince v8 that these are 31bit uints
    const targetwidth = target.width | 0;
    const thiswidth = this.width | 0;
    const copywidth = width | 0;
    const fastwidth = Math.floor(width / 4) * 4;
    const thisdata = new Int32Array(this.data.buffer, this.data.byteOffset, this.data.byteLength / 4);
    const targetdata = new Int32Array(target.data.buffer, target.data.byteOffset, target.data.byteLength / 4);
    for (let cy = 0; cy < height; cy++) {
        let cx = 0;
        let it = (cx + targetx) + (cy + targety) * targetwidth;
        let is = (cx + sourcex) + (cy + sourcey) * thiswidth;
        //copy 4 pixels per iter (xmm)
        for (; cx < fastwidth; cx += 4) {
            targetdata[it] = thisdata[is];
            targetdata[it + 1] = thisdata[is + 1];
            targetdata[it + 2] = thisdata[is + 2];
            targetdata[it + 3] = thisdata[is + 3];
            it += 4;
            is += 4;
        }
        //copy remainder per pixel
        for (; cx < copywidth; cx++) {
            targetdata[it] = thisdata[is];
            it += 1;
            is += 1;
        }
    }
};


/***/ },

/***/ "./src/base/imagedetect.ts"
/*!*********************************!*\
  !*** ./src/base/imagedetect.ts ***!
  \*********************************/
(__unused_webpack_module, exports, __nested_webpack_require_12874__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ImageDataSet = exports.webpackImages = exports.asyncMap = exports.coldif = exports.simpleCompareRMSE = exports.simpleCompare = exports.findSubbuffer = exports.findSubimage = exports.clearPngColorspace = exports.isPngBuffer = exports.imageDataFromFileBuffer = exports.imageDataFromBase64 = exports.imageDataFromUrl = void 0;
const imgref_1 = __nested_webpack_require_12874__(/*! ./imgref */ "./src/base/imgref.ts");
const wapper = __importStar(__nested_webpack_require_12874__(/*! ./wrapper */ "./src/base/wrapper.ts"));
const nodeimports = __importStar(__nested_webpack_require_12874__(/*! ./nodepolyfill */ "./src/base/nodepolyfill.ts"));
const _1 = __nested_webpack_require_12874__(/*! . */ "./src/base/index.ts");
/**
* Downloads an image and returns the ImageData.
* Cleans sRGB headers from downloaded png images. Assumes that data url's are already cleaned from sRGB and other headers
* @param url http(s) or data url to the image
*/
async function imageDataFromUrl(url) {
    var hdr = "data:image/png;base64,";
    var isdataurl = url.startsWith(hdr);
    if (typeof Image != "undefined") {
        if (isdataurl) {
            return loadImageDataFromUrl(url);
        }
        else {
            let res = await fetch(url);
            if (!res.ok) {
                throw new Error("failed to load image: " + url);
            }
            let file = new Uint8Array(await res.arrayBuffer());
            return imageDataFromFileBuffer(file);
        }
    }
    else {
        if (isdataurl) {
            return imageDataFromBase64(url.slice(hdr.length));
        }
        throw new Error("loading remote images in nodejs has been disabled, load the raw bytes and use imageDataFromNodeBuffer instead");
    }
}
exports.imageDataFromUrl = imageDataFromUrl;
function loadImageDataFromUrl(url) {
    if (typeof Image == "undefined") {
        throw new Error("Browser environment expected");
    }
    return new Promise((done, fail) => {
        var img = new Image();
        img.crossOrigin = "crossorigin";
        img.onload = function () { done(new imgref_1.ImgRefCtx(img).toData()); };
        img.onerror = fail;
        img.src = url;
    });
}
/**
* Loads an ImageData object from a base64 encoded png image
* Make sure the png image does not have a sRGB chunk or the resulting pixels will differ for different users!!!
* @param data a base64 encoded png image
*/
async function imageDataFromBase64(data) {
    if (typeof Image != "undefined") {
        return imageDataFromUrl("data:image/png;base64," + data);
    }
    else {
        return nodeimports.imageDataFromBase64(data);
    }
}
exports.imageDataFromBase64 = imageDataFromBase64;
/**
 * Loads an ImageData object directly from a png encoded file buffer
 * This method ensures that png color space headers are taken care off
 * @param data The bytes of a png file
 */
async function imageDataFromFileBuffer(data) {
    if (isPngBuffer(data)) {
        clearPngColorspace(data);
    }
    if (typeof Image != "undefined") {
        let blob = new Blob([data], { type: "image/png" });
        let url = URL.createObjectURL(blob);
        let r = await loadImageDataFromUrl(url);
        URL.revokeObjectURL(url);
        return r;
    }
    else {
        return nodeimports.imageDataFromBuffer(data);
    }
}
exports.imageDataFromFileBuffer = imageDataFromFileBuffer;
/**
* Checks if a given byte array is a png file (by checking for ?PNG as first 4 bytes)
* @param bytes Raw bytes of the png file
*/
function isPngBuffer(bytes) {
    return bytes[0] == 137 && bytes[1] == 80 && bytes[2] == 78 && bytes[3] == 71;
}
exports.isPngBuffer = isPngBuffer;
/**
* Resets the colorspace data in the png file.
* This makes sure the browser renders the exact colors in the file instead of filtering it in order to obtain the best real life representation of
* what it looked like on the authors screen. (this feature is often broken and not supported)
* For example a round trip printscreen -> open in browser results in different colors than the original
* @param data Raw bytes of the png file
*/
function clearPngColorspace(data) {
    if (!isPngBuffer(data)) {
        throw new Error("non-png image received");
    }
    var i = 8;
    while (i < data.length) {
        var length = data[i++] * 0x1000000 + data[i++] * 0x10000 + data[i++] * 0x100 + data[i++];
        var ancillary = !!((data[i] >> 5) & 1);
        var chunkname = String.fromCharCode(data[i], data[i + 1], data[i + 2], data[i + 3]);
        var chunkid = chunkname.toLowerCase();
        if (chunkid != "trns" && ancillary) {
            data[i + 0] = "n".charCodeAt(0);
            data[i + 1] = "o".charCodeAt(0);
            data[i + 2] = "P".charCodeAt(0);
            data[i + 3] = "E".charCodeAt(0);
            //calculate new chunk checksum
            //http://www.libpng.org/pub/png/spec/1.2/PNG-CRCAppendix.html
            var end = i + 4 + length;
            var crc = 0xffffffff;
            //should be fast enough like this
            var bitcrc = function (bit) {
                for (var k = 0; k < 8; k++) {
                    if (bit & 1) {
                        bit = 0xedb88320 ^ (bit >>> 1);
                    }
                    else {
                        bit = bit >>> 1;
                    }
                }
                return bit;
            };
            for (var a = i; a < end; a++) {
                if (a >= i + 4) {
                    data[a] = 0;
                }
                var bit = data[a];
                crc = bitcrc((crc ^ bit) & 0xff) ^ (crc >>> 8);
            }
            crc = crc ^ 0xffffffff;
            //new chunk checksum
            data[i + 4 + length + 0] = (crc >> 24) & 0xff;
            data[i + 4 + length + 1] = (crc >> 16) & 0xff;
            data[i + 4 + length + 2] = (crc >> 8) & 0xff;
            data[i + 4 + length + 3] = (crc >> 0) & 0xff;
        }
        if (chunkname == "IEND") {
            break;
        }
        i += 4; //type
        i += length; //data
        i += 4; //crc
    }
}
exports.clearPngColorspace = clearPngColorspace;
/**
* finds the given needle ImageBuffer in the given haystack ImgRef this function uses the best optimized available
* code depending on the type of the haystack. It will use fast c# searching if the haystack is an ImgRefBind, js searching
* is used otherwise.
* the checklist argument is no longer used and should ignored or null/undefined
* The optional sx,sy,sw,sh arguments indicate a bounding rectangle in which to search the needle. The rectangle should be bigger than the needle
* @returns An array of points where the needle is found. The array is empty if none are found
*/
function findSubimage(haystackImgref, needleBuffer, sx = 0, sy = 0, sw = haystackImgref.width, sh = haystackImgref.height) {
    if (!haystackImgref) {
        throw new TypeError();
    }
    if (!needleBuffer) {
        throw new TypeError();
    }
    var max = 30;
    //check if we can do this in alt1
    if (haystackImgref instanceof imgref_1.ImgRefBind && wapper.hasAlt1 && alt1.bindFindSubImg) {
        var needlestr = wapper.encodeImageString(needleBuffer);
        var r = alt1.bindFindSubImg(haystackImgref.handle, needlestr, needleBuffer.width, sx, sy, sw, sh);
        if (!r) {
            throw new wapper.Alt1Error();
        }
        return JSON.parse(r);
    }
    return findSubbuffer(haystackImgref.read(), needleBuffer, sx, sy, sw, sh);
}
exports.findSubimage = findSubimage;
/**
* Uses js to find the given needle ImageBuffer in the given haystack ImageBuffer. It is better to use the alt1.bind- functions in
* combination with a1nxt.findsubimg.
* the optional sx,sy,sw,sh arguments indicate a bounding rectangle in which to search.
* @returns An array of points where the needle is found. The array is empty if none are found
*/
function findSubbuffer(haystack, needle, sx = 0, sy = 0, sw = haystack.width, sh = haystack.height) {
    var r = [];
    var maxdif = 30;
    var maxresults = 50;
    var needlestride = needle.width * 4;
    var heystackstride = haystack.width * 4;
    //built list of non trans pixel to check
    var checkList = [];
    for (var y = 0; y < needle.height; y++) {
        for (var x = 0; x < needle.width; x++) {
            var i = x * 4 + y * needlestride;
            if (needle.data[i + 3] == 255) {
                checkList.push({ x: x, y: y });
            }
            if (checkList.length == 10) {
                break;
            }
        }
        if (checkList.length == 10) {
            break;
        }
    }
    var cw = (sx + sw) - needle.width;
    var ch = (sy + sh) - needle.height;
    var checklength = checkList.length;
    for (var y = sy; y <= ch; y++) {
        outer: for (var x = sx; x <= cw; x++) {
            for (var a = 0; a < checklength; a++) {
                var i1 = (x + checkList[a].x) * 4 + (y + checkList[a].y) * heystackstride;
                var i2 = checkList[a].x * 4 + checkList[a].y * needlestride;
                var d = 0;
                d = d + Math.abs(haystack.data[i1 + 0] - needle.data[i2 + 0]) | 0;
                d = d + Math.abs(haystack.data[i1 + 1] - needle.data[i2 + 1]) | 0;
                d = d + Math.abs(haystack.data[i1 + 2] - needle.data[i2 + 2]) | 0;
                d *= 255 / needle.data[i2 + 3];
                if (d > maxdif) {
                    continue outer;
                }
            }
            if (simpleCompare(haystack, needle, x, y, maxdif) != Infinity) {
                r.push({ x, y });
                if (r.length > maxresults) {
                    return r;
                }
            }
        }
    }
    return r;
}
exports.findSubbuffer = findSubbuffer;
/**
* Compares two images and returns the average color difference per pixel between them
* @param max The max color difference at any point in the image before short circuiting the function and returning Infinity. set to -1 to always continue.
* @returns The average color difference per pixel or Infinity if the difference is more than max at any point in the image
*/
function simpleCompare(bigbuf, checkbuf, x, y, max = 30) {
    if (x < 0 || y < 0) {
        throw new RangeError();
    }
    if (x + checkbuf.width > bigbuf.width || y + checkbuf.height > bigbuf.height) {
        throw new RangeError();
    }
    if (max == -1) {
        max = 255 * 4;
    }
    var dif = 0;
    for (var step = 8; step >= 1; step /= 2) {
        for (var cx = 0; cx < checkbuf.width; cx += step) {
            for (var cy = 0; cy < checkbuf.height; cy += step) {
                var i1 = (x + cx) * 4 + (y + cy) * bigbuf.width * 4;
                var i2 = cx * 4 + cy * checkbuf.width * 4;
                var d = 0;
                d = d + Math.abs(bigbuf.data[i1 + 0] - checkbuf.data[i2 + 0]) | 0;
                d = d + Math.abs(bigbuf.data[i1 + 1] - checkbuf.data[i2 + 1]) | 0;
                d = d + Math.abs(bigbuf.data[i1 + 2] - checkbuf.data[i2 + 2]) | 0;
                d *= checkbuf.data[i2 + 3] / 255;
                if (step == 1) {
                    dif += d;
                }
                if (d > max) {
                    return Infinity;
                }
            }
        }
    }
    return dif / checkbuf.width / checkbuf.height;
}
exports.simpleCompare = simpleCompare;
/**
* Calculates the root mean square error between the two buffers at the given coordinate, this method can be used in situations with significant blur or
* transparency, it does not bail early on non-matching images like simpleCompare does so it can be expected to be much slower when called often.
* @returns The root mean square error beteen the images, high single pixel errors are penalized more than consisten low errors. return of 0 means perfect match.
*/
function simpleCompareRMSE(bigbuf, checkbuf, x, y) {
    if (x < 0 || y < 0) {
        throw new RangeError();
    }
    if (x + checkbuf.width > bigbuf.width || y + checkbuf.height > bigbuf.height) {
        throw new RangeError();
    }
    var dif = 0;
    var numpix = 0;
    for (var cx = 0; cx < checkbuf.width; cx++) {
        for (var cy = 0; cy < checkbuf.height; cy++) {
            var i1 = (x + cx) * 4 + (y + cy) * bigbuf.width * 4;
            var i2 = cx * 4 + cy * checkbuf.width * 4;
            var d = 0;
            d = d + Math.abs(bigbuf.data[i1 + 0] - checkbuf.data[i2 + 0]) | 0;
            d = d + Math.abs(bigbuf.data[i1 + 1] - checkbuf.data[i2 + 1]) | 0;
            d = d + Math.abs(bigbuf.data[i1 + 2] - checkbuf.data[i2 + 2]) | 0;
            var weight = checkbuf.data[i2 + 3] / 255;
            numpix += weight;
            dif += d * d * weight;
        }
    }
    return Math.sqrt(dif / numpix);
}
exports.simpleCompareRMSE = simpleCompareRMSE;
/**
* Returns the difference between two colors (scaled to the alpha of the second color)
*/
function coldif(r1, g1, b1, r2, g2, b2, a2) {
    return (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)) * a2 / 255; //only applies alpha for 2nd buffer!
}
exports.coldif = coldif;
/**
 * Turns map of promises into a map that contains the resolved values after loading.
 * @param input
 */
function asyncMap(input) {
    var raw = {};
    var promises = [];
    for (var a in input) {
        if (input.hasOwnProperty(a)) {
            raw[a] = null;
            promises.push(input[a].then(function (a, i) { raw[a] = i; r[a] = i; }.bind(null, a)));
        }
    }
    var r = {};
    var promise = Promise.all(promises).then(() => { r.loaded = true; return r; });
    Object.defineProperty(r, "loaded", { enumerable: false, value: false, writable: true });
    Object.defineProperty(r, "promise", { enumerable: false, value: promise });
    Object.defineProperty(r, "raw", { enumerable: false, value: raw });
    return Object.assign(r, raw);
}
exports.asyncMap = asyncMap;
/**
* Same as asyncMap, but casts the properties to ImageData in typescript
*/
function webpackImages(input) {
    return asyncMap(input);
}
exports.webpackImages = webpackImages;
class ImageDataSet {
    constructor() {
        this.buffers = [];
    }
    matchBest(img, x, y, max) {
        let best = null;
        let bestscore = max;
        for (let a = 0; a < this.buffers.length; a++) {
            let score = img.pixelCompare(this.buffers[a], x, y, bestscore);
            if (isFinite(score) && (bestscore == undefined || score < bestscore)) {
                bestscore = score;
                best = a;
            }
        }
        if (best == null) {
            return null;
        }
        return { index: best, score: bestscore };
    }
    static fromFilmStrip(baseimg, width) {
        if ((baseimg.width % width) != 0) {
            throw new Error("slice size does not fit in base img");
        }
        let r = new ImageDataSet();
        for (let x = 0; x < baseimg.width; x += width) {
            r.buffers.push(baseimg.clone(new _1.Rect(x, 0, width, baseimg.height)));
        }
        return r;
    }
    static fromFilmStripUneven(baseimg, widths) {
        let r = new ImageDataSet();
        let x = 0;
        for (let w of widths) {
            r.buffers.push(baseimg.clone(new _1.Rect(x, 0, w, baseimg.height)));
            x += w;
            if (x > baseimg.width) {
                throw new Error("sampling filmstrip outside bounds");
            }
        }
        if (x != baseimg.width) {
            throw new Error("unconsumed pixels left in film strip imagedata");
        }
        return r;
    }
    static fromAtlas(baseimg, slices) {
        let r = new ImageDataSet();
        for (let slice of slices) {
            r.buffers.push(baseimg.clone(slice));
        }
        return r;
    }
}
exports.ImageDataSet = ImageDataSet;


/***/ },

/***/ "./src/base/imgref.ts"
/*!****************************!*\
  !*** ./src/base/imgref.ts ***!
  \****************************/
(__unused_webpack_module, exports, __nested_webpack_require_29830__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ImgRefData = exports.ImgRefBind = exports.ImgRefCtx = exports.ImgRef = void 0;
const index_1 = __nested_webpack_require_29830__(/*! ./index */ "./src/base/index.ts");
/**
 * Represents an image that might be in different types of memory
 * This is mostly used to represent images still in Alt1 memory that have
 * not been transfered to js yet. Various a1lib api's use this type and
 * choose the most efficient approach based on the memory type
 */
class ImgRef {
    constructor(x, y, w, h) {
        this.t = "none";
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    read(x = 0, y = 0, w = this.width, h = this.height) {
        throw new Error("This imgref (" + this.t + ") does not support toData");
    }
    findSubimage(needle, sx = 0, sy = 0, w = this.width, h = this.height) {
        return index_1.ImageDetect.findSubimage(this, needle, sx, sy, w, h);
    }
    toData(x = this.x, y = this.y, w = this.width, h = this.height) {
        return this.read(x - this.x, y - this.y, w, h);
    }
    ;
    containsArea(rect) {
        return this.x <= rect.x && this.y <= rect.y && this.x + this.width >= rect.x + rect.width && this.y + this.height >= rect.y + rect.height;
    }
}
exports.ImgRef = ImgRef;
/**
 * Represents an image in js render memory (canvas/image tag)
 */
class ImgRefCtx extends ImgRef {
    constructor(img, x = 0, y = 0) {
        if (img instanceof CanvasRenderingContext2D) {
            super(x, y, img.canvas.width, img.canvas.height);
            this.ctx = img;
        }
        else {
            super(x, y, img.width, img.height);
            if (img instanceof HTMLCanvasElement) {
                this.ctx = img.getContext("2d", { willReadFrequently: true });
            }
            else {
                var cnv = document.createElement("canvas");
                cnv.width = img.width;
                cnv.height = img.height;
                this.ctx = cnv.getContext("2d", { willReadFrequently: true });
                this.ctx.drawImage(img, 0, 0);
            }
        }
        this.t = "ctx";
    }
    read(x = 0, y = 0, w = this.width, h = this.height) {
        return this.ctx.getImageData(x, y, w, h);
    }
}
exports.ImgRefCtx = ImgRefCtx;
/**
 * Represents in image in Alt1 memory, This type of image can be searched for subimages
 * very efficiently and transfering the full image to js can be avoided this way
 */
class ImgRefBind extends ImgRef {
    constructor(handle, x = 0, y = 0, w = 0, h = 0) {
        super(x, y, w, h);
        this.handle = handle;
        this.t = "bind";
    }
    read(x = 0, y = 0, w = this.width, h = this.height) {
        return (0, index_1.transferImageData)(this.handle, x, y, w, h);
    }
}
exports.ImgRefBind = ImgRefBind;
/**
 * Represents an image in js memory
 */
class ImgRefData extends ImgRef {
    constructor(buf, x = 0, y = 0) {
        super(x, y, buf.width, buf.height);
        this.buf = buf;
        this.t = "data";
    }
    read(x = 0, y = 0, w = this.width, h = this.height) {
        if (x == 0 && y == 0 && w == this.width && h == this.height) {
            return this.buf;
        }
        var r = new ImageData(w, h);
        for (var b = y; b < y + h; b++) {
            for (var a = x; a < x + w; a++) {
                var i1 = (a - x) * 4 + (b - y) * w * 4;
                var i2 = a * 4 + b * 4 * this.buf.width;
                r.data[i1] = this.buf.data[i2];
                r.data[i1 + 1] = this.buf.data[i2 + 1];
                r.data[i1 + 2] = this.buf.data[i2 + 2];
                r.data[i1 + 3] = this.buf.data[i2 + 3];
            }
        }
        return r;
    }
}
exports.ImgRefData = ImgRefData;


/***/ },

/***/ "./src/base/index.ts"
/*!***************************!*\
  !*** ./src/base/index.ts ***!
  \***************************/
(__unused_webpack_module, exports, __nested_webpack_require_33782__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.imageDataFromUrl = exports.ImageDataSet = exports.findSubbuffer = exports.simpleCompare = exports.findSubimage = exports.webpackImages = exports.NodePolyfill = exports.ImageData = exports.Rect = exports.PasteInput = exports.ImageDetect = void 0;
__nested_webpack_require_33782__(/*! ./declarations */ "./src/base/declarations.ts");
exports.ImageDetect = __importStar(__nested_webpack_require_33782__(/*! ./imagedetect */ "./src/base/imagedetect.ts"));
exports.PasteInput = __importStar(__nested_webpack_require_33782__(/*! ./pasteinput */ "./src/base/pasteinput.ts"));
var rect_1 = __nested_webpack_require_33782__(/*! ./rect */ "./src/base/rect.ts");
Object.defineProperty(exports, "Rect", ({ enumerable: true, get: function () { return __importDefault(rect_1).default; } }));
var imagedata_extensions_1 = __nested_webpack_require_33782__(/*! ./imagedata-extensions */ "./src/base/imagedata-extensions.ts");
Object.defineProperty(exports, "ImageData", ({ enumerable: true, get: function () { return imagedata_extensions_1.ImageData; } }));
exports.NodePolyfill = __importStar(__nested_webpack_require_33782__(/*! ./nodepolyfill */ "./src/base/nodepolyfill.ts"));
__exportStar(__nested_webpack_require_33782__(/*! ./imgref */ "./src/base/imgref.ts"), exports);
__exportStar(__nested_webpack_require_33782__(/*! ./wrapper */ "./src/base/wrapper.ts"), exports);
var imagedetect_1 = __nested_webpack_require_33782__(/*! ./imagedetect */ "./src/base/imagedetect.ts");
Object.defineProperty(exports, "webpackImages", ({ enumerable: true, get: function () { return imagedetect_1.webpackImages; } }));
Object.defineProperty(exports, "findSubimage", ({ enumerable: true, get: function () { return imagedetect_1.findSubimage; } }));
Object.defineProperty(exports, "simpleCompare", ({ enumerable: true, get: function () { return imagedetect_1.simpleCompare; } }));
Object.defineProperty(exports, "findSubbuffer", ({ enumerable: true, get: function () { return imagedetect_1.findSubbuffer; } }));
Object.defineProperty(exports, "ImageDataSet", ({ enumerable: true, get: function () { return imagedetect_1.ImageDataSet; } }));
Object.defineProperty(exports, "imageDataFromUrl", ({ enumerable: true, get: function () { return imagedetect_1.imageDataFromUrl; } }));


/***/ },

/***/ "./src/base/nodepolyfill.ts"
/*!**********************************!*\
  !*** ./src/base/nodepolyfill.ts ***!
  \**********************************/
(__unused_webpack_module, exports, __nested_webpack_require_37585__) {


//nodejs and electron polyfills for web api's
//commented out type info as that breaks webpack with optional dependencies
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.imageDataFromBuffer = exports.imageDataFromBase64 = exports.imageDataToFileBytes = exports.createCanvas = exports.imageDataToDrawable = exports.requireElectronCommon = exports.requireNodeCanvas = exports.requireSharp = exports.polyfillRequire = void 0;
const index_1 = __nested_webpack_require_37585__(/*! ./index */ "./src/base/index.ts");
const imagedetect_1 = __nested_webpack_require_37585__(/*! ./imagedetect */ "./src/base/imagedetect.ts");
var requirefunction = null;
/**
 * Call this function to let the libs require extra dependencies on nodejs in order
 * to polyfill some browser api's (mostly image compression/decompression)
 * `NodePolifill.polyfillRequire(require);` should solve most cases
 */
function polyfillRequire(requirefn) {
    requirefunction = requirefn;
}
exports.polyfillRequire = polyfillRequire;
function requireSharp() {
    try {
        if (requirefunction) {
            return requirefunction("sharp");
        }
        else {
            return __nested_webpack_require_37585__(/* webpackIgnore: true */ /*! sharp */ "sharp"); // as typeof import("sharp");
        }
    }
    catch (e) { }
    return null;
}
exports.requireSharp = requireSharp;
function requireNodeCanvas() {
    //attempt to require sharp first, after loading canvas the module sharp fails to load
    requireSharp();
    try {
        if (requirefunction) {
            return requirefunction("canvas");
        }
        else {
            return __nested_webpack_require_37585__(/* webpackIgnore: true */ /*! canvas */ "canvas"); // as typeof import("sharp");
        }
    }
    catch (e) { }
    return null;
}
exports.requireNodeCanvas = requireNodeCanvas;
function requireElectronCommon() {
    try {
        if (requirefunction) {
            return requirefunction("electron/common");
        }
        else {
            return __nested_webpack_require_37585__(/* webpackIgnore: true */ /*! electron/common */ "electron/common");
        }
    }
    catch (e) { }
    return null;
}
exports.requireElectronCommon = requireElectronCommon;
function imageDataToDrawable(buf) {
    let nodecnv = requireNodeCanvas();
    if (!nodecnv) {
        throw new Error("couldn't find built-in canvas or the module 'canvas'");
    }
    return new nodecnv.ImageData(buf.data, buf.width, buf.height);
}
exports.imageDataToDrawable = imageDataToDrawable;
function createCanvas(w, h) {
    let nodecnv = requireNodeCanvas();
    if (!nodecnv) {
        throw new Error("couldn't find built-in canvas or the module 'canvas'");
    }
    return nodecnv.createCanvas(w, h);
}
exports.createCanvas = createCanvas;
function flipBGRAtoRGBA(data) {
    for (let i = 0; i < data.length; i += 4) {
        let tmp = data[i + 2];
        data[i + 2] = data[i + 0];
        data[i + 0] = tmp;
    }
}
async function imageDataToFileBytes(buf, format, quality) {
    //use the electron API if we're in electron
    var electronCommon;
    var sharp;
    if (electronCommon = requireElectronCommon()) {
        let nativeImage = electronCommon.nativeImage;
        //need to copy the buffer in order to flip it without destroying the original
        let bufcpy = Buffer.from(buf.data.slice(buf.data.byteOffset, buf.data.byteLength));
        flipBGRAtoRGBA(bufcpy);
        let nativeimg = nativeImage.createFromBitmap(bufcpy, { width: buf.width, height: buf.height });
        return nativeimg.toPNG();
    }
    else if (sharp = requireSharp()) {
        let img = sharp(Buffer.from(buf.data.buffer), { raw: { width: buf.width, height: buf.height, channels: 4 } });
        if (format == "image/png") {
            img.png();
        }
        else if (format == "image/webp") {
            var opts = { quality: 80 };
            if (typeof quality == "number") {
                opts.quality = quality * 100;
            }
            img.webp(opts);
        }
        else {
            throw new Error("unknown image format: " + format);
        }
        return await img.toBuffer({ resolveWithObject: false }).buffer;
    }
    throw new Error("coulnd't find build-in image compression methods or the module 'electron/common' or 'sharp'");
}
exports.imageDataToFileBytes = imageDataToFileBytes;
function imageDataFromBase64(base64) {
    return imageDataFromBuffer(Buffer.from(base64, "base64"));
}
exports.imageDataFromBase64 = imageDataFromBase64;
async function imageDataFromBuffer(buffer) {
    (0, imagedetect_1.clearPngColorspace)(buffer);
    //use the electron API if we're in electron
    var electronCommon;
    var nodecnv;
    if (electronCommon = requireElectronCommon()) {
        let nativeImage = electronCommon.nativeImage;
        let img = nativeImage.createFromBuffer(buffer);
        let pixels = img.toBitmap();
        let size = img.getSize();
        let pixbuf = new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.byteLength);
        flipBGRAtoRGBA(pixbuf);
        return new index_1.ImageData(pixbuf, size.width, size.height);
    }
    else if (nodecnv = requireNodeCanvas()) {
        return new Promise((done, err) => {
            let img = new nodecnv.Image();
            img.onerror = err;
            img.onload = () => {
                var cnv = nodecnv.createCanvas(img.naturalWidth, img.naturalHeight);
                var ctx = cnv.getContext("2d");
                ctx.drawImage(img, 0, 0);
                var data = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
                //use our own class
                done(new index_1.ImageData(data.data, data.width, data.height));
            };
            img.src = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        });
    }
    throw new Error("couldn't find built-in canvas, module 'electron/common' or the module 'canvas'");
}
exports.imageDataFromBuffer = imageDataFromBuffer;


/***/ },

/***/ "./src/base/pasteinput.ts"
/*!********************************!*\
  !*** ./src/base/pasteinput.ts ***!
  \********************************/
(__unused_webpack_module, exports, __nested_webpack_require_43757__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fileDialog = exports.start = exports.startDragNDrop = exports.triggerPaste = exports.unlisten = exports.listen = exports.lastref = void 0;
const index_1 = __nested_webpack_require_43757__(/*! ./index */ "./src/base/index.ts");
const ImageDetect = __importStar(__nested_webpack_require_43757__(/*! ./imagedetect */ "./src/base/imagedetect.ts"));
var listeners = [];
var started = false;
var dndStarted = false;
var pasting = false;
exports.lastref = null;
function listen(func, errorfunc, dragndrop) {
    listeners.push({ cb: func, error: errorfunc });
    if (!started) {
        start();
    }
    if (dragndrop && !dndStarted) {
        startDragNDrop();
    }
}
exports.listen = listen;
function unlisten(func) {
    let i = listeners.findIndex(c => c.cb == func);
    if (i != -1) {
        listeners.splice(i, 1);
    }
}
exports.unlisten = unlisten;
/**
 * currently used in multiple document situations (iframe), might be removed in the future
 */
function triggerPaste(img) {
    exports.lastref = img;
    for (var a in listeners) {
        listeners[a].cb(exports.lastref);
    }
}
exports.triggerPaste = triggerPaste;
function pasted(img) {
    pasting = false;
    triggerPaste(new index_1.ImgRefCtx(img));
}
function error(error, mes) {
    var _a, _b;
    pasting = false;
    for (var a in listeners) {
        (_b = (_a = listeners[a]).error) === null || _b === void 0 ? void 0 : _b.call(_a, mes, error);
    }
}
function startDragNDrop() {
    var getitem = function (items) {
        var foundimage = "";
        for (var a = 0; a < items.length; a++) {
            var item = items[a];
            var m = item.type.match(/^image\/(\w+)$/);
            if (m) {
                if (m[1] == "png") {
                    return item;
                }
                else {
                    foundimage = m[1];
                }
            }
        }
        if (foundimage) {
            error("notpng", "The image you uploaded is not a .png image. Other image type have compression noise and can't be used for image detection.");
        }
        return null;
    };
    window.addEventListener("dragover", function (e) {
        e.preventDefault();
    });
    window.addEventListener("drop", function (e) {
        if (!e.dataTransfer) {
            return;
        }
        var item = getitem(e.dataTransfer.items);
        e.preventDefault();
        if (!item) {
            return;
        }
        fromFile(item.getAsFile());
    });
}
exports.startDragNDrop = startDragNDrop;
function start() {
    if (started) {
        return;
    }
    started = true;
    //determine if we have a clipboard api
    //try{a=new Event("clipboard"); a="clipboardData" in a;}
    //catch(e){a=false;}
    var ischrome = !!navigator.userAgent.match(/Chrome/) && !navigator.userAgent.match(/Edge/);
    //old method breaks after chrome 41, revert to good old user agent sniffing
    //nvm, internet explorer (edge) decided that it wants to be chrome, however fails at delivering
    //turns out this one is interesting, edge is a hybrid between the paste api's
    var apipasted = function (e) {
        if (!e.clipboardData) {
            return;
        }
        for (var a = 0; a < e.clipboardData.items.length; a++) { //loop all data types
            if (e.clipboardData.items[a].type.indexOf("image") != -1) {
                var file = e.clipboardData.items[a].getAsFile();
                if (file) {
                    var img = new Image();
                    img.src = (window.URL || window.webkitURL).createObjectURL(file);
                    if (img.width > 0) {
                        pasted(img);
                    }
                    else {
                        img.onload = function () { pasted(img); };
                    }
                }
            }
        }
    };
    if (ischrome) {
        document.addEventListener("paste", apipasted);
    }
    else {
        var catcher = document.createElement("div");
        catcher.setAttribute("contenteditable", "");
        catcher.className = "forcehidden"; //retarded ie safety/bug, cant apply styles using js//TODO i don't even know what's going on
        catcher.onpaste = function (e) {
            if (e.clipboardData && e.clipboardData.items) {
                apipasted(e);
                return;
            }
            setTimeout(function () {
                var b = catcher.children[0];
                if (!b || b.tagName != "IMG") {
                    return;
                }
                var img = new Image();
                img.src = b.src;
                var a = img.src.match(/^data:([\w\/]+);/);
                if (img.width > 0) {
                    pasted(img);
                }
                else {
                    img.onload = function () { pasted(img); };
                }
                catcher.innerHTML = "";
            }, 1);
        };
        document.body.appendChild(catcher);
    }
    //detect if ctrl-v is pressed and focus catcher if needed
    document.addEventListener("keydown", function (e) {
        if (e.target.tagName == "INPUT") {
            return;
        }
        if (e.keyCode != "V".charCodeAt(0) || !e.ctrlKey) {
            return;
        }
        pasting = true;
        setTimeout(function () {
            if (pasting) {
                error("noimg", "You pressed Ctrl+V, but no image was pasted by your browser, make sure your clipboard contains an image, and not a link to an image.");
            }
        }, 1000);
        if (catcher) {
            catcher.focus();
        }
    });
}
exports.start = start;
function fileDialog() {
    var fileinput = document.createElement("input");
    fileinput.type = "file";
    fileinput.accept = "image/png";
    fileinput.onchange = function () { if (fileinput.files && fileinput.files[0]) {
        fromFile(fileinput.files[0]);
    } };
    fileinput.click();
    return fileinput;
}
exports.fileDialog = fileDialog;
function fromFile(file) {
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function () {
        var bytearray = new Uint8Array(reader.result);
        if (ImageDetect.isPngBuffer(bytearray)) {
            ImageDetect.clearPngColorspace(bytearray);
        }
        var blob = new Blob([bytearray], { type: "image/png" });
        var img = new Image();
        var bloburl = URL.createObjectURL(blob);
        img.onerror = () => {
            URL.revokeObjectURL(bloburl);
            error("invalidfile", "The file you uploaded could not be opened as an image.");
        };
        img.src = bloburl;
        if (img.width > 0) {
            pasted(img);
            URL.revokeObjectURL(bloburl);
        }
        else {
            img.onload = function () {
                pasted(img);
                URL.revokeObjectURL(bloburl);
            };
        }
    };
    reader.readAsArrayBuffer(file);
}


/***/ },

/***/ "./src/base/rect.ts"
/*!**************************!*\
  !*** ./src/base/rect.ts ***!
  \**************************/
(__unused_webpack_module, exports) {


//util class for rectangle maths
//TODO shit this sucks can we remove it again?
//more of a shorthand to get {x,y,width,height} than a class
//kinda starting to like it again
//TODO remove rant
Object.defineProperty(exports, "__esModule", ({ value: true }));
;
/**
 * Simple rectangle class with some util functions
 */
class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    static fromArgs(...args) {
        if (typeof args[0] == "object") {
            return new Rect(args[0].x, args[0].y, args[0].width, args[0].height);
        }
        else if (typeof args[0] == "number" && args.length >= 4) {
            return new Rect(args[0], args[1], args[2], args[3]);
        }
        else {
            throw new Error("invalid rect args");
        }
    }
    /**
     * Resizes this Rect to include the full size of a given second rectangle
     */
    union(r2) {
        var x = Math.min(this.x, r2.x);
        var y = Math.min(this.y, r2.y);
        this.width = Math.max(this.x + this.width, r2.x + r2.width) - x;
        this.height = Math.max(this.y + this.height, r2.y + r2.height) - y;
        this.x = x;
        this.y = y;
        return this;
    }
    /**
     * Resizes this Rect to include a given point
     */
    includePoint(x, y) {
        this.union(new Rect(x, y, 0, 0));
    }
    /**
     * Grows the rectangle with the given dimensions
     */
    inflate(w, h) {
        this.x -= w;
        this.y -= h;
        this.width += 2 * w;
        this.height += 2 * h;
    }
    /**
     * Resizes this Rect to the area that overlaps a given Rect
     * width and height will be set to 0 if the intersection does not exist
     */
    intersect(r2) {
        if (this.x < r2.x) {
            this.width -= r2.x - this.x;
            this.x = r2.x;
        }
        if (this.y < r2.y) {
            this.height -= r2.y - this.y;
            this.y = r2.y;
        }
        this.width = Math.min(this.x + this.width, r2.x + r2.width) - this.x;
        this.height = Math.min(this.y + this.height, r2.y + r2.height) - this.y;
        if (this.width <= 0 || this.height <= 0) {
            this.width = 0;
            this.height = 0;
        }
    }
    /**
     * Returns wether this Rect has at least one pixel overlap with a given Rect
     */
    overlaps(r2) {
        return this.x < r2.x + r2.width && this.x + this.width > r2.x && this.y < r2.y + r2.height && this.y + this.height > r2.y;
    }
    /**
     * Returns wether a given Rect fits completely inside this Rect
     * @param r2
     */
    contains(r2) {
        return this.x <= r2.x && this.x + this.width >= r2.x + r2.width && this.y <= r2.y && this.y + this.height >= r2.y + r2.height;
    }
    /**
     * Returns wether a given point lies inside this Rect
     */
    containsPoint(x, y) {
        return this.x <= x && this.x + this.width > x && this.y <= y && this.y + this.height > y;
    }
}
exports["default"] = Rect;


/***/ },

/***/ "./src/base/wrapper.ts"
/*!*****************************!*\
  !*** ./src/base/wrapper.ts ***!
  \*****************************/
(__unused_webpack_module, exports, __nested_webpack_require_55131__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.captureStream = exports.captureMultiAsync = exports.captureAsync = exports.ImageStreamReader = exports.once = exports.removeListener = exports.on = exports.addResizeElement = exports.getMousePosition = exports.hasAlt1Version = exports.resetEnvironment = exports.identifyApp = exports.unmixColor = exports.mixColor = exports.encodeImageString = exports.decodeImageString = exports.transferImageData = exports.captureHoldFullRs = exports.captureHoldScreen = exports.captureHold = exports.capture = exports.getdisplaybounds = exports.requireAlt1 = exports.openbrowser = exports.skinName = exports.hasAlt1 = exports.newestversion = exports.Alt1Error = exports.NoAlt1Error = void 0;
const rect_1 = __importDefault(__nested_webpack_require_55131__(/*! ./rect */ "./src/base/rect.ts"));
const imgref_1 = __nested_webpack_require_55131__(/*! ./imgref */ "./src/base/imgref.ts");
const imagedata_extensions_1 = __nested_webpack_require_55131__(/*! ./imagedata-extensions */ "./src/base/imagedata-extensions.ts");
__nested_webpack_require_55131__(/*! ./alt1api */ "./src/base/alt1api.ts");
/**
 * Thrown when a method is called that can not be used outside of Alt1
 */
class NoAlt1Error extends Error {
    constructor() {
        super();
        this.message = "This method can not be ran outside of Alt1";
    }
}
exports.NoAlt1Error = NoAlt1Error;
;
/**
 * Thrown when the Alt1 API returns an invalid result
 * Errors of a different type are throw when internal Alt1 errors occur
 */
class Alt1Error extends Error {
}
exports.Alt1Error = Alt1Error;
/**
 * The latest Alt1 version
 */
exports.newestversion = "1.5.5";
/**
 * Whether the Alt1 API is available
 */
exports.hasAlt1 = (typeof alt1 != "undefined");
/**
 * The name of the Alt1 interface skin. (Always "default" if running in a browser)
 */
exports.skinName = exports.hasAlt1 ? alt1.skinName : "default";
/**
 * Max number of bytes that can be sent by alt1 in one function
 * Not completely sure why this number is different than window.alt1.maxtranfer
 */
var maxtransfer = 4000000;
/**
 * Open a link in the default browser
 * @deprecated use window.open instead
 */
function openbrowser(url) {
    if (exports.hasAlt1) {
        alt1.openBrowser(url);
    }
    else {
        window.open(url, '_blank');
    }
}
exports.openbrowser = openbrowser;
/**
 * Throw if Alt1 API is not available
 */
function requireAlt1() {
    if (!exports.hasAlt1) {
        throw new NoAlt1Error();
    }
}
exports.requireAlt1 = requireAlt1;
/**
 * Returns an object with a rectangle that spans all screens
 */
function getdisplaybounds() {
    if (!exports.hasAlt1) {
        return false;
    }
    return new rect_1.default(alt1.screenX, alt1.screenY, alt1.screenWidth, alt1.screenHeight);
}
exports.getdisplaybounds = getdisplaybounds;
/**
 * gets an imagebuffer with pixel data about the requested region
 */
function capture(...args) {
    //TODO change null return on error into throw instead (x3)
    if (!exports.hasAlt1) {
        throw new NoAlt1Error();
    }
    var rect = rect_1.default.fromArgs(...args);
    if (alt1.capture) {
        return new imagedata_extensions_1.ImageData(alt1.capture(rect.x, rect.y, rect.width, rect.height), rect.width, rect.height);
    }
    var buf = new imagedata_extensions_1.ImageData(rect.width, rect.height);
    if (rect.width * rect.height * 4 <= maxtransfer) {
        var data = alt1.getRegion(rect.x, rect.y, rect.width, rect.height);
        if (!data) {
            return null;
        }
        decodeImageString(data, buf, 0, 0, rect.width, rect.height);
    }
    else {
        //split up the request to to exceed the single transfer limit (for now)
        var x1 = rect.x;
        var ref = alt1.bindRegion(rect.x, rect.y, rect.width, rect.height);
        if (ref <= 0) {
            return null;
        }
        while (x1 < rect.x + rect.width) {
            var x2 = Math.min(rect.x + rect.width, Math.floor(x1 + (maxtransfer / 4 / rect.height)));
            var data = alt1.bindGetRegion(ref, x1, rect.y, x2 - x1, rect.height);
            if (!data) {
                return null;
            }
            decodeImageString(data, buf, x1 - rect.x, 0, x2 - x1, rect.height);
            x1 = x2;
        }
    }
    return buf;
}
exports.capture = capture;
/**
 * Makes alt1 bind an area of the rs client in memory without sending it to the js client
 * returns an imgref object which can be used to get pixel data using the imgreftobuf function
 * currently only one bind can exist per app and the ref in (v) will always be 1
 */
function captureHold(x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    requireAlt1();
    var r = alt1.bindRegion(x, y, w, h);
    if (r <= 0) {
        throw new Alt1Error("capturehold failed");
    }
    return new imgref_1.ImgRefBind(r, x, y, w, h);
}
exports.captureHold = captureHold;
/**
 * Same as captureHoldRegion, but captures the screen instead of the rs client. it also uses screen coordinates instead and can capture outside of the rs client
 */
function captureHoldScreen(x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    requireAlt1();
    var r = alt1.bindScreenRegion(x, y, w, h);
    if (r <= 0) {
        return false;
    }
    return new imgref_1.ImgRefBind(r, x, y, w, h);
}
exports.captureHoldScreen = captureHoldScreen;
/**
 * bind the full rs window
 */
function captureHoldFullRs() {
    return captureHold(0, 0, alt1.rsWidth, alt1.rsHeight);
}
exports.captureHoldFullRs = captureHoldFullRs;
/**
 * returns a subregion from a bound image
 * used internally in imgreftobuf if imgref is a bound image
 * @deprecated This should be handled internall by the imgrefbind.toData method
 */
function transferImageData(handle, x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    requireAlt1();
    if (alt1.bindGetRegionBuffer) {
        return new imagedata_extensions_1.ImageData(alt1.bindGetRegionBuffer(handle, x, y, w, h), w, h);
    }
    var r = new imagedata_extensions_1.ImageData(w, h);
    var x1 = x;
    while (true) { //split up the request to to exceed the single transfer limit (for now)
        var x2 = Math.min(x + w, Math.floor(x1 + (maxtransfer / 4 / h)));
        var a = alt1.bindGetRegion(handle, x1, y, x2 - x1, h);
        if (!a) {
            throw new Alt1Error();
        }
        decodeImageString(a, r, x1 - x, 0, x2 - x1, h);
        x1 = x2;
        if (x1 == x + w) {
            break;
        }
        ;
    }
    return r;
}
exports.transferImageData = transferImageData;
/**
 * decodes a returned string from alt1 to an imagebuffer. You generally never have to do this yourself
 */
function decodeImageString(imagestring, target, x, y, w, h) {
    var bin = atob(imagestring);
    var bytes = target.data;
    w |= 0;
    h |= 0;
    var offset = 4 * x + 4 * y * target.width;
    var target_width = target.width | 0;
    for (var a = 0; a < w; a++) {
        for (var b = 0; b < h; b++) {
            var i1 = (offset + (a * 4 | 0) + (b * target_width * 4 | 0)) | 0;
            var i2 = ((a * 4 | 0) + (b * 4 * w | 0)) | 0;
            bytes[i1 + 0 | 0] = bin.charCodeAt(i2 + 2 | 0); //fix weird red/blue swap in c#
            bytes[i1 + 1 | 0] = bin.charCodeAt(i2 + 1 | 0);
            bytes[i1 + 2 | 0] = bin.charCodeAt(i2 + 0 | 0);
            bytes[i1 + 3 | 0] = bin.charCodeAt(i2 + 3 | 0);
        }
    }
    return target;
}
exports.decodeImageString = decodeImageString;
/**
 * encodes an imagebuffer to a string
 */
function encodeImageString(buf, sx = 0, sy = 0, sw = buf.width, sh = buf.height) {
    var raw = "";
    for (var y = sy; y < sy + sh; y++) {
        for (var x = sx; x < sx + sw; x++) {
            var i = 4 * x + 4 * buf.width * y | 0;
            raw += String.fromCharCode(buf.data[i + 2 | 0]);
            raw += String.fromCharCode(buf.data[i + 1 | 0]);
            raw += String.fromCharCode(buf.data[i + 0 | 0]);
            raw += String.fromCharCode(buf.data[i + 3 | 0]);
        }
    }
    return btoa(raw);
}
exports.encodeImageString = encodeImageString;
/**
 * mixes the given color into a single int. This format is used by alt1
 */
function mixColor(r, g, b, a = 255) {
    return (b << 0) + (g << 8) + (r << 16) + (a << 24);
}
exports.mixColor = mixColor;
function unmixColor(col) {
    var r = (col >> 16) & 0xff;
    var g = (col >> 8) & 0xff;
    var b = (col >> 0) & 0xff;
    return [r, g, b];
}
exports.unmixColor = unmixColor;
function identifyApp(url) {
    if (exports.hasAlt1) {
        alt1.identifyAppUrl(url);
    }
}
exports.identifyApp = identifyApp;
function resetEnvironment() {
    exports.hasAlt1 = (typeof alt1 != "undefined");
    exports.skinName = exports.hasAlt1 ? alt1.skinName : "default";
}
exports.resetEnvironment = resetEnvironment;
function convertAlt1Version(str) {
    var a = str.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!a) {
        throw new RangeError("Invalid version string");
    }
    return (+a[1]) * 1000 * 1000 + (+a[2]) * 1000 + (+a[3]) * 1;
}
var cachedVersionInt = -1;
/**
 * checks if alt1 is running and at least the given version. versionstr should be a string with the version eg: 1.3.2
 * @param versionstr
 */
function hasAlt1Version(versionstr) {
    if (!exports.hasAlt1) {
        return false;
    }
    if (cachedVersionInt == -1) {
        cachedVersionInt = alt1.versionint;
    }
    return cachedVersionInt >= convertAlt1Version(versionstr);
}
exports.hasAlt1Version = hasAlt1Version;
/**
 * Gets the current cursor position in the game, returns null if the rs window is not active (alt1.rsActive)
 */
function getMousePosition() {
    var pos = alt1.mousePosition;
    if (pos == -1) {
        return null;
    }
    return { x: pos >>> 16, y: pos & 0xFFFF };
}
exports.getMousePosition = getMousePosition;
/**
 * Registers a given HTML element as a frame border, when this element is dragged by the user the Alt1 frame will resize accordingly
 * Use the direction arguements to make a given direction stick to the mouse. eg. Only set left to true to make the element behave as the left border
 * Or set all to true to move the whole window. Not all combinations are permitted
 */
function addResizeElement(el, left, top, right, bot) {
    if (!exports.hasAlt1 || !alt1.userResize) {
        return;
    }
    el.addEventListener("mousedown", function (e) {
        alt1.userResize(left, top, right, bot);
        e.preventDefault();
    });
}
exports.addResizeElement = addResizeElement;
/**
 * Add an event listener
 */
function on(type, listener) {
    if (!exports.hasAlt1) {
        return;
    }
    if (!alt1.events) {
        alt1.events = {};
    }
    if (!alt1.events[type]) {
        alt1.events[type] = [];
    }
    alt1.events[type].push(listener);
}
exports.on = on;
/**
 * Removes an event listener
 */
function removeListener(type, listener) {
    var elist = exports.hasAlt1 && alt1.events && alt1.events[type];
    if (!elist) {
        return;
    }
    var i = elist.indexOf(listener);
    if (i == -1) {
        return;
    }
    elist.splice(i, 1);
}
exports.removeListener = removeListener;
/**
 * Listens for the event to fire once and then stops listening
 * @param event
 * @param cb
 */
function once(type, listener) {
    var fn = (e) => {
        removeListener(type, fn);
        listener(e);
    };
    on(type, fn);
}
exports.once = once;
;
/**
 * Used to read a set of images from a binary stream returned by the Alt1 API
 */
class ImageStreamReader {
    constructor(reader, ...args) {
        this.framebuffer = null;
        this.pos = 0;
        this.reading = false;
        this.closed = false;
        //paused state
        this.pausedindex = -1;
        this.pausedbuffer = null;
        this.streamreader = reader;
        if (args[0] instanceof imagedata_extensions_1.ImageData) {
            this.setFrameBuffer(args[0]);
        }
        else if (typeof args[0] == "number") {
            this.setFrameBuffer(new imagedata_extensions_1.ImageData(args[0], args[1]));
        }
    }
    /**
     *
     */
    setFrameBuffer(buffer) {
        if (this.reading) {
            throw new Error("can't change framebuffer while reading");
        }
        this.framebuffer = buffer;
    }
    /**
     * Closes the underlying stream and ends reading
     */
    close() {
        this.streamreader.cancel();
    }
    /**
     * Reads a single image from the stream
     */
    async nextImage() {
        if (this.reading) {
            throw new Error("already reading from this stream");
        }
        if (!this.framebuffer) {
            throw new Error("framebuffer not set");
        }
        this.reading = true;
        var synctime = -Date.now();
        var starttime = Date.now();
        var r = false;
        while (!r) {
            if (this.pausedindex != -1 && this.pausedbuffer) {
                r = this.readChunk(this.pausedindex, this.framebuffer.data, this.pausedbuffer);
            }
            else {
                synctime += Date.now();
                var res = await this.streamreader.read();
                synctime -= Date.now();
                if (res.done) {
                    throw new Error("Stream closed while reading");
                }
                var data = res.value;
                r = this.readChunk(0, this.framebuffer.data, data);
            }
        }
        synctime += Date.now();
        //console.log("Decoded async image, " + this.framebuffer.width + "x" + this.framebuffer.height + " time: " + (Date.now() - starttime) + "ms (" + synctime + "ms main thread)");
        this.reading = false;
        return this.framebuffer;
    }
    readChunk(i, framedata, buffer) {
        //very hot code, explicit int32 casting with |0 speeds it up by ~ x2
        i = i | 0;
        var framesize = framedata.length | 0;
        var pos = this.pos;
        var datalen = buffer.length | 0;
        //var data32 = new Float64Array(buffer.buffer);
        //var framedata32 = new Float64Array(framedata.buffer);
        //fix possible buffer misalignment
        //align to 16 for extra loop unrolling
        while (i < datalen) {
            //slow loop, fix alignment and other issues
            while (i < datalen && pos < framesize && (pos % 16 != 0 || !((i + 16 | 0) <= datalen && (pos + 16 | 0) <= framesize))) {
                var rel = pos;
                if (pos % 4 == 0) {
                    rel = rel + 2 | 0;
                }
                if (pos % 4 == 2) {
                    rel = rel - 2 | 0;
                }
                framedata[rel | 0] = buffer[i | 0];
                i = i + 1 | 0;
                pos = pos + 1 | 0;
            }
            //fast unrolled loop for large chunks i wish js had some sort of memcpy
            if (pos % 16 == 0) {
                while ((i + 16 | 0) <= datalen && (pos + 16 | 0) <= framesize) {
                    framedata[pos + 0 | 0] = buffer[i + 2 | 0];
                    framedata[pos + 1 | 0] = buffer[i + 1 | 0];
                    framedata[pos + 2 | 0] = buffer[i + 0 | 0];
                    framedata[pos + 3 | 0] = buffer[i + 3 | 0];
                    framedata[pos + 4 | 0] = buffer[i + 6 | 0];
                    framedata[pos + 5 | 0] = buffer[i + 5 | 0];
                    framedata[pos + 6 | 0] = buffer[i + 4 | 0];
                    framedata[pos + 7 | 0] = buffer[i + 7 | 0];
                    framedata[pos + 8 | 0] = buffer[i + 10 | 0];
                    framedata[pos + 9 | 0] = buffer[i + 9 | 0];
                    framedata[pos + 10 | 0] = buffer[i + 8 | 0];
                    framedata[pos + 11 | 0] = buffer[i + 11 | 0];
                    framedata[pos + 12 | 0] = buffer[i + 14 | 0];
                    framedata[pos + 13 | 0] = buffer[i + 13 | 0];
                    framedata[pos + 14 | 0] = buffer[i + 12 | 0];
                    framedata[pos + 15 | 0] = buffer[i + 15 | 0];
                    //could speed it up another x2 but wouldn't be able to swap r/b swap and possible alignment issues
                    //framedata32[pos / 8 + 0 | 0] = data32[i / 8 + 0 | 0];
                    //framedata32[pos / 8 + 1 | 0] = data32[i / 8 + 1 | 0];
                    //framedata32[pos / 4 + 2 | 0] = data32[i / 4 + 2 | 0];
                    //framedata32[pos / 4 + 3 | 0] = data32[i / 4 + 3 | 0];
                    pos = pos + 16 | 0;
                    i = i + 16 | 0;
                }
            }
            if (pos >= framesize) {
                this.pausedbuffer = null;
                this.pausedindex = -1;
                this.pos = 0;
                if (i != buffer.length - 1) {
                    this.pausedbuffer = buffer;
                    this.pausedindex = i;
                }
                return true;
            }
        }
        this.pos = pos;
        this.pausedbuffer = null;
        this.pausedindex = -1;
        return false;
    }
}
exports.ImageStreamReader = ImageStreamReader;
/**
 * Asynchronously captures a section of the game screen
 */
async function captureAsync(...args) {
    requireAlt1();
    var rect = rect_1.default.fromArgs(...args);
    if (alt1.captureAsync) {
        let img = await alt1.captureAsync(rect.x, rect.y, rect.width, rect.height);
        return new imagedata_extensions_1.ImageData(img, rect.width, rect.height);
    }
    if (!hasAlt1Version("1.4.6")) {
        return capture(rect.x, rect.y, rect.width, rect.height);
    }
    var url = "https://alt1api/pixel/getregion/" + encodeURIComponent(JSON.stringify(Object.assign(Object.assign({}, rect), { format: "raw", quality: 1 })));
    var res = await fetch(url);
    var imgreader = new ImageStreamReader(res.body.getReader(), rect.width, rect.height);
    return imgreader.nextImage();
}
exports.captureAsync = captureAsync;
/**
 * Asynchronously captures multple area's. This method captures the images in the same render frame if possible
 * @param areas
 */
async function captureMultiAsync(areas) {
    requireAlt1();
    var r = {};
    if (alt1.captureMultiAsync) {
        let bufs = await alt1.captureMultiAsync(areas);
        for (let a in areas) {
            if (!bufs[a]) {
                r[a] = null;
            }
            r[a] = new imagedata_extensions_1.ImageData(bufs[a], areas[a].width, areas[a].height);
        }
        return r;
    }
    var capts = [];
    var captids = [];
    for (var id in areas) {
        if (areas[id]) {
            capts.push(areas[id]);
            captids.push(id);
        }
        else {
            r[id] = null;
        }
    }
    if (capts.length == 0) {
        return r;
    }
    if (!hasAlt1Version("1.5.1")) {
        var proms = [];
        for (var a = 0; a < capts.length; a++) {
            proms.push(captureAsync(capts[a]));
        }
        var results = await Promise.all(proms);
        for (var a = 0; a < capts.length; a++) {
            r[captids[a]] = results[a];
        }
    }
    else {
        var res = await fetch("https://alt1api/pixel/getregionmulti/" + encodeURIComponent(JSON.stringify({ areas: capts, format: "raw", quality: 1 })));
        var imgreader = new ImageStreamReader(res.body.getReader());
        for (var a = 0; a < capts.length; a++) {
            var capt = capts[a];
            imgreader.setFrameBuffer(new imagedata_extensions_1.ImageData(capt.width, capt.height));
            r[captids[a]] = await imgreader.nextImage();
        }
    }
    return r;
}
exports.captureMultiAsync = captureMultiAsync;
/**
 * Starts capturing a realtime stream of the game. Make sure you keep reading the stream and close it when you're done or Alt1 WILL crash
 * @param framecb Called whenever a new frame is decoded
 * @param errorcb Called whenever an error occurs, the error is rethrown if not defined
 * @param fps Maximum fps of the stream
 */
function captureStream(x, y, width, height, fps, framecb, errorcb) {
    requireAlt1();
    if (!hasAlt1Version("1.4.6")) {
        throw new Alt1Error("This function is not supported in this version of Alt1");
    }
    var url = "https://alt1api/pixel/streamregion/" + encodeURIComponent(JSON.stringify({ x, y, width, height, fps, format: "raw" }));
    var res = fetch(url).then(async (res) => {
        var reader = new ImageStreamReader(res.body.getReader(), width, height);
        try {
            while (!reader.closed && !state.closed) {
                var img = await reader.nextImage();
                if (!state.closed) {
                    framecb(img);
                    state.framenr++;
                }
            }
        }
        catch (e) {
            if (!state.closed) {
                reader.close();
                if (errorcb) {
                    errorcb(e);
                }
                else {
                    throw e;
                }
            }
        }
        if (!reader.closed && state.closed) {
            reader.close();
        }
    });
    var state = {
        x, y, width, height,
        framenr: 0,
        close: () => { state.closed = true; },
        closed: false,
    };
    return state;
}
exports.captureStream = captureStream;


/***/ },

/***/ "canvas"
/*!*************************!*\
  !*** external "canvas" ***!
  \*************************/
(module) {

if(typeof __WEBPACK_EXTERNAL_MODULE_canvas__ === 'undefined') { var e = new Error("Cannot find module 'canvas'"); e.code = 'MODULE_NOT_FOUND'; throw e; }

module.exports = __WEBPACK_EXTERNAL_MODULE_canvas__;

/***/ },

/***/ "electron/common"
/*!**********************************!*\
  !*** external "electron/common" ***!
  \**********************************/
(module) {

if(typeof __WEBPACK_EXTERNAL_MODULE_electron_common__ === 'undefined') { var e = new Error("Cannot find module 'electron/common'"); e.code = 'MODULE_NOT_FOUND'; throw e; }

module.exports = __WEBPACK_EXTERNAL_MODULE_electron_common__;

/***/ },

/***/ "sharp"
/*!************************!*\
  !*** external "sharp" ***!
  \************************/
(module) {

if(typeof __WEBPACK_EXTERNAL_MODULE_sharp__ === 'undefined') { var e = new Error("Cannot find module 'sharp'"); e.code = 'MODULE_NOT_FOUND'; throw e; }

module.exports = __WEBPACK_EXTERNAL_MODULE_sharp__;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_77824__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_77824__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__nested_webpack_require_77824__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __nested_webpack_exports__ = __nested_webpack_require_77824__("./src/base/index.ts");
/******/ 	
/******/ 	return __nested_webpack_exports__;
/******/ })()
;
});

/***/ },

/***/ "./node_modules/alt1/dist/dialog/index.js"
/*!************************************************!*\
  !*** ./node_modules/alt1/dist/dialog/index.js ***!
  \************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory(__webpack_require__(/*! alt1/base */ "./node_modules/alt1/dist/base/index.js"), __webpack_require__(/*! alt1/ocr */ "./node_modules/alt1/dist/ocr/index.js"));
	else // removed by dead control flow
{}
})(globalThis, (__WEBPACK_EXTERNAL_MODULE_alt1_base__, __WEBPACK_EXTERNAL_MODULE_alt1_ocr__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/dialog/imgs/12pt.fontmeta.json"
/*!********************************************!*\
  !*** ./src/dialog/imgs/12pt.fontmeta.json ***!
  \********************************************/
(module) {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"chars":[{"width":7,"bonus":105,"chr":"a","pixels":[1,6,80,1,7,249,1,8,252,1,9,130,2,3,196,2,6,203,2,9,241,3,3,239,3,6,237,3,9,218,4,3,222,4,4,111,4,6,242,4,8,142,4,9,88,5,4,212,5,5,242,5,6,244,5,7,244,5,8,244,5,9,231],"secondary":false},{"width":8,"bonus":135,"chr":"b","pixels":[1,0,244,1,1,244,1,2,242,1,3,233,1,4,255,1,5,255,1,6,249,1,7,255,1,8,255,1,9,193,2,3,124,2,4,137,2,8,141,2,9,116,3,3,231,3,9,223,4,3,233,4,9,233,5,3,151,5,4,188,5,8,189,5,9,151,6,4,127,6,5,211,6,6,235,6,7,210,6,8,126],"secondary":false},{"width":6,"bonus":65,"chr":"c","pixels":[1,4,173,1,5,252,1,6,250,1,7,254,1,8,180,2,3,171,2,4,141,2,8,142,2,9,179,3,3,234,3,9,237,4,3,231,4,9,230],"secondary":false},{"width":8,"bonus":135,"chr":"d","pixels":[1,4,174,1,5,253,1,6,250,1,7,253,1,8,178,2,3,175,2,4,159,2,8,152,2,9,179,3,3,237,3,9,238,4,3,223,4,9,222,5,3,114,5,4,187,5,8,174,5,9,90,6,0,244,6,1,244,6,2,244,6,3,244,6,4,244,6,5,244,6,6,244,6,7,244,6,8,244,6,9,239],"secondary":false},{"width":7,"bonus":105,"chr":"e","pixels":[1,4,173,1,5,252,1,6,255,1,7,251,1,8,174,2,3,184,2,4,126,2,6,240,2,8,131,2,9,175,3,3,237,3,6,240,3,9,236,4,3,180,4,4,144,4,6,241,4,9,232,5,4,149,5,5,219,5,6,235,5,9,115],"secondary":false},{"width":4,"bonus":75,"chr":"f","pixels":[0,3,214,1,0,101,1,1,245,1,2,246,1,3,255,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,244,2,0,232,2,3,240,3,0,228,3,3,138],"secondary":false},{"width":8,"bonus":160,"chr":"g","pixels":[1,4,173,1,5,253,1,6,250,1,7,253,1,8,178,1,12,105,2,3,175,2,4,156,2,8,150,2,9,179,2,12,222,3,3,237,3,9,238,3,12,242,4,3,221,4,9,222,4,12,232,5,3,88,5,4,186,5,8,176,5,9,114,5,11,174,5,12,166,6,3,240,6,4,244,6,5,244,6,6,244,6,7,244,6,8,244,6,9,244,6,10,225,6,11,161],"secondary":false},{"width":7,"bonus":105,"chr":"h","pixels":[1,0,244,1,1,244,1,2,244,1,3,236,1,4,254,1,5,255,1,6,246,1,7,244,1,8,244,1,9,244,2,3,123,2,4,120,3,3,238,4,3,222,4,4,113,5,4,205,5,5,240,5,6,244,5,7,244,5,8,244,5,9,244],"secondary":false},{"width":3,"bonus":40,"chr":"i","pixels":[1,0,182,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,244],"secondary":true},{"width":3,"bonus":60,"chr":"j","pixels":[0,12,236,1,0,182,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,244,1,10,243,1,11,223,1,12,98],"secondary":false},{"width":6,"bonus":115,"chr":"k","pixels":[1,0,244,1,1,244,1,2,244,1,3,244,1,4,244,1,5,244,1,6,251,1,7,248,1,8,244,1,9,244,2,5,87,2,6,226,3,4,128,3,5,201,3,6,192,3,7,198,4,3,165,4,4,177,4,7,116,4,8,238,4,9,108,5,3,148,5,9,208],"secondary":false},{"width":3,"bonus":50,"chr":"l","pixels":[1,0,244,1,1,244,1,2,244,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,244],"secondary":false},{"width":11,"bonus":145,"chr":"m","pixels":[1,3,208,1,4,254,1,5,255,1,6,245,1,7,244,1,8,244,1,9,244,2,3,121,2,4,120,3,3,238,4,3,227,4,4,111,5,4,250,5,5,255,5,6,244,5,7,244,5,8,244,5,9,244,6,3,147,6,4,118,7,3,238,8,3,223,8,4,112,9,4,205,9,5,239,9,6,244,9,7,244,9,8,244,9,9,244],"secondary":false},{"width":7,"bonus":90,"chr":"n","pixels":[1,3,208,1,4,254,1,5,255,1,6,245,1,7,244,1,8,244,1,9,244,2,3,119,2,4,120,3,3,237,4,3,223,4,4,113,5,4,205,5,5,239,5,6,244,5,7,244,5,8,244,5,9,244],"secondary":false},{"width":8,"bonus":110,"chr":"o","pixels":[1,4,168,1,5,252,1,6,250,1,7,250,1,8,165,2,3,163,2,4,152,2,8,155,2,9,165,3,3,231,3,9,239,4,3,226,4,9,226,5,3,133,5,4,193,5,8,195,5,9,134,6,4,114,6,5,208,6,6,234,6,7,207,6,8,116],"secondary":false},{"width":8,"bonus":135,"chr":"p","pixels":[1,3,212,1,4,255,1,5,255,1,6,248,1,7,255,1,8,255,1,9,234,1,10,243,1,11,244,1,12,244,2,3,117,2,4,137,2,8,146,2,9,114,3,3,219,3,9,222,4,3,234,4,9,233,5,3,151,5,4,195,5,8,199,5,9,151,6,4,127,6,5,211,6,6,235,6,7,210,6,8,126],"secondary":false},{"width":8,"bonus":135,"chr":"q","pixels":[1,4,174,1,5,253,1,6,250,1,7,253,1,8,179,2,3,175,2,4,155,2,8,152,2,9,179,3,3,237,3,9,239,4,3,223,4,9,222,5,3,88,5,4,186,5,8,174,5,9,114,6,3,238,6,4,244,6,5,244,6,6,244,6,7,244,6,8,244,6,9,244,6,10,244,6,11,244,6,12,244],"secondary":false},{"width":5,"bonus":55,"chr":"r","pixels":[1,3,206,1,4,246,1,5,255,1,6,245,1,7,244,1,8,244,1,9,244,2,3,100,2,4,168,3,3,231,4,3,144],"secondary":false},{"width":7,"bonus":95,"chr":"s","pixels":[1,3,101,1,4,252,1,5,223,1,9,195,2,3,219,2,5,138,2,6,137,2,9,240,3,3,239,3,6,230,3,9,237,4,3,229,4,6,177,4,7,133,4,8,96,4,9,198,5,3,121,5,7,203,5,8,215],"secondary":false},{"width":4,"bonus":70,"chr":"t","pixels":[0,3,211,1,1,91,1,2,233,1,3,255,1,4,244,1,5,244,1,6,244,1,7,244,1,8,253,1,9,133,2,3,240,2,9,239,3,3,195,3,9,193],"secondary":false},{"width":7,"bonus":90,"chr":"u","pixels":[1,3,244,1,4,244,1,5,244,1,6,244,1,7,248,1,8,247,1,9,106,2,9,235,3,9,231,4,8,165,4,9,97,5,3,244,5,4,244,5,5,244,5,6,244,5,7,244,5,8,244,5,9,240],"secondary":false},{"width":6,"bonus":90,"chr":"v","pixels":[0,3,211,0,4,122,1,4,159,1,5,238,1,6,200,1,7,111,2,7,157,2,8,227,2,9,189,3,7,133,3,8,209,3,9,212,4,4,136,4,5,220,4,6,223,4,7,134,5,3,231,5,4,145],"secondary":false},{"width":9,"bonus":175,"chr":"w","pixels":[0,3,188,0,4,123,1,3,85,1,4,146,1,5,206,1,6,241,1,7,186,1,8,121,2,7,101,2,8,213,2,9,255,3,5,145,3,6,218,3,7,211,3,8,136,4,3,245,4,4,211,4,5,106,5,3,111,5,4,183,5,5,234,5,6,179,5,7,108,6,7,139,6,8,216,6,9,220,7,5,99,7,6,160,7,7,220,7,8,228,7,9,164,8,3,231,8,4,233,8,5,168,8,6,103],"secondary":false},{"width":6,"bonus":110,"chr":"x","pixels":[0,3,90,0,9,117,1,3,210,1,4,179,1,8,202,1,9,185,2,4,120,2,5,232,2,6,159,2,7,229,2,8,92,3,5,200,3,6,239,3,7,174,4,3,124,4,4,231,4,5,101,4,7,128,4,8,230,4,9,96,5,3,177,5,9,203],"secondary":false},{"width":6,"bonus":130,"chr":"y","pixels":[0,3,205,0,4,109,0,12,201,1,3,80,1,4,171,1,5,241,1,6,173,1,7,77,1,12,231,2,6,97,2,7,182,2,8,224,2,9,141,2,10,156,2,11,237,2,12,87,3,7,130,3,8,211,3,9,210,3,10,119,4,4,133,4,5,218,4,6,225,4,7,136,5,3,236,5,4,151],"secondary":false},{"width":6,"bonus":85,"chr":"z","pixels":[1,3,191,1,8,141,1,9,252,2,3,240,2,7,218,2,8,140,2,9,243,3,3,240,3,5,161,3,6,208,3,9,240,4,3,250,4,4,225,4,5,121,4,9,240,5,3,127,5,9,138],"secondary":false},{"width":8,"bonus":140,"chr":"A","pixels":[0,8,113,0,9,208,1,5,84,1,6,179,1,7,235,1,8,157,2,3,150,2,4,232,2,5,175,2,6,243,3,1,215,3,2,202,3,3,107,3,6,232,4,1,127,4,2,218,4,3,193,4,4,101,4,6,232,5,4,156,5,5,233,5,6,251,5,7,99,6,6,90,6,7,185,6,8,240,6,9,161,7,9,120],"secondary":false},{"width":8,"bonus":155,"chr":"B","pixels":[1,1,255,1,2,244,1,3,244,1,4,244,1,5,255,1,6,244,1,7,244,1,8,244,1,9,255,2,1,240,2,5,240,2,9,240,3,1,241,3,5,242,3,9,240,4,1,238,4,5,255,4,9,236,5,1,182,5,2,145,5,4,148,5,5,198,5,6,152,5,8,149,5,9,173,6,2,194,6,3,232,6,4,154,6,6,177,6,7,233,6,8,182],"secondary":false},{"width":8,"bonus":100,"chr":"C","pixels":[1,3,199,1,4,254,1,5,251,1,6,252,1,7,206,1,8,78,2,2,235,2,3,104,2,7,98,2,8,235,2,9,93,3,1,192,3,2,82,3,9,212,4,1,238,4,9,245,5,1,237,5,9,240,6,1,189,6,9,170],"secondary":false},{"width":9,"bonus":140,"chr":"D","pixels":[1,1,255,1,2,244,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,255,2,1,240,2,9,240,3,1,243,3,9,245,4,1,233,4,9,227,5,1,165,5,2,132,5,8,149,5,9,154,6,2,235,6,3,156,6,7,168,6,8,229,7,3,158,7,4,222,7,5,238,7,6,216,7,7,147],"secondary":false},{"width":6,"bonus":105,"chr":"E","pixels":[1,1,255,1,2,244,1,3,244,1,4,244,1,5,255,1,6,244,1,7,244,1,8,244,1,9,255,2,1,240,2,5,240,2,9,240,3,1,240,3,5,240,3,9,240,4,1,240,4,5,240,4,9,240,5,1,157,5,5,105,5,9,157],"secondary":false},{"width":6,"bonus":85,"chr":"F","pixels":[1,1,255,1,2,244,1,3,244,1,4,244,1,5,255,1,6,244,1,7,244,1,8,244,1,9,244,2,1,240,2,5,240,3,1,240,3,5,240,4,1,240,4,5,240,5,1,157,5,5,101],"secondary":false},{"width":9,"bonus":135,"chr":"G","pixels":[1,3,190,1,4,254,1,5,251,1,6,255,1,7,208,2,2,236,2,3,118,2,7,106,2,8,239,3,1,171,3,2,107,3,8,95,3,9,198,4,1,233,4,9,245,5,1,241,5,5,240,5,9,240,6,1,221,6,5,241,6,9,225,7,1,118,7,5,236,7,6,244,7,7,244,7,8,244,7,9,165],"secondary":false},{"width":8,"bonus":110,"chr":"H","pixels":[1,1,244,1,2,244,1,3,244,1,4,244,1,5,255,1,6,244,1,7,244,1,8,244,1,9,244,2,5,240,3,5,240,4,5,240,5,5,242,6,1,244,6,2,244,6,3,244,6,4,244,6,5,244,6,6,244,6,7,244,6,8,244,6,9,244],"secondary":false},{"width":4,"bonus":65,"chr":"I","pixels":[1,1,212,1,9,209,2,1,254,2,2,244,2,3,244,2,4,244,2,5,244,2,6,244,2,7,244,2,8,244,2,9,254,3,1,192,3,9,190],"secondary":false},{"width":3,"bonus":65,"chr":"J","pixels":[0,11,110,0,12,205,1,1,244,1,2,244,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,244,1,10,236,1,11,188],"secondary":false},{"width":7,"bonus":125,"chr":"K","pixels":[1,1,244,1,2,244,1,3,244,1,4,244,1,5,251,1,6,249,1,7,244,1,8,244,1,9,244,2,5,220,3,3,100,3,4,221,3,5,234,3,6,156,4,2,139,4,3,203,4,6,179,4,7,219,5,1,175,5,2,177,5,7,102,5,8,240,5,9,126,6,1,144,6,9,198],"secondary":false},{"width":6,"bonus":65,"chr":"L","pixels":[1,1,244,1,2,244,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,255,2,9,255,3,9,255,4,9,255,5,9,176],"secondary":false},{"width":10,"bonus":205,"chr":"M","pixels":[1,1,255,1,2,246,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,244,2,1,176,2,2,224,2,3,153,3,3,85,3,4,168,3,5,225,3,6,161,3,7,79,4,6,77,4,7,159,4,8,229,4,9,169,5,6,112,5,7,193,5,8,192,5,9,113,6,3,117,6,4,196,6,5,184,6,6,103,7,1,206,7,2,213,7,3,130,8,1,244,8,2,244,8,3,244,8,4,244,8,5,244,8,6,244,8,7,244,8,8,244,8,9,244],"secondary":false},{"width":9,"bonus":160,"chr":"N","pixels":[1,1,255,1,2,250,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,244,2,1,141,2,2,239,2,3,115,3,3,193,3,4,208,4,4,93,4,5,230,4,6,151,5,6,146,5,7,229,5,8,90,6,7,84,6,8,224,6,9,187,7,1,244,7,2,244,7,3,244,7,4,244,7,5,244,7,6,244,7,7,244,7,8,244,7,9,244],"secondary":false},{"width":10,"bonus":165,"chr":"O","pixels":[1,2,82,1,3,211,1,4,255,1,5,251,1,6,255,1,7,210,1,8,81,2,1,78,2,2,233,2,3,94,2,7,96,2,8,233,2,9,79,3,1,200,3,2,77,3,9,202,4,1,243,4,9,244,5,1,240,5,9,241,6,1,182,6,2,101,6,8,101,6,9,182,7,2,234,7,3,141,7,7,142,7,8,234,8,3,158,8,4,221,8,5,239,8,6,221,8,7,157],"secondary":false},{"width":7,"bonus":100,"chr":"P","pixels":[1,1,255,1,2,244,1,3,244,1,4,244,1,5,255,1,6,244,1,7,244,1,8,244,1,9,244,2,1,240,2,5,240,3,1,236,3,5,227,4,1,185,4,2,136,4,4,150,4,5,161,5,2,194,5,3,231,5,4,173],"secondary":false},{"width":10,"bonus":185,"chr":"Q","pixels":[1,2,82,1,3,211,1,4,255,1,5,251,1,6,255,1,7,210,1,8,81,2,1,78,2,2,233,2,3,94,2,7,96,2,8,233,2,9,79,3,1,200,3,2,77,3,9,202,4,1,243,4,9,244,5,1,240,5,9,254,5,10,87,6,1,182,6,2,101,6,8,101,6,9,209,6,10,236,6,11,119,7,2,234,7,3,141,7,7,142,7,8,232,7,11,232,8,3,158,8,4,221,8,5,238,8,6,216,8,7,152],"secondary":false},{"width":7,"bonus":135,"chr":"R","pixels":[1,1,255,1,2,244,1,3,244,1,4,244,1,5,255,1,6,244,1,7,244,1,8,244,1,9,244,2,1,240,2,5,240,3,1,236,3,5,250,3,6,77,4,1,189,4,2,128,4,4,138,4,5,176,4,6,195,4,7,211,4,8,93,5,2,195,5,3,234,5,4,173,5,8,203,5,9,223,6,9,81],"secondary":false},{"width":7,"bonus":100,"chr":"S","pixels":[1,2,241,1,3,253,1,4,206,1,9,210,2,1,210,2,4,171,2,5,158,2,9,241,3,1,240,3,5,246,3,9,235,4,1,226,4,5,162,4,6,188,4,8,134,4,9,176,5,1,111,5,6,171,5,7,230,5,8,183],"secondary":false},{"width":8,"bonus":70,"chr":"T","pixels":[1,1,240,2,1,240,3,1,242,4,1,255,4,2,244,4,3,244,4,4,244,4,5,244,4,6,244,4,7,244,4,8,244,4,9,244,5,1,240,6,1,240],"secondary":false},{"width":9,"bonus":115,"chr":"U","pixels":[1,1,244,1,2,244,1,3,244,1,4,244,1,5,244,1,6,244,1,7,251,1,8,162,2,8,171,2,9,140,3,9,223,4,9,239,5,9,212,6,8,205,6,9,106,7,1,244,7,2,244,7,3,244,7,4,244,7,5,244,7,6,242,7,7,209,7,8,110],"secondary":false},{"width":7,"bonus":135,"chr":"V","pixels":[0,1,212,0,2,125,1,2,161,1,3,240,1,4,207,1,5,120,2,4,77,2,5,163,2,6,240,2,7,202,2,8,115,3,7,90,3,8,220,3,9,254,4,5,114,4,6,199,4,7,242,4,8,166,4,9,79,5,2,113,5,3,199,5,4,245,5,5,171,5,6,84,6,1,247,6,2,176,6,3,89],"secondary":false},{"width":11,"bonus":240,"chr":"W","pixels":[0,1,188,0,2,123,1,1,98,1,2,161,1,3,224,1,4,244,1,5,184,1,6,119,2,5,93,2,6,154,2,7,204,2,8,233,2,9,180,3,6,138,3,7,193,3,8,219,3,9,163,4,2,112,4,3,183,4,4,240,4,5,190,4,6,119,5,1,255,5,2,233,5,3,124,6,2,134,6,3,208,6,4,233,6,5,163,6,6,90,7,5,100,7,6,171,7,7,226,7,8,201,7,9,128,8,6,112,8,7,169,8,8,236,8,9,216,9,2,124,9,3,185,9,4,242,9,5,219,9,6,154,9,7,89,10,1,223,10,2,158,10,3,93],"secondary":false},{"width":7,"bonus":135,"chr":"X","pixels":[0,1,118,0,9,166,1,1,187,1,2,211,1,7,112,1,8,231,1,9,123,2,2,83,2,3,223,2,4,156,2,6,208,2,7,170,3,4,212,3,5,255,3,6,133,4,3,211,4,4,155,4,5,78,4,6,214,4,7,175,5,1,169,5,2,212,5,7,119,5,8,237,5,9,134,6,1,120,6,9,174],"secondary":false},{"width":7,"bonus":95,"chr":"Y","pixels":[0,1,190,1,1,107,1,2,227,1,3,183,2,3,107,2,4,227,2,5,176,3,5,224,3,6,249,3,7,244,3,8,244,3,9,244,4,3,152,4,4,232,4,5,122,5,1,156,5,2,237,5,3,131,6,1,141],"secondary":false},{"width":8,"bonus":120,"chr":"Z","pixels":[1,1,240,1,8,141,1,9,252,2,1,240,2,7,222,2,8,180,2,9,245,3,1,240,3,5,161,3,6,233,3,7,88,3,9,240,4,1,240,4,3,89,4,4,233,4,5,160,4,9,240,5,1,245,5,2,180,5,3,222,5,9,240,6,1,252,6,2,140,6,9,240],"secondary":false},{"width":7,"bonus":130,"chr":"0","pixels":[1,2,174,1,3,245,1,4,254,1,5,247,1,6,254,1,7,237,1,8,157,2,1,204,2,2,136,2,8,134,2,9,199,3,1,244,3,9,245,4,1,169,4,2,182,4,3,85,4,7,84,4,8,181,4,9,178,5,2,115,5,3,194,5,4,222,5,5,238,5,6,224,5,7,194,5,8,115],"secondary":false},{"width":7,"bonus":65,"chr":"1","pixels":[1,2,192,1,3,81,2,1,150,2,2,164,3,1,244,3,2,244,3,3,244,3,4,244,3,5,244,3,6,244,3,7,244,3,8,244,3,9,244],"secondary":false},{"width":7,"bonus":105,"chr":"2","pixels":[1,2,116,1,8,114,1,9,253,2,1,203,2,7,148,2,8,192,2,9,244,3,1,241,3,6,181,3,7,169,3,9,240,4,1,201,4,2,120,4,4,94,4,5,220,4,6,134,4,9,240,5,2,192,5,3,233,5,4,188,5,9,240],"secondary":false},{"width":7,"bonus":110,"chr":"3","pixels":[1,1,122,1,2,116,1,9,193,2,1,221,2,5,206,2,9,239,3,1,240,3,5,255,3,9,235,4,1,199,4,2,122,4,4,169,4,5,182,4,6,148,4,8,146,4,9,175,5,2,200,5,3,230,5,4,136,5,6,178,5,7,232,5,8,179],"secondary":false},{"width":7,"bonus":115,"chr":"4","pixels":[1,6,157,1,7,254,2,4,96,2,5,212,2,6,93,2,7,236,3,3,189,3,4,148,3,7,236,4,1,132,4,2,203,4,3,86,4,7,238,5,1,244,5,2,244,5,3,244,5,4,244,5,5,244,5,6,244,5,7,255,5,8,245,5,9,244,6,7,236],"secondary":false},{"width":7,"bonus":105,"chr":"5","pixels":[1,1,176,1,2,198,1,3,220,1,4,232,1,9,200,2,1,244,2,4,231,2,9,240,3,1,240,3,4,234,3,9,229,4,1,240,4,4,164,4,5,180,4,8,174,4,9,149,5,1,78,5,5,159,5,6,227,5,7,217,5,8,139],"secondary":false},{"width":7,"bonus":125,"chr":"6","pixels":[1,2,91,1,3,206,1,4,252,1,5,255,1,6,251,1,7,249,1,8,164,2,1,107,2,2,202,2,4,120,2,5,119,2,8,137,2,9,181,3,1,218,3,4,233,3,9,238,4,1,242,4,4,196,4,5,146,4,8,152,4,9,183,5,5,176,5,6,231,5,7,222,5,8,157],"secondary":false},{"width":7,"bonus":95,"chr":"7","pixels":[1,1,240,2,1,240,2,9,143,3,1,240,3,7,171,3,8,248,3,9,171,4,1,240,4,4,85,4,5,199,4,6,237,4,7,136,5,1,243,5,2,113,5,3,223,5,4,212,5,5,102,6,1,254,6,2,179],"secondary":false},{"width":7,"bonus":145,"chr":"8","pixels":[1,1,77,1,2,246,1,3,251,1,4,152,1,6,217,1,7,251,1,8,241,2,1,216,2,4,184,2,5,235,2,6,89,2,9,217,3,1,239,3,4,80,3,5,227,3,9,239,4,1,201,4,2,109,4,4,209,4,5,189,4,6,171,4,8,120,4,9,195,5,2,206,5,3,224,5,4,91,5,6,159,5,7,231,5,8,189],"secondary":false},{"width":7,"bonus":120,"chr":"9","pixels":[1,2,229,1,3,251,1,4,242,1,5,82,1,9,109,2,1,211,2,2,79,2,5,220,2,9,241,3,1,233,3,5,228,3,9,209,4,1,148,4,2,155,4,4,133,4,5,129,4,7,141,4,8,242,5,2,112,5,3,208,5,4,238,5,5,235,5,6,211,5,7,155],"secondary":false},{"width":11,"bonus":195,"chr":"%","pixels":[1,2,125,1,3,252,1,4,253,1,5,122,2,2,230,2,5,232,3,2,220,3,3,77,3,4,77,3,5,224,3,8,126,3,9,218,4,2,80,4,3,222,4,4,222,4,5,85,4,6,91,4,7,217,4,8,130,5,5,199,5,6,172,6,3,166,6,4,198,6,5,146,6,6,244,6,7,248,6,8,245,6,9,104,7,2,210,7,3,89,7,5,205,7,9,234,8,5,196,8,6,89,8,8,94,8,9,226,9,6,199,9,7,235,9,8,205],"secondary":false},{"width":5,"bonus":85,"chr":"/","pixels":[0,11,97,1,7,105,1,8,167,1,9,228,1,10,220,1,11,158,2,3,112,2,4,174,2,5,233,2,6,212,2,7,150,2,8,88,3,0,182,3,1,237,3,2,203,3,3,141,3,4,79],"secondary":false},{"width":7,"bonus":55,"chr":"+","pixels":[0,6,97,1,6,240,2,6,242,3,3,244,3,4,244,3,5,244,3,6,255,3,7,244,3,8,244,4,6,240,5,6,240],"secondary":false},{"width":6,"bonus":70,"chr":"?","pixels":[1,1,209,2,1,239,2,5,177,2,6,192,2,8,180,2,9,219,3,1,207,3,2,106,3,4,176,3,5,147,3,9,92,4,2,206,4,3,232,4,4,134],"secondary":false},{"width":5,"bonus":40,"chr":"!","pixels":[2,1,244,2,2,244,2,3,244,2,4,244,2,5,244,2,6,244,2,8,199,2,9,239],"secondary":true},{"width":11,"bonus":255,"chr":"@","pixels":[1,3,119,1,4,219,1,5,255,1,6,251,1,7,252,1,8,189,2,2,188,2,3,186,2,8,136,2,9,238,3,1,114,3,2,174,3,4,179,3,5,253,3,6,251,3,7,230,3,9,134,3,10,161,4,1,209,4,3,172,4,4,152,4,7,87,4,8,215,4,10,225,5,1,238,5,3,239,5,8,231,5,10,239,6,1,230,6,3,238,6,7,155,6,8,114,6,10,220,7,1,154,7,2,135,7,3,184,7,4,244,7,5,244,7,6,244,7,7,234,7,8,109,7,10,157,8,2,218,8,3,169,8,7,102,8,8,224,9,3,127,9,4,207,9,5,235,9,6,216,9,7,169],"secondary":false},{"width":8,"bonus":145,"chr":"#","pixels":[0,7,142,1,4,208,1,7,240,1,9,99,2,3,84,2,4,232,2,5,174,2,6,211,2,7,252,2,8,164,2,9,113,3,2,179,3,3,132,3,4,224,3,7,240,4,4,210,4,6,86,4,7,248,4,8,175,4,9,213,5,2,153,5,3,200,5,4,246,5,5,171,5,6,129,5,7,245,6,4,208,6,7,240,7,4,87],"secondary":false},{"width":7,"bonus":140,"chr":"$","pixels":[1,2,245,1,3,253,1,4,147,1,8,200,2,1,206,2,2,102,2,4,235,2,5,81,2,8,239,3,0,244,3,1,254,3,2,244,3,3,244,3,4,248,3,5,252,3,6,244,3,7,244,3,8,254,3,9,244,3,10,122,4,1,210,4,5,234,4,7,117,4,8,194,5,1,105,5,5,104,5,6,225,5,7,205],"secondary":false},{"width":7,"bonus":70,"chr":"^","pixels":[0,6,107,1,4,134,1,5,214,1,6,130,2,2,160,2,3,197,2,4,94,3,1,217,3,2,192,4,3,185,4,4,184,4,5,79,5,5,155,5,6,216],"secondary":false},{"width":7,"bonus":40,"chr":"~","pixels":[1,5,150,1,6,109,2,5,235,3,5,147,3,6,137,4,6,235,5,5,113,5,6,144],"secondary":true},{"width":9,"bonus":185,"chr":"&","pixels":[1,5,78,1,6,238,1,7,252,1,8,229,2,1,129,2,2,253,2,3,225,2,4,84,2,5,218,2,8,105,2,9,205,3,1,236,3,4,245,3,5,117,3,9,242,4,1,234,4,3,119,4,4,171,4,5,221,4,6,112,4,9,228,5,1,100,5,2,230,5,3,173,5,6,211,5,7,158,5,8,175,5,9,139,6,7,245,6,8,249,7,5,188,7,6,239,7,7,136,7,8,171,7,9,211,8,5,81,8,9,143],"secondary":false},{"width":7,"bonus":70,"chr":"*","pixels":[1,2,253,2,2,204,2,4,213,2,5,140,3,0,219,3,1,193,3,2,223,3,3,231,4,2,181,4,3,162,4,4,224,4,5,91,5,2,243,6,2,114],"secondary":false},{"width":4,"bonus":75,"chr":"(","pixels":[1,1,135,1,2,206,1,3,249,1,4,255,1,5,247,1,6,255,1,7,247,1,8,202,1,9,131,2,0,226,2,1,143,2,9,145,2,10,227,2,11,156,3,11,103],"secondary":false},{"width":5,"bonus":95,"chr":")","pixels":[1,11,145,2,0,234,2,1,194,2,2,124,2,3,77,2,7,77,2,8,123,2,9,191,2,10,237,2,11,113,3,1,86,3,2,156,3,3,201,3,4,227,3,5,239,3,6,229,3,7,206,3,8,160,3,9,92],"secondary":false},{"width":5,"bonus":25,"chr":"_","pixels":[0,11,240,1,11,240,2,11,240,3,11,240,4,11,228],"secondary":false},{"width":4,"bonus":15,"chr":"-","pixels":[1,6,240,2,6,240,3,6,217],"secondary":true},{"width":7,"bonus":60,"chr":"=","pixels":[0,4,97,0,7,97,1,4,240,1,7,240,2,4,240,2,7,240,3,4,240,3,7,240,4,4,240,4,7,240,5,4,240,5,7,240],"secondary":false},{"width":4,"bonus":65,"chr":"[","pixels":[1,0,244,1,1,244,1,2,244,1,3,244,1,4,244,1,5,244,1,6,244,1,7,244,1,8,244,1,9,244,1,10,244,1,11,247,2,11,240],"secondary":false},{"width":4,"bonus":70,"chr":"]","pixels":[0,11,120,1,11,241,2,0,244,2,1,244,2,2,244,2,3,244,2,4,244,2,5,244,2,6,244,2,7,244,2,8,244,2,9,244,2,10,244,2,11,236],"secondary":false},{"width":5,"bonus":80,"chr":"{","pixels":[0,5,153,1,4,102,1,5,233,1,6,102,2,0,253,2,1,244,2,2,244,2,3,243,2,4,207,2,6,207,2,7,243,2,8,244,2,9,244,2,10,253,2,11,118,3,11,229],"secondary":false},{"width":5,"bonus":75,"chr":"}","pixels":[1,11,218,2,0,225,2,1,244,2,2,244,2,3,244,2,4,243,2,5,88,2,6,243,2,7,244,2,8,244,2,9,244,2,10,223,2,11,80,3,5,247,4,5,105],"secondary":false},{"width":4,"bonus":40,"chr":":","pixels":[1,3,216,1,4,176,1,8,176,1,9,214,2,3,99,2,4,77,2,8,78,2,9,97],"secondary":true},{"width":4,"bonus":40,"chr":";","pixels":[0,11,91,1,3,216,1,4,176,1,9,243,1,10,234,1,11,139,2,3,99,2,4,77],"secondary":true},{"width":6,"bonus":55,"chr":"\\"","pixels":[1,1,148,1,2,122,1,3,97,2,1,166,2,2,141,2,3,116,3,1,116,3,2,90,4,1,194,4,2,169,4,3,144],"secondary":true},{"width":4,"bonus":30,"chr":"\'","pixels":[1,1,148,1,2,122,1,3,97,2,1,166,2,2,141,2,3,116],"secondary":true},{"width":7,"bonus":70,"chr":"<","pixels":[1,5,142,1,6,154,2,5,195,2,6,207,3,4,166,3,6,97,3,7,145,4,4,190,4,7,219,5,3,191,5,7,117,5,8,137,6,3,106,6,8,114],"secondary":false},{"width":7,"bonus":65,"chr":">","pixels":[1,3,219,1,8,198,2,3,121,2,4,124,2,7,176,3,4,211,3,7,204,4,4,96,4,5,135,4,6,156,4,7,84,5,5,198,5,6,206],"secondary":false},{"width":5,"bonus":85,"chr":"\\\\","pixels":[1,0,217,1,1,228,1,2,167,1,3,105,2,2,85,2,3,147,2,4,209,2,5,233,2,6,174,2,7,112,3,6,78,3,7,140,3,8,202,3,9,236,3,10,182,3,11,119,4,11,132],"secondary":false},{"width":3,"bonus":10,"chr":".","pixels":[1,8,197,1,9,236],"secondary":true},{"width":3,"bonus":25,"chr":",","pixels":[0,10,79,0,11,133,1,9,255,1,10,198,1,11,97],"secondary":true},{"width":7,"bonus":60,"chr":"|","pixels":[3,0,244,3,1,244,3,2,244,3,3,244,3,4,244,3,5,244,3,6,244,3,7,244,3,8,244,3,9,244,3,10,244,3,11,244],"secondary":true}],"width":11,"spacewidth":3,"shadow":false,"height":13,"basey":9}');

/***/ },

/***/ "./src/dialog/imgs/boxtl.data.png"
/*!****************************************!*\
  !*** ./src/dialog/imgs/boxtl.data.png ***!
  \****************************************/
(module, __unused_webpack_exports, __nested_webpack_require_22050__) {

module.exports=(__nested_webpack_require_22050__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAABAAAAAgCAYAAAAbifjMAAAACW5vUEUAAAAAAAAAAAChinLVAAAB9klEQVRIiaWUzW7UQBCEv+qdhQsiT4AECCSOvP+LwAXEgRsoUhA5EK27OMyPx9lkY4QPlseyq6uqu1of3r9xyKBAAsF8Qwg7SRsZ3L8B0qZcvXzBj5/XYFBDiAZgIEI44bQsSEIC2wgwUOzky7fvHfSfr5I2716/chyEbZC4j1ZlAPJ4YxunKVIgCadRPEJEEKqS8PxeFCMUqlVYKzCfDO7VtaJKUISrOdOPlXSTVN0FwM5WWINRydMyfht6O0wIu//sjgOjDESnpIld/7C3a30XiJiYQlTn75nWWHdfnB4gnusLIiIQYoyh1gLdxoguoz6PiUUUNTPqhK0MLNA0t9vpiDYTptTeG4g6tk3SFIcNG8zG9FhOy9oi95bOlna5TQbdj3qO4/HYDiLtIeNsJh8AAYh0Dg+kGt1Vhtg0XyDFGDJJlFwqdUuVfutQHST49PnrxaSW8WQP1J4anws5u2IrU0zypr5eYHCIaG0C5OFuT9uTAGm3OIPTjbgwuYcAJTNR1ExZJjOxfC7nkStgXZBIjGxA366XGWCthSrK5MMOBhGiRNSUt6SNcO4x0b3/EcgmaZtmJ4ti6uaZt08o2OUgbRJLOWxb1rfRnjb+ubvj+bMj7pnvS7j29WmAm1+/YYqpNutiB4OPb692f/wgwPXN7X8B/AXDnvPHX8I0oQAAAABJRU5ErkJggg==")

/***/ },

/***/ "./src/dialog/imgs/boxtl_leg.data.png"
/*!********************************************!*\
  !*** ./src/dialog/imgs/boxtl_leg.data.png ***!
  \********************************************/
(module, __unused_webpack_exports, __nested_webpack_require_23193__) {

module.exports=(__nested_webpack_require_23193__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAW5vUEUAYtdMlAAAAARub1BFAAAAAEEgjiIAAAAJbm9QRQAAAAAAAAAAAKGKctUAAAE0SURBVDhPjZFNTsMwEIVtJ45D05YmLVKBJRISsOIILNiw5QosOXpIKcpPHduFl0wINAHEJ+tpPB6/Gcv8+emRHZIX1TQ6QuBLbs37QNnVxQlj/P+L31yuH+7vZrNptt2QhxSy0vXe6SAMlYrQqshzyiPmt9fny2WslMqyrQr4+vQsTV8m0eTtdRNN582IjGmtob4nrNsLiqBJcjxfxKhGXBblIk6cNVL68AKwQDUCUVuHCsJZR8egrCpkdq0SSEIbb89vhoOZ53vNSYv0JeVpHni16fYCYYztsz10hzDWQEXQulI7Aq266BD0hHYdqC+BVl30CXlDUUZv+Bp9DIrIG4pBxE7XdPAb/bTkK0IVjN/6I1QmVquE9mMGo2KLJdI06xIjBOff72CLn/rr0YOfwVZr/QEeBH9rQlJ0YgAAAABJRU5ErkJggg==")

/***/ },

/***/ "./src/dialog/imgs/boxtr.data.png"
/*!****************************************!*\
  !*** ./src/dialog/imgs/boxtr.data.png ***!
  \****************************************/
(module, __unused_webpack_exports, __nested_webpack_require_24100__) {

module.exports=(__nested_webpack_require_24100__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACW5vUEUAAAAAAAAAAAChinLVAAABMklEQVQ4jV2TXU7EMAyEv7GyBwBuwBvi/mdDoK2HB8dpsqkqVbE1P/ZU31+fFvX0yUzSiSzAGKoqsKtHgrQYvz9/JNXYEOn67mY2gEaLEB/vb4wrEyFsF+zskwQyNre2DdAJdjJCgW0igtejSRlRPUxg42nBDElIp9wDRK2ulUyrBikYRdIgbhfL7xraBtp3RqUAeSIKhZZfC+QkcxrSvQFjhBnFrJPimHygmFKkrRbk82KUzS6sjZeqealJK72wCMbtRiBtQdHyG9IdIntaq5kNoVrvAe6ytTF5m6bmSiKCmMSLTUfk6nXODNA27kyMfTXHlFuBQJj065qNQkR7bWA38RYY94B12rieF7HybVZEbZPpI0yiMiIFzLk9Hg+G5wayeVy/b1RaSpkgFldLFOnkHyghrew8fDp9AAAAAElFTkSuQmCC")

/***/ },

/***/ "./src/dialog/imgs/boxtr_leg.data.png"
/*!********************************************!*\
  !*** ./src/dialog/imgs/boxtr_leg.data.png ***!
  \********************************************/
(module, __unused_webpack_exports, __nested_webpack_require_24979__) {

module.exports=(__nested_webpack_require_24979__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAW5vUEUAYtdMlAAAAARub1BFAAAAAEEgjiIAAAAJbm9QRQAAAAAAAAAAAKGKctUAAAFgSURBVDhPnZO9TsMwFIWPHZuUpo2g6hswsbMzsbEgMfAKiIUnYOWNWBh4F1CFhFKKojatmx/jY+E2RRWK+KSrm9ycHF//iceHO7tal5hM3tGLDyAkIIVAY+0maxUBjYApDYSwOOgdulqMxXwOAbjKPzk9GUPc315bLTWWZo2mNs69hzhOvIAjKC3A72Q4HOAj+9zUnp5fIG6uzm2WTdFP+si/ZkgGqRcTY4zPKpKo6sbnfjJAsZj79+l0BsmfSbEocHQ8Ql2V0Fq5LmIfNKaYz8x5nvsckEHIKJZLX1z95AC/kTRNN1rpullXNdyab9FKI3JBQvu1EwVCjVBLdgwCwSRQumm1aRsJ6/b5Ly4vzvYKInc23l4n+zv4DTtoj0pUpHzuZMD5hoUMBMNOBmx3Hyt3+DoZhJ3g+Wib8e507oBRltXOto7Ho24GvJVcNHbACGTuXnQy4MhcNGbGdhrAN5b0ly21yuFfAAAAAElFTkSuQmCC")

/***/ },

/***/ "./src/dialog/imgs/chatimg.data.png"
/*!******************************************!*\
  !*** ./src/dialog/imgs/chatimg.data.png ***!
  \******************************************/
(module, __unused_webpack_exports, __nested_webpack_require_25950__) {

module.exports=(__nested_webpack_require_25950__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAAUAAAAOCAIAAABoykFxAAAACW5vUEUAAAAAAAAAAAChinLVAAAAyElEQVQImQXBPWqGQBAA0NkZIauoKUSUz0bIFfQKIZDTpUiVI1naiFvaqIvguiCyf+Q99vf7o7We55mIxnGM1nW11i7LMgxDlmXIOd/3fZomY4y1FoUQQoht2xARAAi8PY7DOfc8D2OMXlVJRGVZhhCUUvjxDrmRUsqiKNI0ReccAFhrtdYhBDLsTfuIiK7rcs5FnPPzPLXWiJjnOXZd17ZtCAERvfeolGqapqoqACAivO/be9/3fRzHxhj6/vqUUiZJUtc1Y+wfwO1wX//ZNLEAAAAASUVORK5CYII=")

/***/ },

/***/ "./src/dialog/imgs/chatimg_leg.data.png"
/*!**********************************************!*\
  !*** ./src/dialog/imgs/chatimg_leg.data.png ***!
  \**********************************************/
(module, __unused_webpack_exports, __nested_webpack_require_26697__) {

module.exports=(__nested_webpack_require_26697__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOCAIAAACdNMrBAAAAAW5vUEUAYtdMlAAAAARub1BFAAAAAEEgjiIAAAAJbm9QRQAAAAAAAAAAAKGKctUAAAEOSURBVChTVY+7SgNBFIZnZ3aTWdCYddVcRBIVREEC2gcsFnwMO9/JxsrGzkbQB1AkleArWJjLXhRhJnNbf9ltcviL/3z/nDMzXjI+Hx0PDoadh6dJI6DGOUKIT6kPenZ6eHv/fDTo7vbbRSF5GCCjoDd3j/v9rThel0sLKoWG2DzN97rxdrwhlFHaCqGNdRAF7e1EUhlrHIQl1sAbGjb/N1aFXgqptYEoD3nx/Yu+QvURXI6+tqtFPcpru1os3my5oBX6tgaEaOtcWbKmTywJGF+rMlA8Cgm9vkry+ed0luXLxo9Q+I12JcSGvc7F+ORt8oE5a32pvEositqeI5fJ6OX1/Ws2TbNFUWR5nv4B2LeYEU2WizoAAAAASUVORK5CYII=")

/***/ },

/***/ "./src/dialog/imgs/chatimgactive.data.png"
/*!************************************************!*\
  !*** ./src/dialog/imgs/chatimgactive.data.png ***!
  \************************************************/
(module, __unused_webpack_exports, __nested_webpack_require_27584__) {

module.exports=(__nested_webpack_require_27584__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAAUAAAAOCAIAAABoykFxAAAACW5vUEUAAAAAAAAAAAChinLVAAAAxElEQVQImTXMMWuEMACG4c9YYpCUg1gQKi6unR1cj8L9thtu6h/q1KWDIAiCc1BQeh7RazSadrB9t3d5nLfLWSlVliWlNM/zh7ZtjTFSyvePT8E9whiTUhZFAWBdV1JVVV3XX+MMAIB7V7e+78fvBcC8/rji8EgpfQ6fjJ60seQlZMJem6YJggAA2bZtl5RSABzB2S7tJOGcL8uyD6cOSdM0SRL8R4ZhiONYcO/vp2nSWmdZxqkDwD29Hruu830/iiJr7S9rql8x5SLRJgAAAABJRU5ErkJggg==")

/***/ },

/***/ "./src/dialog/imgs/chatimgactive_leg.data.png"
/*!****************************************************!*\
  !*** ./src/dialog/imgs/chatimgactive_leg.data.png ***!
  \****************************************************/
(module, __unused_webpack_exports, __nested_webpack_require_28351__) {

module.exports=(__nested_webpack_require_28351__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOCAIAAACdNMrBAAAAAW5vUEUAYtdMlAAAAARub1BFAAAAAEEgjiIAAAAJbm9QRQAAAAAAAAAAAKGKctUAAAEESURBVChTPY4xTgMxEEXtmfFmE1hpRSQECqIIVRBCEanpuABnyImo09FzASokjgAVVUQBURpCSMiKHdt8ZwVf1mj8/veM7dXlxbBfnvTad4/vmSMNwRgjRAJ6fno4uX3IssA5k5KV5BHozeQedK9s5bm0dwmVmfh1OisLAa3rEJV8DCFE7wOBFjsO1AbGBAg0jerkDNTQSL6hyRDrfIjN5f8RRPpjmCw6NEhgjakdKknWJGCnhFj8yKDSfK7IQla2/p+46LBRaTkiNlETwvoYDY2vBx/V6m2x2u5IpxH3j4+Gg4Pnl1mluvSi335TBRwuu/vO+NFZ72m6+FxvlnW99v5L9ReDbXkhpJVqYwAAAABJRU5ErkJggg==")

/***/ },

/***/ "./src/dialog/imgs/chatimghover.data.png"
/*!***********************************************!*\
  !*** ./src/dialog/imgs/chatimghover.data.png ***!
  \***********************************************/
(module, __unused_webpack_exports, __nested_webpack_require_29222__) {

module.exports=(__nested_webpack_require_29222__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAAUAAAAOCAIAAABoykFxAAAACW5vUEUAAAAAAAAAAAChinLVAAAAzklEQVQImSXMsWqFMBQAUHtvE4SquFW00sXNH3BxEj/brUMReWR0VBQtgjRBHr1poq9Dzwecp9vnh1Kq6zpjTNu2z8MwWGv7vm+aJooiCIJgHEchxHVdiAhd1wkhpmlijJ3niQ/7u67r/X4/joNzju9vMWMsSRKt9bZtkL+6Lz9fy7LEcex5HhhjEJGIpJQAgPRg39rhnCulEBHCMCSieZ4dx4miCKqqyvPcWuu6LhHBvu9ZlqVp+h+BlFJrXdc1IkopoSgKIgKAsix93/8DMSJyuBUYhC4AAAAASUVORK5CYII=")

/***/ },

/***/ "./src/dialog/imgs/chatimghover_leg.data.png"
/*!***************************************************!*\
  !*** ./src/dialog/imgs/chatimghover_leg.data.png ***!
  \***************************************************/
(module, __unused_webpack_exports, __nested_webpack_require_29997__) {

module.exports=(__nested_webpack_require_29997__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOCAIAAACdNMrBAAAAAW5vUEUAYtdMlAAAAARub1BFAAAAAEEgjiIAAAAJbm9QRQAAAAAAAAAAAKGKctUAAAEjSURBVChTVc89SwNBEIDh2727fChqFosQLExMY4gIsbOIBLT0B9joX9RKTCOksLESSa1Y5TSa+8rdze7s7jl4lfAUw7sMy7CL8cnx4f5Bt3338FzzubbWcRyPc4/q6Kg/nT7eXA72erurz2xHNCBXnOrt/ex01G2JjSwq6nUeh5Ci67ISR30x7DVXqQVAkmegC+BUOx3xFhilNEmTQgIS3qh79JtWOksKkudQ4TXPWyxCpXWSAQGpK3wZrmmDJqn+4VSryRgkIFXF3doUvldyVtJlf8c5gFbbkh5qa822mz5FUBYRpTJaG359dRYE3/OPKEpgncu0MBJtCMztdtqT8eDl9V0xP0cXFe05BktXiBazzvlkOHuaB8vVVxj/xOkySn4BoaPZbEW+44oAAAAASUVORK5CYII=")

/***/ },

/***/ "./src/dialog/imgs/continueimg.data.png"
/*!**********************************************!*\
  !*** ./src/dialog/imgs/continueimg.data.png ***!
  \**********************************************/
(module, __unused_webpack_exports, __nested_webpack_require_30904__) {

module.exports=(__nested_webpack_require_30904__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAEoAAAANCAIAAACB72/yAAAACW5vUEUAAAAAAAAAAAChinLVAAACDklEQVRIib1WPW/TQBh+zzmnB5brtA3FCh2COrF2RQys/IJu/BH+AD+jEkMHVhgqdUKVkJC6MCAxUFVElaUS1U0J9/meGZwcJnaclMY80+vnee957pXurCNXH193tmKgDDwfmoa6mRTtsNkgq8GIdJhQxpjRI9AjJ7WIj5le6FBsc3WL+ADg6hkfIfjN9a8wus/YqOS3OGjGcB7vwBijnHPfen/zfLlcXlVXkgAAfKySy8HBSfDyaRI/2PF9n7bJLYP4cvwEWlpqjDFmrjGltEaeUcvNjkHEJEnefAoA4OAk2N/7Fse9Nc3+OWtJ1UNERJy3rG70klpudoxBbVA6/vB0I0kurkepVMKl3yqrXsUpyPfjVznV8mjN+rsArQEAIcSPy+Hbz5uO39+76nQ2GWMuHa0pbyMnK6XKrLw5/6RJcrGqMeohpBSCA/wZ7/B043nv68O421woFVLC9I+XgxCSZVmxKPI1KgDM68dMC8HPzwYAj13DE+9DEOwKKfP03KHSZOHeiiCEGKum4wkOAC2Czn3lyLIMM3V+Nvhinzly1xz3+n1jZSbbhtgmEgGASp4f07qLuxJwzmFtUvfl0db2trVWcttoNB2Px825O1hroyjaGb4fBC8e/XwXdbuI+B+iJ+NZu+LjUYkwDPv86N76ulJKKdVolud5AEDTNPX95l+bBXC+5KvortBa/wYzM1qsEkaHsgAAAABJRU5ErkJggg==")

/***/ },

/***/ "./src/dialog/imgs/continueimg_leg.data.png"
/*!**************************************************!*\
  !*** ./src/dialog/imgs/continueimg_leg.data.png ***!
  \**************************************************/
(module, __unused_webpack_exports, __nested_webpack_require_32103__) {

module.exports=(__nested_webpack_require_32103__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAEoAAAANCAIAAACB72/yAAAAAW5vUEUAYtdMlAAAAARub1BFAAAAAEEgjiIAAAAJbm9QRQAAAAAAAAAAAKGKctUAAASPSURBVEhLrVZLaFxVGD7nPubeO5NMZpIQTYfaNn2RREsrbQXbuOnKR4WCiKtCV2JABF24qTvdCK5ciIWudeFCqkuLC6WKQqVmEVsMjUkTyySTec993+t37n/n5CZNShQ/Dof/db7z/efce2f4J+++PDbqsgz0sN2y9a7NYResmIKPgTVgptY26IOpwViz0cnFdur04XFrqJDw64OargZ+ODKQJPaAWr1td5zs1lq+pKpmztBzYaPWYcxvV9cN/v7sa4cr1ulzz6Oitv7As0OqBnzH6ThRr1VPfcbyxfKAqeimWRotwe1126hHGWW3Fft2jwzdyn/42U2ygatvXaAU4iAsl/KwiQTMoqK/deymbNwoY95oBiZvJwGhhAzSk7PUbr1brdZkCkoWVmzR3jOT+1p+Keita/nRRnVpYEDs1+n0YGAWHAkCvVwyXGyw3lbhbstKtBylaEbNFg4wxRc3bn19fSaf97hy5O8H9y6/9+vrLz2naoIE4Lki6skmZJmJTQZB67DCE0XxZFEKcZKdlKdAcHhIm5tfFe1V9o1hJapjrxUG4vZ8P8BsWgZmx3Z1XYMaMihFoDgMpMjFTJVBIMo0TYPxzfd3Pv/giFUq5y02NHKMOnxxZpoKABgAtiMeLKGgNAjZOGbYMGSQXMsySRKaWlmtpu3B6rS7iEpIIkC6j4JIUycDCnp++qjf/PmPj9/cPzRmjIyXZYcXzhxmqo5sTk9vcjdInj0ChNPTRxcWltXzZ6YUzpuNtud5UQZJXwEMWkBBx/U5Z4qiUFDWIEKGBLKbmkJ/ojJ87cbiC5OFKPYVtTf65LFzx/Offjk3MT7EFDWMYjlUNSUHwEDB1N8zsAQaOp2uaM80crWaeIkl3W7DdV0ehX4Y+0GIIYK+F8YctpS1RVPoszhygwjuU+Pl69/+9cYrxcDrdZvL+4+ffPrg4LWvfhcdxhGaTFYLZXJQ5L+hULAcx+XvXLnIrOFWdVlIAZKnZRvQVWrtAsMQbymBig1NdIvGkpjAj7/d/2h2Csbd+bWV9bXbS2a96Zw/dYgqBR7dGpIQ3F3YYzA2NtyoN9WTkwcCp92znfTM+tB4LA4VZ5/5lmSBWwtjRoNF6SqAsqCy/UgW/HRn8erlibxqz99tNZuL9Vb050N29sRBVeG0r6bgoe+/gaGPTUEFBi/ZnYRJSZuVu0M8nVGknjhaCYMgK4UG1KMIvJiznciRxbYURIvlUcC4gvmXuaW3Xy2xwL2/EqG3jY5+a8E4PVXhDI1FIcQmTW4eaHLnJCBLLiUlxyiQLsmcCzEggs+4aO/U5IG2GwoplMCAJiru824BVVJNfxUuD5McUdKVyCMes9W19nihttFouW4Dvf1wL4fekEWK40sV480UTSIC6fKgd4SUhBMRLt180qS48MSliO/hNDi/cmmGVv5fwNnL14nuweT2d7cfwiga4n/Z2elDIpfAiS3MKCBj8z38lyiqvpP5DyjBZy8+qxs5WGEURH76JVB0sY2q7PxbtyOwnAwiIQbp7hFy1Y4QVKrNQnEQBNRnRWrGFsGBG/wD9kSQTvgpZ/YAAAAASUVORK5CYII=")

/***/ },

/***/ "./src/dialog/imgs/continueimgdown.data.png"
/*!**************************************************!*\
  !*** ./src/dialog/imgs/continueimgdown.data.png ***!
  \**************************************************/
(module, __unused_webpack_exports, __nested_webpack_require_34194__) {

module.exports=(__nested_webpack_require_34194__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAEoAAAANCAIAAACB72/yAAAACW5vUEUAAAAAAAAAAAChinLVAAAB5UlEQVRIibWWsW4TQRCGf+/O3vriwCUdcoEQEgWi5AlMAUmDeA+UhoegoKDxm9C4gydIQUVhCUgKRIOiyLqszzszTrGWOR8OUSTvX5x2Z27nm/90t3u9+uuHvQfPYfrILZ1vTHMTdX71+5QKV6L+CXsIV2SExQXkQmM9n8/7/b5xg7zEuIBcFK6kqzCjGIguTc9lYukyMnMIoWmaj5+ad6+9974s/xARgBzcRGTm3uXpewCJlEkqaBYrbylycmycc957X5TGZiHqkgGk50fMbHq5HOqSNW6YGE/05DimsXMuH9okfD7ACuNE2bx99TcynmiMkZlTA7vFrQvS2dk5AGvNDquLaLugiKpK0zR1XQOP1vHxRN88+7438M4VtzYgop0+O5St95OqAFAVY2y6pnSKJ61TKdgZpCXtCu21KSUiMcYQQjv+8vG08AfWWlVpo281ucbFGNur/u2f2rmOq5tSncHWaacOM9d1/fn86Try4uG3waAiIhGx1t6E/o+2gjpTA0DkbnXvqlQ/fWZJo+G0qirvSgDJWyYuJXZuhwDu3zscDadffj0ZDaf7lXfOGUJu9Orl1B1vXRtSMICe0f3KH5U/XOHTMcvMBtmOBAIAms1mZVlmYnRERJ3/h+Q8h5QRQrgGOS4wWMbbbmQAAAAASUVORK5CYII=")

/***/ },

/***/ "./src/dialog/imgs/continueimgdown_leg.data.png"
/*!******************************************************!*\
  !*** ./src/dialog/imgs/continueimgdown_leg.data.png ***!
  \******************************************************/
(module, __unused_webpack_exports, __nested_webpack_require_35353__) {

module.exports=(__nested_webpack_require_35353__(/*! alt1/base */ "alt1/base").ImageDetect).imageDataFromBase64("iVBORw0KGgoAAAANSUhEUgAAAEoAAAANCAIAAACB72/yAAAAAW5vUEUAYtdMlAAAAARub1BFAAAAAEEgjiIAAAAJbm9QRQAAAAAAAAAAAKGKctUAAAQQSURBVEhL1VW9bxxFFN/52NvbO59sEic5GZMIEHFkAiICKaRDAlGAlJKGioqShpqejn+ABiEoqFIhkIJEk44miSCRyIcSJXawfT6f7253dueD39xbz62/Ekei4ae5pzdv3rz3fm9m59jHb780N5tFu1GWttKOgDjmlXY4DgsY9nKRQkppaAqkup3JUTXZh0IViFlP3UgalTZZhexvpezyu6ePH4u73QXMc+15ltZBxpxBscNxVnhXQtpo8JkWlljccGVlJ394QpKzZSl3WaZYmjiSV69PO/j+mymMUGCHZ+eFhOwEBIek1GQJGJUCYUlHJaRQPVCwZdTrBzsq2eiVnt7phZOYb6u8HRuEoOWAEBGlkKLyPGk2SQ+AkchU8x2oTP/xoPj2m8+gt9qdR3/f/PLr395alILzJJXkQ6CYSBcShR7VU0PCk5ZI7yRNFF9f8l1Lmg8e/yOWFmfjNM1LheWssEbrPWM0NI4Jbdh4O4+YhTTaqrzAwJR8yAg3X8KEUlHosjTWOGPt6sBeXErKfOzc+MTi2UvL7e9+vjPfjIyxlY9GHEvRkI4iI2ae+yWEhU4ZyRMKLZG+PRyHJWxEqb4qFuWZ8vSSpgQ31EQeewbKrSuT+iuQPRjrU+f8jYU0pTs1w3+8+vDCa3NWS602uy8vg+H3v9ydSyxzzBgXce8Jqhi4+BTKR5zAx7QWDkcBBcFIW8lokHt60CaHsKv0A4E0lP6ZgJsu8AFV02Mtd+Xa6jtLLYbuqhEx/OHXe2COVbhhcOEj1+MTK1ggyYIrHfSnA46jceHpzXQ6w8GuNyrEreuFMigCzQ79BgGaCjl9waad3uFWWv8ezrejK9fWPnpvCXdyfWXtzLnzyy+qn35fIYYAMUSiEKGyOxdYOc3wRWJa54wLQg2iwSMhJJMxz7LS/zHMd2cHm0NUD9dGIlgZafQpjrwirDRcTep7CrCLFGzZ70z0bq1FX31+yfLW9b/+XF/Zunl/Y6DSN07teskEF/TaoIBIVO1BAZAuppkHshBghE4y1EyeeLe2+8rTQ3HErQ7KhD349ivT84OIAeD2xScXoNy7/2R9q9/rjWE5dwJ/A1N6CRfTth6UN5QEWad0GEBKnDk+I7kIBx0Ai8HvaBf9MDSUKSy73Ys+/fDVXJnV1R644Q27sWLOzk3uEm4a27nYjKNuYyOc2oE9nZbEOPbS4Yb+gC3zD6cfkYiaPFZai1dOdmod/C+Bo5PGlYxt5FFHqs3+AO83/Q2CGwF/JYEe1Q3lmfeFh45gl/W3GJRwkuCFgTVM8YXjr51dfr0rW3v/o+sXnUB3GvJ5QZ/ijSdeaq2llPXvDRey0nYQsoQaKHXQgf3l4awqrYZBlrMPzi+00IH/P/Yf0iAr/gXJh0N13Pe/YwAAAABJRU5ErkJggg==")

/***/ },

/***/ "./src/dialog/index.ts"
/*!*****************************!*\
  !*** ./src/dialog/index.ts ***!
  \*****************************/
(__unused_webpack_module, exports, __nested_webpack_require_37192__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const a1lib = __importStar(__nested_webpack_require_37192__(/*! alt1/base */ "alt1/base"));
const OCR = __importStar(__nested_webpack_require_37192__(/*! alt1/ocr */ "alt1/ocr"));
const base_1 = __nested_webpack_require_37192__(/*! alt1/base */ "alt1/base");
var imgs_rs3 = (0, base_1.webpackImages)({
    chatimg: __nested_webpack_require_37192__(/*! ./imgs/chatimg.data.png */ "./src/dialog/imgs/chatimg.data.png"),
    chatimghover: __nested_webpack_require_37192__(/*! ./imgs/chatimghover.data.png */ "./src/dialog/imgs/chatimghover.data.png"),
    chatimgactive: __nested_webpack_require_37192__(/*! ./imgs/chatimgactive.data.png */ "./src/dialog/imgs/chatimgactive.data.png"),
    continueimg: __nested_webpack_require_37192__(/*! ./imgs/continueimg.data.png */ "./src/dialog/imgs/continueimg.data.png"),
    continueimgdown: __nested_webpack_require_37192__(/*! ./imgs/continueimgdown.data.png */ "./src/dialog/imgs/continueimgdown.data.png"),
    boxtl: __nested_webpack_require_37192__(/*! ./imgs/boxtl.data.png */ "./src/dialog/imgs/boxtl.data.png"),
    boxtr: __nested_webpack_require_37192__(/*! ./imgs/boxtr.data.png */ "./src/dialog/imgs/boxtr.data.png")
});
var imgs_leg = (0, base_1.webpackImages)({
    chatimg: __nested_webpack_require_37192__(/*! ./imgs/chatimg_leg.data.png */ "./src/dialog/imgs/chatimg_leg.data.png"),
    chatimghover: __nested_webpack_require_37192__(/*! ./imgs/chatimghover_leg.data.png */ "./src/dialog/imgs/chatimghover_leg.data.png"),
    chatimgactive: __nested_webpack_require_37192__(/*! ./imgs/chatimgactive_leg.data.png */ "./src/dialog/imgs/chatimgactive_leg.data.png"),
    continueimg: __nested_webpack_require_37192__(/*! ./imgs/continueimg_leg.data.png */ "./src/dialog/imgs/continueimg_leg.data.png"),
    continueimgdown: __nested_webpack_require_37192__(/*! ./imgs/continueimgdown_leg.data.png */ "./src/dialog/imgs/continueimgdown_leg.data.png"),
    boxtl: __nested_webpack_require_37192__(/*! ./imgs/boxtl_leg.data.png */ "./src/dialog/imgs/boxtl_leg.data.png"),
    boxtr: __nested_webpack_require_37192__(/*! ./imgs/boxtr_leg.data.png */ "./src/dialog/imgs/boxtr_leg.data.png")
});
var fontmono = __nested_webpack_require_37192__(/*! ../fonts/aa_8px_mono.fontmeta.json */ "./src/fonts/aa_8px_mono.fontmeta.json");
var fontmono2 = __nested_webpack_require_37192__(/*! ./imgs/12pt.fontmeta.json */ "./src/dialog/imgs/12pt.fontmeta.json");
var fontheavy = __nested_webpack_require_37192__(/*! ../fonts/aa_8px_mono_allcaps.fontmeta.json */ "./src/fonts/aa_8px_mono_allcaps.fontmeta.json");
class DialogReader {
    constructor() {
        this.pos = null;
    }
    find(imgref) {
        if (!imgref) {
            imgref = a1lib.captureHoldFullRs();
        }
        if (!imgref) {
            return null;
        }
        var boxes = [];
        for (let imgs of [imgs_rs3, imgs_leg]) {
            var pos = imgref.findSubimage(imgs.boxtl);
            for (var a in pos) {
                var p = pos[a];
                if (imgref.findSubimage(imgs.boxtr, p.x + 492, p.y, 16, 16).length != 0) {
                    boxes.push(Object.assign(Object.assign({}, p), { legacy: imgs == imgs_leg }));
                }
            }
        }
        if (boxes.length == 0) {
            return false;
        }
        var box = boxes[0];
        if (boxes.length > 1) {
            console.log("More than one dialog box found");
        }
        this.pos = { x: box.x + 1, y: box.y + 1, width: 506, height: 130, legacy: box.legacy };
        return this.pos;
    }
    ensureimg(imgref) {
        if (!this.pos) {
            return null;
        }
        if (imgref && a1lib.Rect.fromArgs(imgref).contains(this.pos)) {
            return imgref;
        }
        return a1lib.captureHold(this.pos.x, this.pos.y, this.pos.width, this.pos.height);
    }
    read(imgref) {
        imgref = this.ensureimg(imgref);
        if (!imgref) {
            return false;
        }
        let title = this.readTitle(imgref);
        var r = {
            text: null,
            opts: null,
            title
        };
        if (this.checkDialog(imgref)) {
            r.text = this.readDialog(imgref, true);
            return r;
        }
        else {
            var opts = this.findOptions(imgref);
            if (opts.length != 0) {
                r.opts = this.readOptions(imgref, opts);
                return r;
            }
            else {
                return null;
            }
        }
    }
    readTitle(imgref) {
        if (!this.pos) {
            throw new Error("position not found yet");
        }
        var buf = imgref.toData(this.pos.x, this.pos.y, this.pos.width, 32);
        //somehow y coord can change, 15 for "choose and option:" 18 for npc names
        var pos = OCR.findChar(buf, fontheavy, [240, 190, 121], Math.round(this.pos.width / 2) - 10, 12, 20, 8);
        if (!pos) {
            return "";
        }
        var read = OCR.readSmallCapsBackwards(buf, fontheavy, [[240, 190, 121]], Math.round(this.pos.width / 2) - 10, pos.y, 150, 1);
        return read.text.toLowerCase(); //normalize case since we don't actually know the original
    }
    checkDialog(imgref) {
        if (!this.pos) {
            throw new Error("position not found yet");
        }
        var locs = [];
        let imgs = (this.pos.legacy ? imgs_leg : imgs_rs3);
        locs = locs.concat(imgref.findSubimage(imgs.continueimg, this.pos.x - imgref.x, this.pos.y - imgref.y, this.pos.width, this.pos.height));
        locs = locs.concat(imgref.findSubimage(imgs.continueimgdown, this.pos.x - imgref.x, this.pos.y - imgref.y, this.pos.width, this.pos.height));
        return locs.length != 0;
    }
    readDialog(imgref, checked) {
        if (!this.pos) {
            throw new Error("position not found yet");
        }
        imgref = this.ensureimg(imgref);
        if (!imgref) {
            return null;
        }
        if (!checked) {
            checked = this.checkDialog(imgref);
        }
        if (!checked) {
            return null;
        }
        var lines = [];
        var buf = imgref.toData(this.pos.x, this.pos.y + 33, this.pos.width, 80);
        for (var y = 0; y < buf.height; y++) {
            var hastext = false;
            for (var x = 200; x < 300; x++) {
                var i = x * 4 + y * 4 * buf.width;
                if (buf.data[i] + buf.data[i + 1] + buf.data[i + 2] < 50) {
                    hastext = true;
                    break;
                }
            }
            if (hastext) {
                var chr = null;
                chr = chr || OCR.findChar(buf, fontmono2, [0, 0, 0], 192, y + 5, 12, 3);
                chr = chr || OCR.findChar(buf, fontmono2, [0, 0, 0], 246, y + 5, 12, 3);
                chr = chr || OCR.findChar(buf, fontmono2, [0, 0, 0], 310, y + 5, 12, 3);
                if (chr) {
                    var read = OCR.readLine(buf, fontmono2, [0, 0, 0], chr.x, chr.y, true, true);
                    if (read.text.length >= 3) {
                        lines.push(read.text);
                    }
                    y = chr.y + 5;
                }
            }
        }
        return lines;
    }
    findOptions(imgref) {
        var locs = [];
        if (!this.pos) {
            throw new Error("position not found yet");
        }
        let imgs = (this.pos.legacy ? imgs_leg : imgs_rs3);
        var a = imgref.findSubimage(imgs.chatimg);
        for (var b in a) {
            locs.push({ x: a[b].x, y: a[b].y, hover: false, active: false });
        }
        var a = imgref.findSubimage(imgs.chatimghover);
        for (var b in a) {
            locs.push({ x: a[b].x, y: a[b].y, hover: true, active: false });
        }
        var a = imgref.findSubimage(imgs.chatimgactive);
        for (var b in a) {
            locs.push({ x: a[b].x, y: a[b].y, hover: false, active: true });
        }
        return locs;
    }
    readOptions(imgref, locs) {
        imgref = this.ensureimg(imgref);
        if (!imgref) {
            return null;
        }
        if (!this.pos) {
            throw new Error("interface not found");
        }
        var buf = imgref.toData();
        if (!locs) {
            locs = this.findOptions(imgref);
        }
        var bgcol = [150, 135, 105];
        var fontcol = this.pos.legacy ? [255, 255, 255] : [227, 215, 207];
        var r = [];
        for (var a = 0; a < locs.length; a++) {
            var dx = locs[a].x + 30;
            var dy = locs[a].y + 7;
            var checkline = imgref.toData(dx, dy, Math.min(500, imgref.width - a), 1);
            var row = null;
            for (var x = 0; x < checkline.width; x++) {
                var i = x * 4;
                if (row) {
                    if (coldiff(checkline.data[i], checkline.data[i + 1], checkline.data[i + 2], bgcol[0], bgcol[1], bgcol[2]) < 75) {
                        row.width = x + 20;
                        break;
                    }
                }
                else if (coldiff(checkline.data[i], checkline.data[i + 1], checkline.data[i + 2], fontcol[0], fontcol[1], fontcol[2]) < 380) {
                    var text = "";
                    var chr = OCR.findChar(buf, fontmono2, fontcol, dx + x - 5 - imgref.x, dy + 3 - imgref.y, 30, 1);
                    if (chr) {
                        var read = OCR.readLine(buf, fontmono2, fontcol, chr.x, chr.y, true, true);
                        var text = read.text;
                    }
                    row = { text: text, x: dx + x, y: dy, width: 200, buttonx: dx - 31, hover: !!locs[a].hover, active: locs[a].active };
                }
            }
            if (row) {
                r.push(row);
            }
        }
        r.sort((a, b) => a.y - b.y);
        return r;
    }
}
exports["default"] = DialogReader;
//TODO get rid of this or make it standard
function coldiff(r1, g1, b1, r2, g2, b2) {
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}


/***/ },

/***/ "./src/fonts/aa_8px_mono.fontmeta.json"
/*!*********************************************!*\
  !*** ./src/fonts/aa_8px_mono.fontmeta.json ***!
  \*********************************************/
(module) {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"chars":[{"width":7,"bonus":75,"chr":"a","pixels":[0,7,187,1,3,221,1,6,170,1,8,255,2,3,255,2,5,187,2,8,255,3,3,255,3,5,255,3,8,221,4,4,238,4,5,255,4,6,204,4,7,255,4,8,238],"secondary":false},{"width":7,"bonus":105,"chr":"b","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,3,204,1,4,170,1,7,170,1,8,187,2,3,255,2,8,255,3,3,255,3,8,255,4,3,170,4,4,170,4,7,170,5,5,187,5,6,187],"secondary":false},{"width":7,"bonus":50,"chr":"c","pixels":[0,5,170,0,6,187,1,4,187,1,7,187,2,3,255,2,8,255,3,3,255,3,8,255,4,3,221,4,8,221],"secondary":false},{"width":7,"bonus":105,"chr":"d","pixels":[0,5,187,0,6,187,1,4,170,1,7,170,1,8,170,2,3,255,2,8,255,3,3,255,3,8,255,4,3,204,4,4,170,4,7,170,4,8,187,5,1,204,5,2,221,5,3,221,5,4,221,5,5,221,5,6,221,5,7,221,5,8,204],"secondary":false},{"width":7,"bonus":75,"chr":"e","pixels":[0,5,187,0,6,170,1,4,187,1,5,255,1,7,204,2,3,255,2,5,255,2,8,255,3,3,255,3,5,255,3,8,255,4,3,187,4,5,255,4,8,221,5,5,204],"secondary":false},{"width":4,"bonus":50,"chr":"f","pixels":[0,3,204,1,2,221,1,3,255,1,4,221,1,5,221,1,6,221,1,7,221,1,8,204,2,1,255,2,3,255],"secondary":false},{"width":7,"bonus":115,"chr":"g","pixels":[0,5,187,0,6,187,1,3,170,1,4,153,1,7,170,1,11,153,2,3,255,2,8,255,2,11,238,3,3,255,3,8,255,3,11,221,4,3,221,4,7,153,4,8,221,4,10,204,5,3,204,5,4,221,5,5,221,5,6,221,5,7,221,5,8,221,5,9,170],"secondary":false},{"width":7,"bonus":90,"chr":"h","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,3,170,1,4,204,2,3,255,3,3,255,4,3,170,4,4,221,4,5,221,4,6,221,4,7,221,4,8,204],"secondary":false},{"width":3,"bonus":35,"chr":"i","pixels":[0,1,238,0,3,204,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204],"secondary":false},{"width":4,"bonus":50,"chr":"j","pixels":[0,11,153,1,11,170,2,1,204,2,3,204,2,4,221,2,5,221,2,6,221,2,7,221,2,8,221,2,9,221],"secondary":false},{"width":6,"bonus":70,"chr":"k","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,5,255,2,4,153,2,5,255,2,6,221,3,3,204,3,7,221],"secondary":false},{"width":3,"bonus":40,"chr":"l","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,1,8,255],"secondary":false},{"width":10,"bonus":115,"chr":"m","pixels":[0,3,204,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,4,221,2,3,238,3,3,255,4,3,153,4,4,255,4,5,221,4,6,221,4,7,221,4,8,204,5,4,187,6,3,255,7,3,238,8,4,170,8,5,221,8,6,221,8,7,221,8,8,204],"secondary":false},{"width":7,"bonus":75,"chr":"n","pixels":[0,3,204,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,4,221,2,3,238,3,3,255,4,3,238,5,4,170,5,5,221,5,6,221,5,7,221,5,8,204],"secondary":false},{"width":8,"bonus":70,"chr":"o","pixels":[0,5,187,0,6,170,1,4,204,1,7,221,2,3,238,2,8,238,3,3,255,3,8,255,4,3,238,4,8,255,5,4,204,5,7,221,6,5,170,6,6,170],"secondary":false},{"width":6,"bonus":90,"chr":"p","pixels":[0,3,238,0,4,255,0,5,187,0,6,204,0,7,255,0,8,221,0,9,221,0,10,221,1,3,255,1,8,238,2,3,255,2,8,255,3,3,238,3,8,238,4,4,238,4,5,255,4,6,255,4,7,238],"secondary":false},{"width":7,"bonus":90,"chr":"q","pixels":[0,5,187,0,6,187,1,3,170,1,4,153,1,7,153,1,8,170,2,3,255,2,8,255,3,3,238,3,8,238,4,3,255,4,4,255,4,5,187,4,6,187,4,7,255,4,8,238,4,9,221,4,10,221],"secondary":false},{"width":4,"bonus":45,"chr":"r","pixels":[0,3,204,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,3,187,1,4,204,2,3,255],"secondary":false},{"width":6,"bonus":50,"chr":"s","pixels":[0,4,187,1,3,255,1,5,238,1,8,255,2,3,255,2,8,255,3,3,255,3,6,238,3,8,255,4,7,187],"secondary":false},{"width":5,"bonus":45,"chr":"t","pixels":[1,2,221,1,3,255,1,4,221,1,5,221,1,6,221,1,7,170,2,3,255,2,8,238,3,8,153],"secondary":false},{"width":6,"bonus":70,"chr":"u","pixels":[0,3,204,0,4,221,0,5,221,0,6,221,0,7,170,1,8,238,2,8,255,3,8,204,4,3,204,4,4,221,4,5,221,4,6,204,4,7,255,4,8,221],"secondary":false},{"width":6,"bonus":50,"chr":"v","pixels":[0,3,238,1,5,238,1,6,204,2,7,255,2,8,255,3,5,153,3,6,255,3,7,153,4,3,238,4,4,204],"secondary":false},{"width":10,"bonus":95,"chr":"w","pixels":[1,3,153,1,4,238,1,5,187,2,6,153,2,7,238,2,8,187,3,6,204,3,7,238,3,8,153,4,3,170,4,4,255,5,4,221,5,5,221,6,7,255,6,8,221,7,6,238,7,7,204,8,3,238,8,4,204],"secondary":false},{"width":6,"bonus":55,"chr":"x","pixels":[0,8,170,1,3,170,1,4,204,1,7,221,2,5,255,2,6,238,3,4,255,3,6,187,3,7,187,4,3,221,4,8,255],"secondary":false},{"width":6,"bonus":65,"chr":"y","pixels":[0,3,255,0,4,153,0,11,221,1,5,204,1,6,221,1,11,187,2,7,187,2,8,255,2,9,238,3,6,238,3,7,187,4,3,204,4,4,221],"secondary":false},{"width":6,"bonus":70,"chr":"z","pixels":[0,3,153,0,8,204,1,3,255,1,7,221,1,8,255,2,3,255,2,6,255,2,8,255,3,3,255,3,4,170,3,5,170,3,8,255,4,3,255,4,8,255],"secondary":false},{"width":8,"bonus":85,"chr":"A","pixels":[0,8,153,1,6,221,1,7,238,2,3,170,2,4,255,2,5,187,2,6,255,3,1,255,3,2,255,3,6,255,4,2,255,4,3,238,4,6,255,5,5,255,5,6,255,6,7,187,6,8,255],"secondary":false},{"width":7,"bonus":125,"chr":"B","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,1,255,1,4,255,1,8,255,2,1,255,2,4,255,2,8,255,3,1,255,3,4,255,3,8,255,4,1,221,4,4,255,4,5,170,4,8,204,5,2,170,5,3,170,5,6,187,5,7,153],"secondary":false},{"width":9,"bonus":80,"chr":"C","pixels":[0,4,187,0,5,187,1,2,221,1,3,153,1,6,153,1,7,204,2,1,170,2,8,170,3,1,255,3,8,255,4,1,255,4,8,255,5,1,255,5,8,255,6,1,170,6,8,170],"secondary":false},{"width":8,"bonus":100,"chr":"D","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,1,255,1,8,255,2,1,255,2,8,255,3,1,255,3,8,255,4,1,204,4,8,204,5,2,221,5,7,221,6,4,187,6,5,187],"secondary":false},{"width":6,"bonus":95,"chr":"E","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,1,255,1,5,255,1,8,255,2,1,255,2,5,255,2,8,255,3,1,255,3,5,255,3,8,255,4,1,153,4,8,221],"secondary":false},{"width":6,"bonus":70,"chr":"F","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,1,255,1,5,255,2,1,255,2,5,255,3,1,255,3,5,255],"secondary":false},{"width":9,"bonus":105,"chr":"G","pixels":[0,4,170,0,5,187,1,2,204,1,3,153,1,7,221,2,1,170,2,8,187,3,1,255,3,8,255,4,1,255,4,8,255,5,1,255,5,8,238,6,1,170,6,5,255,6,7,153,6,8,170,7,5,153,7,6,221,7,7,221,7,8,204],"secondary":false},{"width":8,"bonus":105,"chr":"H","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,5,255,2,5,255,3,5,255,4,5,255,5,5,255,6,1,204,6,2,221,6,3,221,6,4,221,6,5,221,6,6,221,6,7,221,6,8,204],"secondary":false},{"width":4,"bonus":60,"chr":"I","pixels":[0,1,192,0,8,191,1,1,255,1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,2,1,192,2,8,191],"secondary":false},{"width":6,"bonus":70,"chr":"J","pixels":[0,6,153,0,7,153,1,8,204,2,1,221,2,8,255,3,1,255,3,8,204,4,1,204,4,2,221,4,3,221,4,4,221,4,5,221,4,6,221,4,7,153],"secondary":false},{"width":7,"bonus":85,"chr":"K","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,4,255,2,4,255,3,3,221,3,5,170,3,6,204,4,1,204,4,2,153,4,7,238,4,8,153],"secondary":false},{"width":6,"bonus":60,"chr":"L","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,8,255,2,8,255,3,8,255,4,8,255],"secondary":false},{"width":9,"bonus":130,"chr":"M","pixels":[0,1,245,0,2,255,0,3,255,0,4,255,0,5,255,0,6,255,0,7,255,0,8,255,1,2,170,1,3,225,2,4,207,2,5,190,3,6,232,4,6,232,5,4,207,5,5,190,6,2,170,6,3,224,7,1,245,7,2,255,7,3,255,7,4,255,7,5,255,7,6,255,7,7,255,7,8,255],"secondary":false},{"width":8,"bonus":110,"chr":"N","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,2,255,2,3,221,3,4,187,3,5,187,4,6,221,5,7,255,6,1,204,6,2,221,6,3,221,6,4,221,6,5,221,6,6,221,6,7,221,6,8,204],"secondary":false},{"width":10,"bonus":110,"chr":"O","pixels":[0,4,187,0,5,170,1,2,204,1,3,153,1,6,170,1,7,204,2,1,153,2,8,153,3,1,255,3,8,255,4,1,255,4,8,255,5,1,255,5,8,255,6,1,153,6,8,153,7,2,204,7,3,153,7,6,170,7,7,204,8,4,187,8,5,170],"secondary":false},{"width":7,"bonus":85,"chr":"P","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,1,255,1,5,255,2,1,255,2,5,255,3,1,255,3,5,255,4,1,187,4,5,187,5,3,221],"secondary":false},{"width":9,"bonus":100,"chr":"Q","pixels":[0,4,187,0,5,187,1,2,221,1,6,153,1,7,221,2,1,187,2,8,170,3,1,255,3,8,255,4,1,255,4,8,255,5,1,238,5,8,238,6,2,204,6,7,255,7,3,255,7,4,204,7,5,221,7,6,255,7,8,204],"secondary":false},{"width":7,"bonus":100,"chr":"R","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,1,255,1,5,255,2,1,255,2,5,255,3,1,255,3,5,255,3,6,187,4,2,238,4,3,204,4,4,255,4,7,238,4,8,170],"secondary":false},{"width":6,"bonus":70,"chr":"S","pixels":[0,2,153,0,3,170,1,1,204,1,4,221,1,8,238,2,1,255,2,4,170,2,8,255,3,1,255,3,5,255,3,8,255,4,1,170,4,6,221,4,7,238],"secondary":false},{"width":8,"bonus":65,"chr":"T","pixels":[0,1,255,1,1,255,2,1,255,3,1,255,3,2,221,3,3,221,3,4,221,3,5,221,3,6,221,3,7,221,3,8,204,4,1,255,5,1,255],"secondary":false},{"width":8,"bonus":85,"chr":"U","pixels":[0,1,204,0,2,221,0,3,221,0,4,221,0,5,221,0,6,187,1,7,170,2,8,255,3,8,255,4,8,221,5,1,204,5,2,221,5,3,221,5,4,221,5,5,221,5,6,255,5,7,238],"secondary":false},{"width":7,"bonus":70,"chr":"V","pixels":[0,1,255,0,2,187,1,3,153,1,4,255,1,5,153,2,6,187,2,7,238,3,7,255,3,8,204,4,4,204,4,5,238,5,1,170,5,2,255,5,3,153],"secondary":false},{"width":10,"bonus":125,"chr":"W","pixels":[0,1,255,0,2,221,1,4,187,1,5,255,1,6,204,2,7,255,2,8,255,3,3,153,3,4,238,3,5,221,4,1,255,4,2,255,4,3,153,5,3,170,5,4,238,5,5,204,6,7,255,6,8,255,7,4,153,7,5,238,7,6,238,7,7,153,8,1,238,8,2,238,8,3,153],"secondary":false},{"width":7,"bonus":75,"chr":"X","pixels":[0,8,170,1,1,187,1,2,204,1,7,238,2,3,221,2,4,153,2,5,255,2,6,153,3,4,255,3,5,238,4,2,238,4,6,204,4,7,170,5,1,204,5,8,255],"secondary":false},{"width":7,"bonus":55,"chr":"Y","pixels":[0,1,170,1,2,238,2,3,153,2,4,255,3,4,221,3,5,204,3,6,221,3,7,221,3,8,204,4,3,255,5,1,238],"secondary":false},{"width":7,"bonus":75,"chr":"Z","pixels":[0,8,187,1,1,255,1,7,221,1,8,255,2,1,255,2,5,204,2,8,255,3,1,255,3,4,204,3,8,255,4,1,255,4,2,221,4,8,255,5,1,187,5,8,153],"secondary":false},{"width":7,"bonus":90,"chr":"0","pixels":[0,2,153,0,3,221,0,4,255,0,5,255,0,6,238,0,7,170,1,1,187,1,8,204,2,1,187,2,8,187,3,1,221,3,8,204,4,2,170,4,3,255,4,4,187,4,5,187,4,6,238,4,7,170],"secondary":false},{"width":7,"bonus":50,"chr":"1","pixels":[1,8,187,2,1,204,2,2,204,2,3,187,2,4,187,2,5,187,2,6,187,2,7,187,2,8,238,3,8,204],"secondary":false},{"width":7,"bonus":55,"chr":"2","pixels":[1,8,255,2,1,187,2,6,153,2,8,187,3,1,204,3,5,153,3,8,187,4,1,187,4,2,153,4,4,204,4,8,187],"secondary":false},{"width":7,"bonus":50,"chr":"3","pixels":[0,8,204,1,1,187,1,8,187,2,1,187,2,4,187,2,8,204,3,2,221,3,3,204,3,5,204,3,7,170],"secondary":false},{"width":7,"bonus":80,"chr":"4","pixels":[0,6,238,1,4,187,1,6,187,2,3,170,2,6,187,3,1,187,3,2,153,3,6,204,4,1,187,4,2,187,4,3,187,4,4,187,4,5,187,4,6,238,4,7,187,4,8,187],"secondary":false},{"width":7,"bonus":70,"chr":"5","pixels":[1,1,238,1,2,187,1,3,187,1,4,187,1,8,204,2,1,187,2,4,187,2,8,187,3,1,187,3,4,204,3,8,204,4,5,238,4,6,187,4,7,221],"secondary":false},{"width":7,"bonus":80,"chr":"6","pixels":[0,3,170,0,4,255,0,5,255,0,6,238,0,7,153,1,2,187,1,8,187,2,1,204,2,4,187,2,8,187,3,1,187,3,4,204,3,8,187,4,5,221,4,6,255,4,7,187],"secondary":false},{"width":7,"bonus":55,"chr":"7","pixels":[0,1,187,1,1,187,1,8,204,2,1,187,2,6,238,2,7,153,3,1,187,3,3,153,3,4,221,4,1,255,4,2,187],"secondary":false},{"width":7,"bonus":95,"chr":"8","pixels":[1,2,238,1,3,221,1,6,204,1,7,221,2,1,204,2,4,204,2,5,170,2,8,221,3,1,187,3,4,170,3,8,187,4,1,221,4,4,170,4,5,204,4,8,187,5,2,170,5,3,153,5,6,238,5,7,238],"secondary":false},{"width":7,"bonus":85,"chr":"9","pixels":[1,2,221,1,3,187,1,4,238,1,8,153,2,1,204,2,5,221,2,8,187,3,1,187,3,5,187,3,8,204,4,1,187,4,7,170,5,2,153,5,3,238,5,4,255,5,5,255,5,6,187],"secondary":false},{"width":8,"bonus":75,"chr":"%","pixels":[0,3,255,0,8,255,1,2,255,1,4,255,1,7,255,2,3,255,2,6,255,3,5,255,4,4,255,4,7,255,5,3,255,5,6,255,5,8,255,6,2,255,6,7,255],"secondary":false},{"width":4,"bonus":40,"chr":"/","pixels":[0,7,153,0,8,238,0,9,221,1,4,187,1,5,238,1,6,170,2,1,221,2,2,221],"secondary":false},{"width":7,"bonus":60,"chr":"+","pixels":[0,5,221,1,5,255,2,5,255,3,2,153,3,3,221,3,4,221,3,5,255,3,6,221,3,7,221,3,8,204,4,5,255,5,5,255],"secondary":false},{"width":5,"bonus":40,"chr":"?","pixels":[0,1,170,1,1,255,1,6,221,1,8,255,2,1,255,2,5,170,3,2,255,3,3,221],"secondary":false},{"width":2,"bonus":35,"chr":"!","pixels":[0,1,170,0,2,187,0,3,187,0,4,187,0,5,187,0,6,170,0,8,255],"secondary":false},{"width":8,"bonus":130,"chr":"@","pixels":[0,4,255,0,5,255,0,6,221,0,7,255,0,8,187,1,3,221,1,9,238,2,2,221,2,5,255,2,6,238,2,7,255,2,10,153,3,2,255,3,4,255,3,8,204,3,10,187,4,2,238,4,4,255,4,8,255,5,3,238,5,4,255,5,5,221,5,6,221,5,7,221,5,8,238,6,8,221],"secondary":false},{"width":8,"bonus":120,"chr":"#","pixels":[0,6,255,1,3,255,1,6,255,1,7,170,1,8,238,2,1,170,2,2,238,2,3,255,2,4,221,2,5,170,2,6,255,3,3,255,3,6,255,4,3,255,4,4,153,4,5,204,4,6,255,4,7,238,4,8,187,5,1,255,5,2,187,5,3,255,5,6,255,6,3,255],"secondary":false},{"width":6,"bonus":70,"chr":"$","pixels":[0,2,153,0,3,170,1,1,204,1,4,221,1,8,238,2,0,204,2,1,238,2,8,238,2,9,204,3,1,238,3,5,238,3,8,255,4,6,170,4,7,170],"secondary":false},{"width":6,"bonus":40,"chr":"^","pixels":[0,4,153,0,5,238,1,2,204,1,3,221,2,1,221,2,2,221,3,3,187,3,4,221],"secondary":false},{"width":6,"bonus":20,"chr":"~","pixels":[1,5,255,2,5,221,3,6,221,4,5,204],"secondary":false},{"width":7,"bonus":95,"chr":"&","pixels":[0,6,187,1,2,238,1,3,255,1,4,187,1,5,187,1,8,187,2,1,255,2,4,255,2,8,255,3,1,255,3,4,255,3,8,255,4,4,255,4,8,187,5,3,204,5,4,255,5,5,221,5,6,187,6,4,153],"secondary":false},{"width":6,"bonus":45,"chr":"*","pixels":[0,2,170,1,2,170,1,3,204,1,4,255,2,1,204,2,2,238,2,3,255,3,2,170,3,4,153],"secondary":false},{"width":4,"bonus":55,"chr":"(","pixels":[0,3,173,0,4,239,0,5,253,0,6,230,0,7,171,1,1,194,1,2,204,1,8,204,1,9,191,2,0,210,2,10,216],"secondary":false},{"width":4,"bonus":55,"chr":")","pixels":[1,0,211,1,10,216,2,1,194,2,2,203,2,8,203,2,9,191,3,3,174,3,4,240,3,5,253,3,6,229,3,7,171],"secondary":false},{"width":7,"bonus":30,"chr":"_","pixels":[0,9,153,1,9,255,2,9,255,3,9,255,4,9,255,5,9,255],"secondary":false},{"width":4,"bonus":15,"chr":"-","pixels":[0,5,255,1,5,255,2,5,255],"secondary":true},{"width":8,"bonus":50,"chr":"=","pixels":[0,4,255,0,6,255,1,4,255,1,6,255,2,4,255,2,6,255,3,4,255,3,6,255,4,4,255,4,6,255],"secondary":false},{"width":3,"bonus":55,"chr":"[","pixels":[0,0,204,0,1,221,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,204,1,0,238,1,8,238],"secondary":false},{"width":3,"bonus":55,"chr":"]","pixels":[0,0,238,0,8,238,1,0,204,1,1,221,1,2,221,1,3,221,1,4,221,1,5,221,1,6,221,1,7,221,1,8,204],"secondary":false},{"width":5,"bonus":50,"chr":"{","pixels":[0,5,153,1,2,170,1,3,221,1,4,221,1,5,204,1,6,255,1,7,221,1,8,170,2,1,238,2,9,238],"secondary":false},{"width":5,"bonus":50,"chr":"}","pixels":[1,1,238,1,9,238,2,2,170,2,3,221,2,4,221,2,5,204,2,6,255,2,7,221,2,8,170,3,5,153],"secondary":false},{"width":3,"bonus":10,"chr":":","pixels":[1,3,255,1,7,255],"secondary":true},{"width":3,"bonus":20,"chr":";","pixels":[0,9,201,1,3,255,1,7,241,1,8,255],"secondary":true},{"width":3,"bonus":20,"chr":"\\"","pixels":[0,1,255,0,2,255,2,1,255,2,2,255],"secondary":true},{"width":2,"bonus":10,"chr":"\'","pixels":[0,1,255,0,2,177],"secondary":true},{"width":7,"bonus":40,"chr":"<","pixels":[0,5,204,1,5,255,2,4,238,2,6,238,3,4,170,3,6,170,4,3,221,4,7,221],"secondary":false},{"width":7,"bonus":45,"chr":">","pixels":[0,3,204,0,7,204,1,7,187,2,4,238,2,6,255,3,4,170,3,5,153,3,6,204,4,5,255],"secondary":false},{"width":5,"bonus":35,"chr":"\\\\","pixels":[1,1,153,1,2,255,1,3,204,2,5,255,2,6,204,3,8,255,3,9,204],"secondary":false},{"width":2,"bonus":5,"chr":".","pixels":[0,8,255],"secondary":true},{"width":3,"bonus":15,"chr":",","pixels":[0,9,205,1,7,205,1,8,255],"secondary":true},{"width":3,"bonus":50,"chr":"|","pixels":[0,1,221,0,2,221,0,3,221,0,4,221,0,5,221,0,6,221,0,7,221,0,8,221,0,9,221,0,10,204],"secondary":false}],"width":10,"spacewidth":3,"shadow":false,"height":12,"basey":8}');

/***/ },

/***/ "./src/fonts/aa_8px_mono_allcaps.fontmeta.json"
/*!*****************************************************!*\
  !*** ./src/fonts/aa_8px_mono_allcaps.fontmeta.json ***!
  \*****************************************************/
(module) {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"chars":[{"width":3,"bonus":35,"chr":"!","pixels":[0,2,170,1,1,221,1,2,255,1,3,221,1,4,187,1,5,170,1,9,204],"secondary":false},{"width":6,"bonus":20,"chr":"\\"","pixels":[1,2,221,1,3,255,3,2,221,3,3,255],"secondary":true},{"width":8,"bonus":125,"chr":"#","pixels":[0,7,187,1,4,255,1,7,255,1,10,170,2,3,170,2,4,255,2,5,255,2,6,221,2,7,255,2,8,170,3,4,255,3,7,255,4,4,255,4,5,153,4,7,255,4,8,238,4,9,255,4,10,204,5,2,238,5,3,204,5,4,255,5,5,153,5,7,255,6,4,255,6,7,153],"secondary":false},{"width":7,"bonus":115,"chr":"$","pixels":[0,8,187,1,2,255,1,3,255,1,4,221,1,9,238,2,1,187,2,4,255,2,5,204,2,8,170,2,9,255,2,10,221,3,0,187,3,1,238,3,2,187,3,3,170,3,4,153,3,5,255,3,6,221,3,9,221,4,1,221,4,6,255,4,7,255,4,8,255],"secondary":false},{"width":12,"bonus":135,"chr":"%","pixels":[1,2,255,1,3,255,1,4,221,2,5,153,3,1,153,3,9,187,4,1,170,4,2,255,4,3,255,4,4,221,4,7,238,4,8,204,5,4,153,5,5,238,5,6,153,6,1,153,6,2,187,6,3,204,6,6,221,6,7,255,6,8,255,7,1,153,7,9,187,8,9,187,9,6,221,9,7,255,9,8,255],"secondary":false},{"width":11,"bonus":190,"chr":"&","pixels":[0,6,187,0,7,255,0,8,170,1,2,204,1,3,255,1,4,153,1,5,238,1,6,170,1,7,187,1,8,255,1,9,153,2,1,170,2,2,153,2,3,153,2,4,255,2,5,187,2,9,238,3,1,221,3,5,238,3,6,170,3,9,255,4,1,238,4,6,238,4,7,153,4,9,204,5,1,187,5,2,187,5,7,255,5,8,204,6,7,170,6,8,255,7,5,238,7,6,255,7,7,170,7,8,170,7,9,221,8,9,238,9,9,153],"secondary":false},{"width":4,"bonus":10,"chr":"\'","pixels":[1,2,204,1,3,255],"secondary":true},{"width":4,"bonus":50,"chr":"(","pixels":[0,3,170,0,4,238,0,5,255,0,6,221,0,7,153,1,1,153,1,2,221,1,3,153,1,7,170,1,8,238],"secondary":false},{"width":4,"bonus":40,"chr":")","pixels":[1,1,170,1,2,221,1,7,170,1,8,238,2,3,187,2,4,238,2,5,255,2,6,204],"secondary":false},{"width":5,"bonus":25,"chr":"*","pixels":[1,1,170,1,2,221,1,3,153,2,2,255,2,3,204],"secondary":false},{"width":8,"bonus":45,"chr":"+","pixels":[1,6,255,2,6,255,3,4,255,3,5,255,3,6,255,3,7,255,3,8,255,4,6,255,5,6,255],"secondary":false},{"width":3,"bonus":10,"chr":",","pixels":[1,8,187,1,9,221],"secondary":true},{"width":5,"bonus":20,"chr":"-","pixels":[0,7,204,1,7,255,2,7,238,3,7,187],"secondary":true},{"width":3,"bonus":5,"chr":".","pixels":[0,9,204],"secondary":true},{"width":7,"bonus":40,"chr":"/","pixels":[0,9,221,1,7,187,1,8,187,2,6,221,3,4,221,4,2,170,4,3,187,5,1,187],"secondary":false},{"width":8,"bonus":105,"chr":"0","pixels":[0,6,153,1,3,221,1,4,255,1,5,255,1,6,255,1,7,255,1,8,238,2,2,187,2,8,153,2,9,204,3,2,187,3,9,204,4,2,221,4,9,187,5,3,238,5,4,255,5,5,255,5,6,255,5,7,255,5,8,221,6,5,153],"secondary":false},{"width":6,"bonus":85,"chr":"1","pixels":[1,3,170,1,9,153,2,3,255,2,4,255,2,5,255,2,6,255,2,7,255,2,8,255,2,9,255,3,2,153,3,3,153,3,4,153,3,5,153,3,6,153,3,7,153,3,8,153,3,9,221],"secondary":false},{"width":8,"bonus":100,"chr":"2","pixels":[1,2,187,1,3,153,1,9,255,2,2,187,2,8,221,2,9,255,3,2,221,3,7,221,3,9,255,4,2,187,4,3,238,4,4,187,4,5,238,4,6,238,4,9,255,5,3,221,5,4,255,5,5,170,5,8,153,5,9,238],"secondary":false},{"width":7,"bonus":100,"chr":"3","pixels":[0,2,170,0,8,170,0,9,204,1,2,221,1,9,238,2,2,238,2,5,221,2,9,221,3,2,221,3,3,187,3,4,204,3,5,255,3,6,153,3,9,187,4,3,238,4,4,153,4,6,255,4,7,255,4,8,255,5,7,153],"secondary":false},{"width":8,"bonus":85,"chr":"4","pixels":[0,7,153,1,6,187,1,7,255,2,5,187,2,7,255,3,4,187,3,7,255,4,3,255,4,4,255,4,5,255,4,6,255,4,7,255,4,8,255,4,9,255,5,7,255,5,9,204,6,7,221],"secondary":false},{"width":7,"bonus":95,"chr":"5","pixels":[0,8,153,0,9,221,1,2,255,1,3,187,1,4,238,1,9,221,2,2,255,2,4,187,2,5,170,2,9,204,3,2,255,3,5,255,3,9,170,4,2,255,4,5,204,4,6,255,4,7,255,4,8,238,5,7,153],"secondary":false},{"width":8,"bonus":105,"chr":"6","pixels":[0,7,153,1,4,153,1,5,255,1,6,255,1,7,255,1,8,255,2,4,204,2,9,221,3,3,170,3,5,153,3,9,204,4,2,153,4,5,187,4,9,204,5,6,238,5,7,170,5,8,187,5,9,153,6,6,187,6,7,255,6,8,170],"secondary":false},{"width":7,"bonus":75,"chr":"7","pixels":[0,2,204,0,3,187,1,2,255,1,9,187,2,2,255,2,7,238,2,8,255,2,9,170,3,2,255,3,5,221,3,6,204,4,2,255,4,3,204,4,4,170,5,2,204],"secondary":false},{"width":8,"bonus":120,"chr":"8","pixels":[1,3,221,1,4,204,1,6,187,1,7,255,1,8,255,2,2,187,2,4,204,2,5,221,2,6,153,2,9,221,3,2,153,3,5,255,3,9,187,4,2,187,4,5,238,4,6,204,4,9,204,5,2,170,5,3,255,5,4,238,5,6,238,5,7,255,5,8,255,6,7,153],"secondary":false},{"width":8,"bonus":95,"chr":"9","pixels":[0,4,153,1,3,255,1,4,255,1,5,255,2,2,187,2,6,153,3,2,204,3,6,153,3,9,153,4,2,221,4,7,153,4,8,204,5,3,255,5,4,255,5,5,255,5,6,255,5,7,187,6,4,153,6,5,153],"secondary":false},{"width":3,"bonus":10,"chr":":","pixels":[0,3,204,0,7,204],"secondary":true},{"width":3,"bonus":20,"chr":";","pixels":[0,2,204,0,6,153,0,7,187,0,8,153],"secondary":true},{"width":7,"bonus":55,"chr":"<","pixels":[0,6,187,0,7,153,1,6,221,1,7,238,2,5,153,3,5,238,3,8,238,4,5,153,4,8,187,5,4,187,5,9,153],"secondary":false},{"width":7,"bonus":60,"chr":"=","pixels":[0,5,255,0,8,255,1,5,255,1,8,255,2,5,255,2,8,255,3,5,255,3,8,255,4,5,255,4,8,255,5,5,221,5,8,221],"secondary":false},{"width":7,"bonus":50,"chr":">","pixels":[0,4,204,0,9,170,1,5,170,1,8,187,2,5,238,2,8,221,3,7,153,4,6,238,4,7,238,5,6,153],"secondary":false},{"width":6,"bonus":65,"chr":"?","pixels":[0,2,153,0,3,187,1,2,221,1,7,221,2,2,238,2,6,238,2,10,204,3,2,204,3,3,221,3,4,204,3,5,255,4,3,238,4,4,221],"secondary":false},{"width":11,"bonus":180,"chr":"@","pixels":[0,4,187,0,5,255,0,6,255,0,7,238,1,3,170,1,8,204,2,5,187,2,6,238,2,7,187,2,9,204,3,4,204,3,5,153,3,6,153,3,7,204,3,9,204,4,3,153,4,6,153,4,9,187,5,0,153,5,3,221,5,4,170,5,5,238,5,6,255,5,7,187,5,9,170,6,3,221,6,4,153,6,7,238,7,1,153,7,7,170,8,1,170,8,2,153,8,6,170,9,3,187,9,4,221,9,5,170],"secondary":false},{"width":9,"bonus":110,"chr":"A","pixels":[1,9,238,2,6,153,2,7,255,2,8,170,2,9,170,3,4,187,3,5,238,3,7,221,4,2,187,4,3,255,4,4,238,4,7,221,5,4,221,5,5,255,5,6,238,5,7,238,6,6,187,6,7,255,6,8,255,6,9,187,7,8,170,7,9,255],"secondary":false},{"width":7,"bonus":150,"chr":"B","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,238,2,6,153,2,7,153,2,8,153,2,9,255,3,2,221,3,5,221,3,9,204,4,2,187,4,3,255,4,4,255,4,5,170,4,6,255,4,7,170,4,8,187,4,9,187,5,6,153,5,7,255,5,8,204],"secondary":false},{"width":8,"bonus":120,"chr":"C","pixels":[0,4,170,0,5,238,0,6,238,0,7,170,1,3,238,1,4,255,1,5,221,1,6,238,1,7,255,1,8,238,2,2,153,2,3,153,2,8,221,2,9,153,3,2,221,3,9,221,4,2,221,4,9,221,5,2,221,5,9,221,6,2,187,6,3,187,6,8,153,6,9,170],"secondary":false},{"width":10,"bonus":165,"chr":"D","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,153,2,6,153,2,7,153,2,8,170,2,9,255,3,2,221,3,9,221,4,2,238,4,9,221,5,2,221,5,9,204,6,2,153,6,3,238,6,8,187,7,3,221,7,4,255,7,5,255,7,6,255,7,7,255,7,8,170,8,5,187,8,6,170],"secondary":false},{"width":7,"bonus":110,"chr":"E","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,238,2,6,153,2,7,153,2,8,170,2,9,239,3,2,214,3,5,221,3,9,212,4,2,212,4,5,226,4,9,238],"secondary":false},{"width":7,"bonus":100,"chr":"F","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,238,2,6,153,2,7,153,2,8,153,2,9,221,3,2,221,3,5,221,4,2,238,4,5,238],"secondary":false},{"width":9,"bonus":135,"chr":"G","pixels":[0,4,170,0,5,238,0,6,255,0,7,187,1,3,238,1,4,238,1,5,187,1,6,204,1,7,255,1,8,238,2,2,153,2,8,221,2,9,153,3,2,221,3,9,221,4,2,221,4,9,238,5,2,238,5,9,221,6,2,204,6,6,255,6,7,255,6,8,255,6,9,204,7,6,204,7,7,153,7,8,153],"secondary":false},{"width":10,"bonus":175,"chr":"H","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,204,2,3,153,2,4,153,2,5,238,2,6,153,2,7,153,2,8,153,2,9,221,3,5,221,4,5,221,5,5,221,6,2,204,6,3,153,6,4,153,6,5,238,6,6,153,6,7,153,6,8,153,6,9,221,7,2,255,7,3,255,7,4,255,7,5,255,7,6,255,7,7,255,7,8,255,7,9,255],"secondary":false},{"width":5,"bonus":80,"chr":"I","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,204,2,3,153,2,4,153,2,5,153,2,6,153,2,7,153,2,8,153,2,9,221],"secondary":false},{"width":6,"bonus":90,"chr":"J","pixels":[2,2,255,2,3,255,2,4,255,2,5,255,2,6,255,2,7,255,2,8,255,2,9,255,2,10,255,2,11,187,3,2,204,3,3,153,3,4,153,3,5,153,3,6,153,3,7,153,3,8,153,3,9,153],"secondary":false},{"width":10,"bonus":140,"chr":"K","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,204,2,3,153,2,4,153,2,5,238,2,6,187,2,7,153,2,8,153,2,9,204,3,5,238,3,6,238,4,6,170,4,7,255,5,2,238,5,3,153,5,7,170,5,8,255,6,2,204,6,8,170,6,9,238,7,9,204],"secondary":false},{"width":7,"bonus":95,"chr":"L","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,204,2,3,153,2,4,153,2,5,153,2,6,153,2,7,153,2,8,170,2,9,255,3,9,221,4,9,221,5,9,204],"secondary":false},{"width":12,"bonus":150,"chr":"M","pixels":[1,6,170,1,7,221,1,8,255,1,9,255,2,2,170,2,3,255,2,4,255,2,5,221,3,4,204,3,5,255,3,6,238,4,6,204,4,7,255,4,8,221,5,7,187,5,8,255,6,6,221,7,4,238,7,5,204,8,2,187,8,3,255,8,4,255,8,5,255,8,6,255,8,7,238,8,8,204,8,9,187,9,7,170,9,8,204,9,9,255],"secondary":false},{"width":10,"bonus":130,"chr":"N","pixels":[1,2,204,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,3,221,2,4,238,3,4,221,3,5,238,4,5,238,4,6,238,5,6,238,5,7,238,6,7,238,6,8,238,7,2,255,7,3,255,7,4,255,7,5,255,7,6,255,7,7,255,7,8,255,7,9,204],"secondary":false},{"width":10,"bonus":155,"chr":"O","pixels":[0,4,170,0,5,238,0,6,238,0,7,170,1,3,238,1,4,238,1,5,187,1,6,204,1,7,255,1,8,238,2,2,170,2,8,204,2,9,170,3,2,221,3,9,238,4,2,221,4,9,221,5,2,238,5,9,204,6,2,153,6,3,238,6,8,170,7,3,238,7,4,255,7,5,255,7,6,255,7,7,255,7,8,187,8,4,153,8,5,221,8,6,204],"secondary":false},{"width":8,"bonus":130,"chr":"P","pixels":[1,1,255,1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,1,238,2,2,153,2,3,153,2,4,153,2,5,170,2,6,153,2,7,153,2,8,153,2,9,221,3,1,204,4,1,238,4,5,187,5,1,153,5,2,255,5,3,255,5,4,255,6,3,153],"secondary":false},{"width":10,"bonus":180,"chr":"Q","pixels":[0,4,153,0,5,238,0,6,238,0,7,170,1,3,221,1,4,255,1,5,221,1,6,238,1,7,255,1,8,238,2,2,153,2,8,221,2,9,170,3,2,221,3,9,238,4,2,221,4,9,221,5,2,238,5,9,204,6,2,153,6,3,221,6,8,153,6,9,238,7,3,221,7,4,255,7,5,255,7,6,255,7,7,255,7,8,170,7,9,187,7,10,153,8,4,153,8,5,204,8,6,204,8,10,255,9,10,204],"secondary":false},{"width":7,"bonus":140,"chr":"R","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,153,2,6,238,2,7,153,2,8,153,2,9,221,3,2,238,3,6,238,4,2,204,4,3,204,4,4,153,4,5,204,4,6,204,4,7,255,5,3,221,5,4,221,5,8,255,6,9,238],"secondary":false},{"width":6,"bonus":115,"chr":"S","pixels":[0,3,221,0,4,238,0,8,187,0,9,187,1,2,187,1,4,204,1,5,255,1,9,238,2,2,187,2,5,255,2,6,187,2,9,221,3,2,204,3,5,153,3,6,255,3,7,170,3,8,153,3,9,170,4,2,204,4,3,153,4,6,170,4,7,255,4,8,187],"secondary":false},{"width":9,"bonus":105,"chr":"T","pixels":[1,2,238,2,2,221,3,2,238,3,3,153,3,4,153,3,5,153,3,6,153,3,7,153,3,8,153,3,9,221,4,2,255,4,3,255,4,4,255,4,5,255,4,6,255,4,7,255,4,8,255,4,9,255,5,2,221,6,2,221,7,2,255],"secondary":false},{"width":10,"bonus":120,"chr":"U","pixels":[1,2,204,1,3,153,1,4,153,1,5,153,1,6,153,2,2,255,2,3,255,2,4,255,2,5,255,2,6,255,2,7,255,2,8,255,3,9,221,4,9,238,5,9,221,6,9,170,7,2,255,7,3,255,7,4,255,7,5,255,7,6,255,7,7,255,7,8,204,8,2,153],"secondary":false},{"width":10,"bonus":90,"chr":"V","pixels":[1,2,255,1,3,153,2,2,238,2,3,255,2,4,255,2,5,187,3,5,238,3,6,255,3,7,221,4,7,221,4,8,255,4,9,187,5,6,187,5,7,204,6,4,221,6,5,187,7,2,255,7,3,170],"secondary":false},{"width":13,"bonus":165,"chr":"W","pixels":[1,2,255,1,3,221,2,2,204,2,3,221,2,4,255,2,5,255,2,6,221,3,6,187,3,7,255,3,8,255,3,9,187,4,6,153,4,7,221,5,4,221,5,5,187,6,2,187,6,3,255,6,4,255,6,5,153,7,4,170,7,5,255,7,6,255,7,7,187,8,7,255,8,8,255,8,9,187,9,5,153,9,6,221,9,7,170,10,2,221,10,3,238,10,4,187,11,2,187],"secondary":false},{"width":9,"bonus":115,"chr":"X","pixels":[1,2,221,1,9,238,2,2,255,2,3,255,2,7,153,2,8,221,2,9,153,3,3,153,3,4,255,3,5,221,3,6,204,4,5,255,4,6,255,4,7,170,5,3,187,5,4,170,5,7,255,5,8,255,5,9,153,6,2,255,6,8,204,6,9,255,7,9,170],"secondary":false},{"width":8,"bonus":95,"chr":"Y","pixels":[0,2,187,1,2,255,1,3,221,2,3,221,2,4,255,2,5,153,3,5,238,3,6,255,3,7,255,3,8,255,3,9,255,4,5,204,4,6,170,4,7,153,4,8,153,4,9,204,5,3,187,5,4,187,6,2,238],"secondary":false},{"width":8,"bonus":105,"chr":"Z","pixels":[0,9,204,1,2,238,1,7,153,1,8,255,1,9,255,2,2,221,2,6,221,2,7,255,2,9,221,3,2,221,3,4,153,3,5,255,3,6,221,3,9,221,4,2,238,4,3,221,4,4,255,4,9,221,5,2,255,5,3,204,5,9,255],"secondary":false},{"width":4,"bonus":65,"chr":"[","pixels":[0,0,255,0,1,255,0,2,255,0,3,255,0,4,255,0,5,255,0,6,255,0,7,255,0,8,255,0,9,255,0,10,187,1,0,187,1,10,170],"secondary":false},{"width":8,"bonus":40,"chr":"\\\\","pixels":[1,1,170,1,2,187,2,3,221,3,5,221,4,6,187,4,7,187,5,8,221,6,9,153],"secondary":false},{"width":5,"bonus":65,"chr":"]","pixels":[1,0,153,1,10,153,2,0,255,2,1,255,2,2,255,2,3,255,2,4,255,2,5,255,2,6,255,2,7,255,2,8,255,2,9,255,2,10,187],"secondary":false},{"width":7,"bonus":40,"chr":"^","pixels":[0,5,204,1,3,238,1,4,170,2,1,238,3,1,221,3,2,204,4,3,187,4,4,238],"secondary":false},{"width":7,"bonus":30,"chr":"_","pixels":[0,10,221,1,10,221,2,10,221,3,10,221,4,10,221,5,10,221],"secondary":false},{"width":9,"bonus":110,"chr":"a","pixels":[1,9,238,2,6,153,2,7,255,2,8,170,2,9,170,3,4,187,3,5,238,3,7,221,4,2,187,4,3,255,4,4,238,4,7,221,5,4,221,5,5,255,5,6,238,5,7,238,6,6,187,6,7,255,6,8,255,6,9,187,7,8,170,7,9,255],"secondary":false},{"width":7,"bonus":150,"chr":"b","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,238,2,6,153,2,7,153,2,8,153,2,9,255,3,2,221,3,5,221,3,9,204,4,2,187,4,3,255,4,4,255,4,5,170,4,6,255,4,7,170,4,8,187,4,9,187,5,6,153,5,7,255,5,8,204],"secondary":false},{"width":8,"bonus":120,"chr":"c","pixels":[0,4,170,0,5,238,0,6,238,0,7,170,1,3,238,1,4,255,1,5,221,1,6,238,1,7,255,1,8,238,2,2,153,2,3,153,2,8,221,2,9,153,3,2,221,3,9,221,4,2,221,4,9,221,5,2,221,5,9,221,6,2,187,6,3,187,6,8,153,6,9,170],"secondary":false},{"width":10,"bonus":165,"chr":"d","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,153,2,6,153,2,7,153,2,8,170,2,9,255,3,2,221,3,9,221,4,2,238,4,9,221,5,2,221,5,9,204,6,2,153,6,3,238,6,8,187,7,3,221,7,4,255,7,5,255,7,6,255,7,7,255,7,8,170,8,5,187,8,6,170],"secondary":false},{"width":7,"bonus":110,"chr":"e","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,238,2,6,153,2,7,153,2,8,170,2,9,255,3,2,221,3,5,221,3,9,221,4,2,238,4,5,238,4,9,238],"secondary":false},{"width":7,"bonus":100,"chr":"f","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,238,2,6,153,2,7,153,2,8,153,2,9,221,3,2,221,3,5,221,4,2,238,4,5,238],"secondary":false},{"width":10,"bonus":135,"chr":"g","pixels":[0,4,170,0,5,238,0,6,255,0,7,187,1,3,238,1,4,238,1,5,187,1,6,204,1,7,255,1,8,238,2,2,153,2,8,221,2,9,153,3,2,221,3,9,221,4,2,221,4,9,238,5,2,238,5,9,221,6,2,204,6,6,255,6,7,255,6,8,255,6,9,204,7,6,204,7,7,153,7,8,153],"secondary":false},{"width":10,"bonus":175,"chr":"h","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,204,2,3,153,2,4,153,2,5,238,2,6,153,2,7,153,2,8,153,2,9,221,3,5,221,4,5,221,5,5,221,6,2,204,6,3,153,6,4,153,6,5,238,6,6,153,6,7,153,6,8,153,6,9,221,7,2,255,7,3,255,7,4,255,7,5,255,7,6,255,7,7,255,7,8,255,7,9,255],"secondary":false},{"width":5,"bonus":80,"chr":"i","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,204,2,3,153,2,4,153,2,5,153,2,6,153,2,7,153,2,8,153,2,9,221],"secondary":false},{"width":5,"bonus":90,"chr":"j","pixels":[2,2,255,2,3,255,2,4,255,2,5,255,2,6,255,2,7,255,2,8,255,2,9,255,2,10,255,2,11,187,3,2,204,3,3,153,3,4,153,3,5,153,3,6,153,3,7,153,3,8,153,3,9,153],"secondary":false},{"width":9,"bonus":140,"chr":"k","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,204,2,3,153,2,4,153,2,5,238,2,6,187,2,7,153,2,8,153,2,9,204,3,5,238,3,6,238,4,6,170,4,7,255,5,2,238,5,3,153,5,7,170,5,8,255,6,2,204,6,8,170,6,9,238,7,9,204],"secondary":false},{"width":7,"bonus":95,"chr":"l","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,204,2,3,153,2,4,153,2,5,153,2,6,153,2,7,153,2,8,170,2,9,255,3,9,221,4,9,221,5,9,204],"secondary":false},{"width":12,"bonus":150,"chr":"m","pixels":[1,6,170,1,7,221,1,8,255,1,9,255,2,2,170,2,3,255,2,4,255,2,5,221,3,4,204,3,5,255,3,6,238,4,6,204,4,7,255,4,8,221,5,7,187,5,8,255,6,6,221,7,4,238,7,5,204,8,2,187,8,3,255,8,4,255,8,5,255,8,6,255,8,7,238,8,8,204,8,9,187,9,7,170,9,8,204,9,9,255],"secondary":false},{"width":10,"bonus":130,"chr":"n","pixels":[1,2,204,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,3,221,2,4,238,3,4,221,3,5,238,4,5,238,4,6,238,5,6,238,5,7,238,6,7,238,6,8,238,7,2,255,7,3,255,7,4,255,7,5,255,7,6,255,7,7,255,7,8,255,7,9,204],"secondary":false},{"width":10,"bonus":155,"chr":"o","pixels":[0,4,170,0,5,238,0,6,238,0,7,170,1,3,238,1,4,238,1,5,187,1,6,204,1,7,255,1,8,238,2,2,170,2,8,204,2,9,170,3,2,221,3,9,238,4,2,221,4,9,221,5,2,238,5,9,204,6,2,153,6,3,238,6,8,170,7,3,238,7,4,255,7,5,255,7,6,255,7,7,255,7,8,187,8,4,153,8,5,221,8,6,204],"secondary":false},{"width":7,"bonus":115,"chr":"p","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,153,2,6,170,2,7,153,2,8,153,2,9,221,3,2,221,4,2,221,4,3,204,4,4,153,4,5,221,5,3,221,5,4,221],"secondary":false},{"width":10,"bonus":180,"chr":"q","pixels":[0,4,153,0,5,238,0,6,238,0,7,170,1,3,221,1,4,255,1,5,221,1,6,238,1,7,255,1,8,238,2,2,153,2,8,221,2,9,170,3,2,221,3,9,238,4,2,221,4,9,221,5,2,238,5,9,204,6,2,153,6,3,221,6,8,153,6,9,238,7,3,221,7,4,255,7,5,255,7,6,255,7,7,255,7,8,170,7,9,187,7,10,153,8,4,153,8,5,204,8,6,204,8,10,255,9,10,204],"secondary":false},{"width":9,"bonus":145,"chr":"r","pixels":[1,2,255,1,3,255,1,4,255,1,5,255,1,6,255,1,7,255,1,8,255,1,9,255,2,2,238,2,3,153,2,4,153,2,5,153,2,6,238,2,7,153,2,8,153,2,9,221,3,2,238,3,6,238,4,2,204,4,3,204,4,4,153,4,5,204,4,6,204,4,7,255,5,3,221,5,4,221,5,8,255,6,9,238,7,9,153],"secondary":false},{"width":6,"bonus":115,"chr":"s","pixels":[0,3,221,0,4,238,0,8,187,0,9,187,1,2,187,1,4,204,1,5,255,1,9,238,2,2,187,2,5,255,2,6,187,2,9,221,3,2,204,3,5,153,3,6,255,3,7,170,3,8,153,3,9,170,4,2,204,4,3,153,4,6,170,4,7,255,4,8,187],"secondary":false},{"width":9,"bonus":105,"chr":"t","pixels":[1,2,238,2,2,221,3,2,238,3,3,153,3,4,153,3,5,153,3,6,153,3,7,153,3,8,153,3,9,221,4,2,255,4,3,255,4,4,255,4,5,255,4,6,255,4,7,255,4,8,255,4,9,255,5,2,221,6,2,221,7,2,255],"secondary":false},{"width":10,"bonus":120,"chr":"u","pixels":[1,2,204,1,3,153,1,4,153,1,5,153,1,6,153,2,2,255,2,3,255,2,4,255,2,5,255,2,6,255,2,7,255,2,8,255,3,9,221,4,9,238,5,9,221,6,9,170,7,2,255,7,3,255,7,4,255,7,5,255,7,6,255,7,7,255,7,8,204,8,2,153],"secondary":false},{"width":10,"bonus":90,"chr":"v","pixels":[1,2,255,1,3,153,2,2,238,2,3,255,2,4,255,2,5,187,3,5,238,3,6,255,3,7,221,4,7,221,4,8,255,4,9,187,5,6,187,5,7,204,6,4,221,6,5,187,7,2,255,7,3,170],"secondary":false},{"width":13,"bonus":165,"chr":"w","pixels":[1,2,255,1,3,221,2,2,204,2,3,221,2,4,255,2,5,255,2,6,221,3,6,187,3,7,255,3,8,255,3,9,187,4,6,153,4,7,221,5,4,221,5,5,187,6,2,187,6,3,255,6,4,255,6,5,153,7,4,170,7,5,255,7,6,255,7,7,187,8,7,255,8,8,255,8,9,187,9,5,153,9,6,221,9,7,170,10,2,221,10,3,238,10,4,187,11,2,187],"secondary":false},{"width":9,"bonus":115,"chr":"x","pixels":[1,2,221,1,9,238,2,2,255,2,3,255,2,7,153,2,8,221,2,9,153,3,3,153,3,4,255,3,5,221,3,6,204,4,5,255,4,6,255,4,7,170,5,3,187,5,4,170,5,7,255,5,8,255,5,9,153,6,2,255,6,8,204,6,9,255,7,9,170],"secondary":false},{"width":8,"bonus":95,"chr":"y","pixels":[0,2,187,1,2,255,1,3,221,2,3,221,2,4,255,2,5,153,3,5,238,3,6,255,3,7,255,3,8,255,3,9,255,4,5,204,4,6,170,4,7,153,4,8,153,4,9,204,5,3,187,5,4,187,6,2,238],"secondary":false},{"width":8,"bonus":105,"chr":"z","pixels":[0,9,204,1,2,238,1,7,153,1,8,255,1,9,255,2,2,221,2,6,221,2,7,255,2,9,221,3,2,221,3,4,153,3,5,255,3,6,221,3,9,221,4,2,238,4,3,221,4,4,255,4,9,221,5,2,255,5,3,204,5,9,255],"secondary":false},{"width":4,"bonus":45,"chr":"{","pixels":[1,1,255,1,2,255,1,3,255,1,5,187,1,6,255,1,7,255,1,8,255,1,9,221,2,0,153],"secondary":false},{"width":2,"bonus":60,"chr":"|","pixels":[0,0,255,0,1,255,0,2,255,0,3,255,0,4,255,0,5,255,0,6,255,0,7,255,0,8,255,0,9,255,0,10,255,0,11,255],"secondary":true},{"width":4,"bonus":45,"chr":"}","pixels":[0,0,153,1,1,255,1,2,255,1,3,255,1,5,187,1,6,255,1,7,255,1,8,255,1,9,221],"secondary":false},{"width":7,"bonus":30,"chr":"~","pixels":[0,5,221,1,4,255,2,4,187,3,5,187,4,5,255,5,4,204],"secondary":false}],"width":13,"spacewidth":3,"shadow":false,"height":12,"basey":9}');

/***/ },

/***/ "alt1/base"
/*!**************************************************************************************************!*\
  !*** external {"root":"A1lib","commonjs2":"alt1/base","commonjs":"alt1/base","amd":"alt1/base"} ***!
  \**************************************************************************************************/
(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_alt1_base__;

/***/ },

/***/ "alt1/ocr"
/*!*********************************************************************************************!*\
  !*** external {"root":"OCR","commonjs2":"alt1/ocr","commonjs":"alt1/ocr","amd":"alt1/ocr"} ***!
  \*********************************************************************************************/
(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_alt1_ocr__;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_86297__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_86297__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __nested_webpack_exports__ = __nested_webpack_require_86297__("./src/dialog/index.ts");
/******/ 	
/******/ 	return __nested_webpack_exports__;
/******/ })()
;
});

/***/ },

/***/ "./node_modules/alt1/dist/ocr/index.js"
/*!*********************************************!*\
  !*** ./node_modules/alt1/dist/ocr/index.js ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory(__webpack_require__(/*! alt1/base */ "./node_modules/alt1/dist/base/index.js"));
	else // removed by dead control flow
{}
})(globalThis, (__WEBPACK_EXTERNAL_MODULE_alt1_base__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ocr/index.ts"
/*!**************************!*\
  !*** ./src/ocr/index.ts ***!
  \**************************/
(__unused_webpack_module, exports, __nested_webpack_require_720__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateFont = exports.loadFontImage = exports.readChar = exports.readSmallCapsBackwards = exports.readLine = exports.getChatColor = exports.getChatColorMono = exports.findReadLine = exports.findChar = exports.decompose3col = exports.decomposeblack = exports.decompose2col = exports.canblend = exports.unblendTrans = exports.unblendKnownBg = exports.unblendBlackBackground = exports.debugFont = exports.debugout = exports.debug = void 0;
const base_1 = __nested_webpack_require_720__(/*! alt1/base */ "alt1/base");
exports.debug = {
    printcharscores: false,
    trackread: false
};
exports.debugout = {};
/**
 * draws the font definition to a buffer and displays it in the dom for debugging purposes
 * @param font
 */
function debugFont(font) {
    var spacing = font.width + 2;
    var buf = new base_1.ImageData(spacing * font.chars.length, font.height + 1);
    for (var a = 0; a < buf.data.length; a += 4) {
        buf.data[a] = buf.data[a + 1] = buf.data[a + 2] = 0;
        buf.data[a + 3] = 255;
    }
    for (var a = 0; a < font.chars.length; a++) {
        var bx = a * spacing;
        var chr = font.chars[a];
        for (var b = 0; b < chr.pixels.length; b += (font.shadow ? 4 : 3)) {
            buf.setPixel(bx + chr.pixels[b], chr.pixels[b + 1], [chr.pixels[b + 2], chr.pixels[b + 2], chr.pixels[b + 2], 255]);
            if (font.shadow) {
                buf.setPixel(bx + chr.pixels[b], chr.pixels[b + 1], [chr.pixels[b + 3], 0, 0, 255]);
            }
        }
    }
    buf.show();
}
exports.debugFont = debugFont;
function unblendBlackBackground(img, r, g, b) {
    var rimg = new base_1.ImageData(img.width, img.height);
    for (var i = 0; i < img.data.length; i += 4) {
        var col = decomposeblack(img.data[i], img.data[i + 1], img.data[i + 2], r, g, b);
        rimg.data[i + 0] = col[0] * 255;
        rimg.data[i + 1] = rimg.data[i + 0];
        rimg.data[i + 2] = rimg.data[i + 0];
        rimg.data[i + 3] = 255;
    }
    return rimg;
}
exports.unblendBlackBackground = unblendBlackBackground;
/**
 * unblends a imagebuffer into match strength with given color
 * the bgimg argument should contain a second image with pixel occluded by the font visible.
 * @param img
 * @param shadow detect black as second color
 * @param bgimg optional second image to
 */
function unblendKnownBg(img, bgimg, shadow, r, g, b) {
    if (bgimg && (img.width != bgimg.width || img.height != bgimg.height)) {
        throw "bgimg size doesn't match";
    }
    var rimg = new base_1.ImageData(img.width, img.height);
    var totalerror = 0;
    for (var i = 0; i < img.data.length; i += 4) {
        var col = decompose2col(img.data[i], img.data[i + 1], img.data[i + 2], r, g, b, bgimg.data[i + 0], bgimg.data[i + 1], bgimg.data[i + 2]);
        if (shadow) {
            if (col[2] > 0.01) {
                console.log("high error component: " + (col[2] * 100).toFixed(1) + "%");
            }
            totalerror += col[2];
            var m = 1 - col[1] - Math.abs(col[2]); //main color+black=100%-bg-error
            rimg.data[i + 0] = m * 255;
            rimg.data[i + 1] = col[0] / m * 255;
            rimg.data[i + 2] = rimg.data[i + 0];
        }
        else {
            rimg.data[i + 0] = col[0] * 255;
            rimg.data[i + 1] = rimg.data[i + 0];
            rimg.data[i + 2] = rimg.data[i + 0];
        }
        rimg.data[i + 3] = 255;
    }
    return rimg;
}
exports.unblendKnownBg = unblendKnownBg;
/**
 * Unblends a font image that is already conpletely isolated to the raw image used ingame. This is the easiest mode for pixel fonts where alpha is 0 or 255, or for extracted font files.
 * @param img
 * @param r
 * @param g
 * @param b
 * @param shadow whether the font has a black shadow
 */
function unblendTrans(img, shadow, r, g, b) {
    var rimg = new base_1.ImageData(img.width, img.height);
    var pxlum = r + g + b;
    for (var i = 0; i < img.data.length; i += 4) {
        if (shadow) {
            var lum = img.data[i + 0] + img.data[i + 1] + img.data[i + 2];
            rimg.data[i + 0] = img.data[i + 3];
            rimg.data[i + 1] = lum / pxlum * 255;
            rimg.data[i + 2] = rimg.data[i + 0];
        }
        else {
            rimg.data[i + 0] = img.data[i + 3];
            rimg.data[i + 1] = rimg.data[i + 0];
            rimg.data[i + 2] = rimg.data[i + 0];
        }
        rimg.data[i + 3] = 255;
    }
    return rimg;
}
exports.unblendTrans = unblendTrans;
/**
 * Determised wether color [rgb]m can be a result of a blend with color [rgb]1 that is p (0-1) of the mix
 * It returns the number that the second color has to lie outside of the possible color ranges
 * @param rm resulting color
 * @param r1 first color of the mix (the other color is unknown)
 * @param p the portion of the [rgb]1 in the mix (0-1)
 */
function canblend(rm, gm, bm, r1, g1, b1, p) {
    var m = Math.min(50, p / (1 - p));
    var r = rm + (rm - r1) * m;
    var g = gm + (gm - g1) * m;
    var b = bm + (bm - b1) * m;
    return Math.max(0, -r, -g, -b, r - 255, g - 255, b - 255);
}
exports.canblend = canblend;
/**
 * decomposes a color in 2 given component colors and returns the amount of each color present
 * also return a third (noise) component which is the the amount leftover orthagonal from the 2 given colors
 */
function decompose2col(rp, gp, bp, r1, g1, b1, r2, g2, b2) {
    //get the normal of the error (cross-product of both colors)
    var r3 = g1 * b2 - g2 * b1;
    var g3 = b1 * r2 - b2 * r1;
    var b3 = r1 * g2 - r2 * g1;
    //normalize to length 255
    var norm = 255 / Math.sqrt(r3 * r3 + g3 * g3 + b3 * b3);
    r3 *= norm;
    g3 *= norm;
    b3 *= norm;
    return decompose3col(rp, gp, bp, r1, g1, b1, r2, g2, b2, r3, g3, b3);
}
exports.decompose2col = decompose2col;
/**
 * decomposes a pixel in a given color component and black and returns what proportion of the second color it contains
 * this is not as formal as decompose 2/3 and only give a "good enough" number
 */
function decomposeblack(rp, gp, bp, r1, g1, b1) {
    var dr = Math.abs(rp - r1);
    var dg = Math.abs(gp - g1);
    var db = Math.abs(bp - b1);
    var maxdif = Math.max(dr, dg, db);
    return [1 - maxdif / 255];
}
exports.decomposeblack = decomposeblack;
/**
 * decomposes a color in 3 given component colors and returns the amount of each color present
 */
function decompose3col(rp, gp, bp, r1, g1, b1, r2, g2, b2, r3, g3, b3) {
    //P=x*C1+y*C2+z*C3
    //assemble as matrix 
    //M*w=p
    //get inverse of M
    //dirty written out version of cramer's rule
    var A = g2 * b3 - b2 * g3;
    var B = g3 * b1 - b3 * g1;
    var C = g1 * b2 - b1 * g2;
    var D = b2 * r3 - r2 * b3;
    var E = b3 * r1 - r3 * b1;
    var F = b1 * r2 - r1 * b2;
    var G = r2 * g3 - g2 * r3;
    var H = r3 * g1 - g3 * r1;
    var I = r1 * g2 - g1 * r2;
    var det = r1 * A + g1 * D + b1 * G;
    //M^-1*p=w
    var x = (A * rp + D * gp + G * bp) / det;
    var y = (B * rp + E * gp + H * bp) / det;
    var z = (C * rp + F * gp + I * bp) / det;
    return [x, y, z];
}
exports.decompose3col = decompose3col;
/**
 * brute force to the exact position of the text
 */
function findChar(buffer, font, col, x, y, w, h) {
    if (x < 0) {
        return null;
    }
    if (y - font.basey < 0) {
        return null;
    }
    if (x + w + font.width > buffer.width) {
        return null;
    }
    if (y + h - font.basey + font.height > buffer.height) {
        return null;
    }
    var best = 1000; //TODO finetune score constants
    var bestchar = null;
    for (var cx = x; cx < x + w; cx++) {
        for (var cy = y; cy < y + h; cy++) {
            var chr = readChar(buffer, font, col, cx, cy, false, false);
            if (chr != null && chr.sizescore < best) {
                best = chr.sizescore;
                bestchar = chr;
            }
        }
    }
    return bestchar;
}
exports.findChar = findChar;
/**
 * reads text with unknown exact coord or color. The given coord should be inside the text
 * color selection not implemented yet
 */
function findReadLine(buffer, font, cols, x, y, w = -1, h = -1) {
    if (w == -1) {
        w = font.width + font.spacewidth;
        x -= Math.ceil(w / 2);
    }
    if (h == -1) {
        h = 7;
        y -= 1;
    }
    var chr = null;
    if (cols.length > 1) {
        //TODO use getChatColor() instead for non-mono?
        var sorted = getChatColorMono(buffer, new base_1.Rect(x, y - font.basey, w, h), cols);
        //loop until we have a match (max 2 cols)
        for (var a = 0; a < 2 && a < sorted.length && chr == null; a++) {
            chr = findChar(buffer, font, sorted[a].col, x, y, w, h);
        }
    }
    else {
        chr = findChar(buffer, font, cols[0], x, y, w, h);
    }
    if (chr == null) {
        return { debugArea: { x, y, w, h }, text: "", fragments: [] };
    }
    return readLine(buffer, font, cols, chr.x, chr.y, true, true);
}
exports.findReadLine = findReadLine;
function getChatColorMono(buf, rect, colors) {
    var colormap = colors.map(c => ({ col: c, score: 0 }));
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.width > buf.width || rect.y + rect.height > buf.height) {
        return colormap;
    }
    var data = buf.data;
    var maxd = 50;
    for (var colobj of colormap) {
        var score = 0;
        var col = colobj.col;
        for (var y = rect.y; y < rect.y + rect.height; y++) {
            for (var x = rect.x; x < rect.x + rect.width; x++) {
                var i = x * 4 + y * 4 * buf.width;
                var d = Math.abs(data[i] - col[0]) + Math.abs(data[i + 1] - col[1]) + Math.abs(data[i + 2] - col[2]);
                if (d < maxd) {
                    score += maxd - d;
                }
            }
        }
        colobj.score = score;
    }
    return colormap.sort((a, b) => b.score - a.score);
}
exports.getChatColorMono = getChatColorMono;
function unblend(r, g, b, R, G, B) {
    var m = Math.sqrt(r * r + g * g + b * b);
    var n = Math.sqrt(R * R + G * G + B * B);
    var x = (r * R + g * G + b * B) / n;
    var y = Math.sqrt(Math.max(0, m * m - x * x));
    var r1 = Math.max(0, (63.75 - y) * 4);
    var r2 = x / n * 255;
    if (r2 > 255) //brighter than refcol
     {
        r1 = Math.max(0, r1 - r2 + 255);
        r2 = 255;
    }
    return [r1, r2];
}
function getChatColor(buf, rect, colors) {
    var bestscore = -1.0;
    var best = null;
    var b2 = 0.0;
    var data = buf.data;
    for (let col of colors) {
        var score = 0.0;
        for (var y = rect.y; y < rect.y + rect.height; y++) {
            for (var x = rect.x; x < rect.x + rect.width; x++) {
                if (x < 0 || x + 1 >= buf.width) {
                    continue;
                }
                if (y < 0 || y + 1 >= buf.width) {
                    continue;
                }
                let i1 = buf.pixelOffset(x, y);
                let i2 = buf.pixelOffset(x + 1, y + 1);
                var pixel1 = unblend(data[i1 + 0], data[i1 + 1], data[i1 + 2], col[0], col[1], col[2]);
                var pixel2 = unblend(data[i2 + 0], data[i2 + 1], data[i2 + 2], col[0], col[1], col[2]);
                //TODO this is from c# can simplify a bit
                var s = (pixel1[0] / 255 * pixel1[1] / 255) * (pixel2[0] / 255 * (255.0 - pixel2[1]) / 255);
                score += s;
            }
        }
        if (score > bestscore) {
            b2 = bestscore;
            bestscore = score;
            best = col;
        }
        else if (score > b2) {
            b2 = score;
        }
    }
    //Console.WriteLine("color: " + bestcol + " - " + (bestscore - b2));
    //bestscore /= rect.width * rect.height;
    return best;
}
exports.getChatColor = getChatColor;
/**
 * reads a line of text with exactly known position and color. y should be the y coord of the text base line, x should be the first pixel of a new character
 */
function readLine(buffer, font, colors, x, y, forward, backward = false) {
    if (typeof colors[0] != "number" && colors.length == 1) {
        colors = colors[0];
    }
    var multicol = typeof colors[0] != "number";
    var allcolors = multicol ? colors : [colors];
    var detectcolor = function (sx, sy, backward) {
        var w = Math.floor(font.width * 1.5);
        if (backward) {
            sx -= w;
        }
        sy -= font.basey;
        return getChatColor(buffer, { x: sx, y: sy, width: w, height: font.height }, allcolors);
    };
    var fragments = [];
    var x1 = x;
    var x2 = x;
    var maxspaces = (typeof font.maxspaces == "number" ? font.maxspaces : 1);
    let fragtext = "";
    let fraghadprimary = false;
    var lastcol = null;
    let addfrag = (forward) => {
        if (!fragtext) {
            return;
        }
        let frag = {
            text: fragtext,
            color: lastcol,
            index: 0,
            xstart: x + (forward ? fragstartdx : fragenddx),
            xend: x + (forward ? fragenddx : fragstartdx)
        };
        if (forward) {
            fragments.push(frag);
        }
        else {
            fragments.unshift(frag);
        }
        fragtext = "";
        fragstartdx = dx;
        fraghadprimary = false;
    };
    for (var dirforward of [true, false]) {
        //init vars
        if (dirforward && !forward) {
            continue;
        }
        if (!dirforward && !backward) {
            continue;
        }
        var dx = 0;
        var fragstartdx = dx;
        var fragenddx = dx;
        var triedspaces = 0;
        var triedrecol = false;
        var col = multicol ? null : colors;
        while (true) {
            col = col || detectcolor(x + dx, y, !dirforward);
            var chr = (col ? readChar(buffer, font, col, x + dx, y, !dirforward, true) : null);
            if (col == null || chr == null) {
                if (triedspaces < maxspaces) {
                    dx += (dirforward ? 1 : -1) * font.spacewidth;
                    triedspaces++;
                    continue;
                }
                if (multicol && !triedrecol && fraghadprimary) {
                    dx -= (dirforward ? 1 : -1) * triedspaces * font.spacewidth;
                    triedspaces = 0;
                    col = null;
                    triedrecol = true;
                    continue;
                }
                if (dirforward) {
                    x2 = x + dx - font.spacewidth;
                }
                else {
                    x1 = x + dx + font.spacewidth;
                }
                break;
            }
            else {
                if (lastcol && (col[0] != lastcol[0] || col[1] != lastcol[1] || col[2] != lastcol[2])) {
                    addfrag(dirforward);
                }
                var spaces = "";
                for (var a = 0; a < triedspaces; a++) {
                    spaces += " ";
                }
                if (dirforward) {
                    fragtext += spaces + chr.chr;
                }
                else {
                    fragtext = chr.chr + spaces + fragtext;
                }
                if (!chr.basechar.secondary) {
                    fraghadprimary = true;
                }
                triedspaces = 0;
                triedrecol = false;
                dx += (dirforward ? 1 : -1) * chr.basechar.width;
                fragenddx = dx;
                lastcol = col;
            }
        }
        if (lastcol && fraghadprimary) {
            addfrag(dirforward);
        }
    }
    fragments.forEach((f, i) => f.index = i);
    return {
        debugArea: { x: x1, y: y - 9, w: x2 - x1, h: 10 },
        text: fragments.map(f => f.text).join(""),
        fragments
    };
}
exports.readLine = readLine;
/**
 * Reads a line of text that uses a smallcaps font, these fonts can have duplicate chars that only have a different amount of
 * empty space after the char before the next char starts.
 * The coordinates should be near the end of the string, or a rectangle with high 1 containing all points where the string can end.
 */
function readSmallCapsBackwards(buffer, font, cols, x, y, w = -1, h = -1) {
    if (w == -1) {
        w = font.width + font.spacewidth;
        x -= Math.ceil(w / 2);
    }
    if (h == -1) {
        h = 7;
        y -= 1;
    }
    var matchedchar = null;
    var sorted = (cols.length == 1 ? [{ col: cols[0], score: 1 }] : getChatColorMono(buffer, new base_1.Rect(x, y - font.basey, w, h), cols));
    //loop until we have a match (max 2 cols)
    for (var a = 0; a < 2 && a < sorted.length && matchedchar == null; a++) {
        for (var cx = x + w - 1; cx >= x; cx--) {
            var best = 1000; //TODO finetune score constants
            var bestchar = null;
            for (var cy = y; cy < y + h; cy++) {
                var chr = readChar(buffer, font, sorted[a].col, cx, cy, true, false);
                if (chr != null && chr.sizescore < best) {
                    best = chr.sizescore;
                    bestchar = chr;
                }
            }
            if (bestchar) {
                matchedchar = bestchar;
                break;
            }
        }
    }
    if (matchedchar == null) {
        return { text: "", debugArea: { x, y, w, h } };
    }
    return readLine(buffer, font, cols, matchedchar.x, matchedchar.y, false, true);
}
exports.readSmallCapsBackwards = readSmallCapsBackwards;
/**
 * Reads a single character at the exact given location
 * @param x exact x location of the start of the character domain (includes part of the spacing between characters)
 * @param y exact y location of the baseline pixel of the character
 * @param backwards read in backwards direction, the x location should be the first pixel after the character domain in that case
 */
function readChar(buffer, font, col, x, y, backwards, allowSecondary) {
    y -= font.basey;
    var shiftx = 0;
    var shifty = font.basey;
    var shadow = font.shadow;
    var debugobj = null;
    var debugimg = null;
    if (exports.debug.trackread) {
        var name = x + ";" + y + " " + JSON.stringify(col);
        if (!exports.debugout[name]) {
            exports.debugout[name] = [];
        }
        debugobj = exports.debugout[name];
    }
    //===== make sure the full domain is inside the bitmap/buffer ======
    if (y < 0 || y + font.height >= buffer.height) {
        return null;
    }
    if (!backwards) {
        if (x < 0 || x + font.width > buffer.width) {
            return null;
        }
    }
    else {
        if (x - font.width < 0 || x > buffer.width) {
            return null;
        }
    }
    //====== start reading the char ======
    var scores = [];
    charloop: for (var chr = 0; chr < font.chars.length; chr++) {
        var chrobj = font.chars[chr];
        if (chrobj.secondary && !allowSecondary) {
            continue;
        }
        const scoreobj = { score: 0, sizescore: 0, chr: chrobj };
        var chrx = (backwards ? x - chrobj.width : x);
        if (exports.debug.trackread) {
            debugimg = new base_1.ImageData(font.width, font.height);
        }
        for (var a = 0; a < chrobj.pixels.length;) {
            var i = (chrx + chrobj.pixels[a]) * 4 + (y + chrobj.pixels[a + 1]) * buffer.width * 4;
            var penalty = 0;
            if (!shadow) {
                penalty = canblend(buffer.data[i], buffer.data[i + 1], buffer.data[i + 2], col[0], col[1], col[2], chrobj.pixels[a + 2] / 255);
                a += 3;
            }
            else {
                var lum = chrobj.pixels[a + 3] / 255;
                penalty = canblend(buffer.data[i], buffer.data[i + 1], buffer.data[i + 2], col[0] * lum, col[1] * lum, col[2] * lum, chrobj.pixels[a + 2] / 255);
                a += 4;
            }
            scoreobj.score += penalty;
            // Short circuit the loop as soon as the penalty threshold (400) is reached
            if (!debugobj && scoreobj.score > 400) {
                continue charloop;
            }
            //TODO add compiler flag to this to remove it for performance
            if (debugimg) {
                debugimg.setPixel(chrobj.pixels[a], chrobj.pixels[a + 1], [penalty, penalty, penalty, 255]);
            }
        }
        scoreobj.sizescore = scoreobj.score - chrobj.bonus;
        if (debugobj) {
            debugobj.push({ chr: chrobj.chr, score: scoreobj.sizescore, rawscore: scoreobj.score, img: debugimg });
        }
        scores.push(scoreobj);
    }
    if (exports.debug.printcharscores) {
        scores.sort((a, b) => a.sizescore - b.sizescore);
        scores.slice(0, 5).forEach(q => console.log(q.chr.chr, q.score.toFixed(3), q.sizescore.toFixed(3)));
    }
    let winchr = null;
    for (const chrscore of scores) {
        if (!winchr || (chrscore && chrscore.sizescore < winchr.sizescore))
            winchr = chrscore;
    }
    if (!winchr || winchr.score > 400) {
        return null;
    }
    return { chr: winchr.chr.chr, basechar: winchr.chr, x: x + shiftx, y: y + shifty, score: winchr.score, sizescore: winchr.sizescore };
}
exports.readChar = readChar;
function loadFontImage(img, meta) {
    var bg = null;
    var pxheight = img.height - 1;
    if (meta.unblendmode == "removebg") {
        pxheight /= 2;
    }
    var inimg = img.clone({ x: 0, y: 0, width: img.width, height: pxheight });
    var outimg;
    if (meta.unblendmode == "removebg") {
        bg = img.clone({ x: 0, y: pxheight + 1, width: img.width, height: pxheight });
        outimg = unblendKnownBg(inimg, bg, meta.shadow, meta.color[0], meta.color[1], meta.color[2]);
    }
    else if (meta.unblendmode == "raw") {
        outimg = unblendTrans(inimg, meta.shadow, meta.color[0], meta.color[1], meta.color[2]);
    }
    else if (meta.unblendmode == "blackbg") {
        outimg = unblendBlackBackground(inimg, meta.color[0], meta.color[1], meta.color[2]);
    }
    else {
        throw new Error("no unblend mode");
    }
    var unblended = new base_1.ImageData(img.width, pxheight + 1);
    outimg.copyTo(unblended, 0, 0, outimg.width, outimg.height, 0, 0);
    img.copyTo(unblended, 0, pxheight, img.width, 1, 0, pxheight);
    return generateFont(unblended, meta.chars, meta.seconds, meta.bonus || {}, meta.basey, meta.spacewidth, meta.treshold, meta.shadow);
}
exports.loadFontImage = loadFontImage;
/**
 * Generates a font json description to use in reader functions
 * @param unblended A source image with all characters lined up. The image should be unblended into components using the unblend functions
 * The lowest pixel line of this image is used to mark the location and size of the charecters if the red component is 255 it means there is a character on that pixel column
 * @param chars A string containing all the characters of the image in the same order
 * @param seconds A string with characters that are considered unlikely and should only be detected if no other character is possible.
 * For example the period (.) character matches positive inside many other characters and should be marked as secondary
 * @param bonusses An object that contains bonus scores for certain difficult characters to make the more likely to be red.
 * @param basey The y position of the baseline pixel of the font
 * @param spacewidth the number of pixels a space takes
 * @param treshold minimal color match proportion (0-1) before a pixel is used for the font
 * @param shadow whether this font also uses the black shadow some fonts have. The "unblended" image should be unblended correspondingly
 * @returns a javascript object describing the font which is used as input for the different read functions
 */
function generateFont(unblended, chars, seconds, bonusses, basey, spacewidth, treshold, shadow) {
    //settings vars
    treshold *= 255;
    //initial vars
    var miny = unblended.height - 1;
    var maxy = 0;
    var font = { chars: [], width: 0, spacewidth: spacewidth, shadow: shadow, height: 0, basey: 0 };
    var ds = false;
    var chardata = [];
    //index all chars
    for (var dx = 0; dx < unblended.width; dx++) {
        var i = 4 * dx + 4 * unblended.width * (unblended.height - 1);
        if (unblended.data[i] == 255 && unblended.data[i + 3] == 255) {
            if (ds === false) {
                ds = dx;
            }
        }
        else {
            if (ds !== false) {
                //char found, start detection
                var de = dx;
                var char = chars[chardata.length];
                var chr = {
                    ds: ds,
                    de: de,
                    width: de - ds,
                    chr: char,
                    bonus: (bonusses && bonusses[char]) || 0,
                    secondary: seconds.indexOf(chars[chardata.length]) != -1,
                    pixels: []
                };
                chardata.push(chr);
                font.width = Math.max(font.width, chr.width);
                for (x = 0; x < de - ds; x++) {
                    for (y = 0; y < unblended.height - 1; y++) {
                        var i = (x + ds) * 4 + y * unblended.width * 4;
                        if (unblended.data[i] >= treshold) {
                            miny = Math.min(miny, y);
                            maxy = Math.max(maxy, y);
                        }
                    }
                }
                ds = false;
            }
        }
    }
    font.height = maxy + 1 - miny;
    font.basey = basey - miny;
    //detect all pixels
    for (var a in chardata) {
        var chr = chardata[a];
        for (var x = 0; x < chr.width; x++) {
            for (var y = 0; y < maxy + 1 - miny; y++) {
                var i = (x + chr.ds) * 4 + (y + miny) * unblended.width * 4;
                if (unblended.data[i] >= treshold) {
                    chr.pixels.push(x, y);
                    chr.pixels.push(unblended.data[i]);
                    if (shadow) {
                        chr.pixels.push(unblended.data[i + 1]);
                    }
                    chr.bonus += 5;
                }
            }
        }
        //prevent js from doing the thing with unnecessary output precision
        chr.bonus = +chr.bonus.toFixed(3);
        font.chars.push({ width: chr.width, bonus: chr.bonus, chr: chr.chr, pixels: chr.pixels, secondary: chr.secondary });
    }
    return font;
}
exports.generateFont = generateFont;


/***/ },

/***/ "alt1/base"
/*!**************************************************************************************************!*\
  !*** external {"root":"A1lib","commonjs2":"alt1/base","commonjs":"alt1/base","amd":"alt1/base"} ***!
  \**************************************************************************************************/
(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE_alt1_base__;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_27758__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_27758__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __nested_webpack_exports__ = __nested_webpack_require_27758__("./src/ocr/index.ts");
/******/ 	
/******/ 	return __nested_webpack_exports__;
/******/ })()
;
});

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=bundle.js.map