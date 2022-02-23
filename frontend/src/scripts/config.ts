import * as DB from "./db";
import * as OutOfFocus from "./test/out-of-focus";
import * as Notifications from "./elements/notifications";
import * as Misc from "./misc";
import * as ConfigEvent from "./observables/config-event";

export let localStorageConfig: MonkeyTypes.Config;
export let dbConfigLoaded = false;
export let changedBeforeDb = false;

export function setLocalStorageConfig(val: MonkeyTypes.Config): void {
  localStorageConfig = val;
}

export function setDbConfigLoaded(val: boolean): void {
  dbConfigLoaded = val;
}

export function setChangedBeforeDb(val: boolean): void {
  changedBeforeDb = val;
}

let loadDone: (value?: unknown) => void;

const defaultConfig: MonkeyTypes.Config = {
  theme: "serika_dark",
  themeLight: "serika",
  themeDark: "serika_dark",
  autoSwitchTheme: false,
  customTheme: false,
  customThemeColors: [
    "#323437",
    "#e2b714",
    "#e2b714",
    "#646669",
    "#d1d0c5",
    "#ca4754",
    "#7e2a33",
    "#ca4754",
    "#7e2a33",
  ],
  favThemes: [],
  showKeyTips: true,
  showLiveWpm: false,
  showTimerProgress: true,
  smoothCaret: true,
  quickTab: false,
  punctuation: false,
  numbers: false,
  words: 50,
  time: 30,
  mode: "time",
  quoteLength: [1],
  language: "english",
  fontSize: "15",
  freedomMode: false,
  resultFilters: null,
  difficulty: "normal",
  blindMode: false,
  quickEnd: false,
  caretStyle: "default",
  paceCaretStyle: "default",
  flipTestColors: false,
  layout: "default",
  funbox: "none",
  confidenceMode: "off",
  indicateTypos: "off",
  timerStyle: "mini",
  colorfulMode: false,
  randomTheme: "off",
  timerColor: "main",
  timerOpacity: "1",
  stopOnError: "off",
  showAllLines: false,
  keymapMode: "off",
  keymapStyle: "staggered",
  keymapLegendStyle: "lowercase",
  keymapLayout: "overrideSync",
  fontFamily: "roboto_mono",
  smoothLineScroll: false,
  alwaysShowDecimalPlaces: false,
  alwaysShowWordsHistory: false,
  singleListCommandLine: "manual",
  capsLockWarning: true,
  playSoundOnError: false,
  playSoundOnClick: "off",
  soundVolume: "0.5",
  startGraphsAtZero: true,
  swapEscAndTab: false,
  showOutOfFocusWarning: true,
  paceCaret: "off",
  paceCaretCustomSpeed: 100,
  repeatedPace: true,
  pageWidth: "100",
  chartAccuracy: true,
  chartStyle: "line",
  minWpm: "off",
  minWpmCustomSpeed: 100,
  highlightMode: "letter",
  alwaysShowCPM: false,
  enableAds: "off",
  hideExtraLetters: false,
  strictSpace: false,
  minAcc: "off",
  minAccCustom: 90,
  showLiveAcc: false,
  showLiveBurst: false,
  monkey: false,
  repeatQuotes: "off",
  oppositeShiftMode: "off",
  customBackground: "",
  customBackgroundSize: "cover",
  customBackgroundFilter: [0, 1, 1, 1, 1],
  customLayoutfluid: "qwerty#dvorak#colemak",
  monkeyPowerLevel: "off",
  minBurst: "off",
  minBurstCustomSpeed: 100,
  burstHeatmap: false,
  britishEnglish: false,
  lazyMode: false,
  showAvg: false,
};

