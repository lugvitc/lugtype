import * as Misc from "../utils/misc";
import Config from "../config";
import * as TestInput from "./test-input";
import * as SlowTimer from "../states/slow-timer";
import * as TestState from "../test/test-state";

export let caretAnimating = true;
const caret = document.querySelector("#caret") as HTMLElement;

export function stopAnimation(): void {
  if (caretAnimating) {
    caret.style.animationName = "none";
    caret.style.opacity = "1";
    caretAnimating = false;
  }
}

export function startAnimation(): void {
  if (!caretAnimating) {
    if (Config.smoothCaret !== "off" && !SlowTimer.get()) {
      caret.style.animationName = "caretFlashSmooth";
    } else {
      caret.style.animationName = "caretFlashHard";
    }
    caretAnimating = true;
  }
}

export function hide(): void {
  caret.classList.add("hidden");
}

function getTargetPositionLeft(
  fullWidthCaret: boolean,
  isLanguageRightToLeft: boolean,
  currentLetter: HTMLElement | undefined,
  previousLetter: HTMLElement | undefined
): number {
  let result = 0;

  if (isLanguageRightToLeft) {
    const fullWidthOffset = fullWidthCaret
      ? 0
      : currentLetter?.offsetWidth ?? previousLetter?.offsetWidth ?? 0;
    if (currentLetter !== undefined) {
      result = currentLetter.offsetLeft + fullWidthOffset;
    } else if (previousLetter !== undefined) {
      result =
        previousLetter.offsetLeft -
        previousLetter.offsetWidth +
        fullWidthOffset;
    }
  } else {
    if (currentLetter !== undefined) {
      result = currentLetter.offsetLeft;
    } else if (previousLetter !== undefined) {
      result = previousLetter.offsetLeft + previousLetter.offsetWidth;
    }
  }

  return result;
}

export async function updatePosition(noAnim = false): Promise<void> {
  console.trace();
  const caretWidth = Math.round(
    document.querySelector("#caret")?.getBoundingClientRect().width ?? 0
  );

  const fullWidthCaret = ["block", "outline", "underline"].includes(
    Config.caretStyle
  );

  const inputLen = TestInput.input.current.length;
  const currentLetterIndex = inputLen;
  //insert temporary character so the caret will work in zen mode
  const activeWordEmpty = $("#words .active").children().length === 0;
  if (activeWordEmpty) {
    $("#words .active").append('<letter style="opacity: 0;">_</letter>');
  }

  const currentWordNodeList = document
    ?.querySelector("#words .active")
    ?.querySelectorAll("letter");

  if (!currentWordNodeList) return;

  const currentLetter = currentWordNodeList[currentLetterIndex] as
    | HTMLElement
    | undefined;

  const previousLetter: HTMLElement = currentWordNodeList[
    Math.min(currentLetterIndex - 1, currentWordNodeList.length - 1)
  ] as HTMLElement;

  const currentLanguage = await Misc.getCurrentLanguage(Config.language);
  const isLanguageRightToLeft = currentLanguage.rightToLeft;
  const letterPosLeft = getTargetPositionLeft(
    fullWidthCaret,
    isLanguageRightToLeft,
    currentLetter,
    previousLetter
  );

  const letterPosTop = currentLetter
    ? currentLetter.offsetTop
    : previousLetter.offsetTop;

  const letterHeight =
    currentLetter?.offsetHeight ??
    previousLetter?.offsetHeight ??
    Config.fontSize * Misc.convertRemToPixels(1);

  const diff = letterHeight - caret.offsetHeight;

  const newTop = letterPosTop + diff / 2;

  let newLeft = letterPosLeft - (fullWidthCaret ? 0 : caretWidth / 2);

  const wordsWrapperWidth =
    $(document.querySelector("#wordsWrapper") as HTMLElement).width() ?? 0;

  if (Config.tapeMode === "letter") {
    newLeft = wordsWrapperWidth / 2 - (fullWidthCaret ? 0 : caretWidth / 2);
  } else if (Config.tapeMode === "word") {
    if (inputLen === 0) {
      newLeft = wordsWrapperWidth / 2 - (fullWidthCaret ? 0 : caretWidth / 2);
    } else {
      let inputWidth = 0;
      for (let i = 0; i < inputLen; i++) {
        inputWidth += $(currentWordNodeList[i] as HTMLElement).outerWidth(
          true
        ) as number;
      }
      newLeft =
        wordsWrapperWidth / 2 +
        inputWidth -
        (fullWidthCaret ? 0 : caretWidth / 2);
    }
  }
  const newWidth = fullWidthCaret
    ? ((currentLetter
        ? currentLetter.offsetWidth
        : previousLetter.offsetWidth) ?? 0) + "px"
    : "";

  let smoothlinescroll = $("#words .smoothScroller").height();
  if (smoothlinescroll === undefined) smoothlinescroll = 0;

  const jqcaret = $(caret);

  jqcaret.css("display", "block"); //for some goddamn reason adding width animation sets the display to none ????????

  const animation: { top: number; left: number; width?: string } = {
    top: newTop - smoothlinescroll,
    left: newLeft,
  };

  if (newWidth !== "") {
    animation.width = newWidth;
  } else {
    jqcaret.css("width", "");
  }

  const smoothCaretSpeed =
    Config.smoothCaret == "off"
      ? 0
      : Config.smoothCaret == "slow"
      ? 150
      : Config.smoothCaret == "medium"
      ? 100
      : Config.smoothCaret == "fast"
      ? 85
      : 0;

  jqcaret
    .stop(true, false)
    .animate(animation, SlowTimer.get() || noAnim ? 0 : smoothCaretSpeed);

  if (Config.showAllLines) {
    const browserHeight = window.innerHeight;
    const middlePos = browserHeight / 2 - (jqcaret.outerHeight() as number) / 2;
    const contentHeight = document.body.scrollHeight;

    if (
      newTop >= middlePos &&
      contentHeight > browserHeight &&
      TestState.isActive
    ) {
      const newscrolltop = newTop - middlePos / 2;
      window.scrollTo({
        left: 0,
        top: newscrolltop,
        behavior: "smooth",
      });
    }
  }
  if (activeWordEmpty) {
    $("#words .active").children().remove();
  }
}

export function show(noAnim = false): void {
  caret.classList.remove("hidden");
  void updatePosition(noAnim);
  startAnimation();
}
