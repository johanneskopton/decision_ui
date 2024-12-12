import { NodeInterface, NumberInterface, setType } from "baklavajs";

import { validateLowerUpper, type DistributionConfiguration } from "./base";
import { deterministicType, probabilisticType } from "../common/types";

import random_trunc_normal from "../../helper/random_trunc_normal";

const q95_Z = 1.6448536269514722;

export const PositiveNormalDistrubtion: DistributionConfiguration = {
  inputs: {
    lower: () => new NumberInterface("lower", 0.1).use(setType, deterministicType).setPort(false),
    upper: () => new NumberInterface("upper", 1).use(setType, deterministicType).setPort(false)
  },
  outputs: {
    sample: () => new NodeInterface<number[]>("Sample", [0.0]).use(setType, probabilisticType)
  },
  validate_input: ({ lower, upper }, registerValidationError) => {
    validateLowerUpper(lower, upper, registerValidationError);
    if (lower <= 0) {
      registerValidationError({
        type: "error",
        message: `Lower bound '${lower}' needs to be larger than 0.`
      });
    }
    if (upper < 0) {
      registerValidationError({
        type: "error",
        message: `Upper bound '${upper}' needs to be larger than 0.`
      });
    }
    if (!(lower >= upper * 0.1)) {
      registerValidationError({
        type: "error",
        message: `Lower bound '${lower}' needs to be at least 1/10th of the upper bound '${upper}'.`
      });
    }
  },
  generate_output: ({ lower, upper }, { globalValues }) => {
    const mean = (lower + upper) / 2;
    const stdDev = (upper - mean) / q95_Z;
    const sample = [...Array(globalValues.mcRuns).keys()].map(() =>
      random_trunc_normal({ range: [0, Infinity], mean, stdDev })
    );
    return { sample };
  }
};
