import { BarController, BarElement, Chart, LinearScale } from "chart.js";

import niceScale from "../helper/nice_scale";

const colors = ["rgba(206, 147, 216, 0.7)", "rgba(77, 182, 172, 0.7)"];

Chart.register(BarController, LinearScale, BarElement);

export default function (
  graph: Chart | null,
  ctx: CanvasRenderingContext2D,
  bins: number[],
  counts: number[],
  in_node = false
) {
  let textColor = "rgba(255, 255, 255, 1)";
  let gridColor = "rgba(255, 255, 255, 0.2)";
  const barColor = "rgba(178, 223, 219, 1)";
  let max_ticks = 7;
  let datasets = [
    {
      data: counts,
      categoryPercentage: 1.0,
      barPercentage: 1.1,
      backgroundColor: barColor
    }
  ];
  if (!in_node) {
    textColor = "rgba(155, 155, 155, 1)";
    gridColor = "rgba(155, 155, 155, 0.2)";
    max_ticks = 10;
    datasets = [];
    const n_variables = Object.keys(counts).length;
    let i = 0;
    for (const variable in counts) {
      datasets.push({
        data: counts[variable],
        categoryPercentage: 1.0,
        barPercentage: n_variables + 0.1,
        backgroundColor: colors[i]
      });
      i++;
    }
  }

  // Calculate X-ticks

  const x_ticks: any = {
    maxRotation: 90,
    minRotation: 0,
    autoSkip: false,
    maxTicksLimit: max_ticks,
    color: textColor,
    afterBuildTicks: axis => {
      const scale = niceScale(bins[0], bins[bins.length - 1], max_ticks);
      const target_tick_values: number[] = [];
      for (let i = 0; i < max_ticks; i++) {
        target_tick_values[i] = scale.niceMinimum + scale.tickSpacing * i;
      }
      axis.ticks = target_tick_values;
    },
    callback: (value, index, ticks) => {
      return +value.toFixed(5);
    }
  };

  if (graph) graph.destroy();
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: bins,
      datasets: datasets
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          type: "linear",
          ticks: x_ticks,

          grid: {
            color: gridColor,
            offset: false
            // zeroLineColor: baseColor
          }
        },
        y: {
          type: "linear",
          ticks: {
            color: textColor,
            maxTicksLimit: 4
          },
          grid: {
            color: gridColor
            // zeroLineColor: baseColor
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      aspectRatio: 1.41,
      hover: { mode: "nearest" }
    }
  });
}
