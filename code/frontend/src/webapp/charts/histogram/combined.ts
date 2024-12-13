import { Chart, type ChartDataset } from "chart.js";

import {
  CHART_COLORS,
  getDefaultHistogramLegend,
  getDefaultHistogramOptions,
  getDefaultHistogramScales
} from "./common";

const TEXT_COLOR = "rgba(50, 50, 50, 1.0)";
const GRID_COLOR = "rgba(155, 155, 155, 0.2)";

export const drawCombinedResultsHistogram = (
  chart: Chart<"bar"> | null,
  ctx: CanvasRenderingContext2D,
  bins: number[],
  values: { [variable: string]: number[] },
  device_pixel_ratio: number = 1.0
): Chart<"bar"> => {
  const max_ticks = 10;
  const n_variables = Object.keys(values).length;

  if (chart) chart.destroy();

  return new Chart<"bar">(ctx, {
    type: "bar",
    data: {
      labels: bins,
      datasets: Object.keys(values).map((variable, idx) => {
        return {
          label: variable,
          data: values[variable],
          categoryPercentage: 1.0,
          barPercentage: n_variables + 0.05,
          backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
        } as ChartDataset<"bar", any>;
      })
    },
    options: {
      ...getDefaultHistogramOptions(),
      ...getDefaultHistogramScales(max_ticks, bins, TEXT_COLOR, GRID_COLOR),
      devicePixelRatio: device_pixel_ratio,
      plugins: {
        legend: getDefaultHistogramLegend(TEXT_COLOR)
      }
    }
  });
};
