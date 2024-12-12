import { NodeInterface, NumberInterface, setType } from "baklavajs";

import { validateLowerUpper, type DistributionConfiguration } from "./base";
import { deterministicType, probabilisticType } from "../common/types";

import random_trunc_normal from "../../helper/random_trunc_normal";

const q95_Z = 1.6448536269514722;

export const TNormDistirbution: DistributionConfiguration = {
  inputs: {
    lower: () => new NumberInterface("lower", 0).use(setType, deterministicType).setPort(false),
    upper: () => new NumberInterface("upper", 1).use(setType, deterministicType).setPort(false)
  },
  outputs: {
    sample: () => new NodeInterface<number[]>("Sample", [0.0]).use(setType, probabilisticType)
  },
  validate_input: ({ lower, upper }, registerValidationError) => {
    validateLowerUpper(lower, upper, registerValidationError);
    if (!(lower >= upper * 0.1)) {
      registerValidationError({
        type: "error",
        message: `Lower bound '${lower}' needs to be at least 1/10th of the upper bound '${upper}'.`
      });
    }
    if (lower < 0 || lower > 1) {
      registerValidationError({
        type: "error",
        message: `Lower bound '${lower}' needs to be between 0 and 1.`
      });
    }
    if (upper < 0 || upper > 1) {
      registerValidationError({
        type: "error",
        message: `Upper bound '${upper}' needs to be between 0 and 1.`
      });
    }
    if (!(lower + (1 - lower) * 0.9 >= upper)) {
      registerValidationError({
        type: "error",
        message: `Lower bound '${lower}' needs to be higher.`
      });
    }
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
