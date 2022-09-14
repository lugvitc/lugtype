import * as UpdateConfig from "../../config";

const commands: MonkeyTypes.CommandsGroup = {
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

export default commands;
