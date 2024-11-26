import { NumberInterface, setType } from "baklavajs";

import type { DistributionConfiguration } from "./base";
import { deterministicType } from "../types";

import random_trunc_normal from "../../helper/random_trunc_normal";

const q95_Z = 1.6448536269514722;

export const TNormDistirbution: DistributionConfiguration = {
  inputs: {
    lower: () => new NumberInterface("lower", -1).use(setType, deterministicType),
    upper: () => new NumberInterface("upper", 1).use(setType, deterministicType)
  },
  random_sample: (params: { lower: number; upper: number }, size): number[] => {
    const mean = (params["lower"] + params["upper"]) / 2;
    const stdDev = (params["upper"] - mean) / q95_Z;

    return [...Array(size).keys()].map(() => random_trunc_normal({ range: [0, 1], mean, stdDev }));
  }
};
