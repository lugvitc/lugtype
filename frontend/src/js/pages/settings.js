import SettingsGroup from "../settings/settings-group";
import Config, * as UpdateConfig from "../config";
import * as Sound from "../controllers/sound-controller";
import * as Misc from "../misc";
import layouts from "../test/layouts";
import * as LanguagePicker from "../settings/language-picker";
import * as Notifications from "../elements/notifications";
import * as DB from "../db";
import * as Funbox from "../test/funbox";
import * as TagController from "../controllers/tag-controller";
import * as PresetController from "../controllers/preset-controller";
import * as SimplePopups from "../popups/simple-popups";
import * as EditTagsPopup from "../popups/edit-tags-popup";
import * as EditPresetPopup from "../popups/edit-preset-popup";
import * as ThemePicker from "../settings/theme-picker";
import * as ImportExportSettingsPopup from "../popups/import-export-settings-popup";
import * as CustomThemePopup from "../popups/custom-theme-popup";
import * as AccountController from "../controllers/account-controller";

export let groups = {};
async function initGroups() {
  await UpdateConfig.loadPromise;
  groups.smoothCaret = new SettingsGroup(
    "smoothCaret",
    UpdateConfig.setSmoothCaret
  );
  groups.difficulty = new SettingsGroup(
    "difficulty",
    UpdateConfig.setDifficulty
  );
  groups.quickTab = new SettingsGroup("quickTab", UpdateConfig.setQuickTabMode);
  groups.showLiveWpm = new SettingsGroup(
    "showLiveWpm",
    UpdateConfig.setShowLiveWpm,
    () => {
      groups.keymapMode.updateButton();
    }
  );
  groups.showLiveAcc = new SettingsGroup(
    "showLiveAcc",
    UpdateConfig.setShowLiveAcc
  );
  groups.showLiveBurst = new SettingsGroup(
    "showLiveBurst",
    UpdateConfig.setShowLiveBurst
  );
  groups.showTimerProgress = new SettingsGroup(
    "showTimerProgress",
    UpdateConfig.setShowTimerProgress
  );
  groups.keymapMode = new SettingsGroup(
    "keymapMode",
    UpdateConfig.setKeymapMode,
    () => {
      groups.showLiveWpm.updateButton();
    },
    () => {
      if (Config.keymapMode === "off") {
        $(".pageSettings .section.keymapStyle").addClass("hidden");
        $(".pageSettings .section.keymapLayout").addClass("hidden");
        $(".pageSettings .section.keymapLegendStyle").addClass("hidden");
      } else {
        $(".pageSettings .section.keymapStyle").removeClass("hidden");
        $(".pageSettings .section.keymapLayout").removeClass("hidden");
        $(".pageSettings .section.keymapLegendStyle").removeClass("hidden");
      }
    }
  );
  groups.keymapMatrix = new SettingsGroup(
    "keymapStyle",
    UpdateConfig.setKeymapStyle
  );
  groups.keymapLayout = new SettingsGroup(
    "keymapLayout",
    UpdateConfig.setKeymapLayout
  );
  groups.keymapLegendStyle = new SettingsGroup(
    "keymapLegendStyle",
    UpdateConfig.setKeymapLegendStyle
  );
  groups.showKeyTips = new SettingsGroup(
    "showKeyTips",
    UpdateConfig.setKeyTips,
    null,
    () => {
      if (Config.showKeyTips) {
        $(".pageSettings .tip").removeClass("hidden");
      } else {
        $(".pageSettings .tip").addClass("hidden");
      }
    }
  );
  groups.freedomMode = new SettingsGroup(
    "freedomMode",
    UpdateConfig.setFreedomMode,
    () => {
      groups.confidenceMode.updateButton();
    }
  );
  groups.strictSpace = new SettingsGroup(
    "strictSpace",
    UpdateConfig.setStrictSpace
  );
  groups.oppositeShiftMode = new SettingsGroup(
    "oppositeShiftMode",
    UpdateConfig.setOppositeShiftMode
  );
  groups.confidenceMode = new SettingsGroup(
    "confidenceMode",
    UpdateConfig.setConfidenceMode,
    () => {
      groups.freedomMode.updateButton();
      groups.stopOnError.updateButton();
    }
  );
  groups.indicateTypos = new SettingsGroup(
    "indicateTypos",
    UpdateConfig.setIndicateTypos
  );
  groups.hideExtraLetters = new SettingsGroup(
    "hideExtraLetters",
    UpdateConfig.setHideExtraLetters
  );
  groups.blindMode = new SettingsGroup("blindMode", UpdateConfig.setBlindMode);
  groups.quickEnd = new SettingsGroup("quickEnd", UpdateConfig.setQuickEnd);
  groups.repeatQuotes = new SettingsGroup(
    "repeatQuotes",
    UpdateConfig.setRepeatQuotes
  );
  groups.enableAds = new SettingsGroup("enableAds", UpdateConfig.setEnableAds);
  groups.alwaysShowWordsHistory = new SettingsGroup(
    "alwaysShowWordsHistory",
    UpdateConfig.setAlwaysShowWordsHistory
  );
  groups.britishEnglish = new SettingsGroup(
    "britishEnglish",
    UpdateConfig.setBritishEnglish
  );
  groups.singleListCommandLine = new SettingsGroup(
    "singleListCommandLine",
    UpdateConfig.setSingleListCommandLine
  );
  groups.capsLockWarning = new SettingsGroup(
    "capsLockWarning",
    UpdateConfig.setCapsLockWarning
  );
  groups.flipTestColors = new SettingsGroup(
    "flipTestColors",
    UpdateConfig.setFlipTestColors
  );
  groups.swapEscAndTab = new SettingsGroup(
    "swapEscAndTab",
    UpdateConfig.setSwapEscAndTab
  );
  groups.showOutOfFocusWarning = new SettingsGroup(
    "showOutOfFocusWarning",
    UpdateConfig.setShowOutOfFocusWarning
  );
  groups.colorfulMode = new SettingsGroup(
    "colorfulMode",
    UpdateConfig.setColorfulMode
  );
  groups.startGraphsAtZero = new SettingsGroup(
    "startGraphsAtZero",
    UpdateConfig.setStartGraphsAtZero
  );
  groups.randomTheme = new SettingsGroup(
    "randomTheme",
    UpdateConfig.setRandomTheme
  );
  groups.stopOnError = new SettingsGroup(
    "stopOnError",
    UpdateConfig.setStopOnError,
    () => {
      groups.confidenceMode.updateButton();
    }
  );
  groups.soundVolume = new SettingsGroup(
    "soundVolume",
    UpdateConfig.setSoundVolume,
    () => {}
  );
  groups.playSoundOnError = new SettingsGroup(
    "playSoundOnError",
    UpdateConfig.setPlaySoundOnError,
    () => {
      if (Config.playSoundOnError) Sound.playError();
    }
  );
  groups.playSoundOnClick = new SettingsGroup(
    "playSoundOnClick",
    UpdateConfig.setPlaySoundOnClick,
    () => {
      if (Config.playSoundOnClick !== "off")
        Sound.playClick(Config.playSoundOnClick);
    }
  );
  groups.showAllLines = new SettingsGroup(
    "showAllLines",
    UpdateConfig.setShowAllLines
  );
  groups.paceCaret = new SettingsGroup("paceCaret", UpdateConfig.setPaceCaret);
  groups.repeatedPace = new SettingsGroup(
    "repeatedPace",
    UpdateConfig.setRepeatedPace
  );
  groups.minWpm = new SettingsGroup("minWpm", UpdateConfig.setMinWpm);
  groups.minAcc = new SettingsGroup("minAcc", UpdateConfig.setMinAcc);
  groups.minBurst = new SettingsGroup("minBurst", UpdateConfig.setMinBurst);
  groups.smoothLineScroll = new SettingsGroup(
    "smoothLineScroll",
    UpdateConfig.setSmoothLineScroll
  );
  groups.lazyMode = new SettingsGroup("lazyMode", UpdateConfig.setLazyMode);
  groups.layout = new SettingsGroup("layout", UpdateConfig.setLayout);
  groups.language = new SettingsGroup("language", UpdateConfig.setLanguage);
  groups.fontSize = new SettingsGroup("fontSize", UpdateConfig.setFontSize);
  groups.pageWidth = new SettingsGroup("pageWidth", UpdateConfig.setPageWidth);
  groups.caretStyle = new SettingsGroup(
    "caretStyle",
    UpdateConfig.setCaretStyle
  );
  groups.paceCaretStyle = new SettingsGroup(
    "paceCaretStyle",
    UpdateConfig.setPaceCaretStyle
  );
  groups.timerStyle = new SettingsGroup(
    "timerStyle",
    UpdateConfig.setTimerStyle
  );
  groups.highlighteMode = new SettingsGroup(
    "highlightMode",
    UpdateConfig.setHighlightMode
  );
  groups.timerOpacity = new SettingsGroup(
    "timerOpacity",
    UpdateConfig.setTimerOpacity
  );
  groups.timerColor = new SettingsGroup(
    "timerColor",
    UpdateConfig.setTimerColor
  );
  groups.fontFamily = new SettingsGroup(
    "fontFamily",
    UpdateConfig.setFontFamily,
    null,
    () => {
      let customButton = $(
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
  );
  groups.alwaysShowDecimalPlaces = new SettingsGroup(
    "alwaysShowDecimalPlaces",
    UpdateConfig.setAlwaysShowDecimalPlaces
  );
  groups.alwaysShowCPM = new SettingsGroup(
    "alwaysShowCPM",
    UpdateConfig.setAlwaysShowCPM
  );
  groups.customBackgroundSize = new SettingsGroup(
    "customBackgroundSize",
    UpdateConfig.setCustomBackgroundSize
  );
  // groups.customLayoutfluid = new SettingsGroup(
  //   "customLayoutfluid",
  //   UpdateConfig.setCustomLayoutfluid
  // );
}

export function reset() {
  $(".pageSettings .section.themes .favThemes.buttons").empty();
  $(".pageSettings .section.themes .allThemes.buttons").empty();
  $(".pageSettings .section.languageGroups .buttons").empty();
  $(".pageSettings .section.layout .buttons").empty();
  $(".pageSettings .section.keymapLayout .buttons").empty();
  $(".pageSettings .section.funbox .buttons").empty();
  $(".pageSettings .section.fontFamily .buttons").empty();
}

export async function fillSettingsPage() {
  await initGroups();
  await UpdateConfig.loadPromise;
  ThemePicker.refreshButtons();

  let langGroupsEl = $(
    ".pageSettings .section.languageGroups .buttons"
  ).empty();
  let currentLanguageGroup = await Misc.findCurrentGroup(Config.language);
  Misc.getLanguageGroups().then((groups) => {
    groups.forEach((group) => {
      langGroupsEl.append(
        `<div class="languageGroup button${
          currentLanguageGroup === group.name ? " active" : ""
        }" group='${group.name}'>${group.name}</div>`
      );
    });
  });

  let layoutEl = $(".pageSettings .section.layout .buttons").empty();
  Object.keys(layouts).forEach((layout) => {
    layoutEl.append(
      `<div class="layout button" layout='${layout}'>${
        layout === "default" ? "off" : layout.replace(/_/g, " ")
      }</div>`
    );
  });

  let keymapEl = $(".pageSettings .section.keymapLayout .buttons").empty();
  keymapEl.append(
    `<div class="layout button" keymapLayout='overrideSync'>emulator sync</div>`
  );
  Object.keys(layouts).forEach((layout) => {
    if (layout.toString() != "default") {
      keymapEl.append(
        `<div class="layout button" keymapLayout='${layout}'>${layout.replace(
          /_/g,
          " "
        )}</div>`
      );
    }
  });

  let funboxEl = $(".pageSettings .section.funbox .buttons").empty();
  funboxEl.append(`<div class="funbox button" funbox='none'>none</div>`);
  Misc.getFunboxList().then((funboxModes) => {
    funboxModes.forEach((funbox) => {
      if (funbox.name === "mirror") {
        funboxEl.append(
          `<div class="funbox button" funbox='${funbox.name}' aria-label="${
            funbox.info
          }" data-balloon-pos="up" data-balloon-length="fit" type="${
            funbox.type
          }" style="transform:scaleX(-1);">${funbox.name.replace(
            /_/g,
            " "
          )}</div>`
        );
      } else {
        funboxEl.append(
          `<div class="funbox button" funbox='${funbox.name}' aria-label="${
            funbox.info
          }" data-balloon-pos="up" data-balloon-length="fit" type="${
            funbox.type
          }">${funbox.name.replace(/_/g, " ")}</div>`
        );
      }
    });
  });

  let isCustomFont = true;
  let fontsEl = $(".pageSettings .section.fontFamily .buttons").empty();
  Misc.getFontsList().then((fonts) => {
    fonts.forEach((font) => {
      if (Config.fontFamily === font.name) isCustomFont = false;
      fontsEl.append(
        `<div class="button${
          Config.fontFamily === font.name ? " active" : ""
        }" style="font-family:${
          font.display !== undefined ? font.display : font.name
        }" fontFamily="${font.name.replace(/ /g, "_")}" tabindex="0"
        onclick="this.blur();">${
          font.display !== undefined ? font.display : font.name
        }</div>`
      );
    });
    $(
      isCustomFont
        ? `<div class="language button no-auto-handle custom active" onclick="this.blur();">Custom (${Config.fontFamily.replace(
            /_/g,
            " "
          )})</div>`
        : '<div class="language button no-auto-handle custom" onclick="this.blur();">Custom</div>'
    )
      .on("click", () => {
        SimplePopups.list.applyCustomFont.show([]);
      })
      .appendTo(fontsEl);
  });

  $(".pageSettings .section.customBackgroundSize input").val(
    Config.customBackground
  );

  $(".pageSettings .section.customLayoutfluid input").val(
    Config.customLayoutfluid.replace(/#/g, " ")
  );
}

// export let settingsFillPromise = fillSettingsPage();

export function hideAccountSection() {
  $(`.sectionGroupTitle[group='account']`).addClass("hidden");
  $(`.settingsGroup.account`).addClass("hidden");
  $(`.pageSettings .section.needsAccount`).addClass("hidden");
}

export function updateDiscordSection() {
  //no code and no discord
  if (firebase.auth().currentUser == null) {
    $(".pageSettings .section.discordIntegration").addClass("hidden");
  } else {
    if (DB.getSnapshot() == null) return;
    $(".pageSettings .section.discordIntegration").removeClass("hidden");

    if (DB.getSnapshot().discordId == undefined) {
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

export function updateAuthSections() {
  $(".pageSettings .section.passwordAuthSettings .button").addClass("hidden");
  $(".pageSettings .section.googleAuthSettings .button").addClass("hidden");

  let user = firebase.auth().currentUser;
  if (!user) return;

  let passwordProvider = user.providerData.find(
    (provider) => provider.providerId === "password"
  );
  let googleProvider = user.providerData.find(
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

function setActiveFunboxButton() {
  $(`.pageSettings .section.funbox .button`).removeClass("active");
  $(
    `.pageSettings .section.funbox .button[funbox='${Config.funbox}']`
  ).addClass("active");
}

function refreshTagsSettingsSection() {
  if (firebase.auth().currentUser !== null && DB.getSnapshot() !== null) {
    let tagsEl = $(".pageSettings .section.tags .tagsList").empty();
    DB.getSnapshot().tags.forEach((tag) => {
      // let tagPbString = "No PB found";
      // if (tag.pb != undefined && tag.pb > 0) {
      //   tagPbString = `PB: ${tag.pb}`;
      // }
      tagsEl.append(`

      <div class="buttons tag" id="${tag._id}">
        <div class="button tagButton ${tag.active ? "active" : ""}" active="${
        tag.active
      }">
          <div class="title">${tag.name}</div>
        </div>
        <div class="clearPbButton button">
          <i class="fas fa-crown fa-fw"></i>
        </div>
        <div class="editButton button">
          <i class="fas fa-pen fa-fw"></i>
        </div>
        <div class="removeButton button">
          <i class="fas fa-trash fa-fw"></i>
        </div>
      </div>

      `);
    });
    $(".pageSettings .section.tags").removeClass("hidden");
  } else {
    $(".pageSettings .section.tags").addClass("hidden");
  }
}

function refreshPresetsSettingsSection() {
  if (firebase.auth().currentUser !== null && DB.getSnapshot() !== null) {
    let presetsEl = $(".pageSettings .section.presets .presetsList").empty();
    DB.getSnapshot().presets.forEach((preset) => {
      presetsEl.append(`
      <div class="buttons preset" id="${preset._id}">
        <div class="button presetButton">
          <div class="title">${preset.name}</div>
        </div>
        <div class="editButton button">
          <i class="fas fa-pen fa-fw"></i>
        </div>
        <div class="removeButton button">
          <i class="fas fa-trash fa-fw"></i>
        </div>
      </div>
      
      `);
    });
    $(".pageSettings .section.presets").removeClass("hidden");
  } else {
    $(".pageSettings .section.presets").addClass("hidden");
  }
}

export function showAccountSection() {
  $(`.sectionGroupTitle[group='account']`).removeClass("hidden");
  $(`.settingsGroup.account`).removeClass("hidden");
  $(`.pageSettings .section.needsAccount`).removeClass("hidden");
  refreshTagsSettingsSection();
  refreshPresetsSettingsSection();
  updateDiscordSection();
}

export function update() {
  Object.keys(groups).forEach((group) => {
    groups[group].updateButton();
  });

  refreshTagsSettingsSection();
  refreshPresetsSettingsSection();
  LanguagePicker.setActiveGroup();
  setActiveFunboxButton();
  ThemePicker.updateActiveTab();
  ThemePicker.setCustomInputs(true);
  updateDiscordSection();
  updateAuthSections();
  ThemePicker.refreshButtons();
  // ThemePicker.updateActiveButton();

  $(".pageSettings .section.paceCaret input.customPaceCaretSpeed").val(
    Config.paceCaretCustomSpeed
  );
  $(".pageSettings .section.minWpm input.customMinWpmSpeed").val(
    Config.minWpmCustomSpeed
  );
  $(".pageSettings .section.minAcc input.customMinAcc").val(
    Config.minAccCustom
  );
  $(".pageSettings .section.minBurst input.customMinBurst").val(
    Config.minBurstCustomSpeed
  );
}

function toggleSettingsGroup(groupName) {
  $(`.pageSettings .settingsGroup.${groupName}`)
    .stop(true, true)
    .slideToggle(250)
    .toggleClass("slideup");
  if ($(`.pageSettings .settingsGroup.${groupName}`).hasClass("slideup")) {
    $(`.pageSettings .sectionGroupTitle[group=${groupName}] .fas`)
      .stop(true, true)
      .animate(
        {
          deg: -90,
        },
        {
          duration: 250,
          step: function (now) {
            $(this).css({
              transform: "rotate(" + now + "deg)",
            });
          },
        }
      );
  } else {
    $(`.pageSettings .sectionGroupTitle[group=${groupName}] .fas`)
      .stop(true, true)
      .animate(
        {
          deg: 0,
        },
        {
          duration: 250,
          step: function (now) {
            $(this).css({
              transform: "rotate(" + now + "deg)",
            });
          },
        }
      );
  }
}

$(document).on(
  "focusout",
  ".pageSettings .section.paceCaret input.customPaceCaretSpeed",
  (e) => {
    UpdateConfig.setPaceCaretCustomSpeed(
      parseInt(
        $(".pageSettings .section.paceCaret input.customPaceCaretSpeed").val()
      )
    );
  }
);

$(document).on(
  "click",
  ".pageSettings .section.paceCaret .button.save",
  (e) => {
    UpdateConfig.setPaceCaretCustomSpeed(
      parseInt(
        $(".pageSettings .section.paceCaret input.customPaceCaretSpeed").val()
      )
    );
  }
);

$(document).on(
  "focusout",
  ".pageSettings .section.minWpm input.customMinWpmSpeed",
  (e) => {
    UpdateConfig.setMinWpmCustomSpeed(
      parseInt($(".pageSettings .section.minWpm input.customMinWpmSpeed").val())
    );
  }
);

$(document).on("click", ".pageSettings .section.minWpm .button.save", (e) => {
  UpdateConfig.setMinWpmCustomSpeed(
    parseInt($(".pageSettings .section.minWpm input.customMinWpmSpeed").val())
  );
});

$(document).on(
  "focusout",
  ".pageSettings .section.minAcc input.customMinAcc",
  (e) => {
    UpdateConfig.setMinAccCustom(
      parseInt($(".pageSettings .section.minAcc input.customMinAcc").val())
    );
  }
);

$(document).on("click", ".pageSettings .section.minAcc .button.save", (e) => {
  UpdateConfig.setMinAccCustom(
    parseInt($(".pageSettings .section.minAcc input.customMinAcc").val())
  );
});

$(document).on(
  "focusout",
  ".pageSettings .section.minBurst input.customMinBurst",
  (e) => {
    UpdateConfig.setMinBurstCustomSpeed(
      parseInt($(".pageSettings .section.minBurst input.customMinBurst").val())
    );
  }
);

$(document).on("click", ".pageSettings .section.minBurst .button.save", (e) => {
  UpdateConfig.setMinBurstCustomSpeed(
    parseInt($(".pageSettings .section.minBurst input.customMinBurst").val())
  );
});

$(document).on(
  "click",
  ".pageSettings .section.languageGroups .button",
  (e) => {
    let group = $(e.currentTarget).attr("group");
    LanguagePicker.setActiveGroup(group, true);
  }
);

$(".pageSettings .section.discordIntegration #unlinkDiscordButton").click(
  (e) => {
    SimplePopups.list.unlinkDiscord.show();
  }
);

//funbox
$(document).on("click", ".pageSettings .section.funbox .button", (e) => {
  let funbox = $(e.currentTarget).attr("funbox");
  let type = $(e.currentTarget).attr("type");
  Funbox.setFunbox(funbox, type);
  setActiveFunboxButton();
});

//tags
$(document).on(
  "click",
  ".pageSettings .section.tags .tagsList .tag .tagButton",
  (e) => {
    let target = e.currentTarget;
    let tagid = $(target).parent(".tag").attr("id");
    TagController.toggle(tagid);
    $(target).toggleClass("active");
  }
);

$(document).on("click", ".pageSettings .section.tags .addTagButton", (e) => {
  EditTagsPopup.show("add");
});

$(document).on(
  "click",
  ".pageSettings .section.presets .addPresetButton",
  (e) => {
    EditPresetPopup.show("add");
  }
);

$(document).on("click", ".pageSettings .section.presets .editButton", (e) => {
  let presetid = $(e.currentTarget).parent(".preset").attr("id");
  let name = $(e.currentTarget).siblings(".button").children(".title").text();
  EditPresetPopup.show("edit", presetid, name);
});

$(document).on("click", ".pageSettings .section.presets .removeButton", (e) => {
  let presetid = $(e.currentTarget).parent(".preset").attr("id");
  let name = $(e.currentTarget).siblings(".button").children(".title").text();
  EditPresetPopup.show("remove", presetid, name);
});

$(document).on(
  "click",
  ".pageSettings .section.presets .presetsList .preset .presetButton",
  (e) => {
    let target = e.currentTarget;
    let presetid = $(target).parent(".preset").attr("id");
    console.log("Applying Preset");
    PresetController.apply(presetid);
  }
);

$(document).on(
  "click",
  ".pageSettings .section.tags .tagsList .tag .editButton",
  (e) => {
    let tagid = $(e.currentTarget).parent(".tag").attr("id");
    let name = $(e.currentTarget)
      .siblings(".tagButton")
      .children(".title")
      .text();
    EditTagsPopup.show("edit", tagid, name);
  }
);

$(document).on(
  "click",
  ".pageSettings .section.tags .tagsList .tag .clearPbButton",
  (e) => {
    let tagid = $(e.currentTarget).parent(".tag").attr("id");
    let name = $(e.currentTarget)
      .siblings(".tagButton")
      .children(".title")
      .text();
    EditTagsPopup.show("clearPb", tagid, name);
  }
);

$(document).on(
  "click",
  ".pageSettings .section.tags .tagsList .tag .removeButton",
  (e) => {
    let tagid = $(e.currentTarget).parent(".tag").attr("id");
    let name = $(e.currentTarget)
      .siblings(".tagButton")
      .children(".title")
      .text();
    EditTagsPopup.show("remove", tagid, name);
  }
);

$("#resetSettingsButton").click((e) => {
  SimplePopups.list.resetSettings.show();
});

$("#importSettingsButton").click((e) => {
  ImportExportSettingsPopup.show("import");
});

$("#exportSettingsButton").click((e) => {
  let configJSON = JSON.stringify(Config);
  navigator.clipboard.writeText(configJSON).then(
    function () {
      Notifications.add("JSON Copied to clipboard", 0);
    },
    function (err) {
      ImportExportSettingsPopup.show("export");
    }
  );
});

$("#shareCustomThemeButton").click((e) => {
  let share = [];
  $.each(
    $(".pageSettings .section.customTheme [type='color']"),
    (index, element) => {
      share.push($(element).attr("value"));
    }
  );

  let url =
    "https://monkeytype.com?" +
    Misc.objectToQueryString({ customTheme: share });

  navigator.clipboard.writeText(url).then(
    function () {
      Notifications.add("URL Copied to clipboard", 0);
    },
    function (err) {
      CustomThemePopup.show(url);
    }
  );
});

$(".pageSettings .sectionGroupTitle").click((e) => {
  toggleSettingsGroup($(e.currentTarget).attr("group"));
});

$(".pageSettings #resetPersonalBestsButton").on("click", (e) => {
  SimplePopups.list.resetPersonalBests.show();
});

$(".pageSettings #updateAccountName").on("click", (e) => {
  SimplePopups.list.updateName.show();
});

$(".pageSettings #addPasswordAuth").on("click", (e) => {
  SimplePopups.list.addPasswordAuth.show();
});

$(".pageSettings #emailPasswordAuth").on("click", (e) => {
  SimplePopups.list.updateEmail.show();
});

$(".pageSettings #passPasswordAuth").on("click", (e) => {
  SimplePopups.list.updatePassword.show();
});

$(".pageSettings #addGoogleAuth").on("click", async (e) => {
  await AccountController.addGoogleAuth();
  setTimeout(() => {
    window.location.reload();
  }, 1000);
});

$(".pageSettings #removeGoogleAuth").on("click", (e) => {
  AccountController.removeGoogleAuth();
});

$(".pageSettings #deleteAccount").on("click", (e) => {
  SimplePopups.list.deleteAccount.show();
});

$(".pageSettings .section.customBackgroundSize .inputAndButton .save").on(
  "click",
  (e) => {
    UpdateConfig.setCustomBackground(
      $(
        ".pageSettings .section.customBackgroundSize .inputAndButton input"
      ).val()
    );
  }
);

$(".pageSettings .section.customBackgroundSize .inputAndButton input").keypress(
  (e) => {
    if (e.keyCode == 13) {
      UpdateConfig.setCustomBackground(
        $(
          ".pageSettings .section.customBackgroundSize .inputAndButton input"
        ).val()
      );
    }
  }
);

$(".pageSettings .section.customLayoutfluid .inputAndButton .save").on(
  "click",
  (e) => {
    UpdateConfig.setCustomLayoutfluid(
      $(".pageSettings .section.customLayoutfluid .inputAndButton input").val()
    );
    Notifications.add("Custom layoutfluid saved", 1);
  }
);

$(".pageSettings .section.customLayoutfluid .inputAndButton .input").keypress(
  (e) => {
    if (e.keyCode == 13) {
      UpdateConfig.setCustomLayoutfluid(
        $(
          ".pageSettings .section.customLayoutfluid .inputAndButton input"
        ).val()
      );
      Notifications.add("Custom layoutfluid saved", 1);
    }
  }
);

$(".quickNav .links a").on("click", (e) => {
  const settingsGroup = e.target.innerText;
  const isOpen = $(`.pageSettings .settingsGroup.${settingsGroup}`).hasClass(
    "slideup"
  );
  isOpen && toggleSettingsGroup(settingsGroup);
});