function isConfigKeyValid(name: string): boolean {
  if (name === null || name === undefined || name === "") return false;
  if (name.length > 30) return false;
  return /^[0-9a-zA-Z_.\-#+]+$/.test(name);
}

type PossibleType =
  | "string"
  | "number"
  | "numberArray"
  | "numberInString"
  | "boolean"
  | "undefined"
  | "null"
  | "stringArray"
  | "layoutfluid"
  | string[]
  | number[];

async function some<T>(
  array: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<boolean> {
  for (const item of array) {
    if (await predicate(item)) return true;
  }

  return false;
}

function isConfigValueValid(
  val: unknown,
  possibleTypes: PossibleType[]
): boolean {
  return possibleTypes.some((possibleType) => {
    switch (possibleType) {
      case "boolean":
        return typeof val === "boolean";

      case "number":
        return typeof val === "number";

      case "numberInString":
        return (
          typeof val === "number" ||
          (typeof val === "string" && !isNaN(parseInt(val)))
        );

      case "string":
        return typeof val === "string";

      case "undefined":
        return typeof val === "undefined";

      case "null":
        return val === null;

      case "stringArray":
        return val instanceof Array && val.every((v) => typeof v === "string");

      case "numberArray":
        return val instanceof Array && val.every((v) => typeof v === "number");

      default:
        if (possibleType instanceof Array) {
          return possibleType.includes(val as never);
        }

        return false;
    }
  });
}

function isConfigValueValidAsync(
  val: unknown,
  possibleTypes: PossibleType[]
): Promise<boolean | undefined> {
  return some(possibleTypes, async (possibleType) => {
    switch (possibleType) {
      case "layoutfluid": {
        if (typeof val !== "string") return false;

        const layoutNames = val.split(/[# ]+/);

        if (layoutNames.length < 2 || layoutNames.length > 5) return false;

        // convert the layout names to layouts
        const layouts = await Promise.all(
          layoutNames.map((layoutName) => Misc.getLayout(layoutName))
        );

        // check if all layouts exist
        if (!layouts.every((layout) => layout !== undefined)) {
          const invalidLayoutNames = layoutNames.map((layoutName, index) => [layoutName, layouts[index]]);

          const invalidLayouts = invalidLayoutNames.filter(([layoutName, layout]) => layout === undefined).map(([layoutName, layout]) => layoutName);

          invalid("custom layoutfluid", val, `The following inputted layouts do not exist: ${invalidLayouts.join(", ")}.`);

          return;
        }

        return true;
      }

      default:
        if (possibleType instanceof Array) {
          return possibleType.includes(val as never);
        }

        return false;
    }
  });
}

function invalid(key: string, val: unknown, customMessage?: string): boolean {
  if (customMessage !== undefined) {
    Notifications.add(`Invalid value for ${key} (${val}). ${customMessage}`);
  } else {
    Notifications.add(
      `Invalid value for ${key} (${val}). Please try to change this setting again.`,
      -1
    );
    console.error(`Invalid value key ${key} value ${val} type ${typeof val}`);
  }
  
  return false;
}
  

let config = {
  ...defaultConfig,
};

export async function saveToLocalStorage(noDbCheck = false): Promise<void> {
  if (!dbConfigLoaded && !noDbCheck) {
    setChangedBeforeDb(true);
  }
  // let d = new Date();
  // d.setFullYear(d.getFullYear() + 1);
  // $.cookie("config", JSON.stringify(config), {
  //   expires: d,
  //   path: "/",
  // });
  const save = config;
  delete save.resultFilters;
  const stringified = JSON.stringify(save);
  window.localStorage.setItem("config", stringified);
  // restartCount = 0;
  if (!noDbCheck) await DB.saveConfig(save);
  ConfigEvent.dispatch("saveToLocalStorage", stringified);
}

//numbers
export function setNumbers(numb: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(numb, ["boolean"])) return invalid("numbers", numb);

  if (config.mode === "quote") {
    numb = false;
  }
  config.numbers = numb;
  if (!config.numbers) {
    $("#top .config .numbersMode .text-button").removeClass("active");
  } else {
    $("#top .config .numbersMode .text-button").addClass("active");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("numbers", config.numbers);

  return true;
}

//punctuation
export function setPunctuation(punc: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(punc, ["boolean"]))
    return invalid("punctuation", punc);

  if (config.mode === "quote") {
    punc = false;
  }
  config.punctuation = punc;
  if (!config.punctuation) {
    $("#top .config .punctuationMode .text-button").removeClass("active");
  } else {
    $("#top .config .punctuationMode .text-button").addClass("active");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("punctuation", config.punctuation);

  return true;
}

export function setMode(mode: MonkeyTypes.Mode, nosave?: boolean): boolean {
  if (!isConfigValueValid(mode, [["time", "words", "quote", "zen", "custom"]]))
    return invalid("mode", mode);

  if (mode !== "words" && config.funbox === "memory") {
    Notifications.add("Memory funbox can only be used with words mode.", 0);
    return;
  }
  const previous = config.mode;
  config.mode = mode;
  if (config.mode == "custom") {
    setPunctuation(false, true);
    setNumbers(false, true);
  } else if (config.mode == "quote") {
    setPunctuation(false, true);
    setNumbers(false, true);
  } else if (config.mode == "zen") {
    if (config.paceCaret != "off") {
      Notifications.add(`Pace caret will not work with zen mode.`, 0);
    }
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("mode", previous, config.mode);

  return true;
}

export function setPlaySoundOnError(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("play sound on error", val);

  config.playSoundOnError = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("playSoundOnError", config.playSoundOnError);

  return true;
}

export function setPlaySoundOnClick(
  val: MonkeyTypes.PlaySoundOnClick,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, [["off", "1", "2", "3", "4", "5", "6", "7"]]))
    return invalid("play sound on click", val);

  config.playSoundOnClick = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("playSoundOnClick", config.playSoundOnClick);

  return true;
}

export function setSoundVolume(
  val: MonkeyTypes.SoundVolume,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, [["0.1", "0.5", "1.0"]]))
    return invalid("sound volume", val);

  config.soundVolume = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("soundVolume", config.soundVolume);

  return true;
}

//difficulty
export function setDifficulty(
  diff: MonkeyTypes.Difficulty,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(diff, [["normal", "expert", "master"]]))
    return invalid("difficulty", diff);

  if (diff !== "normal" && diff !== "expert" && diff !== "master") {
    diff = "normal";
  }
  config.difficulty = diff;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("difficulty", config.difficulty, nosave);

  return true;
}

//set fav themes
export function setFavThemes(themes: string[], nosave?: boolean): boolean {
  if (!isConfigValueValid(themes, ["stringArray"]))
    return invalid("favorite themes", themes);
  config.favThemes = themes;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("favThemes", config.favThemes);

  return true;
}

export function setFunbox(funbox: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(funbox, ["string"])) return invalid("funbox", funbox);

  const val = funbox ? funbox : "none";
  config.funbox = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("funbox", config.funbox);

  return true;
}

export function setBlindMode(blind: boolean, nosave?: boolean): void {
  if (!isConfigValueValid(blind, ["boolean"]))
    return invalid("blind mode", blind);

  config.blindMode = blind;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("blindMode", config.blindMode, nosave);

  return true;
}

export function setChartAccuracy(
  chartAccuracy: boolean,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(chartAccuracy, ["boolean"]))
    return invalid("chart accuracy", chartAccuracy);

  config.chartAccuracy = chartAccuracy;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("chartAccuracy", config.chartAccuracy);

  return true;
}

export function setChartStyle(
  chartStyle: MonkeyTypes.ChartStyle,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(chartStyle, [["line", "scatter"]]))
    return invalid("chart style", chartStyle);

  config.chartStyle = chartStyle;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("chartStyle", config.chartStyle);

  return true;
}

export function setStopOnError(
  soe: MonkeyTypes.StopOnError | boolean,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(soe, [["off", "word", "letter"], "boolean"]))
    return invalid("stop on error", soe);

  if (soe === true || soe === false) {
    soe = "off";
  }
  config.stopOnError = soe;
  if (config.stopOnError !== "off") {
    config.confidenceMode = "off";
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("stopOnError", config.stopOnError, nosave);

  return true;
}

export function setAlwaysShowDecimalPlaces(
  val: boolean,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("always show decimal places", val);

  config.alwaysShowDecimalPlaces = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch(
    "alwaysShowDecimalPlaces",
    config.alwaysShowDecimalPlaces
  );

  return true;
}

export function setAlwaysShowCPM(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("always show CPM", val);

  config.alwaysShowCPM = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("alwaysShowCPM", config.alwaysShowCPM);

  return true;
}

export function setShowOutOfFocusWarning(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("show out of focus warning", val);

  config.showOutOfFocusWarning = val;
  if (!config.showOutOfFocusWarning) {
    OutOfFocus.hide();
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("showOutOfFocusWarning", config.showOutOfFocusWarning);

  return true;
}

export function setSwapEscAndTab(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("swap esc and tab", val);

  config.swapEscAndTab = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("swapEscAndTab", config.swapEscAndTab);

  return true;
}

//pace caret
export function setPaceCaret(
  val: MonkeyTypes.PaceCaret,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, [["custom", "off", "average", "pb"]]))
    return invalid("pace caret", val);

  if (document.readyState === "complete") {
    if (val == "pb" && firebase.auth().currentUser === null) {
      Notifications.add("PB pace caret is unavailable without an account", 0);
      return false;
    }
  }
  // if (config.mode === "zen" && val != "off") {
  //   Notifications.add(`Can't use pace caret with zen mode.`, 0);
  //   val = "off";
  // }
  config.paceCaret = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("paceCaret", config.paceCaret, nosave);

  return true;
}

