export const UVType = {
  norm: {
    id: 2,
    name: "norm",
    params: ["lower", "upper"],
    checks: [
      params => {
        return params["lower"] <= params["upper"];
      }
    ],
    most_likely: params => {
      return (params["lower"] + params["upper"]) / 2;
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
}
