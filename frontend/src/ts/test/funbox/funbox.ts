import * as Notifications from "../../elements/notifications";
import * as Misc from "../../utils/misc";
import * as ManualRestart from "../manual-restart-tracker";
import Config, * as UpdateConfig from "../../config";
import * as MemoryTimer from "./memory-funbox-timer";
import * as FunboxMemory from "./funbox-memory";
import * as FunboxList from "./funbox-list";
import { save } from "./funbox-memory";
import * as TTSEvent from "../../observables/tts-event";
import * as KeymapEvent from "../../observables/keymap-event";
import * as TestWords from "../test-words";
import * as TestInput from "../test-input";
import * as WeakSpot from "../weak-spot";
import { getPoem } from "../poetry";
import { getSection } from "../wikipedia";

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

FunboxList.setFunboxFunctions("nausea", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/nausea.css`);
  },
});

FunboxList.setFunboxFunctions("round_round_baby", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/round_round_baby.css`);
  },
});

FunboxList.setFunboxFunctions("simon_says", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/simon_says.css`);
  },
  applyConfig(): void {
    UpdateConfig.setKeymapMode("next", true);
  },
  rememberSettings(): void {
    save("keymapMode", Config.keymapMode, UpdateConfig.setKeymapMode);
  },
});

FunboxList.setFunboxFunctions("mirror", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/mirror.css`);
  },
});

FunboxList.setFunboxFunctions("tts", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/simon_says.css`);
  },
  applyConfig(): void {
    UpdateConfig.setKeymapMode("off", true);
  },
  rememberSettings(): void {
    save("keymapMode", Config.keymapMode, UpdateConfig.setKeymapMode);
  },
  toggleScript(params: string[]): void {
    if (window.speechSynthesis == undefined) {
      Notifications.add("Failed to load text-to-speech script", -1);
      return;
    }
    TTSEvent.dispatch(params[0]);
  },
});

FunboxList.setFunboxFunctions("choo_choo", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/choo_choo.css`);
  },
});

FunboxList.setFunboxFunctions("arrows", {
  getWord(): string {
    return Misc.getArrows();
  },
  applyConfig(): void {
    $("#words").addClass("arrows");
  },
  rememberSettings(): void {
    save("highlightMode", Config.highlightMode, UpdateConfig.setHighlightMode);
  },
  handleChar(char: string): string {
    if (char === "a" || char === "ArrowLeft") {
      return "←";
    }
    if (char === "s" || char === "ArrowDown") {
      return "↓";
    }
    if (char === "w" || char === "ArrowUp") {
      return "↑";
    }
    if (char === "d" || char === "ArrowRight") {
      return "→";
    }
    return char;
  },
  isCharCorrect(char: string, originalChar: string): boolean {
    if ((char === "a" || char === "ArrowLeft") && originalChar === "←") {
      return true;
    }
    if ((char === "s" || char === "ArrowDown") && originalChar === "↓") {
      return true;
    }
    if ((char === "w" || char === "ArrowUp") && originalChar === "↑") {
      return true;
    }
    if ((char === "d" || char === "ArrowRight") && originalChar === "→") {
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
});

FunboxList.setFunboxFunctions("rAnDoMcAsE", {
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
});

FunboxList.setFunboxFunctions("capitals", {
  alterText(word: string): string {
    return Misc.capitalizeFirstLetterOfEachWord(word);
  },
});

FunboxList.setFunboxFunctions("layoutfluid", {
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
    save("keymapMode", Config.keymapMode, UpdateConfig.setKeymapMode);
    save("layout", Config.layout, UpdateConfig.setLayout);
    save("keymapLayout", Config.keymapLayout, UpdateConfig.setKeymapLayout);
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
      if (Config.layout !== layouts[index] && layouts[index] !== undefined) {
        Notifications.add(`--- !!! ${layouts[index]} !!! ---`, 0);
      }
      if (layouts[index]) {
        UpdateConfig.setLayout(layouts[index]);
        UpdateConfig.setKeymapLayout(layouts[index]);
      }
      KeymapEvent.highlight(
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
    KeymapEvent.highlight(
      TestWords.words
        .getCurrent()
        .substring(
          TestInput.input.current.length,
          TestInput.input.current.length + 1
        )
        .toString()
    );
  },
});

FunboxList.setFunboxFunctions("earthquake", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/earthquake.css`);
  },
});

FunboxList.setFunboxFunctions("space_balls", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/space_balls.css`);
  },
});