export function setPaceCaretCustomSpeed(val: number, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["number"]))
    return invalid("pace caret custom speed", val);

  config.paceCaretCustomSpeed = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("paceCaretCustomSpeed", config.paceCaretCustomSpeed);

  return true;
}

export function setRepeatedPace(pace: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(pace, ["boolean"]))
    return invalid("repeated pace", pace);

  config.repeatedPace = pace;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("repeatedPace", config.repeatedPace);

  return true;
}

//min wpm
export function setMinWpm(
  minwpm: MonkeyTypes.MinimumWordsPerMinute,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(minwpm, [["off", "custom"]]))
    return invalid("min WPM", minwpm);

  config.minWpm = minwpm;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("minWpm", config.minWpm, nosave);

  return true;
}

export function setMinWpmCustomSpeed(val: number, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["number"]))
    return invalid("min WPM custom speed", val);

  config.minWpmCustomSpeed = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("minWpmCustomSpeed", config.minWpmCustomSpeed);

  return true;
}

//min acc
export function setMinAcc(
  min: MonkeyTypes.MinimumAccuracy,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(min, [["off", "custom"]]))
    return invalid("min acc", min);

  config.minAcc = min;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("minAcc", config.minAcc, nosave);

  return true;
}

export function setMinAccCustom(val: number, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["number"]))
    return invalid("min acc custom", val);

  config.minAccCustom = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("minAccCustom", config.minAccCustom);

  return true;
}

//min burst
export function setMinBurst(
  min: MonkeyTypes.MinimumBurst,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(min, [["off", "fixed", "flex"]]))
    return invalid("min burst", min);

  config.minBurst = min;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("minBurst", config.minBurst, nosave);

  return true;
}

export function setMinBurstCustomSpeed(val: number, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["number"]))
    return invalid("min burst custom speed", val);

  config.minBurstCustomSpeed = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("minBurstCustomSpeed", config.minBurstCustomSpeed);

  return true;
}

//always show words history
export function setAlwaysShowWordsHistory(
  val: boolean,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("always show words history", val);

  config.alwaysShowWordsHistory = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("alwaysShowWordsHistory", config.alwaysShowWordsHistory);

  return true;
}

//single list command line
export function setSingleListCommandLine(
  option: MonkeyTypes.SingleListCommandLine,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(option, [["manual", "on"]]))
    return invalid("single list command line", option);

  config.singleListCommandLine = option;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("singleListCommandLine", config.singleListCommandLine);

  return true;
}

//caps lock warning
export function setCapsLockWarning(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("caps lock warning", val);

  config.capsLockWarning = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("capsLockWarning", config.capsLockWarning);

  return true;
}

export function setShowAllLines(sal: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(sal, ["boolean"]))
    return invalid("show all lines", sal);

  config.showAllLines = sal;
  if (!nosave) {
    saveToLocalStorage();
  }
  ConfigEvent.dispatch("showAllLines", config.showAllLines);

  return true;
}

export function setQuickEnd(qe: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(qe, ["boolean"])) return invalid("quick end", qe);

  config.quickEnd = qe;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("quickEnd", config.quickEnd);

  return true;
}

export function setEnableAds(
  val: MonkeyTypes.EnableAds | boolean,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, [["on", "off", "max"], "boolean"]))
    return invalid("enable ads", val);

  if (val === true || val === false) {
    val = "off";
  }
  config.enableAds = val;
  if (!nosave) {
    saveToLocalStorage();
    setTimeout(() => {
      location.reload();
    }, 3000);
    Notifications.add("Ad settings changed. Refreshing...", 0);

    return true;
  }
}

export function setRepeatQuotes(
  val: MonkeyTypes.RepeatQuotes | boolean,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, [["off", "typing"], "boolean"]))
    return invalid("repeat quotes", val);

  if (val === true || val === false) {
    val = "off";
  }
  config.repeatQuotes = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("repeatQuotes", config.repeatQuotes);

  return true;
}

//flip colors
export function setFlipTestColors(flip: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(flip, ["boolean"]))
    return invalid("flip test colors", flip);

  config.flipTestColors = flip;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("flipTestColors", config.flipTestColors);

  return true;
}

//extra color
export function setColorfulMode(extra: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(extra, ["boolean"]))
    return invalid("colorful mode", extra);

  config.colorfulMode = extra;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("colorfulMode", config.colorfulMode);

  return true;
}

//strict space
export function setStrictSpace(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("strict space", val);

  config.strictSpace = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("strictSpace", config.strictSpace);

  return true;
}

//opposite shift space
export function setOppositeShiftMode(
  val: MonkeyTypes.OppositeShiftMode,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, [["off", "on", "keymap"]]))
    return invalid("opposite shift mode", val);

  config.oppositeShiftMode = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("oppositeShiftMode", config.oppositeShiftMode);

  return true;
}

export function setPageWidth(
  val: MonkeyTypes.PageWidth,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(val, [["max", "100", "125", "150", "200"]]))
    return invalid("page width", val);

  config.pageWidth = val;
  $("#centerContent").removeClass("wide125");
  $("#centerContent").removeClass("wide150");
  $("#centerContent").removeClass("wide200");
  $("#centerContent").removeClass("widemax");

  if (val !== "100") {
    $("#centerContent").addClass("wide" + val);
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("pageWidth", config.pageWidth);

  return true;
}

