const list: MonkeyTypes.FunboxMetadata[] = [
  {
    name: "nausea",
    info: "I think I'm gonna be sick.",
  },
  {
    name: "round_round_baby",
    info: "...right round, like a record baby. Right, round round round.",
  },
  {
    name: "simon_says",
    info: "Type what simon says.",
    properties: ["changesWordsVisibility", "usesLayout"],
    forcedConfig: {
      highlightMode: ["letter", "off"],
    },
  },
  {
    name: "mirror",
    info: "Everything is mirrored!",
  },
  {
    name: "upside_down",
    info: "Everything is upside down!",
  },
  {
    name: "tts",
    info: "Listen closely.",
    properties: ["changesWordsVisibility", "speaks"],
    forcedConfig: {
      highlightMode: ["letter", "off"],
    },
  },
  {
    name: "choo_choo",
    info: "All the letters are spinning!",
    properties: ["noLigatures", "conflictsWithSymmetricChars"],
  },
  {
    name: "arrows",
    info: "Play it on a pad!",
    properties: [
      "ignoresLanguage",
      "ignoresLayout",
      "nospace",
      "noLetters",
      "symmetricChars",
    ],
    forcedConfig: {
      punctuation: [false],
      numbers: [false],
      highlightMode: ["letter", "off"],
    },
  },
  {
    name: "rAnDoMcAsE",
    info: "I kInDa LiKe HoW iNeFfIcIeNt QwErTy Is.",
    properties: ["changesCapitalisation"],
  },
  {
    name: "capitals",
    info: "Capitalize Every Word.",
    properties: ["changesCapitalisation"],
  },
  {
    name: "layoutfluid",
    info: "Switch between layouts specified below proportionately to the length of the test.",
    properties: ["changesLayout", "noInfiniteDuration"],
  },
  {
    name: "earthquake",
    info: "Everybody get down! The words are shaking!",
    properties: ["noLigatures"],
  },
  {
    name: "space_balls",
    info: "In a galaxy far far away.",
  },
  {
    name: "gibberish",
    info: "Anvbuefl dizzs eoos alsb?",
    properties: ["ignoresLanguage", "unspeakable"],
  },
  {
    name: "58008",
    alias: "numbers",
    info: "A special mode for accountants.",
    properties: ["ignoresLanguage", "ignoresLayout", "noLetters"],
    forcedConfig: {
      numbers: [false],
    },
  },
  {
    name: "ascii",
    info: "Where was the ampersand again?. Only ASCII characters.",
    properties: ["ignoresLanguage", "noLetters", "unspeakable"],
    forcedConfig: {
      numbers: [false],
    },
  },
  {
    name: "specials",
    info: "!@#$%^&*. Only special characters.",
    properties: ["ignoresLanguage", "noLetters", "unspeakable"],
    forcedConfig: {
      punctuation: [false],
      numbers: [false],
    },
  },
  {
    name: "plus_one",
    info: "React quickly! Only one future word is visible.",
    properties: ["changesWordsVisibility", "toPush:2", "noInfiniteDuration"],
  },
  {
    name: "plus_two",
    info: "Only two future words are visible.",
    properties: ["changesWordsVisibility", "toPush:3", "noInfiniteDuration"],
  },
  {
    name: "plus_three",
    info: "Only three future words are visible.",
    properties: ["changesWordsVisibility", "toPush:4", "noInfiniteDuration"],
  },
  {
    name: "read_ahead_easy",
    info: "Only the current word is invisible.",
    properties: ["changesWordsVisibility"],
    forcedConfig: {
      highlightMode: ["letter", "off"],
    },
  },
  {
    name: "read_ahead",
    info: "Current and the next word are invisible!",
    properties: ["changesWordsVisibility"],
    forcedConfig: {
      highlightMode: ["letter", "off"],
    },
  },
  {
    name: "read_ahead_hard",
    info: "Current and the next two words are invisible!",
    properties: ["changesWordsVisibility"],
    forcedConfig: {
      highlightMode: ["letter", "off"],
    },
  },
  {
    name: "memory",
    info: "Test your memory. Remember the words and type them blind.",
    properties: ["changesWordsVisibility", "noInfiniteDuration"],
    forcedConfig: {
      mode: ["words", "quote", "custom"],
    },
  },
  {
    name: "nospace",
    info: "Whoneedsspacesanyway?",
    properties: ["nospace"],
    forcedConfig: {
      highlightMode: ["letter", "off"],
    },
  },
  {
    name: "poetry",
    info: "Practice typing some beautiful prose.",
    properties: ["noInfiniteDuration", "ignoresLanguage"],
    forcedConfig: {
      punctuation: [false],
      numbers: [false],
    },
  },
  {
    name: "wikipedia",
    info: "Practice typing wikipedia sections.",
    properties: ["noInfiniteDuration", "ignoresLanguage"],
    forcedConfig: {
      punctuation: [false],
      numbers: [false],
    },
  },
  {
    name: "weakspot",
    info: "Focus on slow and mistyped letters.",
    properties: ["changesWordsFrequency"],
  },
  {
    name: "pseudolang",
    info: "Nonsense words that look like the current language.",
    properties: ["unspeakable", "ignoresLanguage"],
  },
  {
    name: "IPv4",
    alias: "network",
    info: "For sysadmins.",
    properties: ["ignoresLanguage", "ignoresLayout", "noLetters"],
    forcedConfig: {
      numbers: [false],
    },
  },
  {
    name: "IPv6",
    alias: "network",
    info: "For sysadmins with a long beard.",
    properties: ["ignoresLanguage", "ignoresLayout", "noLetters"],
    forcedConfig: {
      numbers: [false],
    },
  },
  {
    name: "binary",
    alias: "numbers",
    info: "01000010 01100101 01100101 01110000 00100000 01100010 01101111 01101111 01110000 00101110",
    properties: ["ignoresLanguage", "ignoresLayout", "noLetters"],
    forcedConfig: {
      numbers: [false],
      punctuation: [false],
    },
  },
  {
    name: "zipf",
    alias: "frequency",
    info: "Words are generated according to Zipf's law. (not all languages will produce Zipfy results, use with caution)",
    properties: ["changesWordsFrequency"],
  },
];

export function getAll(): MonkeyTypes.FunboxMetadata[] {
  return list;
}

export function get(config: string): MonkeyTypes.FunboxMetadata[] {
  const funboxes: MonkeyTypes.FunboxMetadata[] = [];
  for (const i of config.split("#")) {
    const f = list.find((f) => f.name === i);
    if (f) funboxes.push(f);
  }
  return funboxes;
}

export function setFunboxFunctions(
  name: string,
  obj: MonkeyTypes.FunboxFunctions
): void {
  const fb = list.find((f) => f.name === name);
  if (!fb) throw new Error(`Funbox ${name} not found.`);
  fb.functions = obj;
}
