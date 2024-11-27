import { NodeInterface, NumberInterface, setType } from "baklavajs";

import type { DistributionConfiguration } from "./base";
import { deterministicType, probabilisticType } from "../common/types";

import random_trunc_normal from "../../helper/random_trunc_normal";

const q95_Z = 1.6448536269514722;

export const TNormDistirbution: DistributionConfiguration = {
  inputs: {
    lower: () => new NumberInterface("lower", -1).use(setType, deterministicType).setPort(false),
    upper: () => new NumberInterface("upper", 1).use(setType, deterministicType).setPort(false)
  },
  outputs: {
    sample: () => new NodeInterface<number[]>("Sample", [0.0]).use(setType, probabilisticType)
  },
  generate_output: ({ lower, upper }, { globalValues }) => {
    const mean = (lower + upper) / 2;
    const stdDev = (upper - mean) / q95_Z;
    const sample = [...Array(globalValues.mcRuns).keys()].map(() =>
      random_trunc_normal({ range: [0, 1], mean, stdDev })
    );
    return { sample };
  }
};
