import * as TestWords from "./test-words";
import * as Notifications from "../elements/notifications";
import * as Misc from "../utils/misc";
import * as ManualRestart from "./manual-restart-tracker";
import Config, * as UpdateConfig from "../config";
import * as TestInput from "../test/test-input";
import * as Keymap from "../elements/keymap";
import * as TTS from "./tts";
import * as WeakSpot from "./weak-spot";
import { getPoem } from "./poetry";
import { getSection } from "./wikipedia";

export const Funboxes: MonkeyTypes.FunboxObject[] = [
  {
    name: "nausea",
    info: "I think I'm gonna be sick.",
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/nausea.css`);
      },
    },
  },
  {
    name: "round_round_baby",
    info: "...right round, like a record baby. Right, round round round.",
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/round_round_baby.css`);
      },
    },
  },
  {
    name: "simon_says",
    info: "Type what simon says.",
    properties: ["changesWordsVisibility", "blockWordHighlight", "usesLayout"],
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/simon_says.css`);
      },
      applyConfig(): void {
        UpdateConfig.setKeymapMode("next", true);
      },
      rememberSettings(): void {
        rememberSetting(
          "keymapMode",
          Config.keymapMode,
          UpdateConfig.setKeymapMode
        );
      },
    },
  },
  {
    name: "mirror",
    info: "Everything is mirrored!",
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/mirror.css`);
      },
    },
  },
  {
    name: "tts",
    info: "Listen closely.",
    properties: ["blockWordHighlight", "changesWordsVisibility", "speaks"],
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/simon_says.css`);
      },
      applyConfig(): void {
        UpdateConfig.setKeymapMode("off", true);
        UpdateConfig.setHighlightMode("letter", true);
      },
      rememberSettings(): void {
        rememberSetting(
          "keymapMode",
          Config.keymapMode,
          UpdateConfig.setKeymapMode
        );
      },
      toggleScript(params: string[]): void {
        if (window.speechSynthesis == undefined) {
          Notifications.add("Failed to load text-to-speech script", -1);
          return;
        }
        TTS.speak(params[0]);
      },
    },
  },
  {
    name: "choo_choo",
    info: "All the letters are spinning!",
    properties: ["noLigatures", "conflictsWithSymmetricChars"],
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/choo_choo.css`);
      },
    },
  },
  {
    name: "arrows",
    info: "Eurobeat Intensifies...",
    properties: [
      "blockWordHighlight",
      "ignoresLanguage",
      "ignoresLayout",
      "nospace",
      "noLetters",
      "symmetricChars",
    ],
    blockedModes: {
      punctuation: true,
      numbers: true,
    },
    functions: {
      getWord(): string {
        return Misc.getArrows();
      },
      applyConfig(): void {
        $("#words").addClass("arrows");
        UpdateConfig.setHighlightMode("letter", true);
      },
      rememberSettings(): void {
        rememberSetting(
          "highlightMode",
          Config.highlightMode,
          UpdateConfig.setHighlightMode
        );
      },
      handleChar(char: string): string {
        if (char === Config.arrowKeys[0] || char === "ArrowLeft") {
          return "←";
        }
        if (char === Config.arrowKeys[1] || char === "ArrowDown") {
          return "↓";
        }
        if (char === Config.arrowKeys[2] || char === "ArrowUp") {
          return "↑";
        }
        if (char === Config.arrowKeys[3] || char === "ArrowRight") {
          return "→";
        }
        return char;
      },
      isCharCorrect(char: string, originalChar: string): boolean {
        if (
          (char === Config.arrowKeys[0] || char === "ArrowLeft") &&
          originalChar === "←"
        ) {
          return true;
        }
        if (
          (char === Config.arrowKeys[1] || char === "ArrowDown") &&
          originalChar === "↓"
        ) {
          return true;
        }
        if (
          (char === Config.arrowKeys[2] || char === "ArrowUp") &&
          originalChar === "↑"
        ) {
          return true;
        }
        if (
          (char === Config.arrowKeys[3] || char === "ArrowRight") &&
          originalChar === "→"
        ) {
          return true;
        }
        return false;
      },
      async preventDefaultEvent(
        event: JQuery.KeyDownEvent<Document, null, Document, Document>
      ): Promise<boolean> {
        // TODO What's better?
        // return /Arrow/i.test(event.key);
        return ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(
          event.key
        );
      },
      getWordHtml(char: string, letterTag?: boolean): string {
        let retval = "";
        if (char === "↑") {
          if (letterTag) retval += `<letter>`;
          retval += `<i class="fas fa-arrow-up"></i>`;
          if (letterTag) retval += `</letter>`;
        }
        if (char === "↓") {
          if (letterTag) retval += `<letter>`;
          retval += `<i class="fas fa-arrow-down"></i>`;
          if (letterTag) retval += `</letter>`;
        }
        if (char === "←") {
          if (letterTag) retval += `<letter>`;
          retval += `<i class="fas fa-arrow-left"></i>`;
          if (letterTag) retval += `</letter>`;
        }
        if (char === "→") {
          if (letterTag) retval += `<letter>`;
          retval += `<i class="fas fa-arrow-right"></i>`;
          if (letterTag) retval += `</letter>`;
        }
        return retval;
      },
    },
  },
  {
    name: "rAnDoMcAsE",
    info: "I kInDa LiKe HoW iNeFfIcIeNt QwErTy Is.",
    properties: ["changesCapitalisation"],
    functions: {
      alterText(word: string): string {
        let randomcaseword = word[0];
        for (let i = 1; i < word.length; i++) {
          if (randomcaseword[i - 1] == randomcaseword[i - 1].toUpperCase()) {
            randomcaseword += word[i].toLowerCase();
          } else {
            randomcaseword += word[i].toUpperCase();
          }
        }
        return randomcaseword;
      },
    },
  },
  {
    name: "capitals",
    info: "Capitalize Every Word.",
    properties: ["changesCapitalisation"],
    functions: {
      alterText(word: string): string {
        return Misc.capitalizeFirstLetterOfEachWord(word);
      },
    },
  },
  {
    name: "layoutfluid",
    info: "Switch between layouts specified below proportionately to the length of the test.",
    properties: ["changesLayout"],
    functions: {
      applyConfig(): void {
        UpdateConfig.setLayout(
          Config.customLayoutfluid.split("#")[0]
            ? Config.customLayoutfluid.split("#")[0]
            : "qwerty",
          true
        );
        UpdateConfig.setKeymapLayout(
          Config.customLayoutfluid.split("#")[0]
            ? Config.customLayoutfluid.split("#")[0]
            : "qwerty",
          true
        );
      },
      rememberSettings(): void {
        rememberSetting(
          "keymapMode",
          Config.keymapMode,
          UpdateConfig.setKeymapMode
        );
        rememberSetting("layout", Config.layout, UpdateConfig.setLayout);
        rememberSetting(
          "keymapLayout",
          Config.keymapLayout,
          UpdateConfig.setKeymapLayout
        );
      },
      handleSpace(): void {
        if (Config.mode !== "time") {
          // here I need to check if Config.customLayoutFluid exists because of my
          // scuffed solution of returning whenever value is undefined in the setCustomLayoutfluid function
          const layouts: string[] = Config.customLayoutfluid
            ? Config.customLayoutfluid.split("#")
            : ["qwerty", "dvorak", "colemak"];
          let index = 0;
          const outOf: number = TestWords.words.length;
          index = Math.floor(
            (TestInput.input.history.length + 1) / (outOf / layouts.length)
          );
          if (
            Config.layout !== layouts[index] &&
            layouts[index] !== undefined
          ) {
            Notifications.add(`--- !!! ${layouts[index]} !!! ---`, 0);
          }
          if (layouts[index]) {
            UpdateConfig.setLayout(layouts[index]);
            UpdateConfig.setKeymapLayout(layouts[index]);
          }
          Keymap.highlightKey(
            TestWords.words
              .getCurrent()
              .charAt(TestInput.input.current.length)
              .toString()
          );
        }
      },
      getResultContent(): string {
        return Config.customLayoutfluid.replace(/#/g, " ");
      },
      restart(): void {
        if (this.applyConfig) this.applyConfig();
        Keymap.highlightKey(
          TestWords.words
            .getCurrent()
            .substring(
              TestInput.input.current.length,
              TestInput.input.current.length + 1
            )
            .toString()
        );
      },
    },
  },
  {
    name: "earthquake",
    info: "Everybody get down! The words are shaking!",
    properties: ["noLigatures"],
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/earthquake.css`);
      },
    },
  },
  {
    name: "space_balls",
    info: "In a galaxy far far away.",
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/space_balls.css`);
      },
    },
  },
  {
    name: "gibberish",
    info: "Anvbuefl dizzs eoos alsb?",
    properties: ["ignoresLanguage", "unspeakable"],
    functions: {
      getWord(): string {
        return Misc.getGibberish();
      },
    },
  },
  {
    name: "58008",
    alias: "numbers",
    info: "A special mode for accountants.",
    properties: ["ignoresLanguage", "ignoresLayout", "noLetters"],
    blockedModes: {
      numbers: true,
    },
    functions: {
      getWord(): string {
        let num = Misc.getNumbers(7);
        if (Config.language.startsWith("kurdish")) {
          num = Misc.convertNumberToArabic(num);
        } else if (Config.language.startsWith("nepali")) {
          num = Misc.convertNumberToNepali(num);
        }
        return num;
      },
      punctuateWord(word: string): string {
        if (word.length > 3) {
          if (Math.random() < 0.5) {
            word = Misc.setCharAt(
              word,
              Misc.randomIntFromRange(1, word.length - 2),
              "."
            );
          }
          if (Math.random() < 0.75) {
            const index = Misc.randomIntFromRange(1, word.length - 2);
            if (
              word[index - 1] !== "." &&
              word[index + 1] !== "." &&
              word[index + 1] !== "0"
            ) {
              const special = Misc.randomElementFromArray(["/", "*", "-", "+"]);
              word = Misc.setCharAt(word, index, special);
            }
          }
        }
        return word;
      },
      rememberSettings(): void {
        rememberSetting("numbers", Config.numbers, UpdateConfig.setNumbers);
      },
      handleChar(char: string): string {
        if (char === "\n") {
          return " ";
        }
        return char;
      },
    },
  },
  {
    name: "ascii",
    info: "Where was the ampersand again?. Only ASCII characters.",
    properties: ["ignoresLanguage", "noLetters", "unspeakable"],
    blockedModes: {
      punctuation: true,
      numbers: true,
    },
    functions: {
      getWord(): string {
        return Misc.getASCII();
      },
    },
  },
  {
    name: "specials",
    info: "!@#$%^&*. Only special characters.",
    properties: ["ignoresLanguage", "noLetters", "unspeakable"],
    blockedModes: {
      punctuation: true,
      numbers: true,
    },
    functions: {
      getWord(): string {
        return Misc.getSpecials();
      },
    },
  },
  {
    name: "plus_one",
    info: "React quickly! Only one future word is visible.",
    properties: ["changesWordsVisibility", "toPush:2"],
  },
  {
    name: "plus_two",
    info: "Only two future words are visible.",
    properties: ["changesWordsVisibility", "toPush:3"],
  },
  {
    name: "read_ahead_easy",
    info: "Only the current word is invisible.",
    properties: ["blockWordHighlight", "changesWordsVisibility"],
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/read_ahead_easy.css`);
      },
      applyConfig(): void {
        UpdateConfig.setHighlightMode("letter", true);
      },
      rememberSettings(): void {
        rememberSetting(
          "highlightMode",
          Config.highlightMode,
          UpdateConfig.setHighlightMode
        );
      },
    },
  },
  {
    name: "read_ahead",
    info: "Current and the next word are invisible!",
    properties: ["blockWordHighlight", "changesWordsVisibility"],
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/read_ahead.css`);
      },
      applyConfig(): void {
        UpdateConfig.setHighlightMode("letter", true);
      },
      rememberSettings(): void {
        rememberSetting(
          "highlightMode",
          Config.highlightMode,
          UpdateConfig.setHighlightMode
        );
      },
    },
  },
  {
    name: "read_ahead_hard",
    info: "Current and the next two words are invisible!",
    properties: ["blockWordHighlight", "changesWordsVisibility"],
    functions: {
      applyCSS(): void {
        $("#funBoxTheme").attr("href", `funbox/read_ahead_hard.css`);
      },
      applyConfig(): void {
        UpdateConfig.setHighlightMode("letter", true);
      },
      rememberSettings(): void {
        rememberSetting(
          "highlightMode",
          Config.highlightMode,
          UpdateConfig.setHighlightMode
        );
      },
    },
  },
  {
    name: "memory",
    info: "Test your memory. Remember the words and type them blind.",
    mode: "words",
    properties: ["changesWordsVisibility"],
    functions: {
      applyConfig(): void {
        $("#wordsWrapper").addClass("hidden");
        UpdateConfig.setMode("words", true);
        UpdateConfig.setShowAllLines(true, true);
        if (Config.keymapMode === "next") {
          UpdateConfig.setKeymapMode("react", true);
        }
      },
      rememberSettings(): void {
        rememberSetting("mode", Config.mode, UpdateConfig.setMode);
        rememberSetting(
          "showAllLines",
          Config.showAllLines,
          UpdateConfig.setShowAllLines
        );
        if (Config.keymapMode === "next") {
          rememberSetting(
            "keymapMode",
            Config.keymapMode,
            UpdateConfig.setKeymapMode
          );
        }
      },
      start(): void {
        resetMemoryTimer();
        $("#wordsWrapper").addClass("hidden");
      },
      restart(): void {
        startMemoryTimer();
        if (Config.keymapMode === "next") {
          UpdateConfig.setKeymapMode("react");
        }
      },
    },
  },
  {
    name: "nospace",
    info: "Whoneedsspacesanyway?",
    properties: ["blockWordHighlight", "nospace"],
    functions: {
      applyConfig(): void {
        $("#words").addClass("nospace");
        UpdateConfig.setHighlightMode("letter", true);
      },
      rememberSettings(): void {
        rememberSetting(
          "highlightMode",
          Config.highlightMode,
          UpdateConfig.setHighlightMode
        );
      },
    },
  },
  {
    name: "poetry",
    info: "Practice typing some beautiful prose.",
    blockedModes: {
      punctuation: true,
      numbers: true,
    },
    functions: {
      async pullSection(): Promise<Misc.Section | false> {
        return getPoem();
      },
    },
  },
  {
    name: "wikipedia",
    info: "Practice typing wikipedia sections.",
    blockedModes: {
      punctuation: true,
      numbers: true,
    },
    functions: {
      async pullSection(lang?: string): Promise<Misc.Section | false> {
        return getSection(lang ? lang : "english");
      },
    },
  },
  {
    name: "weakspot",
    info: "Focus on slow and mistyped letters.",
    functions: {
      getWord(wordset?: Misc.Wordset): string {
        if (wordset !== undefined) return WeakSpot.getWord(wordset);
        else return "";
      },
    },
  },
  {
    name: "pseudolang",
    info: "Nonsense words that look like the current language.",
    properties: ["unspeakable"],
    functions: {
      async withWords(words?: string[]): Promise<Misc.Wordset> {
        if (words !== undefined) return new PseudolangWordGenerator(words);
        return new Misc.Wordset([]);
      },
    },
  },
];

