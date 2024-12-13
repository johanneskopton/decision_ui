import { Chart, type ChartDataset } from "chart.js";

import { CHART_COLORS, getDefaultHistogramLegend } from "./common";

const TEXT_COLOR = "rgba(50, 50, 50, 1.0)";
const GRID_COLOR = "rgba(155, 155, 155, 0.2)";

export const drawEvpiBoxChart = (
  chart: Chart<"bar"> | null,
  ctx: CanvasRenderingContext2D,
  evpi: { [estimate: string]: { [result: string]: number } },
  device_pixel_ratio: number = 1.0
): Chart<"bar"> => {
  if (chart) chart.destroy();

  console.log("evpi: " + JSON.stringify(evpi));
  const estimate_variables = Object.keys(evpi);
  const result_variables = Object.keys(evpi[Object.keys(evpi)[0]]);
  console.log("estimate_variables: " + JSON.stringify(estimate_variables));
  console.log("result variables: " + JSON.stringify(result_variables));

  return new Chart<"bar">(ctx, {
    type: "bar",

    data: {
      labels: estimate_variables,
      datasets: result_variables.map((r, idx) => {
        return {
          label: r,
          data: estimate_variables.map(e => evpi[e][r]) as number[],
          backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
        } as ChartDataset<"bar", any>;
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 0,
      animation: false,
      indexAxis: "y",
      devicePixelRatio: device_pixel_ratio,
      scales: {
        x: {
          type: "linear",
          ticks: {
            color: TEXT_COLOR
          },
          grid: {
            color: GRID_COLOR
          }
        },
        y: {
          type: "category",
          ticks: {
            color: TEXT_COLOR,
            font: {
              size: 14
            }
          },
          grid: {
            color: GRID_COLOR
          }
        }
      },
      plugins: {
        legend: getDefaultHistogramLegend(TEXT_COLOR)
      }
    }
  });
};