export function setCaretStyle(
  caretStyle: MonkeyTypes.CaretStyle,
  nosave?: boolean
): boolean {
  if (
    !isConfigValueValid(caretStyle, [
      ["off", "default", "block", "outline", "underline", "carrot", "banana"],
    ])
  )
    return invalid("caret style", caretStyle);

  config.caretStyle = caretStyle;
  $("#caret").removeClass("off");
  $("#caret").removeClass("default");
  $("#caret").removeClass("underline");
  $("#caret").removeClass("outline");
  $("#caret").removeClass("block");
  $("#caret").removeClass("carrot");
  $("#caret").removeClass("banana");

  if (caretStyle == "off") {
    $("#caret").addClass("off");
  } else if (caretStyle == "default") {
    $("#caret").addClass("default");
  } else if (caretStyle == "block") {
    $("#caret").addClass("block");
  } else if (caretStyle == "outline") {
    $("#caret").addClass("outline");
  } else if (caretStyle == "underline") {
    $("#caret").addClass("underline");
  } else if (caretStyle == "carrot") {
    $("#caret").addClass("carrot");
  } else if (caretStyle == "banana") {
    $("#caret").addClass("banana");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("caretStyle", config.caretStyle);

  return true;
}

export function setPaceCaretStyle(
  caretStyle: MonkeyTypes.CaretStyle,
  nosave?: boolean
): boolean {
  if (
    !isConfigValueValid(caretStyle, [
      ["off", "default", "block", "outline", "underline", "carrot", "banana"],
    ])
  )
    return invalid("pace caret style", caretStyle);

  config.paceCaretStyle = caretStyle;
  $("#paceCaret").removeClass("off");
  $("#paceCaret").removeClass("default");
  $("#paceCaret").removeClass("underline");
  $("#paceCaret").removeClass("outline");
  $("#paceCaret").removeClass("block");
  $("#paceCaret").removeClass("carrot");
  $("#paceCaret").removeClass("banana");

  if (caretStyle == "default") {
    $("#paceCaret").addClass("default");
  } else if (caretStyle == "block") {
    $("#paceCaret").addClass("block");
  } else if (caretStyle == "outline") {
    $("#paceCaret").addClass("outline");
  } else if (caretStyle == "underline") {
    $("#paceCaret").addClass("underline");
  } else if (caretStyle == "carrot") {
    $("#paceCaret").addClass("carrot");
  } else if (caretStyle == "banana") {
    $("#paceCaret").addClass("banana");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("paceCaretStyle", config.paceCaretStyle);

  return true;
}

export function setShowTimerProgress(timer: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(timer, ["boolean"]))
    return invalid("show timer progress", timer);

  config.showTimerProgress = timer;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("showTimerProgress", config.showTimerProgress);

  return true;
}

export function setShowLiveWpm(live: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(live, ["boolean"]))
    return invalid("show live WPM", live);

  config.showLiveWpm = live;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("showLiveWpm", config.showLiveWpm);

  return true;
}

export function setShowLiveAcc(live: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(live, ["boolean"]))
    return invalid("show live acc", live);

  config.showLiveAcc = live;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("showLiveAcc", config.showLiveAcc);

  return true;
}

export function setShowLiveBurst(live: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(live, ["boolean"]))
    return invalid("show live burst", live);

  config.showLiveBurst = live;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("showLiveBurst", config.showLiveBurst);

  return true;
}

export function setShowAvg(live: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(live, ["boolean"]))
    return invalid("show average", live);

  config.showAvg = live;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("showAvg", config.showAvg, nosave);

  return true;
}

export function setHighlightMode(
  mode: MonkeyTypes.HighlightMode,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(mode, [["off", "letter", "word"]]))
    return invalid("highlight mode", mode);

  if (
    mode === "word" &&
    (config.funbox === "nospace" ||
      config.funbox === "read_ahead" ||
      config.funbox === "read_ahead_easy" ||
      config.funbox === "read_ahead_hard" ||
      config.funbox === "tts" ||
      config.funbox === "arrows")
  ) {
    Notifications.add("Can't use word highlight with this funbox", 0);
    return;
  }

  config.highlightMode = mode;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("highlightMode", config.highlightMode);

  return true;
}

export function setHideExtraLetters(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("hide extra letters", val);

  config.hideExtraLetters = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("hideExtraLetters", config.hideExtraLetters);

  return true;
}

export function setTimerStyle(
  style: MonkeyTypes.TimerStyle,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(style, [["bar", "text", "mini"]]))
    return invalid("timer style", style);

  config.timerStyle = style;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("timerStyle", config.timerStyle);

  return true;
}

export function setTimerColor(
  color: MonkeyTypes.TimerColor,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(color, [["black", "sub", "text", "main"]]))
    return invalid("timer color", color);

  config.timerColor = color;

  $("#timer").removeClass("timerSub");
  $("#timer").removeClass("timerText");
  $("#timer").removeClass("timerMain");

  $("#timerNumber").removeClass("timerSub");
  $("#timerNumber").removeClass("timerText");
  $("#timerNumber").removeClass("timerMain");

  $("#largeLiveWpmAndAcc").removeClass("timerSub");
  $("#largeLiveWpmAndAcc").removeClass("timerText");
  $("#largeLiveWpmAndAcc").removeClass("timerMain");

  $("#miniTimerAndLiveWpm").removeClass("timerSub");
  $("#miniTimerAndLiveWpm").removeClass("timerText");
  $("#miniTimerAndLiveWpm").removeClass("timerMain");

  if (color === "main") {
    $("#timer").addClass("timerMain");
    $("#timerNumber").addClass("timerMain");
    $("#largeLiveWpmAndAcc").addClass("timerMain");
    $("#miniTimerAndLiveWpm").addClass("timerMain");
  } else if (color === "sub") {
    $("#timer").addClass("timerSub");
    $("#timerNumber").addClass("timerSub");
    $("#largeLiveWpmAndAcc").addClass("timerSub");
    $("#miniTimerAndLiveWpm").addClass("timerSub");
  } else if (color === "text") {
    $("#timer").addClass("timerText");
    $("#timerNumber").addClass("timerText");
    $("#largeLiveWpmAndAcc").addClass("timerText");
    $("#miniTimerAndLiveWpm").addClass("timerText");
  }

  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("timerColor", config.timerColor);

  return true;
}
export function setTimerOpacity(
  opacity: MonkeyTypes.TimerOpacity,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(opacity, [["0.25", "0.5", "0.75", "1"]]))
    return invalid("timer opacity", opacity);

  config.timerOpacity = opacity;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("timerOpacity", config.timerOpacity);

  return true;
}

//key tips
export function setKeyTips(keyTips: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(keyTips, ["boolean"]))
    return invalid("key tips", keyTips);

  config.showKeyTips = keyTips;
  if (config.showKeyTips) {
    $("#bottom .keyTips").removeClass("hidden");
  } else {
    $("#bottom .keyTips").addClass("hidden");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("showKeyTips", config.showKeyTips);

  return true;
}

//mode
export function setTimeConfig(
  time: MonkeyTypes.TimeModes,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(time, ["number"])) return invalid("time", time);

  const newTime = isNaN(time) || time < 0 ? defaultConfig.time : time;

  $("#top .config .time .text-button").removeClass("active");

  const timeCustom = ![15, 30, 60, 120].includes(newTime) ? "custom" : newTime;

  config.time = newTime;

  $(
    "#top .config .time .text-button[timeConfig='" + timeCustom + "']"
  ).addClass("active");
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("time", config.time);

  return true;
}

