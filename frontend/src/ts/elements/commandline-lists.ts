import * as DB from "../db";
import * as Misc from "../utils/misc";
import * as Notifications from "./notifications";
import * as Sound from "../controllers/sound-controller";
import * as ThemeController from "../controllers/theme-controller";
import Config, * as UpdateConfig from "../config";
import * as PractiseWords from "../test/practise-words";
import * as TestLogic from "../test/test-logic";
import * as ChallengeController from "../controllers/challenge-controller";
import { Auth } from "../firebase";
import { navigate } from "../controllers/route-controller";

const commandsKeymapMode: MonkeyTypes.CommandsGroup = {
  title: "Keymap mode...",
  configKey: "keymapMode",
  list: [
    {
      id: "setKeymapModeOff",
      display: "off",
      configValue: "off",
      exec: (): void => {
        UpdateConfig.setKeymapMode("off");
      },
    },
    {
      id: "setKeymapModeStatic",
      display: "static",
      configValue: "static",
      exec: (): void => {
        UpdateConfig.setKeymapMode("static");
      },
    },
    {
      id: "setKeymapModeNext",
      display: "next",
      configValue: "next",
      exec: (): void => {
        UpdateConfig.setKeymapMode("next");
      },
    },
    {
      id: "setKeymapModeReact",
      display: "react",
      alias: "flash",
      configValue: "react",
      exec: (): void => {
        UpdateConfig.setKeymapMode("react");
      },
    },
  ],
};

export const commandsEnableAds: MonkeyTypes.CommandsGroup = {
  title: "Set enable ads...",
  configKey: "ads",
  list: [
    {
      id: "setEnableAdsOff",
      display: "off",
      configValue: "off",
      exec: (): void => {
        UpdateConfig.setAds("off");
      },
    },
    {
      id: "setEnableAdsOn",
      display: "result",
      configValue: "result",
      exec: (): void => {
        UpdateConfig.setAds("result");
      },
    },
    {
      id: "setEnableOn",
      display: "on",
      configValue: "on",
      exec: (): void => {
        UpdateConfig.setAds("on");
      },
    },
    {
      id: "setEnableSellout",
      display: "sellout",
      configValue: "sellout",
      exec: (): void => {
        UpdateConfig.setAds("sellout");
      },
    },
  ],
};

const commandsRepeatedPace: MonkeyTypes.CommandsGroup = {
  title: "Repeated pace...",
  configKey: "repeatedPace",
  list: [
    {
      id: "setRepeatedPaceOff",
      display: "off",
      configValue: false,
      exec: (): void => {
        UpdateConfig.setRepeatedPace(false);
      },
    },
    {
      id: "setRepeatedPaceOn",
      display: "on",
      configValue: true,
      exec: (): void => {
        UpdateConfig.setRepeatedPace(true);
      },
    },
  ],
};

const commandsKeymapStyle: MonkeyTypes.CommandsGroup = {
  title: "Keymap style...",
  configKey: "keymapStyle",
  list: [
    {
      id: "setKeymapStyleStaggered",
      display: "staggered",
      configValue: "staggered",
      exec: (): void => {
        UpdateConfig.setKeymapStyle("staggered");
      },
    },
    {
      id: "setKeymapStyleAlice",
      display: "alice",
      configValue: "alice",
      exec: (): void => {
        UpdateConfig.setKeymapStyle("alice");
      },
    },
    {
      id: "setKeymapStyleMatrix",
      display: "matrix",
      configValue: "matrix",
      exec: (): void => {
        UpdateConfig.setKeymapStyle("matrix");
      },
    },
    {
      id: "setKeymapStyleSplit",
      display: "split",
      configValue: "split",
      exec: (): void => {
        UpdateConfig.setKeymapStyle("split");
      },
    },
    {
      id: "setKeymapStyleSplitMatrix",
      display: "split matrix",
      configValue: "split_matrix",
      exec: (): void => {
        UpdateConfig.setKeymapStyle("split_matrix");
      },
    },
  ],
};

