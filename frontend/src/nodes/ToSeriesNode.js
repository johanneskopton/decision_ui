import { UncertainSeriesNode } from "./UncertainSeriesNode";
import nj from "numjs";

export class ToSeriesNode extends UncertainSeriesNode {
  constructor() {
    super();
    this.type = "ToSeries";
    this.name = "ToSeries";
    this.addInputInterface("value", "NumberOption", 1, {
      type: "probabilistic"
    });
    this.addInputInterface("n", "IntegerOption", 10, {
      type: "deterministic_int"
    });
    this.addInputInterface("timestep", "IntegerOption", 0, {
      type: "deterministic_int"
    });
    this.addOption("TimestepMethod", "SelectOption", "every", undefined, {
      items: ["every", "as defined"]
    });
  }

  calculate_single(input) {
    var result;
    const TimestepMethod = this.getOptionValue("TimestepMethod");
    if (TimestepMethod == "every") {
      return nj.ones([input.n]).multiply(input.value);
    } else if (TimestepMethod == "as defined") {
      let result = nj.zeros([input.n]);
      result.set(input.timestep, input.value);
      return result;
    }
  }
}
