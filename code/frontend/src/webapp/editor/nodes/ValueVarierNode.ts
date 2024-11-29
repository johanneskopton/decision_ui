import { defineNode, IntegerInterface, NodeInterface, SelectInterface, setType } from "baklavajs";
import gaussian from "gaussian";
import nj from "@d4c/numjs";

import { deterministicIntegerType, probabilisticType, probabilisticSeriesType } from "../common/types";
import { DeterministicNumberInterface } from "../interfaces/DeterministicNumberInterface";
import { makeArray } from "../common/math";

type SupportedTrendTypes = "absolute" | "relative";
const ABSOLUTE_TREND_TYPE = "absolute";
const RELATIVE_TREND_TYPE = "relative";
const SUPPORTED_TREND_TYPES = [ABSOLUTE_TREND_TYPE, RELATIVE_TREND_TYPE];

export const ValueVarierNode = defineNode({
  type: "ValueVarier",

  title: "Value Varier",

  inputs: {
    trend_type: () =>
      new SelectInterface<SupportedTrendTypes>("Trend Type", "absolute", SUPPORTED_TREND_TYPES).setPort(false),
    var_mean: () => new DeterministicNumberInterface("Var Mean", 1).use(setType, probabilisticType),
    var_cv: () => new DeterministicNumberInterface("Var CV", 100).use(setType, probabilisticType),
    trend: () => new DeterministicNumberInterface("Trend", 0).use(setType, probabilisticType),
    n: () => new IntegerInterface("N", 10).use(setType, deterministicIntegerType)
  },

  outputs: {
    series: () => new NodeInterface<number[][]>("Series", []).use(setType, probabilisticSeriesType)
  },

  calculate({ trend_type, var_mean, var_cv, trend, n }, { globalValues }) {
    const mcRuns = globalValues.mcRuns;

    // convert deterministic input to probabilistic
    var_mean = makeArray(var_mean, mcRuns);
    var_cv = makeArray(var_cv, mcRuns);
    trend = makeArray(trend, mcRuns);

    const series: number[][] = [];
    for (let i = 0; i < mcRuns; i++) {
      const mean_t0 = var_mean[i];
      const variance = ((mean_t0 * var_cv[i]) / 100) ** 2;

      let result: number[] = [];
      if (variance == 0 && trend[i] == 0) {
        result = nj.ones([n]).multiply(mean_t0).tolist() as number[];
      } else {
        const mean = [];
        for (let j = 0; j < n; j++) {
          if (trend_type == ABSOLUTE_TREND_TYPE) {
            mean.push(mean_t0 + trend[i] * j);
          } else if (trend_type == RELATIVE_TREND_TYPE) {
            mean.push(mean_t0 * (1 + trend[i] / 100) ** j);
          }
        }
        if (variance == 0) {
          result = nj.array(mean).tolist() as number[];
        } else {
          for (let j = 0; j < n; j++) {
            const variance = ((mean[j] * var_cv[i]) / 100) ** 2;
            const distribution = gaussian(mean[j], variance);
            result.push(distribution.ppf(Math.random()));
          }
        }
      }

      series.push(result);
    }

    return { series };
  },

  onPlaced() {
    this.width = 220;
  }
});
