import * as CustomText from "../test/custom-text";
import * as CustomTextState from "../states/custom-text-name";
import * as ManualRestart from "../test/manual-restart-tracker";
import * as TestLogic from "../test/test-logic";
import * as ChallengeController from "../controllers/challenge-controller";
import Config, * as UpdateConfig from "../config";
import * as Misc from "../utils/misc";
import * as WordFilterPopup from "./word-filter";
import * as Notifications from "../elements/notifications";
import * as SavedTextsPopup from "./saved-texts";
import * as SaveCustomTextPopup from "./save-custom-text";
import AnimatedModal, { ShowOptions } from "../utils/animated-modal";

const popup = "#customTextModal .modal";

type State = {
  textarea: string;
  lastSavedTextareaState: string;
};

const state: State = {
  textarea: CustomText.text.join(" "),
  lastSavedTextareaState: CustomText.text.join(" "),
};

function updateLongTextWarning(): void {
  if (CustomTextState.isCustomTextLong() === true) {
    $(`${popup} .longCustomTextWarning`).removeClass("hidden");
    $(`${popup} .randomWordsCheckbox input`).prop("checked", false);
    $(`${popup} .delimiterCheck input`).prop("checked", false);
    $(`${popup} .typographyCheck`).prop("checked", true);
    $(`${popup} .replaceNewlineWithSpace input`).prop("checked", false);
    $(`${popup} .inputs`).addClass("disabled");
  } else {
    $(`${popup} .longCustomTextWarning`).addClass("hidden");
    $(`${popup} .inputs`).removeClass("disabled");
  }
}

//todo: rewrite this file to use a state object instead of constantly directly accessing the DOM

async function beforeAnimation(
  modalEl: HTMLElement,
  modalChainData?: IncomingData
): Promise<void> {
  updateLongTextWarning();

  if (
    CustomText.isSectionRandom ||
    CustomText.isTimeRandom ||
    CustomText.isWordRandom
  ) {
    $(`${popup} .randomWordsCheckbox input`).prop("checked", true);
  } else {
    $(`${popup} .randomWordsCheckbox input`).prop("checked", false);
  }

  if (CustomText.delimiter === "|") {
    $(`${popup} .delimiterCheck input`).prop("checked", true);
  } else {
    $(`${popup} .delimiterCheck input`).prop("checked", false);
  }

  if ($(`${popup} .randomWordsCheckbox input`).prop("checked") as boolean) {
    $(`${popup} .inputs .randomInputFields`).removeClass("disabled");
  } else {
    $(`${popup} .inputs .randomInputFields`).addClass("disabled");
  }
  if ($(`${popup} .replaceNewlineWithSpace input`).prop("checked") as boolean) {
    $(`${popup} .inputs .replaceNewLinesButtons`).removeClass("disabled");
  } else {
    $(`${popup} .inputs .replaceNewLinesButtons`).addClass("disabled");
  }

  if (CustomTextState.isCustomTextLong()) {
    // if we are in long custom text mode, always reset the textarea state to the current text
    state.textarea = CustomText.text.join(" ");
  }

  if (modalChainData?.text !== undefined) {
    if (modalChainData.long !== true && CustomTextState.isCustomTextLong()) {
      CustomTextState.setCustomTextName("", undefined);
      Notifications.add("Disabled long custom text progress tracking", 0, {
        duration: 5,
      });
      updateLongTextWarning();
    }

    const newText =
      modalChainData.set ?? true
        ? modalChainData.text
        : state.textarea + " " + modalChainData.text;
    state.textarea = newText;
  }
  $(`${popup} textarea`).val(state.textarea);

  $(`${popup} .wordcount input`).val(
    CustomText.word === -1 ? "" : CustomText.word
  );
  $(`${popup} .time input`).val(CustomText.time === -1 ? "" : CustomText.time);
}

async function afterAnimation(): Promise<void> {
  if (!CustomTextState.isCustomTextLong()) {
    $(`${popup} textarea`).trigger("focus");
  }
}

export function show(showOptions?: ShowOptions): void {
  state.textarea = state.lastSavedTextareaState;
  void modal.show({
    ...(showOptions as ShowOptions<IncomingData>),
    beforeAnimation,
    afterAnimation,
  });
}

function hide(): void {
  void modal.hide();
}

