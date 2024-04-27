import Config, * as UpdateConfig from "../config";
import * as FunboxList from "./funbox/funbox-list";
import * as CustomText from "./custom-text";
import * as Wordset from "./wordset";
import QuotesController from "../controllers/quotes-controller";
import * as TestWords from "./test-words";
import * as BritishEnglish from "./british-english";
import * as LazyMode from "./lazy-mode";
import * as EnglishPunctuation from "./english-punctuation";
import * as PractiseWords from "./practise-words";
import * as Misc from "../utils/misc";
import * as Strings from "../utils/strings";
import * as Arrays from "../utils/arrays";
import * as TestState from "../test/test-state";
import * as GetText from "../utils/generate";

function shouldCapitalize(lastChar: string): boolean {
  return /[?!.؟]/.test(lastChar);
}

let spanishSentenceTracker = "";
export async function punctuateWord(
  previousWord: string,
  currentWord: string,
  index: number,
  maxindex: number
): Promise<string> {
  let word = currentWord;

  const currentLanguage = Config.language.split("_")[0];

  const lastChar = Strings.getLastChar(previousWord);

  const funbox = FunboxList.get(Config.funbox).find(
    (f) => f.functions?.punctuateWord
  );
  if (funbox?.functions?.punctuateWord) {
    return funbox.functions.punctuateWord(word);
  }
  if (
    currentLanguage !== "code" &&
    currentLanguage !== "georgian" &&
    (index === 0 || shouldCapitalize(lastChar))
  ) {
    //always capitalise the first word or if there was a dot unless using a code alphabet or the Georgian language

    word = Strings.capitalizeFirstLetterOfEachWord(word);

    if (currentLanguage === "turkish") {
      word = word.replace(/I/g, "İ");
    }

    if (currentLanguage === "spanish" || currentLanguage === "catalan") {
      const rand = Math.random();
      if (rand > 0.9) {
        word = "¿" + word;
        spanishSentenceTracker = "?";
      } else if (rand > 0.8) {
        word = "¡" + word;
        spanishSentenceTracker = "!";
      }
    }
  } else if (
    (Math.random() < 0.1 &&
      lastChar !== "." &&
      lastChar !== "," &&
      index !== maxindex - 2) ||
    index === maxindex - 1
  ) {
    if (currentLanguage === "spanish" || currentLanguage === "catalan") {
      if (spanishSentenceTracker === "?" || spanishSentenceTracker === "!") {
        word += spanishSentenceTracker;
        spanishSentenceTracker = "";
      }
    } else {
      const rand = Math.random();
      if (rand <= 0.8) {
        if (currentLanguage === "kurdish") {
          word += ".";
        } else if (currentLanguage === "nepali") {
          word += "।";
        } else if (
          currentLanguage === "japanese" ||
          currentLanguage === "chinese"
        ) {
          word += "。";
        } else {
          word += ".";
        }
      } else if (rand > 0.8 && rand < 0.9) {
        if (currentLanguage === "french") {
          word = "?";
        } else if (
          currentLanguage === "arabic" ||
          currentLanguage === "persian" ||
          currentLanguage === "urdu" ||
          currentLanguage === "kurdish"
        ) {
          word += "؟";
        } else if (currentLanguage === "greek") {
          word += ";";
        } else if (
          currentLanguage === "japanese" ||
          currentLanguage === "chinese"
        ) {
          word += "？";
        } else {
          word += "?";
        }
      } else {
        if (currentLanguage === "french") {
          word = "!";
        } else if (
          currentLanguage === "japanese" ||
          currentLanguage === "chinese"
        ) {
          word += "！";
        } else {
          word += "!";
        }
      }
    }
  } else if (
    Math.random() < 0.01 &&
    lastChar !== "," &&
    lastChar !== "." &&
    currentLanguage !== "russian"
  ) {
    word = `"${word}"`;
  } else if (
    Math.random() < 0.011 &&
    lastChar !== "," &&
    lastChar !== "." &&
    currentLanguage !== "russian" &&
    currentLanguage !== "ukrainian" &&
    currentLanguage !== "slovak"
  ) {
    word = `'${word}'`;
  } else if (Math.random() < 0.012 && lastChar !== "," && lastChar !== ".") {
    if (currentLanguage === "code") {
      const r = Math.random();
      const brackets = ["()", "{}", "[]", "<>"];

      // add `word` in javascript
      if (Config.language.startsWith("code_javascript")) {
        brackets.push("``");
      }

      const index = Math.floor(r * brackets.length);
      const bracket = brackets[index] as string;

      word = `${bracket[0]}${word}${bracket[1]}`;
    } else if (
      currentLanguage === "japanese" ||
      currentLanguage === "chinese"
    ) {
      word = `（${word}）`;
    } else {
      word = `(${word})`;
    }
  } else if (
    Math.random() < 0.013 &&
    lastChar !== "," &&
    lastChar !== "." &&
    lastChar !== ";" &&
    lastChar !== "؛" &&
    lastChar !== ":" &&
    lastChar !== "；" &&
    lastChar !== "："
  ) {
    if (currentLanguage === "french") {
      word = ":";
    } else if (currentLanguage === "greek") {
      word = "·";
    } else if (currentLanguage === "chinese") {
      word += "：";
    } else {
      word += ":";
    }
  } else if (
    Math.random() < 0.014 &&
    lastChar !== "," &&
    lastChar !== "." &&
    previousWord !== "-"
  ) {
    word = "-";
  } else if (
    Math.random() < 0.015 &&
    lastChar !== "," &&
    lastChar !== "." &&
    lastChar !== ";" &&
    lastChar !== "؛" &&
    lastChar !== "；" &&
    lastChar !== "："
  ) {
    if (currentLanguage === "french") {
      word = ";";
    } else if (currentLanguage === "greek") {
      word = "·";
    } else if (currentLanguage === "arabic" || currentLanguage === "kurdish") {
      word += "؛";
    } else if (currentLanguage === "chinese") {
      word += "；";
    } else {
      word += ";";
    }
  } else if (Math.random() < 0.2 && lastChar !== ",") {
    if (
      currentLanguage === "arabic" ||
      currentLanguage === "urdu" ||
      currentLanguage === "persian" ||
      currentLanguage === "kurdish"
    ) {
      word += "،";
    } else if (currentLanguage === "japanese") {
      word += "、";
    } else if (currentLanguage === "chinese") {
      word += "，";
    } else {
      word += ",";
    }
  } else if (Math.random() < 0.25 && currentLanguage === "code") {
    const specials = ["{", "}", "[", "]", "(", ")", ";", "=", "+", "%", "/"];
    const specialsC = [
      "{",
      "}",
      "[",
      "]",
      "(",
      ")",
      ";",
      "=",
      "+",
      "%",
      "/",
      "/*",
      "*/",
      "//",
      "!=",
      "==",
      "<=",
      ">=",
      "||",
      "&&",
      "<<",
      ">>",
      "%=",
      "&=",
      "*=",
      "++",
      "+=",
      "--",
      "-=",
      "/=",
      "^=",
      "|=",
    ];

    if (
      (Config.language.startsWith("code_c") &&
        !Config.language.startsWith("code_css")) ||
      Config.language.startsWith("code_arduino")
    ) {
      word = Arrays.randomElementFromArray(specialsC);
    } else {
      if (Config.language.startsWith("code_javascript")) {
        word = Arrays.randomElementFromArray([...specials, "`"]);
      } else {
        word = Arrays.randomElementFromArray(specials);
      }
    }
  } else if (
    Math.random() < 0.5 &&
    currentLanguage === "english" &&
    (await EnglishPunctuation.check(word))
  ) {
    word = await applyEnglishPunctuationToWord(word);
  }
  return word;
}

