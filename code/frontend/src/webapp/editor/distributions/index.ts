import type { DistributionConfiguration } from "./base";

import { NormalDistrubtion } from "./normal";
import { DeterministicDistribution } from "./deterministic";
import { PositiveNormalDistrubtion } from "./posnorm";
import { TNormDistirbution } from "./tnorm";

export const DETERMINISTIC_DISTRIBUTION = "deterministic";
export const NORMAL_DISTRIBUTION = "norm";
export const POSITIVE_NORMAL_DISTRIBUTION = "posnorm";
export const TNORM_DISTRIBUTION = "tnorm_0_1";

export type AvailableDistributionsType = "deterministic" | "norm" | "posnorm" | "tnorm_0_1";

export const DISRTIBUTIONS: { [key in AvailableDistributionsType]: DistributionConfiguration } = {
  [DETERMINISTIC_DISTRIBUTION]: DeterministicDistribution,
  [NORMAL_DISTRIBUTION]: NormalDistrubtion,
  [POSITIVE_NORMAL_DISTRIBUTION]: PositiveNormalDistrubtion,
  [TNORM_DISTRIBUTION]: TNormDistirbution
};

export const AVAILABLE_DISTRIBUTIONS = Object.keys(DISRTIBUTIONS);