const commandsKeymapLegendStyle: MonkeyTypes.CommandsGroup = {
  title: "Keymap legend style...",
  configKey: "keymapLegendStyle",
  list: [
    {
      id: "setKeymapLegendStyleLowercase",
      display: "lowercase",
      configValue: "lowercase",
      exec: (): void => {
        UpdateConfig.setKeymapLegendStyle("lowercase");
      },
    },
    {
      id: "setKeymapLegendStyleUppercase",
      display: "uppercase",
      configValue: "uppercase",
      exec: (): void => {
        UpdateConfig.setKeymapLegendStyle("uppercase");
      },
    },
    {
      id: "setKeymapLegendStyleBlank",
      display: "blank",
      configValue: "blank",
      exec: (): void => {
        UpdateConfig.setKeymapLegendStyle("blank");
      },
    },
    {
      id: "setKeymapLegendStyleDynamic",
      display: "dynamic",
      configValue: "dynamic",
      exec: (): void => {
        UpdateConfig.setKeymapLegendStyle("dynamic");
      },
    },
  ],
};

const commandsKeymapShowTopRow: MonkeyTypes.CommandsGroup = {
  title: "Keymap show top row...",
  configKey: "keymapShowTopRow",
  list: [
    {
      id: "keymapShowTopRowAlways",
      display: "always",
      configValue: "always",
      exec: (): void => {
        UpdateConfig.setKeymapShowTopRow("always");
      },
    },
    {
      id: "keymapShowTopRowLayout",
      display: "layout dependent",
      configValue: "layout",
      exec: (): void => {
        UpdateConfig.setKeymapShowTopRow("layout");
      },
    },
    {
      id: "keymapShowTopRowNever",
      display: "never",
      configValue: "never",
      exec: (): void => {
        UpdateConfig.setKeymapShowTopRow("never");
      },
    },
  ],
};

const commandsBritishEnglish: MonkeyTypes.CommandsGroup = {
  title: "British english...",
  configKey: "britishEnglish",
  list: [
    {
      id: "setBritishEnglishOff",
      display: "off",
      configValue: false,
      exec: (): void => {
        UpdateConfig.setBritishEnglish(false);
        TestLogic.restart();
      },
    },
    {
      id: "setBritishEnglishOn",
      display: "on",
      configValue: true,
      exec: (): void => {
        UpdateConfig.setBritishEnglish(true);
        TestLogic.restart();
      },
    },
  ],
};

const commandsHighlightMode: MonkeyTypes.CommandsGroup = {
  title: "Highlight mode...",
  configKey: "highlightMode",
  list: [
    {
      id: "setHighlightModeOff",
      display: "off",
      configValue: "off",
      exec: (): void => {
        UpdateConfig.setHighlightMode("off");
      },
    },
    {
      id: "setHighlightModeLetter",
      display: "letter",
      configValue: "letter",
      exec: (): void => {
        UpdateConfig.setHighlightMode("letter");
      },
    },
    {
      id: "setHighlightModeWord",
      display: "word",
      configValue: "word",
      exec: (): void => {
        UpdateConfig.setHighlightMode("word");
      },
    },
  ],
};

const commandsTapeMode: MonkeyTypes.CommandsGroup = {
  title: "Tape mode...",
  configKey: "tapeMode",
  list: [
    {
      id: "setTapeModeOff",
      display: "off",
      configValue: "off",
      exec: (): void => {
        UpdateConfig.setTapeMode("off");
      },
    },
    {
      id: "setTapeModeLetter",
      display: "letter",
      configValue: "letter",
      exec: (): void => {
        UpdateConfig.setTapeMode("letter");
      },
    },
    {
      id: "setTapeModeWord",
      display: "word",
      configValue: "word",
      exec: (): void => {
        UpdateConfig.setTapeMode("word");
      },
    },
  ],
};