async function applyEnglishPunctuationToWord(word: string): Promise<string> {
  return EnglishPunctuation.replace(word);
}

function getFunboxWordsFrequency():
  | MonkeyTypes.FunboxWordsFrequency
  | undefined {
  const wordFunbox = FunboxList.get(Config.funbox).find(
    (f) => f.functions?.getWordsFrequencyMode
  );
  if (wordFunbox?.functions?.getWordsFrequencyMode) {
    return wordFunbox.functions.getWordsFrequencyMode();
  }
  return undefined;
}

async function getFunboxSection(): Promise<string[]> {
  const ret = [];
  const sectionFunbox = FunboxList.get(Config.funbox).find(
    (f) => f.functions?.pullSection
  );
  if (sectionFunbox?.functions?.pullSection) {
    const section = await sectionFunbox.functions.pullSection(Config.language);

    if (section === false || section === undefined) {
      UpdateConfig.toggleFunbox(sectionFunbox.name);
      throw new Error("Failed to pull section");
    }

    for (const word of section.words) {
      if (ret.length >= Config.words && Config.mode === "words") {
        break;
      }
      ret.push(word);
    }
  }
  return ret;
}

function getFunboxWord(
  word: string,
  wordIndex: number,
  wordset?: Wordset.Wordset
): string {
  const wordFunbox = FunboxList.get(Config.funbox).find(
    (f) => f.functions?.getWord
  );
  if (wordFunbox?.functions?.getWord) {
    word = wordFunbox.functions.getWord(wordset, wordIndex);
  }
  return word;
}