//quote length
export function setQuoteLength(
  len: MonkeyTypes.QuoteLengthArray | MonkeyTypes.QuoteLength,
  nosave?: boolean,
  multipleMode?: boolean
): boolean {
  if (!isConfigValueValid(len, [[-2, -1, 0, 1, 2, 3], "numberArray"]))
    return invalid("quote length", len);

  if (Array.isArray(len)) {
    //config load
    if (len.length === 1 && len[0] === -1) len = [1];
    config.quoteLength = len;
  } else {
    if (!Array.isArray(config.quoteLength)) config.quoteLength = [];
    if (len === null || isNaN(len) || len < -2 || len > 3) {
      len = 1;
    }
    len = parseInt(len.toString()) as MonkeyTypes.QuoteLength;
    if (multipleMode) {
      if (!config.quoteLength.includes(len)) {
        config.quoteLength.push(len);
      } else {
        if (config.quoteLength.length > 1)
          config.quoteLength = config.quoteLength.filter((ql) => ql !== len);
      }
    } else {
      config.quoteLength = [len];
    }
  }
  // if (!nosave) setMode("quote", nosave);
  $("#top .config .quoteLength .text-button").removeClass("active");
  config.quoteLength.forEach((ql) => {
    $(
      "#top .config .quoteLength .text-button[quoteLength='" + ql + "']"
    ).addClass("active");
  });
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("quoteLength", config.quoteLength);

  return true;
}

export function setWordCount(
  wordCount: MonkeyTypes.WordsModes,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(wordCount, ["number"]))
    return invalid("words", wordCount);

  const newWordCount =
    wordCount < 0 || wordCount > 100000 ? defaultConfig.words : wordCount;

  $("#top .config .wordCount .text-button").removeClass("active");

  const wordCustom = ![10, 25, 50, 100, 200].includes(newWordCount)
    ? "custom"
    : newWordCount;

  config.words = newWordCount;

  $(
    "#top .config .wordCount .text-button[wordCount='" + wordCustom + "']"
  ).addClass("active");
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("words", config.words);

  return true;
}

//caret
export function setSmoothCaret(mode: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(mode, ["boolean"])) return invalid("", mode);

  config.smoothCaret = mode;
  if (mode) {
    $("#caret").css("animation-name", "caretFlashSmooth");
  } else {
    $("#caret").css("animation-name", "caretFlashHard");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("smoothCaret", config.smoothCaret);

  return true;
}

export function setStartGraphsAtZero(mode: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(mode, ["boolean"]))
    return invalid("start graphs at zero", mode);

  config.startGraphsAtZero = mode;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("startGraphsAtZero", config.startGraphsAtZero);

  return true;
}

//linescroll
export function setSmoothLineScroll(mode: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(mode, ["boolean"]))
    return invalid("smooth line scroll", mode);

  config.smoothLineScroll = mode;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("smoothLineScroll", config.smoothLineScroll);

  return true;
}

//quick tab
export function setQuickTabMode(mode: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(mode, ["boolean"]))
    return invalid("quick tab mode", mode);

  config.quickTab = mode;
  if (!config.quickTab) {
    $("#restartTestButton").removeClass("hidden");
    $("#restartTestButton").css("opacity", 1);
    $("#bottom .keyTips")
      .html(`<key>tab</key> and <key>enter</key> / <key>space</key> - restart test<br>
      <key>ctrl/cmd</key>+<key>shift</key>+<key>p</key> or <key>esc</key> - command line`);
  } else {
    $("#restartTestButton").addClass("hidden");
    $("#bottom .keyTips").html(`<key>tab</key> - restart test<br>
    <key>ctrl/cmd</key>+<key>shift</key>+<key>p</key> or <key>esc</key> - command line`);
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("quickTab", config.quickTab);

  return true;
}

export function previewFontFamily(font: string): boolean {
  if (!isConfigValueValid(font, ["string"]))
    return invalid("preview font family", font);

  document.documentElement.style.setProperty(
    "--font",
    '"' + font.replace(/_/g, " ") + '", "Roboto Mono"'
  );

  return true;
}

//font family
export function setFontFamily(font: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(font, ["string"]))
    return invalid("font family", font);

  if (font === "") {
    font = "roboto_mono";
    Notifications.add(
      "Empty input received, reverted to the default font.",
      0,
      3,
      "Custom font"
    );
  }
  if (!isConfigKeyValid(font)) {
    Notifications.add(
      `Invalid font name value: "${font}".`,
      -1,
      3,
      "Custom font"
    );
    return false;
  }
  config.fontFamily = font;
  document.documentElement.style.setProperty(
    "--font",
    `"${font.replace(/_/g, " ")}", "Roboto Mono"`
  );
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("fontFamily", config.fontFamily);

  return true;
}

//freedom
export function setFreedomMode(freedom: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(freedom, ["boolean"]))
    return invalid("freedom mode", freedom);

  if (freedom == null) {
    freedom = false;
  }
  config.freedomMode = freedom;
  if (config.freedomMode && config.confidenceMode !== "off") {
    config.confidenceMode = "off";
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("freedomMode", config.freedomMode);

  return true;
}

export function setConfidenceMode(
  cm: MonkeyTypes.ConfidenceMode,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(cm, [["off", "on", "max"]]))
    return invalid("confidence mode", cm);

  config.confidenceMode = cm;
  if (config.confidenceMode !== "off") {
    config.freedomMode = false;
    config.stopOnError = "off";
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("confidenceMode", config.confidenceMode, nosave);

  return true;
}

export function setIndicateTypos(
  value: MonkeyTypes.IndicateTypos,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(value, [["off", "below", "replace"]]))
    return invalid("indicate typos", value);

  config.indicateTypos = value;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("indicateTypos", config.indicateTypos);

  return true;
}

export function setAutoSwitchTheme(boolean: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(boolean, ["boolean"]))
    return invalid("auto switch theme", boolean);

  boolean = boolean ?? defaultConfig.autoSwitchTheme;
  config.autoSwitchTheme = boolean;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("autoSwitchTheme", config.autoSwitchTheme);

  return true;
}

export function setCustomTheme(boolean: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(boolean, ["boolean"]))
    return invalid("custom theme", boolean);

  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("customTheme", config.customTheme);

  return true;
}

export function setTheme(name: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(name, ["string"])) return invalid("", name);

  config.theme = name;
  setCustomTheme(false, true);
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("theme", config.theme);

  return true;
}

export function setThemeLight(name: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(name, ["string"]))
    return invalid("theme light", name);

  config.themeLight = name;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("themeLight", config.themeLight, nosave);

  return true;
}

export function setThemeDark(name: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(name, ["string"])) return invalid("theme dark", name);

  config.themeDark = name;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("themeDark", config.themeDark, nosave);

  return true;
}

function setThemes(
  theme: string,
  customState: boolean,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(theme, ["string"])) return invalid("", theme);

  config.theme = theme;
  config.customTheme = customState;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("setThemes", customState);

  return true;
}

export function setRandomTheme(
  val: MonkeyTypes.RandomTheme | boolean,
  nosave?: boolean
): boolean {
  if (
    !isConfigValueValid(val, [["off", "on", "fav", "light", "dark"], "boolean"])
  )
    return invalid("random theme", val);

  if (val === true || val === false) {
    val = "off";
  }
  config.randomTheme = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("randomTheme", config.randomTheme);

  return true;
}

