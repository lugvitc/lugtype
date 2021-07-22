import * as TestLogic from "./test-logic";
import * as TestUI from "./test-ui";
import Config from "./config";
import * as DB from "./db";

export let settings = null;

function resetCaretPosition() {
  if (Config.paceCaret === "off" && !TestLogic.isPaceRepeat)
    return;
  if (!$("#paceCaret").hasClass("hidden")) {
    $("#paceCaret").addClass("hidden");
  }
  if (Config.mode === "zen") return;

  let caret = $("#paceCaret");
  let firstLetter = document
    .querySelector("#words .word")
    .querySelector("letter");

  caret.stop(true, true).animate(
    {
      top: firstLetter.offsetTop - $(firstLetter).height() / 4,
      left: firstLetter.offsetLeft,
    },
    0,
    "linear"
  );
}

export async function init() {
  $("#paceCaret").addClass("hidden");
  let mode2 = "";
  if (Config.mode === "time") {
    mode2 = Config.time;
  } else if (Config.mode === "words") {
    mode2 = Config.words;
  } else if (Config.mode === "custom") {
    mode2 = "custom";
  } else if (Config.mode === "quote") {
    mode2 = TestLogic.randomQuote.id;
  }
  let wpm;
  if (Config.paceCaret === "pb") {
    wpm = await DB.getLocalPB(
      Config.mode,
      mode2,
      Config.punctuation,
      Config.language,
      Config.difficulty
    );
  } else if (Config.paceCaret === "average") {
    let mode2 = "";
    if (Config.mode === "time") {
      mode2 = Config.time;
    } else if (Config.mode === "words") {
      mode2 = Config.words;
    } else if (Config.mode === "custom") {
      mode2 = "custom";
    } else if (Config.mode === "quote") {
      mode2 = TestLogic.randomQuote.id;
    }
    wpm = await DB.getUserAverageWpm10(
      Config.mode,
      mode2,
      Config.punctuation,
      Config.language,
      Config.difficulty
    );
    console.log("avg pace " + wpm);
  } else if (Config.paceCaret === "custom") {
    wpm = Config.paceCaretCustomSpeed;
  } else if (TestLogic.isPaceRepeat == true) {
    wpm = TestLogic.lastTestWpm;
  }
  if (wpm < 1 || wpm == false || wpm == undefined || Number.isNaN(wpm)) {
    settings = null;
    return;
  }

  let characters = wpm * 5;
  let cps = characters / 60; //characters per step
  let spc = 60 / characters; //seconds per character

  settings = {
    wpm: wpm,
    cps: cps,
    spc: spc,
    correction: 0,
    currentWordIndex: 0,
    currentLetterIndex: -1,
    wordsStatus: {},
    timeout: null,
  };

  resetCaretPosition();
  TestUI.updateModesNotice();
}

export function update(expectedStepEnd) {
  if (settings === null || !TestLogic.active || TestUI.resultVisible) {
    return;
  }
  if ($("#paceCaret").hasClass("hidden")) {
    $("#paceCaret").removeClass("hidden");
  }
  try {
    settings.currentLetterIndex++;
    if (
      settings.currentLetterIndex >=
      TestLogic.words.get(settings.currentWordIndex).length
    ) {
      //go to the next word
      settings.currentLetterIndex = -1;
      settings.currentWordIndex++;
    }
    if (!Config.blindMode) {
      if (settings.correction < 0) {
        while (settings.correction < 0) {
          settings.currentLetterIndex--;
          if (settings.currentLetterIndex <= -2) {
            //go to the previous word
            settings.currentLetterIndex =
              TestLogic.words.get(settings.currentWordIndex - 1).length - 1;
            settings.currentWordIndex--;
          }
          settings.correction++;
        }
      } else if (settings.correction > 0) {
        while (settings.correction > 0) {
          settings.currentLetterIndex++;
          if (
            settings.currentLetterIndex >=
            TestLogic.words.get(settings.currentWordIndex).length
          ) {
            //go to the next word
            settings.currentLetterIndex = -1;
            settings.currentWordIndex++;
          }
          settings.correction--;
        }
      }
    }
  } catch (e) {
    //out of words
    settings = null;
    $("#paceCaret").addClass("hidden");
    return;
  }

  try {
    let caret = $("#paceCaret");
    let currentLetter;
    let newTop;
    let newLeft;
    try {
      let newIndex =
        settings.currentWordIndex -
        (TestLogic.words.currentIndex - TestUI.currentWordElementIndex);
      let word = document.querySelectorAll("#words .word")[newIndex];
      if (settings.currentLetterIndex === -1) {
        currentLetter = word.querySelectorAll("letter")[0];
      } else {
        currentLetter = word.querySelectorAll("letter")[
          settings.currentLetterIndex
        ];
      }
      newTop = currentLetter.offsetTop - $(currentLetter).height() / 5;
      newLeft;
      if (settings.currentLetterIndex === -1) {
        newLeft = currentLetter.offsetLeft;
      } else {
        newLeft =
          currentLetter.offsetLeft +
          $(currentLetter).width() -
          caret.width() / 2;
      }
      caret.removeClass("hidden");
    } catch (e) {
      caret.addClass("hidden");
    }

    let smoothlinescroll = $("#words .smoothScroller").height();
    if (smoothlinescroll === undefined) smoothlinescroll = 0;

    $("#paceCaret").css({
      top: newTop - smoothlinescroll,
    });

    let duration = expectedStepEnd - performance.now();

    if (Config.smoothCaret) {
      caret.stop(true, true).animate(
        {
          left: newLeft,
        },
        duration,
        "linear"
      );
    } else {
      caret.stop(true, true).animate(
        {
          left: newLeft,
        },
        0,
        "linear"
      );
    }
    settings.timeout = setTimeout(() => {
      try {
        update(expectedStepEnd + settings.spc * 1000);
      } catch (e) {
        settings = null;
      }
    }, duration);
  } catch (e) {
    console.error(e);
    $("#paceCaret").addClass("hidden");
  }
}

export function reset() {
  settings = null;
  if (settings !== null) clearTimeout(settings.timeout);
}

export function handleSpace(correct, currentWord) {
  if (correct) {
    if (
      settings !== null &&
      settings.wordsStatus[TestLogic.words.currentIndex] === true &&
      !Config.blindMode
    ) {
      settings.wordsStatus[TestLogic.words.currentIndex] = undefined;
      settings.correction -= currentWord.length + 1;
    }
  } else {
    if (
      settings !== null &&
      settings.wordsStatus[TestLogic.words.currentIndex] === undefined &&
      !Config.blindMode
    ) {
      settings.wordsStatus[TestLogic.words.currentIndex] = true;
      settings.correction += currentWord.length + 1;
    }
  }
}

export function start() {
  update(performance.now() + settings.spc * 1000);
}
