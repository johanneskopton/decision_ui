import type { DistributionConfiguration } from "./base";

import { NormalDistrubtion } from "./normal";
import { ConstantDistribution } from "./constant";

export const CONSTANT_DISTRIBUTION = "constant";
export const NORMAL_DISTRIBUTION = "norm";

export type AvailableDistributionsType = "constant" | "norm";

export const DISRTIBUTIONS: { [key in AvailableDistributionsType]: DistributionConfiguration } = {
    [CONSTANT_DISTRIBUTION]: ConstantDistribution,
    [NORMAL_DISTRIBUTION]: NormalDistrubtion,
};

export const AVAILABLE_DISTRIBUTIONS = Object.keys(DISRTIBUTIONS);

