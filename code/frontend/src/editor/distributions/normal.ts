import gaussian from "gaussian";
import { NodeInterface, NumberInterface, setType } from "baklavajs";

import type { DistributionConfiguration } from "./base";
import { deterministicType, probabilisticType } from "../common/types";

const q95_Z = 1.6448536269514722;

export const NormalDistrubtion: DistributionConfiguration = {
  inputs: {
    lower: () => new NumberInterface("lower", -1).use(setType, deterministicType).setPort(false),
    upper: () => new NumberInterface("upper", 1).use(setType, deterministicType).setPort(false)
  },
  outputs: {
    sample: () => new NodeInterface<number[]>("Sample", [0.0]).use(setType, probabilisticType)
  },
  generate_output: ({ lower, upper }, { globalValues }) => {
    const mean = (lower + upper) / 2;
    const std = (upper - mean) / q95_Z;
    const variance = std ** 2;
    const distribution = gaussian(mean, variance);
    return {
      sample: [...Array(globalValues.mcRuns).keys()].map(() => distribution.ppf(Math.random()))
    };
  }
};
