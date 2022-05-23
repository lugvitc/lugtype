import ChartJS from "chart.js";
import * as Tribe from "./tribe";
import * as ThemeColors from "../elements/theme-colors";
import * as Notifications from "../elements/notifications";

const charts: Record<string, unknown> = {};

const settings = {
  type: "line",
  data: {
    labels: [1, 2, 3],
    datasets: [
      {
        label: "wpm",
        data: [100, 100, 100],
        borderColor: "rgba(125, 125, 125, 1)",
        borderWidth: 1,
        yAxisID: "wpm",
        order: 2,
        radius: 1,
      },
      {
        label: "raw",
        data: [110, 110, 110],
        borderColor: "rgba(125, 125, 125, 1)",
        borderWidth: 1,
        yAxisID: "raw",
        order: 3,
        radius: 1,
      },
      {
        label: "errors",
        data: [1, 0, 1],
        borderColor: "rgba(255, 125, 125, 1)",
        pointBackgroundColor: "rgba(255, 125, 125, 1)",
        borderWidth: 1,
        order: 1,
        yAxisID: "error",
        maxBarThickness: 10,
        type: "scatter",
        pointStyle: "crossRot",
        radius: function (context): 0 | 2 {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value <= 0 ? 0 : 2;
        },
        pointHoverRadius: function (context): 0 | 3 {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value <= 0 ? 0 : 3;
        },
      },
    ],
  },
  options: {
    layout: {
      padding: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5,
      },
    },
    tooltips: {
      titleFontFamily: "Roboto Mono",
      bodyFontFamily: "Roboto Mono",
      mode: "index",
      intersect: false,
      enabled: false,
      custom: function (tooltipModel) {
        // Tooltip Element
        let tooltipEl = document.getElementById("tribeMiniChartCustomTooltip");

        // Create element on first render
        if (!tooltipEl) {
          tooltipEl = document.createElement("div");
          tooltipEl.id = "tribeMiniChartCustomTooltip";
          tooltipEl.innerHTML = "<div></div>";
          document.body.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        if (tooltipModel.opacity === 0) {
          tooltipEl.style.opacity = "0";
          return;
        }

        // Set caret Position
        tooltipEl.classList.remove("above", "below", "no-transform");
        if (tooltipModel.yAlign) {
          tooltipEl.classList.add(tooltipModel.yAlign);
        } else {
          tooltipEl.classList.add("no-transform");
        }

        function getBody(bodyItem) {
          return bodyItem.lines;
        }

        // Set Text
        if (tooltipModel.body) {
          const titleLines = tooltipModel.title || [];
          const bodyLines = tooltipModel.body.map(getBody);

          let innerHtml = "";

          titleLines.forEach(function (title: string) {
            innerHtml += "<div>" + title + "</div>";
          });
          // innerHtml += '</thead><tbody>';

          bodyLines.forEach(function (body, _i) {
            // var colors = tooltipModel.labelColors[i];
            // var style = 'background:' + colors.backgroundColor;
            // style += '; border-color:' + colors.borderColor;
            // style += '; border-width: 2px';
            // var span = '<span style="' + style + '"></span>';
            innerHtml += "<div>" + body + "</div>";
            // innerHtml += '<tr><td>' + span + body + '</td></tr>';
          });
          // innerHtml += '</tbody>';

          const tableRoot = tooltipEl.querySelector("div");
          tableRoot.innerHTML = innerHtml;
        }

        // `this` will be the overall tooltip
        const position = this._chart.canvas.getBoundingClientRect();

        // Display, position, and set styles for font
        tooltipEl.style.opacity = "1";
        tooltipEl.style.position = "absolute";
        tooltipEl.style.left =
          position.left +
          window.pageXOffset +
          tooltipModel.caretX -
          tooltipEl.offsetWidth +
          "px";
        tooltipEl.style.top =
          position.top + window.pageYOffset + tooltipModel.caretY + "px";
        // tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
        tooltipEl.style.fontSize = "0.75rem";
        tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
        tooltipEl.style.padding =
          tooltipModel.yPadding + "px " + tooltipModel.xPadding + "px";
        tooltipEl.style.pointerEvents = "none";
        tooltipEl.style.background = "rgba(0,0,0,.75)";
        tooltipEl.style.borderRadius = "0.5rem";
        tooltipEl.style.color = "white";
        tooltipEl.style.zIndex = "999";
        tooltipEl.style.transition = "left 0.25s, top 0.25s, opacity 0.25s";
      },
    },
    legend: {
      display: false,
      labels: {
        defaultFontFamily: "Roboto Mono",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          ticks: {
            fontFamily: "Roboto Mono",
            autoSkip: true,
            autoSkipPadding: 40,
            display: false,
          },
          display: true,
          scaleLabel: {
            display: false,
            labelString: "Seconds",
            fontFamily: "Roboto Mono",
          },
          gridLines: {
            display: true,
            drawTicks: false,
            tickMarkLength: 0,
          },
        },
      ],
      yAxes: [
        {
          id: "wpm",
          display: true,
          scaleLabel: {
            display: false,
            labelString: "Words per Minute",
            fontFamily: "Roboto Mono",
          },
          ticks: {
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            min: 0,
            autoSkip: true,
            autoSkipPadding: 40,
            display: false,
          },
          gridLines: {
            display: true,
            drawTicks: false,
            tickMarkLength: 0,
          },
        },
        {
          id: "raw",
          display: false,
          scaleLabel: {
            display: true,
            labelString: "Raw Words per Minute",
            fontFamily: "Roboto Mono",
          },
          ticks: {
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            min: 0,
            autoSkip: true,
            autoSkipPadding: 40,
          },
          gridLines: {
            display: false,
          },
        },
        {
          id: "error",
          display: false,
          position: "right",
          scaleLabel: {
            display: true,
            labelString: "Errors",
            fontFamily: "Roboto Mono",
          },
          ticks: {
            precision: 0,
            fontFamily: "Roboto Mono",
            beginAtZero: true,
            autoSkip: true,
            autoSkipPadding: 40,
          },
          gridLines: {
            display: false,
          },
        },
      ],
    },
    annotation: {
      annotations: [],
    },
  },
};