function applyFunboxesToWord(word: string): string {
  for (const f of FunboxList.get(Config.funbox)) {
    if (f.functions?.alterText) {
      word = f.functions.alterText(word);
    }
  }
  return word;
}

async function applyBritishEnglishToWord(
  word: string,
  previousWord: string
): Promise<string> {
  if (!Config.britishEnglish) return word;
  if (!Config.language.includes("english")) return word;
  if (
    Config.mode === "quote" &&
    TestWords.randomQuote?.britishText !== undefined &&
    TestWords.randomQuote?.britishText !== ""
  ) {
    return word;
  }

  return await BritishEnglish.replace(word, previousWord);
}

function applyLazyModeToWord(
  word: string,
  language: MonkeyTypes.LanguageObject
): string {
  const allowLazyMode = !language.noLazyMode || Config.mode === "custom";
  if (Config.lazyMode && allowLazyMode) {
    word = LazyMode.replaceAccents(word, language.additionalAccents);
  }
  return word;
}

export function getWordOrder(): MonkeyTypes.FunboxWordOrder {
  const wordOrder =
    FunboxList.get(Config.funbox)
      .find((f) => f.properties?.find((fp) => fp.startsWith("wordOrder")))
      ?.properties?.find((fp) => fp.startsWith("wordOrder")) ?? "";

  if (!wordOrder) {
    return "normal";
  } else {
    return wordOrder.split(":")[1] as MonkeyTypes.FunboxWordOrder;
  }
}

export function getWordsLimit(): number {
  let limit = 100;

  const funboxToPush =
    FunboxList.get(Config.funbox)
      .find((f) => f.properties?.find((fp) => fp.startsWith("toPush")))
      ?.properties?.find((fp) => fp.startsWith("toPush:")) ?? "";

  if (Config.showAllLines) {
    if (Config.mode === "custom") {
      limit = CustomText.getLimitValue();
    }
    if (Config.mode === "words") {
      limit = Config.words;
    }
    if (Config.mode === "quote") {
      limit = currentQuote.length;
    }
  }

  //infinite words
  if (Config.mode === "words" && Config.words === 0) {
    limit = 100;
  }

  //custom
  if (Config.mode === "custom") {
    if (
      CustomText.getLimitValue() === 0 ||
      CustomText.getLimitMode() === "time" ||
      CustomText.getLimitMode() === "section"
    ) {
      limit = 100;
    } else {
      limit =
        CustomText.getLimitValue() > 100 ? 100 : CustomText.getLimitValue();
    }
  }

  //funboxes
  if (funboxToPush) {
    limit = +(funboxToPush.split(":")[1] as string);
  }

  //make sure the limit is not higher than the word count
  if (Config.mode === "words" && Config.words !== 0 && Config.words < limit) {
    limit = Config.words;
  }

  if (Config.mode === "quote" && currentQuote.length < limit) {
    limit = currentQuote.length;
  }

  if (
    Config.mode === "custom" &&
    CustomText.getLimitMode() === "word" &&
    CustomText.getLimitValue() < limit
  ) {
    limit = CustomText.getLimitValue();
  }

  return limit;
}

export class WordGenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WordGenError";
  }
}

let currentQuote: string[] = [];

let isCurrentlyUsingFunboxSection = false;

