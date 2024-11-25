import gaussian from "gaussian";
import { NumberInterface, setType } from "baklavajs";

import type { DistributionConfiguration } from "./base";
import { deterministicType } from "../types";

const q95_Z = 1.6448536269514722;

export const NormalDistrubtion: DistributionConfiguration = {
  inputs: {
    lower: () => new NumberInterface("lower", -1).use(setType, deterministicType),
    upper: () => new NumberInterface("upper", 1).use(setType, deterministicType)
  },
  random_sample: (params: { lower: number; upper: number }, size): number[] => {
    const mean = (params.lower + params.upper) / 2;
    const std = (params.upper - mean) / q95_Z;
    const variance = std ** 2;
    const distribution = gaussian(mean, variance);
    return [...Array(size).keys()].map(() => distribution.ppf(Math.random()));
  }
};