export function setBritishEnglish(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"]))
    return invalid("british english", val);

  if (!val) {
    val = false;
  }
  config.britishEnglish = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("britishEnglish", config.britishEnglish);

  return true;
}

export function setLazyMode(val: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(val, ["boolean"])) return invalid("lazy mode", val);

  if (!val) {
    val = false;
  }
  config.lazyMode = val;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("lazyMode", config.lazyMode, nosave);

  return true;
}

export function setCustomThemeColors(colors: string[], nosave?: boolean): boolean {
  if (!isConfigValueValid(colors, ["stringArray"]))
    return invalid("custom theme colors", colors);

  if (colors !== undefined) {
    config.customThemeColors = colors;
    // ThemeController.set("custom");
    // applyCustomThemeColors();
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("customThemeColors", config.customThemeColors);

  return true;
}

export function setLanguage(language: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(language, ["string"]))
    return invalid("language", language);

  config.language = language;
  try {
    firebase.analytics().logEvent("changedLanguage", {
      language: language,
    });
  } catch (e) {
    console.log("Analytics unavailable");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("language", config.language);

  return true;
}

export function setMonkey(monkey: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(monkey, ["boolean"]))
    return invalid("monkey", monkey);

  config.monkey = monkey;
  if (config.monkey) {
    $("#monkey").removeClass("hidden");
  } else {
    $("#monkey").addClass("hidden");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("monkey", config.monkey);

  return true;
}

export function setKeymapMode(
  mode: MonkeyTypes.KeymapMode,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(mode, [["off", "static", "react", "next"]]))
    return invalid("keymap mode", mode);

  $(".active-key").removeClass("active-key");
  $(".keymap-key").attr("style", "");
  config.keymapMode = mode;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("keymapMode", config.keymapMode);

  return true;
}

export function setKeymapLegendStyle(
  style: MonkeyTypes.KeymapLegendStyle,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(style, [["lowercase", "uppercase", "blank"]]))
    return invalid("keymap legend style", style);

  // Remove existing styles
  const keymapLegendStyles = ["lowercase", "uppercase", "blank"];
  keymapLegendStyles.forEach((name) => {
    $(".keymapLegendStyle").removeClass(name);
  });

  style = style || "lowercase";

  // Mutate the keymap in the DOM, if it exists.
  // 1. Remove everything
  $(".keymap-key > .letter").css("display", "");
  $(".keymap-key > .letter").css("text-transform", "");

  // 2. Append special styles onto the DOM elements
  if (style === "uppercase") {
    $(".keymap-key > .letter").css("text-transform", "capitalize");
  }
  if (style === "blank") {
    $(".keymap-key > .letter").css("display", "none");
  }

  // Update and save to cookie for persistence
  $(".keymapLegendStyle").addClass(style);
  config.keymapLegendStyle = style;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("keymapLegendStyle", config.keymapLegendStyle);

  return true;
}

export function setKeymapStyle(
  style: MonkeyTypes.KeymapStyle,
  nosave?: boolean
): boolean {
  if (
    !isConfigValueValid(style, [
      ["staggered", "alice", "matrix", "split", "split_matrix"],
    ])
  )
    return invalid("keymap style", style);

  style = style || "staggered";
  config.keymapStyle = style;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("keymapStyle", config.keymapStyle);

  return true;
}

export function setKeymapLayout(layout: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(layout, ["string"]))
    return invalid("keymap layout", layout);

  config.keymapLayout = layout;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("keymapLayout", config.keymapLayout);

  return true;
}

export function setLayout(layout: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(layout, ["string"])) return invalid("layout", layout);

  config.layout = layout;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("layout", config.layout, nosave);

  return true;
}

// export function setSavedLayout(layout: string, nosave?: boolean): boolean {
//   if (layout == null || layout == undefined) {
//     layout = "qwerty";
//   }
//   config.savedLayout = layout;
//   setLayout(layout, nosave);

//   return true;
// }

export function setFontSize(
  fontSize: MonkeyTypes.FontSize,
  nosave?: boolean
): boolean {
  fontSize = fontSize.toString() as MonkeyTypes.FontSize; //todo remove after around a week
  if (!isConfigValueValid(fontSize, [["1", "125", "15", "2", "3", "4"]]))
    return invalid("font size", fontSize);

  config.fontSize = fontSize;
  $("#words").removeClass("size125");
  $("#caret, #paceCaret").removeClass("size125");
  $("#words").removeClass("size15");
  $("#caret, #paceCaret").removeClass("size15");
  $("#words").removeClass("size2");
  $("#caret, #paceCaret").removeClass("size2");
  $("#words").removeClass("size3");
  $("#caret, #paceCaret").removeClass("size3");
  $("#words").removeClass("size35");
  $("#caret, #paceCaret").removeClass("size35");
  $("#words").removeClass("size4");
  $("#caret, #paceCaret").removeClass("size4");

  $("#miniTimerAndLiveWpm").removeClass("size125");
  $("#miniTimerAndLiveWpm").removeClass("size15");
  $("#miniTimerAndLiveWpm").removeClass("size2");
  $("#miniTimerAndLiveWpm").removeClass("size3");
  $("#miniTimerAndLiveWpm").removeClass("size35");
  $("#miniTimerAndLiveWpm").removeClass("size4");

  if (fontSize == "125") {
    $("#words").addClass("size125");
    $("#caret, #paceCaret").addClass("size125");
    $("#miniTimerAndLiveWpm").addClass("size125");
  } else if (fontSize == "15") {
    $("#words").addClass("size15");
    $("#caret, #paceCaret").addClass("size15");
    $("#miniTimerAndLiveWpm").addClass("size15");
  } else if (fontSize == "2") {
    $("#words").addClass("size2");
    $("#caret, #paceCaret").addClass("size2");
    $("#miniTimerAndLiveWpm").addClass("size2");
  } else if (fontSize == "3") {
    $("#words").addClass("size3");
    $("#caret, #paceCaret").addClass("size3");
    $("#miniTimerAndLiveWpm").addClass("size3");
  } else if (fontSize == "4") {
    $("#words").addClass("size4");
    $("#caret, #paceCaret").addClass("size4");
    $("#miniTimerAndLiveWpm").addClass("size4");
  }
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("fontSize", config.fontSize);

  return true;
}