export const ActiveFunboxes = (): MonkeyTypes.FunboxObject[] => {
  const funboxes: MonkeyTypes.FunboxObject[] = [];
  for (const i of Config.funbox.split("#")) {
    const f = Funboxes.find((f) => f.name === i);
    if (f) funboxes.push(f);
  }
  return funboxes;
};

const prefixSize = 2;

class CharDistribution {
  public chars: { [char: string]: number };
  public count: number;
  constructor() {
    this.chars = {};
    this.count = 0;
  }

  public addChar(char: string): void {
    this.count++;
    if (char in this.chars) {
      this.chars[char]++;
    } else {
      this.chars[char] = 1;
    }
  }

  public randomChar(): string {
    const randomIndex = Misc.randomIntFromRange(0, this.count - 1);
    let runningCount = 0;
    for (const [char, charCount] of Object.entries(this.chars)) {
      runningCount += charCount;
      if (runningCount > randomIndex) {
        return char;
      }
    }

    return Object.keys(this.chars)[0];
  }
}

class PseudolangWordGenerator extends Misc.Wordset {
  public ngrams: { [prefix: string]: CharDistribution } = {};
  constructor(words: string[]) {
    super(words);
    // Can generate an unbounded number of words in theory.
    this.length = Infinity;

    for (let word of words) {
      // Mark the end of each word with a space.
      word += " ";
      let prefix = "";
      for (const c of word) {
        // Add `c` to the distribution of chars that can come after `prefix`.
        if (!(prefix in this.ngrams)) {
          this.ngrams[prefix] = new CharDistribution();
        }
        this.ngrams[prefix].addChar(c);
        prefix = (prefix + c).substr(-prefixSize);
      }
    }
  }

