import { SeriesUncertainNode } from "./SeriesUncertainNode";
import nj from "@d4c/numjs";

export class ToSeriesNode extends SeriesUncertainNode {
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
    this.timestep_option = false;
    this.addOption("TimestepMethod", "SelectOption", "every", undefined, {
      items: ["every", "as defined"]
    });
    this.check_timestep_method = this.check_timestep_method.bind(this);
    this.check_timestep_method();
    this.events.update.addListener(undefined, this.check_timestep_method);
  }

  check_timestep_method() {
    if (
      this.getOptionValue("TimestepMethod") == "as defined" &&
      !this.timestep_option
    ) {
      this.timestep_option = true;
      this.addInputInterface("timestep", "IntegerOption", 0, {
        type: "probabilistic_int"
      });
    } else if (
      this.getOptionValue("TimestepMethod") == "every" &&
      this.timestep_option
    ) {
      this.removeInterface("timestep");
      this.timestep_option = false;
    }
  }

  calculate_single(input) {
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
