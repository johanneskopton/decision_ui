import { NodeInterface, NumberInterface, setType } from "baklavajs";
import type { DistributionConfiguration } from "./base";
import { deterministicType } from "../common/types";

export const DeterministicDistribution: DistributionConfiguration = {
  inputs: {
    value: () => new NumberInterface("value", 1.0).use(setType, deterministicType).setPort(false)
  },
  outputs: {
    value: () => new NodeInterface<number>("Value", 0.0).use(setType, deterministicType)
  },
  validate_input: () => null,
  generate_output: ({ value }) => {
    return { value };
  }
};
