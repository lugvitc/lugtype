import * as UpdateConfig from "../../config.js";

const subgroup: MonkeyTypes.CommandsSubgroup = {
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

const commands: MonkeyTypes.Command[] = [
  {
    id: "changeTapeMode",
    display: "Tape mode...",
    icon: "fa-tape",
    subgroup,
  },
];

export default commands;
