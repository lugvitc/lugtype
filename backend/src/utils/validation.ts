import _ from "lodash";
import { replaceHomoglyphs } from "../constants/homoglyphs";
import { profanities, regexProfanities } from "../constants/profanities";
import { intersect, matchesAPattern, sanitizeString } from "./misc";
import { default as FunboxList } from "../constants/funbox-list";

export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

const VALID_NAME_PATTERN = /^[\da-zA-Z_.-]+$/;

export function isUsernameValid(name: string): boolean {
  if (_.isNil(name) || !inRange(name.length, 1, 16)) {
    return false;
  }

  const normalizedName = name.toLowerCase();

  const beginsWithPeriod = /^\..*/.test(normalizedName);
  if (beginsWithPeriod) {
    return false;
  }

  const isProfanity = profanities.find((profanity) =>
    normalizedName.includes(profanity)
  );
  if (isProfanity) {
    return false;
  }

  return VALID_NAME_PATTERN.test(name);
}

export function containsProfanity(text: string): boolean {
  const normalizedText = text
    .toLowerCase()
    .split(/[.,"/#!?$%^&*;:{}=\-_`~()\s\n]+/g)
    .map((str) => {
      return replaceHomoglyphs(sanitizeString(str) ?? "");
    });

  const hasProfanity = regexProfanities.some((profanity) => {
    return normalizedText.some((word) => {
      return matchesAPattern(word, profanity);
    });
  });

  return hasProfanity;
}

export function isTagPresetNameValid(name: string): boolean {
  if (_.isNil(name) || !inRange(name.length, 1, 16)) {
    return false;
  }

  return VALID_NAME_PATTERN.test(name);
}

export function isTestTooShort(result: MonkeyTypes.CompletedEvent): boolean {
  const { mode, mode2, customText, testDuration, bailedOut } = result;

  if (mode === "time") {
    const seconds = parseInt(mode2);

    const setTimeTooShort = seconds > 0 && seconds < 15;
    const infiniteTimeTooShort = seconds === 0 && testDuration < 15;
    const bailedOutTooShort = bailedOut
      ? bailedOut && testDuration < 15
      : false;
    return setTimeTooShort || infiniteTimeTooShort || bailedOutTooShort;
  }

  if (mode === "words") {
    const wordCount = parseInt(mode2);

    const setWordTooShort = wordCount > 0 && wordCount < 10;
    const infiniteWordTooShort = wordCount === 0 && testDuration < 15;
    const bailedOutTooShort = bailedOut
      ? bailedOut && testDuration < 15
      : false;
    return setWordTooShort || infiniteWordTooShort || bailedOutTooShort;
  }

  if (mode === "custom") {
    if (!customText) return true;
    const { isWordRandom, isTimeRandom, textLen, word, time } = customText;
    const setTextTooShort =
      !isWordRandom && !isTimeRandom && _.isNumber(textLen) && textLen < 10;
    const randomWordsTooShort = isWordRandom && !isTimeRandom && word < 10;
    const randomTimeTooShort = !isWordRandom && isTimeRandom && time < 15;
    const bailedOutTooShort = bailedOut
      ? bailedOut && testDuration < 15
      : false;
    return (
      setTextTooShort ||
      randomWordsTooShort ||
      randomTimeTooShort ||
      bailedOutTooShort
    );
  }

  if (mode === "zen") {
    return testDuration < 15;
  }

  return false;
}

export function areFunboxesCompatible(funboxesString: string): boolean {
  const funboxes = funboxesString.split("#").filter((f) => f !== "none");

  const funboxesToCheck = FunboxList.filter((f) => funboxes.includes(f.name));

  const allFunboxesAreValid = funboxesToCheck.length === funboxes.length;
  const oneWordModifierMax =
    funboxesToCheck.filter(
      (f) =>
        f.frontendFunctions?.includes("getWord") ||
        f.frontendFunctions?.includes("pullSection") ||
        f.frontendFunctions?.includes("withWords")
    ).length <= 1;
  const layoutUsability =
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "changesLayout")
    ).length === 0 ||
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "ignoresLayout" || fp === "usesLayout")
    ).length === 0;
  const oneNospaceOrToPushMax =
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "nospace" || fp.startsWith("toPush"))
    ).length <= 1;
  const oneChangesWordsVisibilityMax =
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "changesWordsVisibility")
    ).length <= 1;
  const oneFrequencyChangesMax =
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "changesWordsFrequency")
    ).length <= 1;
  const noFrequencyChangesConflicts =
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "changesWordsFrequency")
    ).length === 0 ||
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "ignoresLanguage")
    ).length === 0;
  const capitalisationChangePosibility =
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "noLetters")
    ).length === 0 ||
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "changesCapitalisation")
    ).length === 0;
  const noConflictsWithSymmetricChars =
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "conflictsWithSymmetricChars")
    ).length === 0 ||
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "symmetricChars")
    ).length === 0;
  const canSpeak =
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "speaks" || fp === "unspeakable")
    ).length <= 1;
  const hasLanguageToSpeak =
    funboxesToCheck.filter((f) => f.properties?.find((fp) => fp === "speaks"))
      .length === 0 ||
    funboxesToCheck.filter((f) =>
      f.properties?.find((fp) => fp === "ignoresLanguage")
    ).length === 0;
  const oneToPushOrPullSectionMax =
    funboxesToCheck.filter(
      (f) =>
        f.properties?.find((fp) => fp.startsWith("toPush:")) ||
        f.frontendFunctions?.includes("pullSection")
    ).length <= 1;
  const oneApplyCSSMax =
    funboxesToCheck.filter((f) => f.frontendFunctions?.includes("applyCSS"))
      .length <= 1;
  const onePunctuateWordMax =
    funboxesToCheck.filter((f) =>
      f.frontendFunctions?.includes("punctuateWord")
    ).length <= 1;
  const oneCharCheckerMax =
    funboxesToCheck.filter((f) =>
      f.frontendFunctions?.includes("isCharCorrect")
    ).length <= 1;
  const oneCharReplacerMax =
    funboxesToCheck.filter((f) => f.frontendFunctions?.includes("getWordHtml"))
      .length <= 1;
  const allowedConfig = {} as Record<string, string[] | boolean[]>;
  let noConfigConflicts = true;
  for (const f of funboxesToCheck) {
    if (!f.frontendForcedConfig) continue;
    for (const key in f.frontendForcedConfig) {
      if (allowedConfig[key]) {
        if (
          intersect<string | boolean>(
            allowedConfig[key],
            f.frontendForcedConfig[key],
            true
          ).length === 0
        ) {
          noConfigConflicts = false;
          break;
        }
      } else {
        allowedConfig[key] = f.frontendForcedConfig[key];
      }
    }
  }

  return (
    allFunboxesAreValid &&
    oneWordModifierMax &&
    layoutUsability &&
    oneNospaceOrToPushMax &&
    oneChangesWordsVisibilityMax &&
    oneFrequencyChangesMax &&
    noFrequencyChangesConflicts &&
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