  public override randomWord(): string {
    let word = "";
    for (;;) {
      const prefix = word.substr(-prefixSize);
      const charDistribution = this.ngrams[prefix];
      if (!charDistribution) {
        // This shouldn't happen if this.ngrams is complete. If it does
        // somehow, start generating a new word.
        word = "";
        continue;
      }
      // Pick a random char from the distribution that comes after `prefix`.
      const nextChar = charDistribution.randomChar();
      if (nextChar == " ") {
        // A space marks the end of the word, so stop generating and return.
        break;
      }
      word += nextChar;
    }
    return word;
  }
}

let memoryTimer: number | null = null;
let memoryInterval: NodeJS.Timeout | null = null;

type SetFunction = (...params: any[]) => any;

let settingsMemory: {
  [key: string]: { value: any; setFunction: SetFunction };
} = {};

function rememberSetting(
  settingName: string,
  value: any,
  setFunction: SetFunction
): void {
  settingsMemory[settingName] ??= {
    value,
    setFunction,
  };
}

function loadMemory(): void {
  Object.keys(settingsMemory).forEach((setting) => {
    settingsMemory[setting].setFunction(settingsMemory[setting].value, true);
  });
  settingsMemory = {};
}

function showMemoryTimer(): void {
  $("#typingTest #memoryTimer").stop(true, true).animate(
    {
      opacity: 1,
    },
    125
  );
}

