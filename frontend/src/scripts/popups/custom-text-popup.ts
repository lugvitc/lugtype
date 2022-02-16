import * as CustomText from "../test/custom-text";
import * as ManualRestart from "../test/manual-restart-tracker";
import * as TestLogic from "../test/test-logic";
import * as ChallengeController from "../controllers/challenge-controller";
import Config, * as UpdateConfig from "../config";
import * as Misc from "../misc";
import * as WordFilterPopup from "./word-filter-popup";
import * as Notifications from "../elements/notifications";

const wrapper = "#customTextPopupWrapper";
const popup = "#customTextPopup";

export function show(): void {
  if ($(wrapper).hasClass("hidden")) {
    if ($(`${popup} .checkbox input`).prop("checked")) {
      $(`${popup} .inputs .randomInputFields`).removeClass("hidden");
    } else {
      $(`${popup} .inputs .randomInputFields`).addClass("hidden");
    }
    $(wrapper)
      .stop(true, true)
      .css("opacity", 0)
      .removeClass("hidden")
      .animate({ opacity: 1 }, 100, () => {
        let newtext = CustomText.text.join(CustomText.delimiter);
        newtext = newtext.replace(/\n /g, "\n");
        $(`${popup} textarea`).val(newtext);
        $(`${popup} .wordcount input`).val(CustomText.word);
        $(`${popup} .time input`).val(CustomText.time);
        $(`${popup} textarea`).focus();
      });
  }
  setTimeout(() => {
    $(`${popup} textarea`).focus();
  }, 150);
}

$(`${popup} .delimiterCheck input`).change(() => {
  let delimiter;
  if ($(`${popup} .delimiterCheck input`).prop("checked")) {
    delimiter = "|";
  } else {
    delimiter = " ";
  }
  if (
    $(`${popup} textarea`).val() != CustomText.text.join(CustomText.delimiter)
  ) {
    const currentText = $(`${popup} textarea`).val() as string;
    const currentTextSplit = currentText.split(CustomText.delimiter);
    let newtext = currentTextSplit.join(delimiter);
    newtext = newtext.replace(/\n /g, "\n");
    $(`${popup} textarea`).val(newtext);
  } else {
    let newtext = CustomText.text.join(delimiter);
    newtext = newtext.replace(/\n /g, "\n");
    $(`${popup} textarea`).val(newtext);
  }
  CustomText.setDelimiter(delimiter);
});

export function hide(): void {
  if (!$(wrapper).hasClass("hidden")) {
    $(wrapper)
      .stop(true, true)
      .css("opacity", 1)
      .animate(
        {
          opacity: 0,
        },
        100,
        () => {
          $(wrapper).addClass("hidden");
        }
      );
  }
}

export function isVisible(): boolean {
  return !$(wrapper).hasClass("hidden");
}

$(wrapper).mousedown((e) => {
  if ($(e.target).attr("id") === "customTextPopupWrapper") {
    hide();
  }
});

$(`${popup} .inputs .checkbox input`).change(() => {
  if ($(`${popup} .checkbox input`).prop("checked")) {
    $(`${popup} .inputs .randomInputFields`).removeClass("hidden");
  } else {
    $(`${popup} .inputs .randomInputFields`).addClass("hidden");
  }
});

$(`${popup} textarea`).keypress((e) => {
  if (e.code === "Enter" && e.ctrlKey) {
    $(`${popup} .button.apply`).click();
  }
});

$(`${popup} .randomInputFields .wordcount input`).keypress(() => {
  $(`${popup} .randomInputFields .time input`).val("");
});

$(`${popup} .randomInputFields .time input`).keypress(() => {
  $(`${popup} .randomInputFields .wordcount input`).val("");
});

$("#customTextPopup .apply").click(() => {
  let text = ($("#customTextPopup textarea").val() as string).normalize();
  text = text.trim();
  // text = text.replace(/[\r]/gm, " ");
  text = text.replace(/\\\\t/gm, "\t");
  text = text.replace(/\\\\n/gm, "\n");
  text = text.replace(/\\t/gm, "\t");
  text = text.replace(/\\n/gm, "\n");
  text = text.replace(/ +/gm, " ");
  // text = text.replace(/(\r\n)+/g, "\r\n");
  // text = text.replace(/(\n)+/g, "\n");
  // text = text.replace(/(\r)+/g, "\r");
  text = text.replace(/( *(\r\n|\r|\n) *)/g, "\n ");
  if ($("#customTextPopup .typographyCheck input").prop("checked")) {
    text = Misc.cleanTypographySymbols(text);
  }
  // text = Misc.remove_non_ascii(text);
  text = text.replace(/[\u2060]/g, "");
  CustomText.setText(text.split(CustomText.delimiter));
  CustomText.setWord(
    parseInt($("#customTextPopup .wordcount input").val() as string)
  );
  CustomText.setTime(
    parseInt($("#customTextPopup .time input").val() as string)
  );

  CustomText.setIsWordRandom(
    $("#customTextPopup .checkbox input").prop("checked") &&
      !isNaN(CustomText.word)
  );
  CustomText.setIsTimeRandom(
    $("#customTextPopup .checkbox input").prop("checked") &&
      !isNaN(CustomText.time)
  );

  if (
    isNaN(CustomText.word) &&
    isNaN(CustomText.time) &&
    (CustomText.isTimeRandom || CustomText.isWordRandom)
  ) {
    Notifications.add(
      "You need to specify word count or time in seconds to start a random custom test.",
      0,
      5
    );
    return;
  }

  if (
    !isNaN(CustomText.word) &&
    !isNaN(CustomText.time) &&
    (CustomText.isTimeRandom || CustomText.isWordRandom)
  ) {
    Notifications.add(
      "You need to pick between word count or time in seconds to start a random custom test.",
      0,
      5
    );
    return;
  }

  if (
    (CustomText.isWordRandom && CustomText.word === 0) ||
    (CustomText.isTimeRandom && CustomText.time === 0)
  ) {
    Notifications.add(
      "Infinite words! Make sure to use Bail Out from the command line to save your result.",
      0,
      7
    );
  }

  ChallengeController.clearActive();
  ManualRestart.set();
  if (Config.mode !== "custom") UpdateConfig.setMode("custom");
  TestLogic.restart();
  hide();
});

$("#customTextPopup .wordfilter").click(() => {
  WordFilterPopup.show();
});

$(document).on("click", "#top .config .customText .text-button", () => {
  show();
});

$(document).keydown((event) => {
  if (
    event.key === "Escape" &&
    !$("#customTextPopupWrapper").hasClass("hidden")
  ) {
    hide();
    event.preventDefault();
  }
});
