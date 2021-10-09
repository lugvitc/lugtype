import * as TestStats from "./test-stats";
import * as Notifications from "./notifications";
import Config, * as UpdateConfig from "./config";
import * as CustomText from "./custom-text";
import * as TestLogic from "./test-logic";

export let before = {
  mode: null,
  punctuation: null,
  numbers: null,
};

export function init(missed, slow) {
  if (Config.mode === "zen") return;
  let limit;
  if ((missed && !slow) || (!missed && slow)) {
    limit = 20;
  } else if (missed && slow) {
    limit = 10;
  }

  let sortableMissedWords = [];
  if (missed) {
    Object.keys(TestStats.missedWords).forEach((missedWord) => {
      sortableMissedWords.push([missedWord, TestStats.missedWords[missedWord]]);
    });
    sortableMissedWords.sort((a, b) => {
      return b[1] - a[1];
    });
    sortableMissedWords = sortableMissedWords.slice(0, limit);
  }

  if (missed && !slow && sortableMissedWords.length == 0) {
    Notifications.add("You haven't missed any words", 0);
    return;
  }

  let sortableSlowWords = [];
  if (slow) {
    sortableSlowWords = TestLogic.words.get().map(function (e, i) {
      return [e, TestStats.burstHistory[i]];
    });
    sortableSlowWords.sort((a, b) => {
      return a[1] - b[1];
    });
    sortableSlowWords = sortableSlowWords.slice(
      0,
      Math.min(limit, Math.round(TestLogic.words.length * 0.2))
    );
  }

  // console.log(sortableMissedWords);
  // console.log(sortableSlowWords);

  if (sortableMissedWords.length == 0 && sortableSlowWords.length == 0) {
    Notifications.add("Could not start a new custom test", 0);
    return;
  }

  let newCustomText = [];
  sortableMissedWords.forEach((missed, index) => {
    for (let i = 0; i < missed[1]; i++) {
      newCustomText.push(missed[0]);
    }
  });

  sortableSlowWords.forEach((slow, index) => {
    for (let i = 0; i < sortableSlowWords.length - index; i++) {
      newCustomText.push(slow[0]);
    }
  });

  // console.log(newCustomText);

  let mode = before.mode === null ? Config.mode : before.mode;
  let punctuation =
    before.punctuation === null ? Config.punctuation : before.punctuation;
  let numbers = before.numbers === null ? Config.numbers : before.numbers;
  UpdateConfig.setMode("custom");

  CustomText.setText(newCustomText);
  CustomText.setIsWordRandom(true);
  CustomText.setWord(
    (sortableSlowWords.length + sortableMissedWords.length) * 5
  );

  TestLogic.restart(false, false, false, true);
  before.mode = mode;
  before.punctuation = punctuation;
  before.numbers = numbers;
}

export function resetBefore() {
  before.mode = null;
  before.punctuation = null;
  before.numbers = null;
}

export function showPopup(focus = false) {
  if ($("#practiseWordsPopupWrapper").hasClass("hidden")) {
    if (Config.mode === "zen") {
      Notifications.add("Practice words is unsupported in zen mode", 0);
      return;
    }
    $("#practiseWordsPopupWrapper")
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, 100, () => {
        if (focus) {
          console.log("focusing");
          $("#practiseWordsPopup .missed").focus();
        }
      });
  }
}

function hidePopup() {
  if (!$("#practiseWordsPopupWrapper").hasClass("hidden")) {
    $("#practiseWordsPopupWrapper")
      .stop(true, true)
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        100,
        (e) => {
          $("#practiseWordsPopupWrapper").addClass("hidden");
        }
      );
  }
}

$("#practiseWordsPopupWrapper").click((e) => {
  if ($(e.target).attr("id") === "practiseWordsPopupWrapper") {
    hidePopup();
  }
});

$("#practiseWordsPopup .button.missed").click(() => {
  hidePopup();
  init(true, false);
});

$("#practiseWordsPopup .button.slow").click(() => {
  hidePopup();
  init(false, true);
});

$("#practiseWordsPopup .button.both").click(() => {
  hidePopup();
  init(true, true);
});

$("#practiseWordsPopup .button").keypress((e) => {
  if (e.key == "Enter") {
    $(e.currentTarget).click();
  }
});

$("#practiseWordsPopup .button.both").on("focusout", (e) => {
  e.preventDefault();
  $("#practiseWordsPopup .missed").focus();
});