FunboxList.setFunboxFunctions("gibberish", {
  getWord(): string {
    return Misc.getGibberish();
  },
});

FunboxList.setFunboxFunctions("58008", {
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
    save("numbers", Config.numbers, UpdateConfig.setNumbers);
  },
  handleChar(char: string): string {
    if (char === "\n") {
      return " ";
    }
    return char;
  },
});

FunboxList.setFunboxFunctions("ascii", {
  getWord(): string {
    return Misc.getASCII();
  },
});

FunboxList.setFunboxFunctions("specials", {
  getWord(): string {
    return Misc.getSpecials();
  },
});

FunboxList.setFunboxFunctions("read_ahead_easy", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/read_ahead_easy.css`);
  },
  rememberSettings(): void {
    save("highlightMode", Config.highlightMode, UpdateConfig.setHighlightMode);
  },
});

FunboxList.setFunboxFunctions("read_ahead", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/read_ahead.css`);
  },
  rememberSettings(): void {
    save("highlightMode", Config.highlightMode, UpdateConfig.setHighlightMode);
  },
});

FunboxList.setFunboxFunctions("read_ahead_hard", {
  applyCSS(): void {
    $("#funBoxTheme").attr("href", `funbox/read_ahead_hard.css`);
  },
  rememberSettings(): void {
    save("highlightMode", Config.highlightMode, UpdateConfig.setHighlightMode);
  },
});

FunboxList.setFunboxFunctions("memory", {
  applyConfig(): void {
    $("#wordsWrapper").addClass("hidden");
    UpdateConfig.setShowAllLines(true, true);
    if (Config.keymapMode === "next") {
      UpdateConfig.setKeymapMode("react", true);
    }
  },
  rememberSettings(): void {
    save("mode", Config.mode, UpdateConfig.setMode);
    save("showAllLines", Config.showAllLines, UpdateConfig.setShowAllLines);
    if (Config.keymapMode === "next") {
      save("keymapMode", Config.keymapMode, UpdateConfig.setKeymapMode);
    }
  },
  start(): void {
    MemoryTimer.reset();
    $("#wordsWrapper").addClass("hidden");
  },
  restart(): void {
    MemoryTimer.start();
    if (Config.keymapMode === "next") {
      UpdateConfig.setKeymapMode("react");
    }
  },
});

FunboxList.setFunboxFunctions("nospace", {
  applyConfig(): void {
    $("#words").addClass("nospace");
  },
  rememberSettings(): void {
    save("highlightMode", Config.highlightMode, UpdateConfig.setHighlightMode);
  },
});

FunboxList.setFunboxFunctions("poetry", {
  async pullSection(): Promise<Misc.Section | false> {
    return getPoem();
  },
});

FunboxList.setFunboxFunctions("wikipedia", {
  async pullSection(lang?: string): Promise<Misc.Section | false> {
    return getSection(lang ? lang : "english");
  },
});

FunboxList.setFunboxFunctions("weakspot", {
  getWord(wordset?: Misc.Wordset): string {
    if (wordset !== undefined) return WeakSpot.getWord(wordset);
    else return "";
  },
});

FunboxList.setFunboxFunctions("pseudolang", {
  async withWords(words?: string[]): Promise<Misc.Wordset> {
    if (words !== undefined) return new PseudolangWordGenerator(words);
    return new Misc.Wordset([]);
  },
});

export function toggleScript(...params: string[]): void {
  FunboxList.get(Config.funbox).forEach((funbox) => {
    if (funbox.functions?.toggleScript) funbox.functions.toggleScript(params);
  });
}

