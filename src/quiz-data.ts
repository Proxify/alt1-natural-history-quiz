// All 84 questions from the Varrock Museum Natural History Quiz
// Source: https://runescape.wiki/w/Natural_history_quiz
// Spellings are verbatim from the wiki (do NOT correct "Sarcopterghii", "Chilli"/"Chili" etc.)

export interface QuizEntry {
	question: string;
	options: [string, string, string];
	answer: string;
}

export const QUIZ_DATA: QuizEntry[] = [
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

export function normalize(s: string): string {
	return s
		.toLowerCase()
		.replace(/[‘’“”]/g, "'") // smart quotes → straight
		.replace(/[^a-z0-9 ]/g, " ")                 // strip all non-alphanum (apostrophes, punctuation, dashes)
		.replace(/\s+/g, " ")
		.trim();
}

function makeOptionsKey(a: string, b: string, c: string): string {
	return [normalize(a), normalize(b), normalize(c)].sort().join("|");
}

export const QUESTION_MAP: Map<string, string> = new Map(
	QUIZ_DATA.map(e => [normalize(e.question), e.answer])
);

export const OPTIONS_MAP: Map<string, string> = new Map(
	QUIZ_DATA.map(e => [makeOptionsKey(e.options[0], e.options[1], e.options[2]), e.answer])
);

if (OPTIONS_MAP.size !== QUIZ_DATA.length) {
	console.error(`OPTIONS_MAP collision! Expected ${QUIZ_DATA.length} entries, got ${OPTIONS_MAP.size}. Two questions share the same option triplet.`);
}
