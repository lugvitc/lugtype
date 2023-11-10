import Config, * as UpdateConfig from "../../config";
import { get as getTypingSpeedUnit } from "../../utils/typing-speed-units";

const subgroup: MonkeyTypes.CommandsSubgroup = {
  title: "Change min speed mode...",
  configKey: "minWpm",
  list: [
    {
      id: "setMinWpmOff",
      display: "off",
      configValue: "off",
      exec: (): void => {
        UpdateConfig.setMinWpm("off");
      },
    },
    {
      id: "setMinWpmCustom",
      display: "custom...",
      configValue: "custom",
      input: true,
      exec: (input): void => {
        if (!input) return;
        const newVal = getTypingSpeedUnit(Config.typingSpeedUnit).toWpm(
          parseInt(input)
        );
        UpdateConfig.setMinWpmCustomSpeed(newVal);
        UpdateConfig.setMinWpm("custom");
      },
    },
  ],
};

const commands: MonkeyTypes.Command[] = [
  {
    id: "changeMinWpm",
    display: "Minimum speed...",
    alias: "minimum",
    icon: "fa-bomb",
    subgroup,
  },
];

export default commands;