const commandsTimerStyle: MonkeyTypes.CommandsGroup = {
  title: "Timer/progress style...",
  configKey: "timerStyle",
  list: [
    {
      id: "setTimerStyleBar",
      display: "bar",
      configValue: "bar",
      exec: (): void => {
        UpdateConfig.setTimerStyle("bar");
      },
    },
    {
      id: "setTimerStyleText",
      display: "text",
      configValue: "text",
      exec: (): void => {
        UpdateConfig.setTimerStyle("text");
      },
    },
    {
      id: "setTimerStyleMini",
      display: "mini",
      configValue: "mini",
      exec: (): void => {
        UpdateConfig.setTimerStyle("mini");
      },
    },
  ],
};

const commandsTimerColor: MonkeyTypes.CommandsGroup = {
  title: "Timer/progress color...",
  configKey: "timerColor",
  list: [
    {
      id: "setTimerColorBlack",
      display: "black",
      configValue: "black",
      exec: (): void => {
        UpdateConfig.setTimerColor("black");
      },
    },
    {
      id: "setTimerColorSub",
      display: "sub",
      configValue: "sub",
      exec: (): void => {
        UpdateConfig.setTimerColor("sub");
      },
    },
    {
      id: "setTimerColorText",
      display: "text",
      configValue: "text",
      exec: (): void => {
        UpdateConfig.setTimerColor("text");
      },
    },
    {
      id: "setTimerColorMain",
      display: "main",
      configValue: "main",
      exec: (): void => {
        UpdateConfig.setTimerColor("main");
      },
    },
  ],
};

const commandsTimerOpacity: MonkeyTypes.CommandsGroup = {
  title: "Timer/progress opacity...",
  configKey: "timerOpacity",
  list: [
    {
      id: "setTimerOpacity.25",
      display: ".25",
      configValue: 0.25,
      exec: (): void => {
        UpdateConfig.setTimerOpacity("0.25");
      },
    },
    {
      id: "setTimerOpacity.5",
      display: ".5",
      configValue: 0.5,
      exec: (): void => {
        UpdateConfig.setTimerOpacity("0.5");
      },
    },
    {
      id: "setTimerOpacity.75",
      display: ".75",
      configValue: 0.75,
      exec: (): void => {
        UpdateConfig.setTimerOpacity("0.75");
      },
    },
    {
      id: "setTimerOpacity1",
      display: "1",
      configValue: 1,
      exec: (): void => {
        UpdateConfig.setTimerOpacity("1");
      },
    },
  ],
};

const commandsPageWidth: MonkeyTypes.CommandsGroup = {
  title: "Page width...",
  configKey: "pageWidth",
  list: [
    {
      id: "setPageWidth100",
      display: "100",
      configValue: "100",
      exec: (): void => {
        UpdateConfig.setPageWidth("100");
      },
    },
    {
      id: "setPageWidth125",
      display: "125",
      configValue: "125",
      exec: (): void => {
        UpdateConfig.setPageWidth("125");
      },
    },
    {
      id: "setPageWidth150",
      display: "150",
      configValue: "150",
      exec: (): void => {
        UpdateConfig.setPageWidth("150");
      },
    },
    {
      id: "setPageWidth200",
      display: "200",
      configValue: "200",
      exec: (): void => {
        UpdateConfig.setPageWidth("200");
      },
    },
    {
      id: "setPageWidthMax",
      display: "max",
      configValue: "max",
      exec: (): void => {
        UpdateConfig.setPageWidth("max");
      },
    },
  ],
};

const commandsPractiseWords: MonkeyTypes.CommandsGroup = {
  title: "Practice words...",
  list: [
    {
      id: "practiseWordsMissed",
      display: "missed",
      noIcon: true,
      exec: (): void => {
        PractiseWords.init(true, false);
        TestLogic.restart({
          practiseMissed: true,
        });
      },
    },
    {
      id: "practiseWordsSlow",
      display: "slow",
      noIcon: true,
      exec: (): void => {
        PractiseWords.init(false, true);
        TestLogic.restart({
          practiseMissed: true,
        });
      },
    },
    {
      id: "practiseWordsBoth",
      display: "both",
      noIcon: true,
      exec: (): void => {
        PractiseWords.init(true, true);
        TestLogic.restart({
          practiseMissed: true,
        });
      },
    },
  ],
};

