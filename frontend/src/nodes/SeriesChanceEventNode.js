import { SeriesUncertainNode } from "./SeriesUncertainNode";

export class SeriesChanceEventNode extends SeriesUncertainNode {
  constructor() {
    super();
    this.type = "SeriesChanceEvent";
    this.name = "ChanceEvent";
    this.addInputInterface("chance", "NumberOption", 0, {
      min: 0,
      max: 1,
      type: "probabilistic"
    });
    this.addInputInterface("value_if", undefined, NaN, {
      type: "probabilistic_series"
    });
    this.addInputInterface("value_if_not", undefined, NaN, {
      type: "probabilistic_series"
    });
  }

  check_valid() {
    let value_if = this.getInterface("value_if").value[0];
    let value_if_not = this.getInterface("value_if_not").value[0];
    if (
      typeof value_if == "object" &&
      typeof value_if_not == "object" &&
      value_if.shape[0] == value_if_not.shape[0]
    ) {
      return true;
    } else {
      return false;
    }
  }

  calculate_single(input) {
    if (Math.random() < input.chance) {
      return input.value_if;
    } else {
      return input.value_if_not;
    }
  }
}