function hideMemoryTimer(): void {
  $("#typingTest #memoryTimer").stop(true, true).animate(
    {
      opacity: 0,
    },
    125
  );
}

export function resetMemoryTimer(): void {
  if (memoryInterval !== null) {
    clearInterval(memoryInterval);
    memoryInterval = null;
  }
  memoryTimer = null;
  hideMemoryTimer();
}

function updateMemoryTimer(sec: number): void {
  $("#typingTest #memoryTimer").text(
    `Timer left to memorise all words: ${sec}s`
  );
}

export function startMemoryTimer(): void {
  resetMemoryTimer();
  memoryTimer = Math.round(Math.pow(TestWords.words.length, 1.2));
  updateMemoryTimer(memoryTimer);
  showMemoryTimer();
  memoryInterval = setInterval(() => {
    if (memoryTimer === null) return;
    memoryTimer -= 1;
    memoryTimer == 0 ? hideMemoryTimer() : updateMemoryTimer(memoryTimer);
    if (memoryTimer <= 0) {
      resetMemoryTimer();
      $("#wordsWrapper").addClass("hidden");
    }
  }, 1000);
}

export function reset(): void {
  resetMemoryTimer();
}

export function toggleScript(...params: string[]): void {
  ActiveFunboxes().forEach((funbox) => {
    if (funbox.functions?.toggleScript) funbox.functions.toggleScript(params);
  });
}

