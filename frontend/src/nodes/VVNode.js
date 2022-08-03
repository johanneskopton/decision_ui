import { UncertainSeriesNode } from "./UncertainSeriesNode";
import gaussian from "gaussian";
import nj from "numjs";

export class VVNode extends UncertainSeriesNode {
  constructor() {
    super();
    this.type = "VV";
    this.name = "ValueVarier";
    this.addOption("TrendType", "SelectOption", "absolute", undefined, {
      items: ["absolute", "relative"]
    });
    this.addInputInterface("var_mean", "NumberOption", 1, {
      type: "probabilistic"
    });
    this.addInputInterface("var_CV", "NumberOption", 100, {
      type: "probabilistic"
    });
    this.addInputInterface("trend", "NumberOption", 0, {
      type: "probabilistic"
    });
    this.addInputInterface("n", "IntegerOption", 10, {
      type: "deterministic_int"
    });
  }

  calculate_single(input) {
    let mean_t0 = input.var_mean;
    let trend_type = this.getOptionValue("TrendType");
    let trend = input.trend;
    let variance = ((mean_t0 * input.var_CV) / 100) ** 2;
    let result = [];
    if (variance == 0 && trend == 0) {
      let result = nj.ones([input.n]).multiply(mean_t0);
      return result;
    }
    var mean = [];
    for (let i = 0; i < input.n; i++) {
      if (trend_type == "absolute") {
        mean.push(mean_t0 + trend * i);
      } else if (trend_type == "relative") {
        mean.push(mean_t0 * (1 + trend / 100) ** i);
      }
    }
    if (variance == 0) {
      return nj.array(mean);
    }

    for (let i = 0; i < input.n; i++) {
      let distribution = gaussian(mean[i], variance);
      result.push(distribution.ppf(Math.random()));
    }
    return nj.array(result);
  }
}
