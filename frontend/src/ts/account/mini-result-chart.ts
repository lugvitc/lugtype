import * as ChartController from "../controllers/chart-controller";
import Config from "../config";
import { ChartData } from ".../../../Typings/interfaces";

export function updatePosition(x: number, y: number) {
  $(".pageAccount .miniResultChartWrapper").css({ top: y, left: x });
}

export function show() {
  $(".pageAccount .miniResultChartWrapper").stop(true, true).fadeIn(125);
  $(".pageAccount .miniResultChartBg").stop(true, true).fadeIn(125);
}

function hide() {
  $(".pageAccount .miniResultChartWrapper").stop(true, true).fadeOut(125);
  $(".pageAccount .miniResultChartBg").stop(true, true).fadeOut(125);
}

// TODO change
export function updateData(data: ChartData) {
  // let data = filteredResults[filteredId].chartData;
  const labels = [];
  for (let i = 1; i <= data.wpm.length; i++) {
    labels.push(i.toString());
  }
  ChartController.miniResult.data.labels = labels;
  ChartController.miniResult.data.datasets[0].data = data.wpm;
  ChartController.miniResult.data.datasets[1].data = data.raw;
  ChartController.miniResult.data.datasets[2].data = data.err;

  ChartController.miniResult.updateColors();

  const maxChartVal = Math.max(
    ...[Math.max(...data.wpm), Math.max(...data.raw)]
  );
  const minChartVal = Math.min(
    ...[Math.min(...data.wpm), Math.min(...data.raw)]
  );
  ChartController.miniResult.options.scales.yAxes[0].ticks.max =
    Math.round(maxChartVal);
  ChartController.miniResult.options.scales.yAxes[1].ticks.max =
    Math.round(maxChartVal);

  if (!Config.startGraphsAtZero) {
    ChartController.miniResult.options.scales.yAxes[0].ticks.min =
      Math.round(minChartVal);
    ChartController.miniResult.options.scales.yAxes[1].ticks.min =
      Math.round(minChartVal);
  } else {
    ChartController.miniResult.options.scales.yAxes[0].ticks.min = 0;
    ChartController.miniResult.options.scales.yAxes[1].ticks.min = 0;
  }

  ChartController.miniResult.update({ duration: 0 });
}

$(document).on("click", ".pageAccount .miniResultChartBg", () => hide());
