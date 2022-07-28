import gaussian from "gaussian";
import random_trunc_normal from "./helper/random_trunc_normal";

// 95% quantile of the standard normal distribution
const q95_Z = 1.6448536269514722;

const numeric_tolerance = 1e-5;

const lower_upper_check = params => {
  return params["lower"] + numeric_tolerance < params["upper"];
};

export const UVType = {
  /*deterministic: {
    id: 0,
    name: "deterministic",
    params: ["value"],
    checks: [],
    most_likely: params => params.value,
    random_sample: params => params.value
  },*/
  norm: {
    id: 2,
    name: "norm",
    params: ["lower", "upper"],
    checks: [lower_upper_check],
    most_likely: params => {
      return (params["lower"] + params["upper"]) / 2;
    },
    random_sample: params => {
      let mean = (params["lower"] + params["upper"]) / 2;
      let std = (params["upper"] - mean) / q95_Z;
      let variance = std ** 2;
      let distribution = gaussian(mean, variance);
      return distribution.ppf(Math.random());
    }
  },
  posnorm: {
    id: 3,
    name: "posnorm",
    params: ["lower", "upper"],
    checks: [
      lower_upper_check,
      params => {
        return params["lower"] > params["upper"] * 0.1;
        let variance = std ** 2;
      }
    ],
    most_likely: params => {
      let mean = (params["lower"] + params["upper"]) / 2;
      return Math.max(0, mean);
    },
    random_sample: params => {
      let mean = (params["lower"] + params["upper"]) / 2;
      let stdDev = (params["upper"] - mean) / q95_Z;
      return random_trunc_normal({ range: [0, Infinity], mean, stdDev });
    }
  }
  /*Bernoulli: {
    id: 1,
    name: "Bernoulli",
    params: ["p"],
    checks: [
      params => {
        return 0 <= params["p"] && params["p"] <= 1;
      }
    ],
    most_likely: params => {
      return (params["p"] >= 0.5) * 1;
    }
  }*/
};

export class UV {
  constructor(type, params) {
    this.type = type;
    // check param completeness
    this.type.params.forEach(element => {
      if (!(element in params)) {
        throw new Error("incomplete definition of random variable!");
      }
    });
    this.params = params;
    // check param validity
    this.is_valid = true;
    this.type.checks.forEach(element => {
      this.is_valid = this.is_valid && element(this.params);
    });
  }

  get_most_likely() {
    return this.type.most_likely(this.params);
  }

  get_random_sample() {
    return this.type.random_sample(this.params);
  }
}
