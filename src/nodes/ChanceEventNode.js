import { UncertainNode } from "./UncertainNode";

export class ChanceEventNode extends UncertainNode {
  constructor() {
    super();
    this.type = "ChanceEventNode";
    this.name = "ChanceEvent";
    this.addInputInterface("chance", "NumberOption", 0, {
      min: 0,
      max: 1,
      type: "deterministic"
    });
    this.addInputInterface("value_if", "NumberOption", 1, {
      type: "probabilistic"
    });
    this.addInputInterface("value_if_not", "NumberOption", 0, {
      type: "probabilistic"
    });
  }

  calculate_single(input) {
    var result;
    // short for if ...
    result =
      (input.value_if - input.value_if_not) * (Math.random() < input.chance) +
      input.value_if_not;
    return result;
  }
}