export const commandsChallenges: MonkeyTypes.CommandsGroup = {
  title: "Load challenge...",
  list: [],
};

Misc.getChallengeList().then((challenges) => {
  challenges.forEach((challenge) => {
    commandsChallenges.list.push({
      id:
        "loadChallenge" + Misc.capitalizeFirstLetterOfEachWord(challenge.name),
      noIcon: true,
      display: challenge.display,
      exec: async (): Promise<void> => {
        navigate("/");
        await ChallengeController.setup(challenge.name);
        TestLogic.restart({
          nosave: true,
        });
      },
    });
  });
});

// export function showFavouriteThemesAtTheTop() {
export function updateThemeCommands(): void {
  if (Config.favThemes.length > 0) {
    themeCommands.list = [];
    Config.favThemes.forEach((theme: string) => {
      themeCommands.list.push({
        id: "changeTheme" + Misc.capitalizeFirstLetterOfEachWord(theme),
        display: theme.replace(/_/g, " "),
        hover: (): void => {
          // previewTheme(theme);
          ThemeController.preview(theme, false);
        },
        exec: (): void => {
          UpdateConfig.setTheme(theme);
        },
      });
    });
    Misc.getThemesList().then((themes) => {
      themes.forEach((theme) => {
        if ((Config.favThemes as string[]).includes(theme.name)) return;
        themeCommands.list.push({
          id: "changeTheme" + Misc.capitalizeFirstLetterOfEachWord(theme.name),
          display: theme.name.replace(/_/g, " "),
          hover: (): void => {
            // previewTheme(theme.name);
            ThemeController.preview(theme.name, false);
          },
          exec: (): void => {
            UpdateConfig.setTheme(theme.name);
          },
        });
      });
    });
  }
}

const commandsCopyWordsToClipboard: MonkeyTypes.CommandsGroup = {
  title: "Are you sure...",
  list: [
    {
      id: "copyNo",
      display: "Nevermind",
    },
    {
      id: "copyYes",
      display: "Yes, I am sure",
      exec: (): void => {
        const words = Misc.getWords();

        navigator.clipboard.writeText(words).then(
          () => {
            Notifications.add("Copied to clipboard", 1);
          },
          () => {
            Notifications.add("Failed to copy!", -1);
          }
        );
      },
    },
  ],
};

const commandsMonkeyPowerLevel: MonkeyTypes.CommandsGroup = {
  title: "Power mode...",
  configKey: "monkeyPowerLevel",
  list: [
    {
      id: "monkeyPowerLevelOff",
      display: "off",
      configValue: "off",
      exec: () => UpdateConfig.setMonkeyPowerLevel("off"),
    },
    {
      id: "monkeyPowerLevel1",
      display: "mellow",
      configValue: "1",
      exec: () => UpdateConfig.setMonkeyPowerLevel("1"),
    },
    {
      id: "monkeyPowerLevel2",
      display: "high",
      configValue: "2",
      exec: () => UpdateConfig.setMonkeyPowerLevel("2"),
    },
    {
      id: "monkeyPowerLevel3",
      display: "ultra",
      configValue: "3",
      exec: () => UpdateConfig.setMonkeyPowerLevel("3"),
    },
    {
      id: "monkeyPowerLevel4",
      display: "over 9000",
      configValue: "4",
      exec: () => UpdateConfig.setMonkeyPowerLevel("4"),
    },
  ],
};

const listsObject = {
  commandsChallenges,
  commandsLanguages,
  commandsDifficulty,
  commandsLazyMode,
  commandsPaceCaret,
  commandsShowAverage,
  commandsMinWpm,
  commandsMinAcc,
  commandsMinBurst,
  commandsFunbox,
  commandsConfidenceMode,
  commandsStopOnError,
  commandsLayouts,
  commandsOppositeShiftMode,
  commandsTags,
};

export type ListsObjectKeys = keyof typeof listsObject;

export function getList(list: ListsObjectKeys): MonkeyTypes.CommandsGroup {
  return listsObject[list];
}
