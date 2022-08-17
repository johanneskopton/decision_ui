import { UncertainNode } from "./UncertainNode";

export class RoundNode extends UncertainNode {
  constructor() {
    super();
    this.getInterface("Result").type = "probabilistic_int";
    this.type = "Round";
    this.name = "Round";
    this.addInputInterface("x", "NumberOption", 0, { type: "probabilistic" });
    this.addOption("Operation", "SelectOption", "round", undefined, {
      items: ["floor", "ceiling", "round"]
    });
  }

  calculate_single(input) {
    const operations = {
      floor: x => Math.floor(x),
      ceiling: x => Math.ceil(x),
      round: x => Math.round(x)
    };
    var result;
    const operation = this.getOptionValue("Operation");
    result = operations[operation](input.x);
    return result;
  }
}