async function fillData(chart, userId: string): Promise<void> {
  const labels: number[] = [];
  if (!Tribe.room) return;
  const result = Tribe.room.users[userId].result;
  for (let i = 1; i <= result.chartData.wpm.length; i++) {
    labels.push(i);
  }

  const chartmaxval = Math.max(
    Math.max(...result.chartData.wpm),
    Math.max(...result.chartData.raw)
  );

  chart.data.labels = labels;
  chart.data.datasets[0].data = result.chartData.wpm;
  chart.data.datasets[1].data = result.chartData.raw;
  chart.data.datasets[2].data = result.chartData.err;

  chart.options.scales.yAxes[0].ticks.max = Math.round(chartmaxval);
  chart.options.scales.yAxes[1].ticks.max = Math.round(chartmaxval);

  if (userId == Tribe.socket.id) {
    chart.data.datasets[0].borderColor = await ThemeColors.get("main");
    chart.data.datasets[0].pointBackgroundColor = await ThemeColors.get("main");
  } else {
    chart.data.datasets[0].borderColor = await ThemeColors.get("text");
    chart.data.datasets[0].pointBackgroundColor = await ThemeColors.get("text");
  }
  chart.data.datasets[1].borderColor = await ThemeColors.get("sub");
  chart.data.datasets[1].pointBackgroundColor = await ThemeColors.get("sub");

  chart.update({ duration: 0 });
}

export async function drawChart(userId: string): Promise<void> {
  try {
    const element = $(
      `.pageTest #result #tribeResults table tbody tr#${userId} .minichart canvas`
    )[0];

    if (!Tribe.room || !Tribe.room.users[userId].result) return;

    const chart = new ChartJS(element, $.extend(true, {}, settings));

    await fillData(chart, userId);

    charts[userId] = chart;
    $(
      `.pageTest #result #tribeResults table tbody tr#${userId} .minichart`
    ).removeClass("hidden");
    $(
      `.pageTest #result #tribeResults table tbody tr#${userId} .progress`
    ).addClass("hidden");
    return;
  } catch (e) {
    Notifications.add("Error drawing mini chart: " + e.message, -1);
    return;
  }
}

export async function drawAllCharts(): Promise<void> {
  if (!Tribe.room) return;
  const list = Object.keys(Tribe.room.users);
  for (let i = 0; i < list.length; i++) {
    const userId = list[i];
    if (!charts[userId]) {
      await drawChart(userId);
    }
  }
}

export async function updateChartMaxValues(): Promise<void> {
  if (!Tribe.room) return;
  let maxWpm = 0;
  let maxRaw = 0;

  for (const userId of Object.keys(Tribe.room.users)) {
    const result = Tribe.room.users[userId].result;
    if (!result) return;
    const maxUserWpm = Math.max(maxWpm, Math.max(...result.chartData.wpm));
    const maxUserRaw = Math.max(maxRaw, Math.max(...result.chartData.raw));
    if (maxUserWpm > maxWpm) {
      maxWpm = maxUserWpm;
    }
    if (maxUserRaw > maxRaw) {
      maxRaw = maxUserRaw;
    }
  }
  const chartmaxval = Math.max(maxWpm, maxRaw);

  const list = Object.keys(Tribe.room.users);
  for (let i = 0; i < list.length; i++) {
    const userId = list[i];
    if (charts[userId]) {
      charts[userId].options.scales.yAxes[0].ticks.max =
        Math.round(chartmaxval);
      charts[userId].options.scales.yAxes[1].ticks.max =
        Math.round(chartmaxval);
      await charts[userId].update({ duration: 0 });
    }
  }
}

export function destroyAllCharts(): void {
  Object.keys(charts).forEach((userId) => {
    charts[userId].clear();
    charts[userId].destroy();
    delete charts[userId];
  });
}