export function isFunboxCompatible(funbox?: string): boolean {
  if (funbox === "none" || Config.funbox === "none") return true;
  let checkingFunbox = FunboxList.get(Config.funbox);
  if (funbox !== undefined) {
    checkingFunbox = checkingFunbox.concat(
      FunboxList.getAll().filter((f) => f.name == funbox)
    );
  }

  const allFunboxesAreValid =
    FunboxList.get(Config.funbox).filter(
      (f) => Config.funbox.split("#").find((cf) => cf == f.name) !== undefined
    ).length == Config.funbox.split("#").length;
  const oneWordModifierMax =
    checkingFunbox.filter(
      (f) =>
        f.functions?.getWord ||
        f.functions?.pullSection ||
        f.functions?.withWords
    ).length <= 1;
  const layoutUsability =
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "changesLayout")
    ).length == 0 ||
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "ignoresLayout" || fp == "usesLayout")
    ).length == 0;
  const oneNospaceOrToPushMax =
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "nospace" || fp.startsWith("toPush"))
    ).length <= 1;
  const oneChangesWordsVisibilityMax =
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "changesWordsVisibility")
    ).length <= 1;
  const capitalisationChangePosibility =
    checkingFunbox.filter((f) => f.properties?.find((fp) => fp == "noLetters"))
      .length == 0 ||
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "changesCapitalisation")
    ).length == 0;
  const noConflictsWithSymmetricChars =
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "conflictsWithSymmetricChars")
    ).length == 0 ||
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "symmetricChars")
    ).length == 0;
  const canSpeak =
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "speaks" || fp == "unspeakable")
    ).length <= 1;
  const hasLanguageToSpeak =
    checkingFunbox.filter((f) => f.properties?.find((fp) => fp == "speaks"))
      .length == 0 ||
    checkingFunbox.filter((f) =>
      f.properties?.find((fp) => fp == "ignoresLanguage")
    ).length == 0;
  const oneToPushOrPullSectionMax =
    checkingFunbox.filter(
      (f) =>
        f.properties?.find((fp) => fp.startsWith("toPush:")) ||
        f.functions?.pullSection
    ).length <= 1;
  const oneApplyCSSMax =
    checkingFunbox.filter((f) => f.functions?.applyCSS).length <= 1;
  const onePunctuateWordMax =
    checkingFunbox.filter((f) => f.functions?.punctuateWord).length <= 1;
  const oneCharCheckerMax =
    checkingFunbox.filter((f) => f.functions?.isCharCorrect).length <= 1;
  const oneCharReplacerMax =
    checkingFunbox.filter((f) => f.functions?.getWordHtml).length <= 1;
  const allowedConfig = {} as MonkeyTypes.FunboxForcedConfig;
  let noConfigConflicts = true;
  for (const f of checkingFunbox) {
    if (!f.forcedConfig) continue;
    for (const key in f.forcedConfig) {
      if (allowedConfig[key]) {
        if (
          Misc.intersect(allowedConfig[key], f.forcedConfig[key], true)
            .length === 0
        ) {
          noConfigConflicts = false;
          break;
        }
      } else {
        allowedConfig[key] = f.forcedConfig[key];
      }
    }
  }

  return (
    allFunboxesAreValid &&
    oneWordModifierMax &&
    layoutUsability &&
    oneNospaceOrToPushMax &&
    oneChangesWordsVisibilityMax &&
    capitalisationChangePosibility &&
    noConflictsWithSymmetricChars &&
    canSpeak &&
    hasLanguageToSpeak &&
    oneToPushOrPullSectionMax &&
    oneApplyCSSMax &&
    onePunctuateWordMax &&
    oneCharCheckerMax &&
    oneCharReplacerMax &&
    noConfigConflicts
  );
}

export function setFunbox(funbox: string): boolean {
  FunboxMemory.load();
  UpdateConfig.setFunbox(funbox, false);
  return true;
}