export function setCustomBackground(value: string, nosave?: boolean): boolean {
  if (!isConfigValueValid(value, ["string"]))
    return invalid("custom background", value);

  value = value.trim();
  if (
    (/(https|http):\/\/(www\.|).+\..+\/.+(\.png|\.gif|\.jpeg|\.jpg)/gi.test(
      value
    ) &&
      !/[<>]/.test(value)) ||
    value == ""
  ) {
    config.customBackground = value;
    if (!nosave) saveToLocalStorage();
    ConfigEvent.dispatch("customBackground", config.customBackground);
  } else {
    Notifications.add("Invalid custom background URL", 0);
  }

  return true;
}

export async function setCustomLayoutfluid(
  value: MonkeyTypes.CustomLayoutFluidSpaces,
  nosave?: boolean
): Promise<boolean> {
  const isInvalid = await isConfigValueValidAsync(value, ["layoutfluid"]);
  
  if (isInvalid === undefined) return false;

  if (!isInvalid)
    return invalid("custom layoutfluid", value);

  const customLayoutfluid = value.replace(
    / /g,
    "#"
  ) as MonkeyTypes.CustomLayoutFluid;

  config.customLayoutfluid = customLayoutfluid;
  $(".pageSettings .section.customLayoutfluid input").val(
    customLayoutfluid.replace(/#/g, " ")
  );
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("customLayoutFluid", config.customLayoutfluid);

  return true;
}

export function setCustomBackgroundSize(
  value: MonkeyTypes.CustomBackgroundSize,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(value, [["max", "cover", "contain"]]))
    return invalid("custom background size", value);

  if (value != "cover" && value != "contain" && value != "max") {
    value = "cover";
  }
  config.customBackgroundSize = value;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("customBackgroundSize", config.customBackgroundSize);

  return true;
}

export function setCustomBackgroundFilter(
  array: MonkeyTypes.CustomBackgroundFilter,
  nosave?: boolean
): boolean {
  array = (array as unknown as string[]).map((value) =>
    parseFloat(value)
  ) as MonkeyTypes.CustomBackgroundFilter;
  if (!isConfigValueValid(array, ["numberArray"]))
    return invalid("custom background filter", array);

  config.customBackgroundFilter = array;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("customBackgroundFilter", config.customBackgroundFilter);

  return true;
}

export function setMonkeyPowerLevel(
  level: MonkeyTypes.MonkeyPowerLevel,
  nosave?: boolean
): boolean {
  if (!isConfigValueValid(level, [["off", "1", "2", "3", "4"]]))
    return invalid("monkey power level", level);

  if (!["off", "1", "2", "3", "4"].includes(level)) level = "off";
  config.monkeyPowerLevel = level;
  if (!nosave) saveToLocalStorage();
  ConfigEvent.dispatch("monkeyPowerLevel", config.monkeyPowerLevel);

  return true;
}

export function setBurstHeatmap(value: boolean, nosave?: boolean): boolean {
  if (!isConfigValueValid(value, ["boolean"]))
    return invalid("burst heatmap", value);

  if (!value) {
    value = false;
  }
  config.burstHeatmap = value;
  if (!nosave) {
    saveToLocalStorage();
  }
  ConfigEvent.dispatch("burstHeatmap", config.burstHeatmap);

  return true;
}

