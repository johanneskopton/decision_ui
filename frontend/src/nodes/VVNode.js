import { UncertainSeriesNode } from "./UncertainSeriesNode";
import gaussian from "gaussian";
import nj from "numjs";

export class VVNode extends UncertainSeriesNode {
  constructor() {
    super();
    this.type = "VV";
    this.name = "ValueVarier";
    this.addInputInterface("var_mean", "NumberOption", 1, {
      type: "probabilistic"
    });
    this.addInputInterface("var_CV", "NumberOption", 100, {
      type: "probabilistic"
    });
    this.addInputInterface("n", "IntegerOption", 10, {
      type: "deterministic_int"
    });
  }

  calculate_single(input) {
    let mean = input.var_mean;
    let variance = ((mean * input.var_CV) / 100) ** 2;
    let result = [];
    if (variance > 0) {
      let distribution = gaussian(mean, variance);
      for (let i = 0; i < input.n; i++) {
        result.push(distribution.ppf(Math.random()));
      }
      result = nj.array(result);
    } else {
      result = nj.ones([input.n]).multiply(mean);
    }
    return result;
  }
}
