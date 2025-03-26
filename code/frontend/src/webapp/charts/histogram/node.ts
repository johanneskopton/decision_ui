import { Chart, type ChartDataset } from "chart.js";

import { getDefaultHistogramOptions, getDefaultHistogramScales } from "./common";

const TEXT_COLOR = "rgba(255, 255, 255, 1)";
const GRID_COLOR = "rgba(255, 255, 255, 0.2)";
const BAR_COLOR = "rgba(178, 223, 219, 1)";

export const drawNodeHistogram = (
  chart: Chart<"bar"> | null,
  ctx: CanvasRenderingContext2D,
  bins: number[],
  values: number[]
): Chart<"bar"> => {
  const max_ticks = 7;

  if (chart) chart.destroy();

  return new Chart<"bar">(ctx, {
    type: "bar",
    data: {
      labels: bins,
      datasets: [
        {
          data: values,
          categoryPercentage: 1.0,
          barPercentage: 1.05,
          backgroundColor: BAR_COLOR
        } as ChartDataset<"bar", any>
      ]
    },
    options: {
      ...getDefaultHistogramOptions(),
      ...getDefaultHistogramScales(max_ticks, bins, TEXT_COLOR, GRID_COLOR),
      plugins: {
        legend: { display: false }
      }
    }
  });
};
