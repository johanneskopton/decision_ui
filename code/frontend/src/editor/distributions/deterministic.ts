import { NumberInterface, setType } from "baklavajs";
import type { DistributionConfiguration } from "./base";
import { deterministicType } from "../types";
import { repeat } from "@/common/array";

export const DeterministicDistribution: DistributionConfiguration = {
  inputs: {
    value: () => new NumberInterface("value", 1.0).use(setType, deterministicType)
  },
  random_sample: (params: { value: number }, size: number): number[] => {
    return repeat(params.value, size);
  }
};