export async function generateWords(
  language: MonkeyTypes.LanguageObject
): Promise<{
  words: string[];
  sectionIndexes: number[];
}> {
  if (!TestState.isRepeated) {
    previousGetNextWordReturns = [];
  }
  currentQuote = [];
  currentSection = [];
  sectionIndex = 0;
  sectionHistory = [];
  const ret: {
    words: string[];
    sectionIndexes: number[];
  } = {
    words: [],
    sectionIndexes: [],
  };

  const sectionFunbox = FunboxList.get(Config.funbox).find(
    (f) => f.functions?.pullSection
  );
  isCurrentlyUsingFunboxSection =
    sectionFunbox?.functions?.pullSection !== undefined;

  const limit = getWordsLimit();
  console.debug("Words limit", limit);

  const wordOrder = getQuoteOrCustomModeWordOrder();
  console.debug("Word order", wordOrder);

  let wordList = language.words;
  if (Config.mode === "custom") {
    if (wordOrder === "reverse") {
      wordList = CustomText.getText().reverse();
    } else {
      wordList = CustomText.getText();
    }
  }
  const wordset = await Wordset.withWords(wordList);

  if (Config.mode === "quote") {
    const quoteWords = await generateQuoteWords(language, wordset, limit);
    if (wordOrder === "reverse") {
      quoteWords.words.reverse();
      quoteWords.sectionIndexes.reverse();
    }
    return quoteWords;
  }

  if (
    Config.mode === "time" ||
    Config.mode === "words" ||
    Config.mode === "custom"
  ) {
    let stop = false;
    let i = 0;
    while (!stop) {
      const nextWord = await getNextWord(
        wordset,
        i,
        language,
        limit,
        Arrays.nthElementFromArray(ret.words, -1) ?? "",
        Arrays.nthElementFromArray(ret.words, -2) ?? ""
      );
      ret.words.push(nextWord.word);
      ret.sectionIndexes.push(nextWord.sectionIndex);

      const randomSectionStop =
        CustomText.getLimitMode() === "section" &&
        CustomText.getLimitValue() !== 0 &&
        sectionIndex >= CustomText.getLimitValue();

      const customModeStop =
        Config.mode === "custom" &&
        currentSection.length === 0 &&
        randomSectionStop;

      if (customModeStop || ret.words.length >= limit) {
        stop = true;
      }
      i++;
    }
  }
  sectionHistory = []; //free up a bit of memory? is that even a thing?
  return ret;
}

async function generateQuoteWords(
  language: MonkeyTypes.LanguageObject,
  wordset: Wordset.Wordset,
  limit: number
): Promise<{
  words: string[];
  sectionIndexes: number[];
}> {
  const ret: {
    words: string[];
    sectionIndexes: number[];
  } = {
    words: [],
    sectionIndexes: [],
  };
  if (TestState.isRepeated) {
    for (
      let i = 0;
      i < Math.min(limit, previousGetNextWordReturns.length);
      i++
    ) {
      const repeated = previousGetNextWordReturns[i];

      if (repeated === undefined) {
        throw new WordGenError("Repeated word is undefined");
      }

      ret.words.push(repeated.word);
      ret.sectionIndexes.push(repeated.sectionIndex);
    }
    return ret;
  }

  const languageToGet = language.name.startsWith("swiss_german")
    ? "german"
    : language.name;

  const quotesCollection = await QuotesController.getQuotes(
    languageToGet,
    Config.quoteLength
  );

  if (quotesCollection.length === 0) {
    UpdateConfig.setMode("words");
    throw new WordGenError(
      `No ${Config.language
        .replace(/_\d*k$/g, "")
        .replace(/_/g, " ")} quotes found`
    );
  }

  let rq: MonkeyTypes.Quote;
  if (Config.quoteLength.includes(-2) && Config.quoteLength.length === 1) {
    const targetQuote = QuotesController.getQuoteById(
      TestState.selectedQuoteId
    );
    if (targetQuote === undefined) {
      UpdateConfig.setQuoteLength(-1);
      throw new WordGenError(
        `Quote ${TestState.selectedQuoteId} does not exist`
      );
    }
    rq = targetQuote;
  } else if (Config.quoteLength.includes(-3)) {
    const randomQuote = QuotesController.getRandomFavoriteQuote(
      Config.language
    );
    if (randomQuote === null) {
      UpdateConfig.setQuoteLength(-1);
      throw new WordGenError("No favorite quotes found");
    }
    rq = randomQuote;
  } else {
    const randomQuote = QuotesController.getRandomQuote();
    if (randomQuote === null) {
      UpdateConfig.setQuoteLength(-1);
      throw new WordGenError("No quotes found for selected quote length");
    }
    rq = randomQuote;
  }

  rq.language = Strings.removeLanguageSize(Config.language);
  rq.text = rq.text.replace(/ +/gm, " ");
  rq.text = rq.text.replace(/( *(\r\n|\r|\n) *)/g, "\n ");
  rq.text = rq.text.replace(/…/g, "...");
  rq.text = rq.text.trim();

  if (
    rq.britishText !== undefined &&
    rq.britishText !== "" &&
    Config.britishEnglish
  ) {
    rq.textSplit = rq.britishText.split(" ");
  } else {
    rq.textSplit = rq.text.split(" ");
  }

  TestWords.setRandomQuote(rq);

  if (TestWords.randomQuote === null) {
    throw new WordGenError("Random quote is null");
  }

  if (TestWords.randomQuote.textSplit === undefined) {
    throw new WordGenError("Random quote textSplit is undefined");
  }

  currentQuote = TestWords.randomQuote.textSplit;

let currentWordset: Wordset.Wordset | null = null;
let currentLanguage: MonkeyTypes.LanguageObject | null = null;
    const nextWord = await getNextWord(
      i,
      limit,
      Arrays.nthElementFromArray(ret.words, -1) ?? "",
      Arrays.nthElementFromArray(ret.words, -2) ?? ""
    );
    ret.words.push(nextWord.word);
    ret.sectionIndexes.push(i);
  }
  return ret;
}

