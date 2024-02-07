import SettingsGroup from "../settings/settings-group";
import Config, * as UpdateConfig from "../config";
import * as Sound from "../controllers/sound-controller";
import * as Misc from "../utils/misc";
import * as DB from "../db";
import { toggleFunbox } from "../test/funbox/funbox";
import * as TagController from "../controllers/tag-controller";
import * as PresetController from "../controllers/preset-controller";
import * as ThemePicker from "../settings/theme-picker";
import * as Notifications from "../elements/notifications";
import * as ImportExportSettingsPopup from "../popups/import-export-settings-popup";
import * as ConfigEvent from "../observables/config-event";
import * as ActivePage from "../states/active-page";
import * as ApeKeysPopup from "../popups/ape-keys-popup";
import * as CookiePopup from "../popups/cookie-popup";
import Page from "./page";
import { Auth } from "../firebase";
import Ape from "../ape";
import { areFunboxesCompatible } from "../test/funbox/funbox-validation";
import { get as getTypingSpeedUnit } from "../utils/typing-speed-units";

import * as Skeleton from "../popups/skeleton";

interface SettingsGroups<T extends MonkeyTypes.ConfigValue> {
  [key: string]: SettingsGroup<T>;
}

export const groups: SettingsGroups<MonkeyTypes.ConfigValue> = {};