function handleDelimiterChange(): void {
  let delimiter;
  if ($(`${popup} .delimiterCheck input`).prop("checked") as boolean) {
    delimiter = "|";

    $(`${popup} .randomInputFields .sectioncount `).removeClass("hidden");

    $(`${popup} .randomInputFields .wordcount input `).val("");
    $(`${popup} .randomInputFields .wordcount `).addClass("hidden");
  } else {
    delimiter = " ";
    $(`${popup} .randomInputFields .sectioncount input `).val("");
    $(`${popup} .randomInputFields .sectioncount `).addClass("hidden");
    $(`${popup} .randomInputFields .wordcount `).removeClass("hidden");
  }
  if (
    $(`${popup} textarea`).val() !== CustomText.text.join(CustomText.delimiter)
  ) {
    const currentText = $(`${popup} textarea`).val() as string;
    const currentTextSplit = currentText.split(CustomText.delimiter);
    let newtext = currentTextSplit.join(delimiter);
    newtext = newtext.replace(/\n /g, "\n");
    $(`${popup} textarea`).val(newtext);
    state.textarea = newtext;
  } else {
    let newtext = CustomText.text.join(delimiter);
    newtext = newtext.replace(/\n /g, "\n");
    $(`${popup} textarea`).val(newtext);
    state.textarea = newtext;
  }
  CustomText.setDelimiter(delimiter);
}

