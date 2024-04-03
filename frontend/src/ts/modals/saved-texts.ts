import * as CustomText from "../test/custom-text";
import * as CustomTextState from "../states/custom-text-name";
import { escapeHTML } from "../utils/misc";
import AnimatedModal, {
  HideOptions,
  ShowOptions,
} from "../utils/animated-modal";
import { showPopup } from "./simple-modals";

async function fill(): Promise<void> {
  const names = CustomText.getCustomTextNames();
  const listEl = $(`#savedTextsModal .list`).empty();
  let list = "";
  if (names.length === 0) {
    list += "<div>No saved custom texts found</div>";
  } else {
    for (const name of names) {
      list += `<div class="savedText" data-name="${name}">
      <div class="button name">${escapeHTML(name)}</div>
      <div class="button delete">
      <i class="fas fa-fw fa-trash"></i>
      </div>
      </div>`;
    }
  }
  listEl.html(list);

  const longNames = CustomText.getCustomTextNames(true);
  const longListEl = $(`#savedTextsModal .listLong`).empty();
  let longList = "";
  if (longNames.length === 0) {
    longList += "<div>No saved long custom texts found</div>";
  } else {
    for (const name of longNames) {
      longList += `<div class="savedLongText" data-name="${name}">
      <div class="button name">${escapeHTML(name)}</div>
      <div class="button ${
        CustomText.getCustomTextLongProgress(name) <= 0 ? "disabled" : ""
      } resetProgress">reset</div>
      <div class="button delete">
      <i class="fas fa-fw fa-trash"></i>
      </div>
      </div>`;
    }
  }
  longListEl.html(longList);

  $("#savedTextsModal .list .savedText .button.delete").on("click", (e) => {
    const name = $(e.target).closest(".savedText").data("name");
    showPopup("deleteCustomText", [name], {
      modalChain: modal,
    });
  });

  $("#savedTextsModal .listLong .savedLongText .button.delete").on(
    "click",
    (e) => {
      const name = $(e.target).closest(".savedLongText").data("name");
      showPopup("deleteCustomTextLong", [name], {
        modalChain: modal,
      });
    }
  );

  $("#savedTextsModal .listLong .savedLongText .button.resetProgress").on(
    "click",
    (e) => {
      const name = $(e.target).closest(".savedLongText").data("name");
      showPopup("resetProgressCustomTextLong", [name], {
        modalChain: modal,
      });
    }
  );

  $("#savedTextsModal .list .savedText .button.name").on("click", (e) => {
    const name = $(e.target).text();
    CustomTextState.setCustomTextName(name, false);
    const text = getSavedText(name, false);
    hide({ modalChainData: { text } });
  });

  $("#savedTextsModal .listLong .savedLongText .button.name").on(
    "click",
    (e) => {
      const name = $(e.target).text();
      CustomTextState.setCustomTextName(name, true);
      const text = getSavedText(name, true);
      hide({ modalChainData: { text } });
    }
  );
}

export async function show(options: ShowOptions): Promise<void> {
  void modal.show({
    ...options,
    beforeAnimation: async () => {
      void fill();
    },
  });
}

function hide(hideOptions?: HideOptions): void {
  void modal.hide({
    ...hideOptions,
  });
}

function getSavedText(name: string, long: boolean): string {
  let text = CustomText.getCustomText(name, long);
  if (long) {
    text = text.slice(CustomText.getCustomTextLongProgress(name));
  }
  return text.join(" ");
}

async function setup(): Promise<void> {
  //
}

const modal = new AnimatedModal({
  dialogId: "savedTextsModal",
  setup,
  showOptionsWhenInChain: {
    beforeAnimation: async (): Promise<void> => {
      void fill();
    },
  },
});