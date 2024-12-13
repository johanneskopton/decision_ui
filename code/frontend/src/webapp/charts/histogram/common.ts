import type { ChartOptions, LegendOptions, ScaleChartOptions } from "chart.js";
import { BarController, BarElement, Chart, LinearScale, Colors, Legend, CategoryScale } from "chart.js";

/* eslint @typescript-eslint/no-unsafe-function-type: 0 */

// copied from internal chartjs typings
type _DeepPartialArray<T> = Array<DeepPartial<T>>;
type _DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };

// copied from intenral chartjs typings
export type DeepPartial<T> = T extends Function
  ? T
  : T extends Array<infer U>
    ? _DeepPartialArray<U>
    : T extends object
      ? _DeepPartialObject<T>
      : T | undefined;

export const CHART_COLORS = [
  "rgba(206, 147, 216, 0.7)", // purple
  "rgba(77, 182, 172, 0.7)", // gree
  "rgba(54, 162, 235, 0.7)", // blue
  "rgba(255, 99, 132, 0.7)", // red
  "rgba(255, 159, 64, 0.7)", // orange
  "rgba(255, 205, 86, 0.7)", // yellow
  "rgba(201, 203, 207, 0.7)" // grey
];

Chart.register(BarController, LinearScale, BarElement, Colors, Legend, CategoryScale);

export const getDefaultHistogramScales = (
  max_ticks: number,
  bins: number[],
  textColor: string,
  gridColor: string
): DeepPartial<ScaleChartOptions<"bar">> => {
  return {
    scales: {
      x: {
        type: "linear",
        ticks: {
          maxRotation: 90,
          minRotation: 0,
          autoSkip: false,
          maxTicksLimit: max_ticks,
          color: textColor,
          callback: value => +(value as number).toFixed(5)
        },
        grid: {
          color: gridColor,
          offset: false
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
        }
      }
    }
  };
};

export const getDefaultHistogramLegend = (textColor: string): DeepPartial<LegendOptions<"bar">> => {
  return {
    position: "top",
    labels: {
      color: textColor,
      font: {
        size: 14
      }
    }
  };
};

export const getDefaultHistogramOptions = (): ChartOptions<"bar"> => {
  return {
    responsive: true,
    resizeDelay: 0,
    animation: false,
    maintainAspectRatio: false,
    hover: { mode: "nearest" }
  };
};
