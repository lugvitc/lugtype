import * as UpdateConfig from "../../config.js";

const subgroup: MonkeyTypes.CommandsSubgroup = {
  title: "Custom background size...",
  configKey: "customBackgroundSize",
  list: [
    {
      id: "setCustomBackgroundSizeCover",
      display: "cover",
      icon: "fa-image",
      configValue: "cover",
      exec: (): void => {
        UpdateConfig.setCustomBackgroundSize("cover");
      },
    },
    {
      id: "setCustomBackgroundSizeContain",
      display: "contain",
      icon: "fa-image",
      configValue: "contain",
      exec: (): void => {
        UpdateConfig.setCustomBackgroundSize("contain");
      },
    },
    {
      id: "setCustomBackgroundSizeMax",
      display: "max",
      icon: "fa-image",
      configValue: "max",
      exec: (): void => {
        UpdateConfig.setCustomBackgroundSize("max");
      },
    },
  ],
};

const commands: MonkeyTypes.Command[] = [
  {
    id: "setCustomBackgroundSize",
    display: "Custom background size...",
    icon: "fa-image",
    subgroup,
  },
];

export default commands;