export function toggleFunbox(funbox: string): boolean {
  if (funbox == "none") setFunbox("none");
  if (
    !isFunboxCompatible(funbox) &&
    !Config.funbox.split("#").includes(funbox)
  ) {
    Notifications.add(
      `Can not apply the ${funbox.replace(/_/g, " ")} funbox`,
      0
    );
    return true;
  }
  FunboxMemory.load();
  const e = UpdateConfig.toggleFunbox(funbox, false);
  if (e === false || e === true) return false;
  return true;
}

export async function clear(): Promise<boolean> {
  $("#funBoxTheme").attr("href", ``);
  $("#words").removeClass("nospace");
  $("#words").removeClass("arrows");
  $("#wordsWrapper").removeClass("hidden");
  MemoryTimer.reset();
  ManualRestart.set();
  return true;
}

function checkActiveFunboxesForcedConfigs(
  configKey?: string,
  configValue?: MonkeyTypes.ConfigValues
): void {
  if (configKey === undefined || configValue === undefined) {
    for (const [key, value] of Object.entries(Config)) {
      checkActiveFunboxesForcedConfigs(key, value);
    }
  } else {
    for (const activeFunbox of FunboxList.get(Config.funbox)) {
      const forcedConfigValues = activeFunbox.forcedConfig?.[configKey];
      if (forcedConfigValues && !forcedConfigValues.includes(configValue)) {
        Notifications.add(
          `The ${activeFunbox.name} funbox does not allow ${configKey}: ${configValue}`,
          0
        );
        if (configKey == "highlightMode") {
          UpdateConfig.setHighlightMode(
            forcedConfigValues[0] as MonkeyTypes.HighlightMode
          );
        }
        if (configKey == "punctuation") {
          UpdateConfig.setPunctuation(forcedConfigValues[0] as boolean);
        }
        if (configKey == "numbers") {
          UpdateConfig.setNumbers(forcedConfigValues[0] as boolean);
        }
      }
    }
  }
}

export async function activate(funbox?: string): Promise<boolean | undefined> {
  if (funbox === undefined || funbox === null) {
    funbox = Config.funbox;
  } else if (Config.funbox != funbox) {
    Config.funbox = funbox;
  }

  // The configuration might be edited with dev tools,
  // so we need to double check its validity
  if (!isFunboxCompatible()) {
    Notifications.add(
      Misc.createErrorMessage(
        undefined,
        `Failed to activate funbox: funboxes ${Config.funbox.replace(
          /_/g,
          " "
        )} are not compatible`
      ),
      -1
    );
    UpdateConfig.setFunbox("none", true);
    await clear();
    return false;
  }

  MemoryTimer.reset();
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
    if (
      FunboxList.get(Config.funbox).find((f) =>
        f.properties?.includes("noLigatures")
      )
    ) {
      Notifications.add(
        "Current language does not support this funbox mode",
        0
      );
      UpdateConfig.setFunbox("none", true);
      await clear();
      return;
    }
  }

  if (Config.time === 0 && Config.mode === "time") {
    const fb = FunboxList.get(Config.funbox).filter((f) =>
      f.properties?.includes("noInfiniteDuration")
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
      UpdateConfig.setTimeConfig(15, true);
    }
  }

  if (Config.words === 0 && Config.mode === "words") {
    const fb = FunboxList.get(Config.funbox).filter((f) =>
      f.properties?.includes("noInfiniteDuration")
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
      UpdateConfig.setWordCount(10, true);
    }
  }

  checkActiveFunboxesForcedConfigs();

  ManualRestart.set();
  FunboxList.get(Config.funbox).forEach(async (funbox) => {
    if (funbox.functions?.applyCSS) funbox.functions.applyCSS();
    if (funbox.functions?.applyConfig) funbox.functions.applyConfig();
  });
  // ModesNotice.update();
  return true;
}

export async function rememberSettings(): Promise<void> {
  FunboxList.get(Config.funbox).forEach(async (funbox) => {
    if (funbox.functions?.rememberSettings) funbox.functions.rememberSettings();
  });
}