function handleFileOpen(): void {
  const file = ($(`#fileInput`)[0] as HTMLInputElement).files?.[0];
  if (file) {
    if (file.type !== "text/plain") {
      Notifications.add("File is not a text file", -1, {
        duration: 5,
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = (readerEvent): void => {
      const content = readerEvent.target?.result as string;
      $(`${popup} textarea`).val(content);
      state.textarea = content;
      $(`#fileInput`).val("");
    };
    reader.onerror = (): void => {
      Notifications.add("Failed to read file", -1, {
        duration: 5,
      });
    };
  }
}

function cleanUpText(): string[] {
  let text = state.textarea;

  if (text === "") return [];

  text = text.normalize().trim();
  // text = text.replace(/[\r]/gm, " ");

  //replace any characters that look like a space with an actual space
  text = text.replace(/[\u2000-\u200A\u202F\u205F\u00A0]/g, " ");

  //replace zero width characters
  text = text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");

  if (
    $(`${popup} .replaceControlCharacters input`).prop("checked") as boolean
  ) {
    text = text.replace(/([^\\]|^)\\t/gm, "$1\t");
    text = text.replace(/([^\\]|^)\\n/gm, "$1\n");
    text = text.replace(/\\\\t/gm, "\\t");
    text = text.replace(/\\\\n/gm, "\\n");
  }

  text = text.replace(/ +/gm, " ");
  text = text.replace(/( *(\r\n|\r|\n) *)/g, "\n ");
  if ($(`${popup} .typographyCheck input`).prop("checked") as boolean) {
    text = Misc.cleanTypographySymbols(text);
  }
  if ($(`${popup} .replaceNewlineWithSpace input`).prop("checked") as boolean) {
    let periods = true;
    if (
      $(
        $(`${popup} .replaceNewLinesButtons .button`)[0] as HTMLElement
      ).hasClass("active")
    ) {
      periods = false;
    }

    if (periods) {
      text = text.replace(/\n/gm, ". ");
      text = text.replace(/\.\. /gm, ". ");
      text = text.replace(/ +/gm, " ");
    } else {
      text = text.replace(/\n/gm, " ");
      text = text.replace(/ +/gm, " ");
    }
  }

  const words = text.split(CustomText.delimiter).filter((word) => word !== "");
  return words;
}

function apply(): void {
  if (state.textarea === "") {
    Notifications.add("Text cannot be empty", 0);
    return;
  }

  state.lastSavedTextareaState = state.textarea;

  CustomText.setText(cleanUpText());

  CustomText.setWord(
    parseInt(($(`${popup} .wordcount input`).val() as string) || "-1")
  );
  CustomText.setTime(
    parseInt(($(`${popup} .time input`).val() as string) || "-1")
  );

  CustomText.setSection(
    parseInt(($(`${popup} .sectioncount input`).val() as string) || "-1")
  );
  CustomText.setIsWordRandom(
    ($(`${popup} .randomWordsCheckbox input`).prop("checked") as boolean) &&
      CustomText.word > -1
  );
  CustomText.setIsTimeRandom(
    ($(`${popup} .randomWordsCheckbox input`).prop("checked") as boolean) &&
      CustomText.time > -1
  );
  CustomText.setIsSectionRandom(
    ($(`${popup} .randomWordsCheckbox input`).prop("checked") as boolean) &&
      CustomText.section > -1
  );
  if (
    ($(`${popup} .randomWordsCheckbox input`).prop("checked") as boolean) &&
    !CustomText.isTimeRandom &&
    !CustomText.isWordRandom &&
    !CustomText.isSectionRandom
  ) {
    Notifications.add(
      "You need to specify word count or time in seconds to start a random custom test",
      0,
      {
        duration: 5,
      }
    );
    return;
  }

  if (
    ($(`${popup} .randomWordsCheckbox input`).prop("checked") as boolean) &&
    CustomText.isTimeRandom &&
    CustomText.isWordRandom
  ) {
    Notifications.add(
      "You need to pick between word count or time in seconds to start a random custom test",
      0,
      {
        duration: 5,
      }
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
      {
        duration: 7,
      }
    );
  }

  ChallengeController.clearActive();
  ManualRestart.set();
  if (Config.mode !== "custom") UpdateConfig.setMode("custom");
  TestLogic.restart();
  hide();
}

async function setup(modalEl: HTMLElement): Promise<void> {
  modalEl
    .querySelector(".delimiterCheck input")
    ?.addEventListener("change", handleDelimiterChange);
  modalEl
    .querySelector("#fileInput")
    ?.addEventListener("change", handleFileOpen);
  modalEl
    .querySelector(".randomWordsCheckbox input")
    ?.addEventListener("change", () => {
      if ($(`${popup} .randomWordsCheckbox input`).prop("checked") as boolean) {
        $(`${popup} .inputs .randomInputFields`).removeClass("disabled");
      } else {
        $(`${popup} .inputs .randomInputFields`).addClass("disabled");
      }
    });
  modalEl
    .querySelector(".replaceNewlineWithSpace input")
    ?.addEventListener("change", () => {
      if (
        $(`${popup} .replaceNewlineWithSpace input`).prop("checked") as boolean
      ) {
        $(`${popup} .inputs .replaceNewLinesButtons`).removeClass("disabled");
      } else {
        $(`${popup} .inputs .replaceNewLinesButtons`).addClass("disabled");
      }
    });
  const replaceNewLinesButtons = modalEl.querySelectorAll(
    ".replaceNewLinesButtons .button"
  );
  for (const button of replaceNewLinesButtons) {
    button.addEventListener("click", () => {
      $(`${popup} .replaceNewLinesButtons .button`).removeClass("active");
      $(button).addClass("active");
    });
  }
  const textarea = modalEl.querySelector("textarea");
  textarea?.addEventListener("input", (e) => {
    state.textarea = (e.target as HTMLTextAreaElement).value;
  });
  textarea?.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();

    const area = e.target as HTMLTextAreaElement;
    const start: number = area.selectionStart;
    const end: number = area.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    area.value =
      area.value.substring(0, start) + "\t" + area.value.substring(end);

    // put caret at right position again
    area.selectionStart = area.selectionEnd = start + 1;

    state.textarea = area.value;
  });
  textarea?.addEventListener("keypress", (e) => {
    if (Misc.isElementVisible(`#customTextModal .longCustomTextWarning`)) {
      e.preventDefault();
      return;
    }
    if (e.code === "Enter" && e.ctrlKey) {
      $(`${popup} .button.apply`).trigger("click");
    }
    if (
      CustomTextState.isCustomTextLong() &&
      CustomTextState.getCustomTextName() !== ""
    ) {
      CustomTextState.setCustomTextName("", undefined);
      Notifications.add("Disabled long custom text progress tracking", 0, {
        duration: 5,
      });
      updateLongTextWarning();
    }
  });
  modalEl
    .querySelector(".randomInputFields .wordcount input")
    ?.addEventListener("keypress", (e) => {
      $(`${popup} .randomInputFields .time input`).val("");
      $(`${popup} .randomInputFields .sectioncount input`).val("");
    });
  modalEl
    .querySelector(".randomInputFields .time input")
    ?.addEventListener("keypress", (e) => {
      $(`${popup} .randomInputFields .wordcount input`).val("");
      $(`${popup} .randomInputFields .sectioncount input`).val("");
    });
  modalEl
    .querySelector(".randomInputFields .sectioncount input")
    ?.addEventListener("keypress", (e) => {
      $(`${popup} .randomInputFields .time input`).val("");
      $(`${popup} .randomInputFields .wordcount input`).val("");
    });
  modalEl.querySelector(".button.apply")?.addEventListener("click", () => {
    apply();
  });
  modalEl.querySelector(".button.wordfilter")?.addEventListener("click", () => {
    void WordFilterPopup.show({
      modalChain: modal as AnimatedModal<unknown, unknown>,
    });
  });
  modalEl
    .querySelector(".button.showSavedTexts")
    ?.addEventListener("click", () => {
      void SavedTextsPopup.show({
        modalChain: modal as AnimatedModal<unknown, unknown>,
      });
    });
  modalEl
    .querySelector(".button.saveCustomText")
    ?.addEventListener("click", () => {
      void SaveCustomTextPopup.show({
        modalChain: modal as AnimatedModal<unknown, unknown>,
        modalChainData: { text: cleanUpText() },
      });
    });
  modalEl
    .querySelector(".longCustomTextWarning")
    ?.addEventListener("click", () => {
      $(`#customTextModal .longCustomTextWarning`).addClass("hidden");
    });
}

type IncomingData = {
  text: string;
  set?: boolean;
  long?: boolean;
};

const modal = new AnimatedModal<IncomingData>({
  dialogId: "customTextModal",
  setup,
  customEscapeHandler: async (): Promise<void> => {
    hide();
  },
  customWrapperClickHandler: async (): Promise<void> => {
    hide();
  },
  showOptionsWhenInChain: {
    beforeAnimation,
    afterAnimation,
  },
});