export function apply(configObj: MonkeyTypes.Config | null | "null"): void {
  if (configObj == null || configObj == undefined || configObj === "null") {
    Notifications.add("Could not apply config", -1, 3);
    return;
  }
  (Object.keys(defaultConfig) as (keyof MonkeyTypes.Config)[]).forEach(
    (configKey) => {
      if (configObj[configKey] === undefined) {
        const newValue = defaultConfig[configKey];

        (configObj[configKey] as typeof newValue) = newValue;
      }
    }
  );
  if (configObj !== undefined && configObj !== null) {
    setCustomThemeColors(configObj.customThemeColors, true);
    setThemeLight(configObj.themeLight, true);
    setThemeDark(configObj.themeDark, true);
    setAutoSwitchTheme(configObj.autoSwitchTheme, true);
    setThemes(configObj.theme, configObj.customTheme, true);
    // setTheme(configObj.theme, true);
    // setCustomTheme(configObj.customTheme, true, true);
    setCustomLayoutfluid(configObj.customLayoutfluid, true);
    setCustomBackground(configObj.customBackground, true);
    setCustomBackgroundSize(configObj.customBackgroundSize, true);
    setCustomBackgroundFilter(configObj.customBackgroundFilter, true);
    setQuickTabMode(configObj.quickTab, true);
    setKeyTips(configObj.showKeyTips, true);
    setTimeConfig(configObj.time, true);
    setQuoteLength(configObj.quoteLength, true);
    setWordCount(configObj.words, true);
    setLanguage(configObj.language, true);
    // setSavedLayout(configObj.savedLayout, true);
    setLayout(configObj.layout, true);
    setFontSize(configObj.fontSize, true);
    setFreedomMode(configObj.freedomMode, true);
    setCaretStyle(configObj.caretStyle, true);
    setPaceCaretStyle(configObj.paceCaretStyle, true);
    setDifficulty(configObj.difficulty, true);
    setBlindMode(configObj.blindMode, true);
    setQuickEnd(configObj.quickEnd, true);
    setFlipTestColors(configObj.flipTestColors, true);
    setColorfulMode(configObj.colorfulMode, true);
    setConfidenceMode(configObj.confidenceMode, true);
    setIndicateTypos(configObj.indicateTypos, true);
    setTimerStyle(configObj.timerStyle, true);
    setTimerColor(configObj.timerColor, true);
    setTimerOpacity(configObj.timerOpacity, true);
    setKeymapMode(configObj.keymapMode, true);
    setKeymapStyle(configObj.keymapStyle, true);
    setKeymapLegendStyle(configObj.keymapLegendStyle, true);
    setKeymapLayout(configObj.keymapLayout, true);
    setFontFamily(configObj.fontFamily, true);
    setSmoothCaret(configObj.smoothCaret, true);
    setSmoothLineScroll(configObj.smoothLineScroll, true);
    setShowLiveWpm(configObj.showLiveWpm, true);
    setShowLiveAcc(configObj.showLiveAcc, true);
    setShowLiveBurst(configObj.showLiveBurst, true);
    setShowTimerProgress(configObj.showTimerProgress, true);
    setAlwaysShowDecimalPlaces(configObj.alwaysShowDecimalPlaces, true);
    setAlwaysShowWordsHistory(configObj.alwaysShowWordsHistory, true);
    setSingleListCommandLine(configObj.singleListCommandLine, true);
    setCapsLockWarning(configObj.capsLockWarning, true);
    setPlaySoundOnError(configObj.playSoundOnError, true);
    setPlaySoundOnClick(configObj.playSoundOnClick, true);
    setSoundVolume(configObj.soundVolume, true);
    setStopOnError(configObj.stopOnError, true);
    setFavThemes(configObj.favThemes, true);
    setFunbox(configObj.funbox, true);
    setRandomTheme(configObj.randomTheme, true);
    setShowAllLines(configObj.showAllLines, true);
    setSwapEscAndTab(configObj.swapEscAndTab, true);
    setShowOutOfFocusWarning(configObj.showOutOfFocusWarning, true);
    setPaceCaret(configObj.paceCaret, true);
    setPaceCaretCustomSpeed(configObj.paceCaretCustomSpeed, true);
    setRepeatedPace(configObj.repeatedPace, true);
    setPageWidth(configObj.pageWidth, true);
    setChartAccuracy(configObj.chartAccuracy, true);
    setChartStyle(configObj.chartStyle, true);
    setMinBurst(configObj.minBurst, true);
    setMinBurstCustomSpeed(configObj.minBurstCustomSpeed, true);
    setMinWpm(configObj.minWpm, true);
    setMinWpmCustomSpeed(configObj.minWpmCustomSpeed, true);
    setMinAcc(configObj.minAcc, true);
    setMinAccCustom(configObj.minAccCustom, true);
    setNumbers(configObj.numbers, true);
    setPunctuation(configObj.punctuation, true);
    setHighlightMode(configObj.highlightMode, true);
    setAlwaysShowCPM(configObj.alwaysShowCPM, true);
    setHideExtraLetters(configObj.hideExtraLetters, true);
    setStartGraphsAtZero(configObj.startGraphsAtZero, true);
    setStrictSpace(configObj.strictSpace, true);
    setOppositeShiftMode(configObj.oppositeShiftMode, true);
    setMode(configObj.mode, true);
    setMonkey(configObj.monkey, true);
    setRepeatQuotes(configObj.repeatQuotes, true);
    setMonkeyPowerLevel(configObj.monkeyPowerLevel, true);
    setBurstHeatmap(configObj.burstHeatmap, true);
    setBritishEnglish(configObj.britishEnglish, true);
    setLazyMode(configObj.lazyMode, true);
    setShowAvg(configObj.showAvg, true);

    try {
      setEnableAds(configObj.enableAds, true);
      // let addemo = false;
      // if (
      //   firebase.app().options.projectId === "monkey-type-dev-67af4" ||
      //   window.location.hostname === "localhost"
      // ) {
      //   addemo = true;
      // }

      if (config.enableAds === "max" || config.enableAds === "on") {
        $("head").append(`
          <script
          src="https://hb.vntsm.com/v3/live/ad-manager.min.js"
          type="text/javascript"
          data-site-id="60b78af12119122b8958910f"
          data-mode="scan"
          id="adScript"
          async
          ></script>
        `);

        if (config.enableAds === "max") {
          //

          $("#ad_rich_media").removeClass("hidden");
          $("#ad_rich_media").html(
            `<div class="vm-placement" data-id="60bf737ee04cb761c88aafb1" style="display:none"></div>`
          );
        } else {
          $("#ad_rich_media").remove();
        }

        //<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>

        $("#ad_footer").html(
          `<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>`
        );
        $("#ad_footer").removeClass("hidden");

        // $("#ad_footer2").html(`<div class="vm-placement" data-id="60bf73e9e04cb761c88aafb7"></div>`);
        // $("#ad_footer2").removeClass("hidden");

        $("#ad_about1").html(
          `<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>`
        );
        $("#ad_about1").removeClass("hidden");

        $("#ad_about2").html(
          `<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>`
        );
        $("#ad_about2").removeClass("hidden");

        $("#ad_settings0").html(
          `<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>`
        );
        $("#ad_settings0").removeClass("hidden");

        $("#ad_settings1").html(
          `<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>`
        );
        $("#ad_settings1").removeClass("hidden");

        $("#ad_settings2").html(
          `<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>`
        );
        $("#ad_settings2").removeClass("hidden");

        $("#ad_settings3").html(
          `<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>`
        );
        $("#ad_settings3").removeClass("hidden");

        $("#ad_account").html(
          `<div class="vm-placement" data-id="60bf73dae04cb761c88aafb5"></div>`
        );
        $("#ad_account").removeClass("hidden");
        $(".footerads").removeClass("hidden");
      } else {
        $("#adScript").remove();
        $(".footerads").remove();
        $("#ad_left").remove();
        $("#ad_right").remove();
        $("#ad_footer").remove();
        $("#ad_footer2").remove();
        $("#ad_footer3").remove();
        $("#ad_settings0").remove();
        $("#ad_settings1").remove();
        $("#ad_settings2").remove();
        $("#ad_settings3").remove();
        $("#ad_account").remove();
        $("#ad_about1").remove();
        $("#ad_about2").remove();
      }
    } catch (e: any) {
      Notifications.add("Error initialising ads: " + e.message);
      console.log("error initialising ads " + e.message);
      $(".footerads").remove();
      $("#ad_left").remove();
      $("#ad_right").remove();
      $("#ad_footer").remove();
      $("#ad_footer2").remove();
      $("#ad_footer3").remove();
      $("#ad_settings0").remove();
      $("#ad_settings1").remove();
      $("#ad_settings2").remove();
      $("#ad_settings3").remove();
      $("#ad_account").remove();
      $("#ad_about1").remove();
      $("#ad_about2").remove();
    }

    ConfigEvent.dispatch("configApplied", config);
  }
}

export function reset(): void {
  apply(defaultConfig);
  saveToLocalStorage();
}

export function loadFromLocalStorage(): void {
  console.log("loading localStorage config");
  // let newConfig = $.cookie("config");
  const newConfigString = window.localStorage.getItem("config");
  let newConfig: MonkeyTypes.Config;
  if (
    newConfigString !== undefined &&
    newConfigString !== null &&
    newConfigString !== ""
  ) {
    try {
      newConfig = JSON.parse(newConfigString);
    } catch (e) {
      newConfig = {} as MonkeyTypes.Config;
    }
    apply(newConfig);
    console.log("applying localStorage config");
    localStorageConfig = newConfig;
    saveToLocalStorage(true);
    console.log("saving localStorage config");
  }
  // TestLogic.restart(false, true);
  loadDone();
}

export function getConfigChanges(): MonkeyTypes.PresetConfig {
  const configChanges = {} as MonkeyTypes.PresetConfig;
  (Object.keys(config) as (keyof MonkeyTypes.Config)[])
    .filter((key) => {
      return config[key] != defaultConfig[key];
    })
    .forEach((key) => {
      (configChanges[key] as typeof config[typeof key]) = config[key];
    });
  return configChanges;
}

export function setConfig(newConfig: MonkeyTypes.Config): void {
  config = newConfig;
}

export const loadPromise = new Promise((v) => {
  loadDone = v;
});

export default config;