export function checkFunbox(funbox?: string): boolean {
  if (funbox === "none" || Config.funbox === "none") return true;
  let checkingFunbox = ActiveFunboxes();
  if (funbox !== undefined) {
    checkingFunbox = checkingFunbox.concat(
      Funboxes.filter((f) => f.name == funbox)
    );
  }
  return !(
    Funboxes.filter(
      (f) => Config.funbox.split("#").find((cf) => cf == f.name) !== undefined
    ).length != Config.funbox.split("#").length ||
    checkingFunbox.filter(
      (f) =>
        f.functions?.getWord ||
        f.functions?.pullSection ||
        f.functions?.withWords
    ).length > 1 ||
    checkingFunbox.filter((f) =>
      f.properties?.find(
        (fp) =>
          fp == "changesLayout" || fp == "ignoresLayout" || fp == "usesLayout"
      )
    ).length > 1 ||
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "nospace" || fp.startsWith("toPush"))
    ).length > 1 ||
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "changesWordsVisibility")
    ).length > 1 ||
    checkingFunbox.filter((f) =>
      f.properties?.find(
        (fp) => fp == "noLetters" || fp == "changesCapitalisation"
      )
    ).length > 1 ||
    checkingFunbox.filter((f) =>
      f.properties?.find(
        (fp) => fp == "conflictsWithSymmetricChars" || fp == "symmetricChars"
      )
    ).length > 1 ||
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "speaks" || fp == "unspeakable")
    ).length > 1 ||
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "speaks" || fp == "ignoresLanguage")
    ).length > 1 ||
    checkingFunbox.filter(
      (f) =>
        f.properties?.find((fp) => fp.startsWith("toPush:")) ||
        f.functions?.pullSection
    ).length > 1 ||
    checkingFunbox.filter((f) => f.functions?.applyCSS).length > 1 ||
    checkingFunbox.filter((f) => f.functions?.punctuateWord).length > 1 ||
    checkingFunbox.filter((f) => f.functions?.isCharCorrect).length > 1 ||
    checkingFunbox.filter((f) => f.functions?.getWordHtml).length > 1
  );
}

