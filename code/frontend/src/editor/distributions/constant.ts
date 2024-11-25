import { NumberInterface } from "baklavajs";
import type { DistributionConfiguration } from "./base";

export const ConstantDistribution: DistributionConfiguration = {
    inputs: {
      value: () => new NumberInterface("value", 1.0)
    },
    random_sample: (params: { value: number }, size: number): number[] => {
      return [...Array(size).keys()].map(() => params.value);
    }
  };