async function initGroups(): Promise<void> {
  await UpdateConfig.loadPromise;
  groups["smoothCaret"] = new SettingsGroup(
    "smoothCaret",
    UpdateConfig.setSmoothCaret,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["difficulty"] = new SettingsGroup(
    "difficulty",
    UpdateConfig.setDifficulty,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["quickRestart"] = new SettingsGroup(
    "quickRestart",
    UpdateConfig.setQuickRestartMode,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["showLiveWpm"] = new SettingsGroup(
    "showLiveWpm",
    UpdateConfig.setShowLiveWpm,
    "button",
    () => {
      groups["keymapMode"]?.updateInput();
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["showLiveAcc"] = new SettingsGroup(
    "showLiveAcc",
    UpdateConfig.setShowLiveAcc,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["showLiveBurst"] = new SettingsGroup(
    "showLiveBurst",
    UpdateConfig.setShowLiveBurst,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["showTimerProgress"] = new SettingsGroup(
    "showTimerProgress",
    UpdateConfig.setShowTimerProgress,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["showAverage"] = new SettingsGroup(
    "showAverage",
    UpdateConfig.setShowAverage,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["keymapMode"] = new SettingsGroup(
    "keymapMode",
    UpdateConfig.setKeymapMode,
    "button",
    () => {
      groups["showLiveWpm"]?.updateInput();
    },
    () => {
      if (Config.keymapMode === "off") {
        $(".pageSettings .section.keymapStyle").addClass("hidden");
        $(".pageSettings .section.keymapLayout").addClass("hidden");
        $(".pageSettings .section.keymapLegendStyle").addClass("hidden");
        $(".pageSettings .section.keymapShowTopRow").addClass("hidden");
      } else {
        $(".pageSettings .section.keymapStyle").removeClass("hidden");
        $(".pageSettings .section.keymapLayout").removeClass("hidden");
        $(".pageSettings .section.keymapLegendStyle").removeClass("hidden");
        $(".pageSettings .section.keymapShowTopRow").removeClass("hidden");
      }
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["keymapMatrix"] = new SettingsGroup(
    "keymapStyle",
    UpdateConfig.setKeymapStyle,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["keymapLayout"] = new SettingsGroup(
    "keymapLayout",
    UpdateConfig.setKeymapLayout,
    "select"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["keymapLegendStyle"] = new SettingsGroup(
    "keymapLegendStyle",
    UpdateConfig.setKeymapLegendStyle,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["keymapShowTopRow"] = new SettingsGroup(
    "keymapShowTopRow",
    UpdateConfig.setKeymapShowTopRow,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["showKeyTips"] = new SettingsGroup(
    "showKeyTips",
    UpdateConfig.setKeyTips,
    "button",
    undefined,
    () => {
      if (Config.showKeyTips) {
        $(".pageSettings .tip").removeClass("hidden");
      } else {
        $(".pageSettings .tip").addClass("hidden");
      }
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["freedomMode"] = new SettingsGroup(
    "freedomMode",
    UpdateConfig.setFreedomMode,
    "button",
    () => {
      groups["confidenceMode"]?.updateInput();
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["strictSpace"] = new SettingsGroup(
    "strictSpace",
    UpdateConfig.setStrictSpace,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["oppositeShiftMode"] = new SettingsGroup(
    "oppositeShiftMode",
    UpdateConfig.setOppositeShiftMode,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["confidenceMode"] = new SettingsGroup(
    "confidenceMode",
    UpdateConfig.setConfidenceMode,
    "button",
    () => {
      groups["freedomMode"]?.updateInput();
      groups["stopOnError"]?.updateInput();
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["indicateTypos"] = new SettingsGroup(
    "indicateTypos",
    UpdateConfig.setIndicateTypos,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["hideExtraLetters"] = new SettingsGroup(
    "hideExtraLetters",
    UpdateConfig.setHideExtraLetters,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["blindMode"] = new SettingsGroup(
    "blindMode",
    UpdateConfig.setBlindMode,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["quickEnd"] = new SettingsGroup(
    "quickEnd",
    UpdateConfig.setQuickEnd,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["repeatQuotes"] = new SettingsGroup(
    "repeatQuotes",
    UpdateConfig.setRepeatQuotes,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["ads"] = new SettingsGroup(
    "ads",
    UpdateConfig.setAds,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["alwaysShowWordsHistory"] = new SettingsGroup(
    "alwaysShowWordsHistory",
    UpdateConfig.setAlwaysShowWordsHistory,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["britishEnglish"] = new SettingsGroup(
    "britishEnglish",
    UpdateConfig.setBritishEnglish,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["singleListCommandLine"] = new SettingsGroup(
    "singleListCommandLine",
    UpdateConfig.setSingleListCommandLine,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["capsLockWarning"] = new SettingsGroup(
    "capsLockWarning",
    UpdateConfig.setCapsLockWarning,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["flipTestColors"] = new SettingsGroup(
    "flipTestColors",
    UpdateConfig.setFlipTestColors,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["showOutOfFocusWarning"] = new SettingsGroup(
    "showOutOfFocusWarning",
    UpdateConfig.setShowOutOfFocusWarning,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["colorfulMode"] = new SettingsGroup(
    "colorfulMode",
    UpdateConfig.setColorfulMode,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["startGraphsAtZero"] = new SettingsGroup(
    "startGraphsAtZero",
    UpdateConfig.setStartGraphsAtZero,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["autoSwitchTheme"] = new SettingsGroup(
    "autoSwitchTheme",
    UpdateConfig.setAutoSwitchTheme,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["randomTheme"] = new SettingsGroup(
    "randomTheme",
    UpdateConfig.setRandomTheme,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["stopOnError"] = new SettingsGroup(
    "stopOnError",
    UpdateConfig.setStopOnError,
    "button",
    () => {
      groups["confidenceMode"]?.updateInput();
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["soundVolume"] = new SettingsGroup(
    "soundVolume",
    UpdateConfig.setSoundVolume,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["playSoundOnError"] = new SettingsGroup(
    "playSoundOnError",
    UpdateConfig.setPlaySoundOnError,
    "button",
    () => {
      if (Config.playSoundOnError !== "off") Sound.playError();
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["playSoundOnClick"] = new SettingsGroup(
    "playSoundOnClick",
    UpdateConfig.setPlaySoundOnClick,
    "button",
    () => {
      if (Config.playSoundOnClick !== "off") Sound.playClick("KeyQ");
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["showAllLines"] = new SettingsGroup(
    "showAllLines",
    UpdateConfig.setShowAllLines,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["paceCaret"] = new SettingsGroup(
    "paceCaret",
    UpdateConfig.setPaceCaret,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["repeatedPace"] = new SettingsGroup(
    "repeatedPace",
    UpdateConfig.setRepeatedPace,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["minWpm"] = new SettingsGroup(
    "minWpm",
    UpdateConfig.setMinWpm,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["minAcc"] = new SettingsGroup(
    "minAcc",
    UpdateConfig.setMinAcc,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["minBurst"] = new SettingsGroup(
    "minBurst",
    UpdateConfig.setMinBurst,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["smoothLineScroll"] = new SettingsGroup(
    "smoothLineScroll",
    UpdateConfig.setSmoothLineScroll,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["lazyMode"] = new SettingsGroup(
    "lazyMode",
    UpdateConfig.setLazyMode,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["layout"] = new SettingsGroup(
    "layout",
    UpdateConfig.setLayout,
    "select"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["language"] = new SettingsGroup(
    "language",
    UpdateConfig.setLanguage,
    "select"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["fontSize"] = new SettingsGroup(
    "fontSize",
    UpdateConfig.setFontSize,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["pageWidth"] = new SettingsGroup(
    "pageWidth",
    UpdateConfig.setPageWidth,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["caretStyle"] = new SettingsGroup(
    "caretStyle",
    UpdateConfig.setCaretStyle,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["paceCaretStyle"] = new SettingsGroup(
    "paceCaretStyle",
    UpdateConfig.setPaceCaretStyle,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["timerStyle"] = new SettingsGroup(
    "timerStyle",
    UpdateConfig.setTimerStyle,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["highlightMode"] = new SettingsGroup(
    "highlightMode",
    UpdateConfig.setHighlightMode,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["tapeMode"] = new SettingsGroup(
    "tapeMode",
    UpdateConfig.setTapeMode,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["timerOpacity"] = new SettingsGroup(
    "timerOpacity",
    UpdateConfig.setTimerOpacity,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["timerColor"] = new SettingsGroup(
    "timerColor",
    UpdateConfig.setTimerColor,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["fontFamily"] = new SettingsGroup(
    "fontFamily",
    UpdateConfig.setFontFamily,
    "button",
    undefined,
    () => {
      const customButton = $(
        ".pageSettings .section.fontFamily .buttons .custom"
      );
      if (
        $(".pageSettings .section.fontFamily .buttons .active").length === 0
      ) {
        customButton.addClass("active");
        customButton.text(`Custom (${Config.fontFamily.replace(/_/g, " ")})`);
      } else {
        customButton.text("Custom");
      }
    }
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["alwaysShowDecimalPlaces"] = new SettingsGroup(
    "alwaysShowDecimalPlaces",
    UpdateConfig.setAlwaysShowDecimalPlaces,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["typingSpeedUnit"] = new SettingsGroup(
    "typingSpeedUnit",
    UpdateConfig.setTypingSpeedUnit,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  groups["customBackgroundSize"] = new SettingsGroup(
    "customBackgroundSize",
    UpdateConfig.setCustomBackgroundSize,
    "button"
  ) as SettingsGroup<MonkeyTypes.ConfigValue>;
  // groups.customLayoutfluid = new SettingsGroup(
  //   "customLayoutfluid",
  //   UpdateConfig.setCustomLayoutfluid
  // );
}

function reset(): void {
  $(".pageSettings .section.themes .favThemes.buttons").empty();
  $(".pageSettings .section.themes .allThemes.buttons").empty();
  $(".pageSettings .section.themes .allCustomThemes.buttons").empty();
  $(".pageSettings .section.languageGroups .buttons").empty();
  $(".pageSettings select").empty().select2("destroy");
  $(".pageSettings .section.funbox .buttons").empty();
  $(".pageSettings .section.fontFamily .buttons").empty();
}

let groupsInitialized = false;
async function fillSettingsPage(): Promise<void> {
  if (Config.showKeyTips) {
    $(".pageSettings .tip").removeClass("hidden");
  } else {
    $(".pageSettings .tip").addClass("hidden");
  }

  // Language Selection Combobox
  const languageEl = document.querySelector(
    ".pageSettings .section.language select"
  ) as HTMLSelectElement;
  languageEl.innerHTML = "";
  let languageElHTML = "";

  let languageGroups;
  try {
    languageGroups = await Misc.getLanguageGroups();
  } catch (e) {
    console.error(
      Misc.createErrorMessage(
        e,
        "Failed to initialize settings language picker"
      )
    );
  }

  if (languageGroups) {
    for (const group of languageGroups) {
      let langComboBox = `<optgroup label="${group.name}">`;
      group.languages.forEach((language: string) => {
        langComboBox += `<option value="${language}">
        ${Misc.getLanguageDisplayString(language)}
      </option>`;
      });
      langComboBox += `</optgroup>`;
      languageElHTML += langComboBox;
    }
    languageEl.innerHTML = languageElHTML;
  }
  $(languageEl).select2({
    width: "100%",
  });

  await Misc.sleep(0);

  const layoutEl = document.querySelector(
    ".pageSettings .section.layout select"
  ) as HTMLSelectElement;
  layoutEl.innerHTML = `<option value='default'>off</option>`;
  let layoutElHTML = "";

  const keymapEl = document.querySelector(
    ".pageSettings .section.keymapLayout select"
  ) as HTMLSelectElement;
  keymapEl.innerHTML = `<option value='overrideSync'>emulator sync</option>`;
  let keymapElHTML = "";

  let layoutsList;
  try {
    layoutsList = await Misc.getLayoutsList();
  } catch (e) {
    console.error(Misc.createErrorMessage(e, "Failed to refresh keymap"));
  }

  if (layoutsList) {
    for (const layout of Object.keys(layoutsList)) {
      if (layout.toString() !== "korean") {
        layoutElHTML += `<option value='${layout}'>${layout.replace(
          /_/g,
          " "
        )}</option>`;
      }
      if (layout.toString() !== "default") {
        keymapElHTML += `<option value='${layout}'>${layout.replace(
          /_/g,
          " "
        )}</option>`;
      }
    }
    layoutEl.innerHTML += layoutElHTML;
    keymapEl.innerHTML += keymapElHTML;
  }
  $(layoutEl).select2({
    width: "100%",
  });
  $(keymapEl).select2({
    width: "100%",
  });

  await Misc.sleep(0);

  const themeEl1 = document.querySelector(
    ".pageSettings .section.autoSwitchThemeInputs select.light"
  ) as HTMLSelectElement;
  themeEl1.innerHTML = "";
  let themeEl1HTML = "";

  const themeEl2 = document.querySelector(
    ".pageSettings .section.autoSwitchThemeInputs select.dark"
  ) as HTMLSelectElement;
  themeEl2.innerHTML = "";
  let themeEl2HTML = "";

  let themes;
  try {
    themes = await Misc.getThemesList();
  } catch (e) {
    console.error(
      Misc.createErrorMessage(e, "Failed to load themes into dropdown boxes")
    );
  }

  if (themes) {
    for (const theme of themes) {
      themeEl1HTML += `<option value='${theme.name}'>${theme.name.replace(
        /_/g,
        " "
      )}</option>`;
      themeEl2HTML += `<option value='${theme.name}'>${theme.name.replace(
        /_/g,
        " "
      )}</option>`;
    }
    themeEl1.innerHTML = themeEl1HTML;
    themeEl2.innerHTML = themeEl2HTML;
  }
  $(themeEl1).select2({
    width: "100%",
  });
  $(themeEl2).select2({
    width: "100%",
  });

  await Misc.sleep(0);

  $(`.pageSettings .section.autoSwitchThemeInputs select.light`)
    .val(Config.themeLight)
    .trigger("change.select2");
  $(`.pageSettings .section.autoSwitchThemeInputs select.dark`)
    .val(Config.themeDark)
    .trigger("change.select2");

  const funboxEl = document.querySelector(
    ".pageSettings .section.funbox .buttons"
  ) as HTMLDivElement;
  funboxEl.innerHTML = `<div class="funbox button" funbox='none'>none</div>`;
  let funboxElHTML = "";

  let funboxList;
  try {
    funboxList = await Misc.getFunboxList();
  } catch (e) {
    console.error(Misc.createErrorMessage(e, "Failed to get funbox list"));
  }

  if (funboxList) {
    for (const funbox of funboxList) {
      if (funbox.name === "mirror") {
        funboxElHTML += `<div class="funbox button" funbox='${
          funbox.name
        }' aria-label="${
          funbox.info
        }" data-balloon-pos="up" data-balloon-length="fit" style="transform:scaleX(-1);">${funbox.name.replace(
          /_/g,
          " "
        )}</div>`;
      } else if (funbox.name === "upside_down") {
        funboxElHTML += `<div class="funbox button" funbox='${
          funbox.name
        }' aria-label="${
          funbox.info
        }" data-balloon-pos="up" data-balloon-length="fit" style="transform:scaleX(-1) scaleY(-1);">${funbox.name.replace(
          /_/g,
          " "
        )}</div>`;
      } else {
        funboxElHTML += `<div class="funbox button" funbox='${
          funbox.name
        }' aria-label="${
          funbox.info
        }" data-balloon-pos="up" data-balloon-length="fit">${funbox.name.replace(
          /_/g,
          " "
        )}</div>`;
      }
    }
    funboxEl.innerHTML = funboxElHTML;
  }

  await Misc.sleep(0);

  let isCustomFont = true;
  const fontsEl = document.querySelector(
    ".pageSettings .section.fontFamily .buttons"
  ) as HTMLDivElement;
  fontsEl.innerHTML = "";

  let fontsElHTML = "";

  let fontsList;
  try {
    fontsList = await Misc.getFontsList();
  } catch (e) {
    console.error(
      Misc.createErrorMessage(e, "Failed to update fonts settings buttons")
    );
  }

  if (fontsList) {
    for (const font of fontsList) {
      if (Config.fontFamily === font.name) isCustomFont = false;
      fontsElHTML += `<div class="button${
        Config.fontFamily === font.name ? " active" : ""
      }" style="font-family:${
        font.display !== undefined ? font.display : font.name
      }" fontFamily="${font.name.replace(/ /g, "_")}" tabindex="0"
        onclick="this.blur();">${
          font.display !== undefined ? font.display : font.name
        }</div>`;
    }

    fontsElHTML += isCustomFont
      ? `<div class="button no-auto-handle custom active" onclick="this.blur();">Custom (${Config.fontFamily.replace(
          /_/g,
          " "
        )})</div>`
      : '<div class="button no-auto-handle custom" onclick="this.blur();">Custom</div>';

    fontsEl.innerHTML = fontsElHTML;
  }

  $(".pageSettings .section.customBackgroundSize input").val(
    Config.customBackground
  );

  $(".pageSettings .section.fontSize input").val(Config.fontSize);

  $(".pageSettings .section.customLayoutfluid input").val(
    Config.customLayoutfluid.replace(/#/g, " ")
  );

  await Misc.sleep(0);
  setEventDisabled(true);
  if (!groupsInitialized) {
    await initGroups();
    groupsInitialized = true;
  } else {
    for (const groupKey of Object.keys(groups)) {
      groups[groupKey]?.updateInput();
    }
  }
  setEventDisabled(false);
  await Misc.sleep(0);
  await ThemePicker.refreshButtons();
  await UpdateConfig.loadPromise;
}

// export let settingsFillPromise = fillSettingsPage();

export function hideAccountSection(): void {
  $(`.sectionGroupTitle[group='account']`).addClass("hidden");
  $(`.settingsGroup.account`).addClass("hidden");
  $(`.pageSettings .section.needsAccount`).addClass("hidden");
  $(".pageSettings .quickNav .accountTitleLink").addClass("hidden");
}

function showAccountSection(): void {
  $(`.sectionGroupTitle[group='account']`).removeClass("hidden");
  $(`.settingsGroup.account`).removeClass("hidden");
  $(`.pageSettings .section.needsAccount`).removeClass("hidden");
  $(".pageSettings .quickNav .accountTitleLink").removeClass("hidden");
  refreshTagsSettingsSection();
  refreshPresetsSettingsSection();
  updateDiscordSection();

  if (DB.getSnapshot()?.lbOptOut === true) {
    $(".pageSettings .section.optOutOfLeaderboards").remove();
  }
}

export function updateDiscordSection(): void {
  //no code and no discord
  if (!Auth?.currentUser) {
    $(".pageSettings .section.discordIntegration").addClass("hidden");
  } else {
    if (!DB.getSnapshot()) return;
    $(".pageSettings .section.discordIntegration").removeClass("hidden");

    if (DB.getSnapshot()?.discordId === undefined) {
      //show button
      $(".pageSettings .section.discordIntegration .buttons").removeClass(
        "hidden"
      );
      $(".pageSettings .section.discordIntegration .info").addClass("hidden");
    } else {
      $(".pageSettings .section.discordIntegration .buttons").addClass(
        "hidden"
      );
      $(".pageSettings .section.discordIntegration .info").removeClass(
        "hidden"
      );
    }
  }
}

export function updateAuthSections(): void {
  $(".pageSettings .section.passwordAuthSettings .button").addClass("hidden");
  $(".pageSettings .section.googleAuthSettings .button").addClass("hidden");

  const user = Auth?.currentUser;
  if (!user) return;

  const passwordProvider = user.providerData.find(
    (provider) => provider.providerId === "password"
  );
  const googleProvider = user.providerData.find(
    (provider) => provider.providerId === "google.com"
  );

  if (passwordProvider) {
    $(
      ".pageSettings .section.passwordAuthSettings #emailPasswordAuth"
    ).removeClass("hidden");
    $(
      ".pageSettings .section.passwordAuthSettings #passPasswordAuth"
    ).removeClass("hidden");
  } else {
    $(
      ".pageSettings .section.passwordAuthSettings #addPasswordAuth"
    ).removeClass("hidden");
  }

  if (googleProvider) {
    $(
      ".pageSettings .section.googleAuthSettings #removeGoogleAuth"
    ).removeClass("hidden");
    if (passwordProvider) {
      $(
        ".pageSettings .section.googleAuthSettings #removeGoogleAuth"
      ).removeClass("disabled");
    } else {
      $(".pageSettings .section.googleAuthSettings #removeGoogleAuth").addClass(
        "disabled"
      );
    }
  } else {
    $(".pageSettings .section.googleAuthSettings #addGoogleAuth").removeClass(
      "hidden"
    );
  }
}

function setActiveFunboxButton(): void {
  $(`.pageSettings .section.funbox .button`).removeClass("active");
  $(`.pageSettings .section.funbox .button`).removeClass("disabled");
  Misc.getFunboxList()
    .then((funboxModes) => {
      funboxModes.forEach((funbox) => {
        if (
          !areFunboxesCompatible(Config.funbox, funbox.name) &&
          !Config.funbox.split("#").includes(funbox.name)
        ) {
          $(
            `.pageSettings .section.funbox .button[funbox='${funbox.name}']`
          ).addClass("disabled");
        }
      });
    })
    .catch((e) => {
      Notifications.add(`Failed to update funbox buttons: ${e.message}`, -1);
    });
  Config.funbox.split("#").forEach((funbox) => {
    $(`.pageSettings .section.funbox .button[funbox='${funbox}']`).addClass(
      "active"
    );
  });
}

function refreshTagsSettingsSection(): void {
  if (Auth?.currentUser && DB.getSnapshot()) {
    const tagsEl = $(".pageSettings .section.tags .tagsList").empty();
    DB.getSnapshot()?.tags?.forEach((tag) => {
      // let tagPbString = "No PB found";
      // if (tag.pb !== undefined && tag.pb > 0) {
      //   tagPbString = `PB: ${tag.pb}`;
      // }
      tagsEl.append(`

      <div class="buttons tag" data-id="${tag._id}" data-name="${
        tag.name
      }" data-display="${tag.display}">
        <button class="tagButton ${tag.active ? "active" : ""}" active="${
        tag.active
      }">
          ${tag.display}
        </button>
        <button class="clearPbButton">
          <i class="fas fa-crown fa-fw"></i>
        </button>
        <button class="editButton">
          <i class="fas fa-pen fa-fw"></i>
        </button>
        <button class="removeButton">
          <i class="fas fa-trash fa-fw"></i>
        </button>
      </div>

      `);
    });
    $(".pageSettings .section.tags").removeClass("hidden");
  } else {
    $(".pageSettings .section.tags").addClass("hidden");
  }
}

function refreshPresetsSettingsSection(): void {
  if (Auth?.currentUser && DB.getSnapshot()) {
    const presetsEl = $(".pageSettings .section.presets .presetsList").empty();
    DB.getSnapshot()?.presets?.forEach((preset: MonkeyTypes.Preset) => {
      presetsEl.append(`
      <div class="buttons preset" data-id="${preset._id}" data-name="${preset.name}" data-display="${preset.display}">
        <button class="presetButton">${preset.display}</button>
        <button class="editButton">
          <i class="fas fa-pen fa-fw"></i>
        </button>
        <button class="removeButton">
          <i class="fas fa-trash fa-fw"></i>
        </button>
      </div>
      
      `);
    });
    $(".pageSettings .section.presets").removeClass("hidden");
  } else {
    $(".pageSettings .section.presets").addClass("hidden");
  }
}

export async function update(groupUpdate = true): Promise<void> {
  // Object.keys(groups).forEach((group) => {
  if (groupUpdate) {
    for (const group of Object.keys(groups)) {
      groups[group]?.updateInput();
    }
  }

  refreshTagsSettingsSection();
  refreshPresetsSettingsSection();
  // LanguagePicker.setActiveGroup(); Shifted from grouped btns to combo-box
  setActiveFunboxButton();
  updateDiscordSection();
  updateAuthSections();
  await Misc.sleep(0);
  ThemePicker.updateActiveTab(true);
  ThemePicker.setCustomInputs(true);
  // ThemePicker.updateActiveButton();

  $(".pageSettings .section.paceCaret input.customPaceCaretSpeed").val(
    getTypingSpeedUnit(Config.typingSpeedUnit).fromWpm(
      Config.paceCaretCustomSpeed
    )
  );

  $(".pageSettings .section.minWpm input.customMinWpmSpeed").val(
    getTypingSpeedUnit(Config.typingSpeedUnit).fromWpm(Config.minWpmCustomSpeed)
  );
  $(".pageSettings .section.minAcc input.customMinAcc").val(
    Config.minAccCustom
  );
  $(".pageSettings .section.minBurst input.customMinBurst").val(
    getTypingSpeedUnit(Config.typingSpeedUnit).fromWpm(
      Config.minBurstCustomSpeed
    )
  );

  if (Config.autoSwitchTheme) {
    $(".pageSettings .section.autoSwitchThemeInputs").removeClass("hidden");
  } else {
    $(".pageSettings .section.autoSwitchThemeInputs").addClass("hidden");
  }

  if (Config.customBackground !== "") {
    $(".pageSettings .section.customBackgroundFilter").removeClass("hidden");
  } else {
    $(".pageSettings .section.customBackgroundFilter").addClass("hidden");
  }

  if (Auth?.currentUser) {
    showAccountSection();
  } else {
    hideAccountSection();
  }

  const modifierKey = window.navigator.userAgent.toLowerCase().includes("mac")
    ? "cmd"
    : "ctrl";
  if (Config.quickRestart === "esc") {
    $(".pageSettings .tip").html(`
    tip: You can also change all these settings quickly using the
    command line (<key>${modifierKey}</key>+<key>shift</key>+<key>p</key>)`);
  } else {
    $(".pageSettings .tip").html(`
    tip: You can also change all these settings quickly using the
    command line (<key>esc</key> or <key>${modifierKey}</key>+<key>shift</key>+<key>p</key>)`);
  }
}

function toggleSettingsGroup(groupName: string): void {
  const groupEl = $(`.pageSettings .settingsGroup.${groupName}`);
  groupEl.stop(true, true).slideToggle(250).toggleClass("slideup");
  if (groupEl.hasClass("slideup")) {
    $(`.pageSettings .sectionGroupTitle[group=${groupName}]`).addClass(
      "rotateIcon"
    );
  } else {
    $(`.pageSettings .sectionGroupTitle[group=${groupName}]`).removeClass(
      "rotateIcon"
    );
  }
}

$(".pageSettings .section.paceCaret").on(
  "focusout",
  "input.customPaceCaretSpeed",
  () => {
    const inputValue = parseInt(
      $(
        ".pageSettings .section.paceCaret input.customPaceCaretSpeed"
      ).val() as string
    );
    const newConfigValue = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
      inputValue
    );
    UpdateConfig.setPaceCaretCustomSpeed(newConfigValue);
  }
);

$(".pageSettings .section.paceCaret").on("click", ".button.save", () => {
  const inputValue = parseInt(
    $(
      ".pageSettings .section.paceCaret input.customPaceCaretSpeed"
    ).val() as string
  );
  const newConfigValue = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
    inputValue
  );
  UpdateConfig.setPaceCaretCustomSpeed(newConfigValue);
});

$(".pageSettings .section.minWpm").on(
  "focusout",
  "input.customMinWpmSpeed",
  () => {
    const inputValue = parseInt(
      $(".pageSettings .section.minWpm input.customMinWpmSpeed").val() as string
    );
    const newConfigValue = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
      inputValue
    );
    UpdateConfig.setMinWpmCustomSpeed(newConfigValue);
  }
);

$(".pageSettings .section.minWpm").on("click", ".button.save", () => {
  const inputValue = parseInt(
    $(".pageSettings .section.minWpm input.customMinWpmSpeed").val() as string
  );
  const newConfigValue = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
    inputValue
  );
  UpdateConfig.setMinWpmCustomSpeed(newConfigValue);
});

$(".pageSettings .section.minAcc").on("focusout", "input.customMinAcc", () => {
  UpdateConfig.setMinAccCustom(
    parseInt(
      $(".pageSettings .section.minAcc input.customMinAcc").val() as string
    )
  );
});

$(".pageSettings .section.minAcc").on("click", ".button.save", () => {
  UpdateConfig.setMinAccCustom(
    parseInt(
      $(".pageSettings .section.minAcc input.customMinAcc").val() as string
    )
  );
});

$(".pageSettings .section.minBurst").on(
  "focusout",
  "input.customMinBurst",
  () => {
    const inputValue = parseInt(
      $(".pageSettings .section.minBurst input.customMinBurst").val() as string
    );
    const newConfigValue = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
      inputValue
    );
    UpdateConfig.setMinBurstCustomSpeed(newConfigValue);
  }
);

$(".pageSettings .section.minBurst").on("click", ".button.save", () => {
  const inputValue = parseInt(
    $(".pageSettings .section.minBurst input.customMinBurst").val() as string
  );
  const newConfigValue = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
    inputValue
  );
  UpdateConfig.setMinBurstCustomSpeed(newConfigValue);
});

//funbox
$(".pageSettings .section.funbox").on("click", ".button", (e) => {
  const funbox = <string>$(e.currentTarget).attr("funbox");
  toggleFunbox(funbox);
  setActiveFunboxButton();
});

//tags
$(".pageSettings .section.tags").on(
  "click",
  ".tagsList .tag .tagButton",
  (e) => {
    const target = e.currentTarget;
    const tagid = $(target).parent(".tag").attr("data-id") as string;
    TagController.toggle(tagid);
    $(target).toggleClass("active");
  }
);

$(".pageSettings .section.presets").on(
  "click",
  ".presetsList .preset .presetButton",
  (e) => {
    const target = e.currentTarget;
    const presetid = $(target).parent(".preset").attr("data-id") as string;
    console.log("Applying Preset");
    configEventDisabled = true;
    PresetController.apply(presetid);
    configEventDisabled = false;
    void update();
  }
);

$("#importSettingsButton").on("click", () => {
  ImportExportSettingsPopup.show("import");
});

$("#exportSettingsButton").on("click", () => {
  const configJSON = JSON.stringify(Config);
  navigator.clipboard.writeText(configJSON).then(
    function () {
      Notifications.add("JSON Copied to clipboard", 0);
    },
    function () {
      ImportExportSettingsPopup.show("export");
    }
  );
});

$(".pageSettings .sectionGroupTitle").on("click", (e) => {
  toggleSettingsGroup($(e.currentTarget).attr("group") as string);
});

$(".pageSettings .section.apeKeys #showApeKeysPopup").on("click", () => {
  void ApeKeysPopup.show();
});

$(".pageSettings .section.customBackgroundSize .inputAndButton .save").on(
  "click",
  () => {
    UpdateConfig.setCustomBackground(
      $(
        ".pageSettings .section.customBackgroundSize .inputAndButton input"
      ).val() as string
    );
  }
);

$(".pageSettings .section.customBackgroundSize .inputAndButton input").on(
  "keypress",
  (e) => {
    if (e.key === "Enter") {
      UpdateConfig.setCustomBackground(
        $(
          ".pageSettings .section.customBackgroundSize .inputAndButton input"
        ).val() as string
      );
    }
  }
);

$(".pageSettings .section.fontSize .inputAndButton .save").on("click", () => {
  const didConfigSave = UpdateConfig.setFontSize(
    parseFloat(
      $(".pageSettings .section.fontSize .inputAndButton input").val() as string
    )
  );
  if (didConfigSave) {
    Notifications.add("Saved", 1, {
      duration: 1,
    });
  }
});

$(".pageSettings .section.fontSize .inputAndButton input").on(
  "keypress",
  (e) => {
    if (e.key === "Enter") {
      const didConfigSave = UpdateConfig.setFontSize(
        parseFloat(
          $(
            ".pageSettings .section.fontSize .inputAndButton input"
          ).val() as string
        )
      );
      if (didConfigSave === true) {
        Notifications.add("Saved", 1, {
          duration: 1,
        });
      }
    }
  }
);

$(".pageSettings .section.customLayoutfluid .inputAndButton .save").on(
  "click",
  () => {
    void UpdateConfig.setCustomLayoutfluid(
      $(
        ".pageSettings .section.customLayoutfluid .inputAndButton input"
      ).val() as MonkeyTypes.CustomLayoutFluidSpaces
    ).then((bool) => {
      if (bool) {
        Notifications.add("Custom layoutfluid saved", 1);
      }
    });
  }
);

$(".pageSettings .section.customLayoutfluid .inputAndButton .input").on(
  "keypress",
  (e) => {
    if (e.key === "Enter") {
      void UpdateConfig.setCustomLayoutfluid(
        $(
          ".pageSettings .section.customLayoutfluid .inputAndButton input"
        ).val() as MonkeyTypes.CustomLayoutFluidSpaces
      ).then((bool) => {
        if (bool) {
          Notifications.add("Custom layoutfluid saved", 1);
        }
      });
    }
  }
);

$(".pageSettings .quickNav .links a").on("click", (e) => {
  const settingsGroup = e.target.innerText;
  const isOpen = $(`.pageSettings .settingsGroup.${settingsGroup}`).hasClass(
    "slideup"
  );
  isOpen && toggleSettingsGroup(settingsGroup);
});

$(".pageSettings .section.updateCookiePreferences .button").on("click", () => {
  CookiePopup.show();
  CookiePopup.showSettings();
});

$(".pageSettings .section.autoSwitchThemeInputs").on(
  "change",
  `select.light`,
  (e) => {
    const target = $(e.currentTarget);
    if (target.hasClass("disabled") || target.hasClass("no-auto-handle")) {
      return;
    }
    UpdateConfig.setThemeLight(target.val() as string);
  }
);

$(".pageSettings .section.autoSwitchThemeInputs").on(
  "change",
  `select.dark`,
  (e) => {
    const target = $(e.currentTarget);
    if (target.hasClass("disabled") || target.hasClass("no-auto-handle")) {
      return;
    }
    UpdateConfig.setThemeDark(target.val() as string);
  }
);

$(".pageSettings .section.discordIntegration .getLinkAndGoToOauth").on(
  "click",
  () => {
    void Ape.users.getOauthLink().then((res) => {
      window.open(res.data.url, "_self");
    });
  }
);

let configEventDisabled = false;
export function setEventDisabled(value: boolean): void {
  configEventDisabled = value;
}
ConfigEvent.subscribe((eventKey) => {
  if (eventKey === "fullConfigChange") setEventDisabled(true);
  if (eventKey === "fullConfigChangeFinished") {
    setEventDisabled(false);
  }
  if (configEventDisabled || eventKey === "saveToLocalStorage") return;
  if (ActivePage.get() === "settings" && eventKey !== "theme") {
    void update();
  }
});

export const page = new Page(
  "settings",
  $(".page.pageSettings"),
  "/settings",
  async () => {
    //
  },
  async () => {
    Skeleton.remove("pageSettings");
    reset();
  },
  async () => {
    Skeleton.append("pageSettings", "main");
    await fillSettingsPage();
    await update(false);
  },
  async () => {
    //
  }
);

$(() => {
  Skeleton.save("pageSettings");
});