export let sectionIndex = 0;
export let currentSection: string[] = [];
let sectionHistory: string[] = [];

let previousGetNextWordReturns: GetNextWordReturn[] = [];

type GetNextWordReturn = {
  word: string;
  sectionIndex: number;
};

//generate next word
export async function getNextWord(
  wordIndex: number,
  wordsBound: number,
  previousWord: string,
  previousWord2: string
): Promise<GetNextWordReturn> {
  console.debug("Getting next word", {
    isRepeated: TestState.isRepeated,
    currentWordset,
    wordIndex,
    language: currentLanguage,
    wordsBound,
    previousWord,
    previousWord2,
  });

  if (currentWordset === null) {
    throw new WordGenError("Current wordset is null");
  }

  if (currentLanguage === null) {
    throw new WordGenError("Current language is null");
  }

  //because quote test can be repeated in the middle of a test
  //we cant rely on data inside previousGetNextWordReturns
  //because it might not include the full quote
  if (TestState.isRepeated && Config.mode !== "quote") {
    const repeated = previousGetNextWordReturns[wordIndex];

    if (repeated === undefined) {
      throw new WordGenError("Repeated word is undefined");
    }

    console.debug("Repeated word: ", repeated);
    return repeated;
  }

  const funboxFrequency = getFunboxWordsFrequency() ?? "normal";
  let randomWord = currentWordset.randomWord(funboxFrequency);
  const previousWordRaw = previousWord.replace(/[.?!":\-,]/g, "").toLowerCase();
  const previousWord2Raw = previousWord2
    .replace(/[.?!":\-,']/g, "")
    .toLowerCase();

  if (currentSection.length === 0) {
    const funboxSection = await getFunboxSection();

    if (Config.mode === "quote") {
      randomWord = currentWordset.nextWord();
    } else if (Config.mode === "custom" && CustomText.getMode() === "repeat") {
      const customText = CustomText.getText();
      randomWord = customText[sectionIndex % customText.length] as string;
    } else if (
      Config.mode === "custom" &&
      CustomText.getMode() === "random" &&
      (currentWordset.length < 4 || PractiseWords.before.mode !== null)
    ) {
      randomWord = currentWordset.randomWord(funboxFrequency);
    } else if (Config.mode === "custom" && CustomText.getMode() === "shuffle") {
      randomWord = currentWordset.shuffledWord();
    } else if (
      Config.mode === "custom" &&
      CustomText.getLimitMode() === "section"
    ) {
      randomWord = currentWordset.randomWord(funboxFrequency);

      const previousSection = Arrays.nthElementFromArray(sectionHistory, -1);
      const previousSection2 = Arrays.nthElementFromArray(sectionHistory, -2);

      let regenerationCount = 0;
      while (
        regenerationCount < 100 &&
        (previousSection === randomWord || previousSection2 === randomWord)
      ) {
        regenerationCount++;
        randomWord = currentWordset.randomWord(funboxFrequency);
      }
    } else if (isCurrentlyUsingFunboxSection) {
      randomWord = funboxSection.join(" ");
    } else {
      let regenarationCount = 0; //infinite loop emergency stop button
      let firstAfterSplit = (randomWord.split(" ")[0] as string).toLowerCase();
      let firstAfterSplitLazy = applyLazyModeToWord(
        firstAfterSplit,
        currentLanguage
      );
      while (
        regenarationCount < 100 &&
        (previousWordRaw === firstAfterSplitLazy ||
          previousWord2Raw === firstAfterSplitLazy ||
          (Config.mode !== "custom" &&
            !Config.punctuation &&
            randomWord === "I") ||
          (Config.mode !== "custom" &&
            !Config.punctuation &&
            !Config.language.startsWith("code") &&
            /[-=_+[\]{};'\\:"|,./<>?]/i.test(randomWord)) ||
          (Config.mode !== "custom" &&
            !Config.numbers &&
            /[0-9]/i.test(randomWord)))
      ) {
        regenarationCount++;
        randomWord = currentWordset.randomWord(funboxFrequency);
        firstAfterSplit = randomWord.split(" ")[0] as string;
        firstAfterSplitLazy = applyLazyModeToWord(
          firstAfterSplit,
          currentLanguage
        );
      }
    }
    randomWord = randomWord.replace(/ +/g, " ");
    randomWord = randomWord.replace(/(^ )|( $)/g, "");

    randomWord = getFunboxWord(randomWord, wordIndex, currentWordset);

    currentSection = [...randomWord.split(" ")];
    sectionHistory.push(randomWord);
    randomWord = currentSection.shift() as string;
    sectionIndex++;
  } else {
    randomWord = currentSection.shift() as string;
  }

  if (randomWord === undefined) {
    throw new WordGenError("Random word is undefined");
  }

  if (randomWord === "") {
    throw new WordGenError("Random word is empty");
  }

  if (/ /g.test(randomWord)) {
    throw new WordGenError("Random word contains spaces");
  }

  if (
    Config.mode !== "custom" &&
    Config.mode !== "quote" &&
    /[A-Z]/.test(randomWord) &&
    !Config.punctuation &&
    !Config.language.startsWith("german") &&
    !Config.language.startsWith("swiss_german") &&
    !Config.language.startsWith("code") &&
    !Config.language.startsWith("klingon") &&
    !isCurrentlyUsingFunboxSection
  ) {
    randomWord = randomWord.toLowerCase();
  }

  randomWord = randomWord.replace(/ +/gm, " ");
  randomWord = randomWord.replace(/(^ )|( $)/gm, "");
  randomWord = applyLazyModeToWord(randomWord, currentLanguage);
  randomWord = await applyBritishEnglishToWord(randomWord, previousWordRaw);

  if (Config.language.startsWith("swiss_german")) {
    randomWord = randomWord.replace(/ß/g, "ss");
  }

  if (
    Config.punctuation &&
    !currentLanguage.originalPunctuation &&
    !isCurrentlyUsingFunboxSection
  ) {
    randomWord = await punctuateWord(
      previousWord,
      randomWord,
      wordIndex,
      wordsBound
    );
  }
  if (Config.numbers) {
    if (Math.random() < 0.1) {
      randomWord = GetText.getNumbers(4);

      if (Config.language.startsWith("kurdish")) {
        randomWord = Misc.convertNumberToArabic(randomWord);
      } else if (Config.language.startsWith("nepali")) {
        randomWord = Misc.convertNumberToNepali(randomWord);
      }
    }
  }

  randomWord = applyFunboxesToWord(randomWord);

  console.debug("Word:", randomWord);

  const ret = {
    word: randomWord,
    sectionIndex: sectionIndex,
  };

  previousGetNextWordReturns.push(ret);

  return ret;
}
