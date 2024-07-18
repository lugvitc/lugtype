import * as UpdateConfig from "../../config.js";

const subgroup: MonkeyTypes.CommandsSubgroup = {
  title: "Show average...",
  configKey: "showAverage",
  list: [
    {
      id: "setShowAverageOff",
      display: "off",
      configValue: "off",
      exec: (): void => {
        UpdateConfig.setShowAverage("off");
      },
    },
    {
      id: "setShowAverageSpeed",
      display: "speed",
      configValue: "speed",
      exec: (): void => {
        UpdateConfig.setShowAverage("speed");
      },
    },
    {
      id: "setShowAverageAcc",
      display: "accuracy",
      configValue: "acc",
      exec: (): void => {
        UpdateConfig.setShowAverage("acc");
      },
    },
    {
      id: "setShowAverageBoth",
      display: "both",
      configValue: "both",
      exec: (): void => {
        UpdateConfig.setShowAverage("both");
      },
    },
  ],
};

const commands: MonkeyTypes.Command[] = [
  {
    id: "changeShowAverage",
    display: "Show average...",
    icon: "fa-chart-bar",
    subgroup,
  },
];

export default commands;
