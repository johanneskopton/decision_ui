import gaussian from "gaussian";

// 95% quantile of the standard normal distribution
const q95_Z = 1.6448536269514722;

export const UVType = {
  deterministic: {
    id: 0,
    name: "deterministic",
    params: ["value"],
    checks: [],
    most_likely: params => params.value,
    random_sample: params => params.value
  },
  norm: {
    id: 2,
    name: "norm",
    params: ["lower", "upper"],
    checks: [
      params => {
        return params["lower"] < params["upper"];
      }
    ],
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