export function setFunbox(funbox: string): boolean {
  loadMemory();
  UpdateConfig.setFunbox(funbox, false);
  return true;
}

export function toggleFunbox(funbox: string): boolean {
  if (
    funbox == "none" ||
    (!checkFunbox(funbox) && !Config.funbox.split("#").includes(funbox))
  ) {
    Notifications.add(`Can not apply the ${funbox} funbox`, 0);
    return true;
  }
  loadMemory();
  const e = UpdateConfig.toggleFunbox(funbox, false);
  if (e === false || e === true) return false;
  return true;
}

export async function clear(): Promise<boolean> {
  $("#funBoxTheme").attr("href", ``);
  $("#words").removeClass("nospace");
  $("#words").removeClass("arrows");
  $("#wordsWrapper").removeClass("hidden");
  reset();
  ManualRestart.set();
  return true;
}

export async function activate(funbox?: string): Promise<boolean | undefined> {
  if (funbox === undefined || funbox === null) {
    funbox = Config.funbox;
  } else if (Config.funbox != funbox) {
    Config.funbox = funbox;
  }

  // The configuration might be edited with dev tools,
  // so we need to double check its validity
  if (!checkFunbox()) {
    Notifications.add(
      Misc.createErrorMessage(undefined, "Failed to activate funbox"),
      -1
    );
    UpdateConfig.setFunbox("none", true);
    await clear();
    return false;
  }

  reset();
  $("#wordsWrapper").removeClass("hidden");
  $("#funBoxTheme").attr("href", ``);
  $("#words").removeClass("nospace");
  $("#words").removeClass("arrows");

  let language;
  try {
    language = await Misc.getCurrentLanguage(Config.language);
  } catch (e) {
    Notifications.add(
      Misc.createErrorMessage(e, "Failed to activate funbox"),
      -1
    );
    UpdateConfig.setFunbox("none", true);
    await clear();
    return false;
  }

  if (language.ligatures) {
    if (ActiveFunboxes().find((f) => f.properties?.includes("noLigatures"))) {
      Notifications.add(
        "Current language does not support this funbox mode",
        0
      );
      UpdateConfig.setFunbox("none", true);
      await clear();
      return;
    }
  }

  if (
    (Config.time === 0 && Config.mode === "time") ||
    (Config.words === 0 && Config.mode === "words")
  ) {
    const fb = ActiveFunboxes().filter(
      (f) =>
        f.functions?.pullSection ||
        f.properties?.find((fp) => fp.startsWith("toPush:"))
    );
    if (fb.length > 0) {
      Notifications.add(
        `${Misc.capitalizeFirstLetterOfEachWord(
          Config.mode
        )} mode with value 0 does not support the ${fb[0].name.replace(
          /_/g,
          " "
        )} funbox`,
        0
      );
      if (Config.mode === "time") UpdateConfig.setTimeConfig(15, true);
      if (Config.mode === "words") UpdateConfig.setWordCount(10, true);
    }
  }

  if (Config.highlightMode === "word") {
    const fb = ActiveFunboxes().filter((f) =>
      f.properties?.includes("blockWordHighlight")
    );
    if (fb.length > 0) {
      Notifications.add(
        `Can't use word highlight with ${fb[0].name.replace(/_/g, " ")} funbox`,
        0
      );
      UpdateConfig.setHighlightMode("letter");
    }
  }

  ManualRestart.set();
  ActiveFunboxes().forEach(async (funbox) => {
    if (funbox.functions?.applyCSS) funbox.functions.applyCSS();
    if (funbox.functions?.applyConfig) funbox.functions.applyConfig();
  });
  // ModesNotice.update();
  return true;
}

export async function rememberSettings(): Promise<void> {
  ActiveFunboxes().forEach(async (funbox) => {
    if (funbox.functions?.rememberSettings) funbox.functions.rememberSettings();
  });
}
