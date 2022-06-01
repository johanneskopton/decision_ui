export const UVType = {
  Normal: {
    id: 2,
    name: "Normal",
    params: ["min90ci", "max90ci"],
    checks: [
      params => {
        return params["min90ci"] <= params["max90ci"];
      }
    ],
    most_likely: params => {
      return (params["min90ci"] + params["max90ci"]) / 2;
    }
  },
  Bernoulli: {
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
  }
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
