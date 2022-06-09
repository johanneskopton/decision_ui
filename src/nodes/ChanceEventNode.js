import { Node } from "@baklavajs/core";

export class ChanceEventNode extends Node {
  constructor() {
    super();
    this.type = "ChanceEventNode";
    this.name = "ChanceEvent";
    this.addInputInterface("chance", "NumberOption", 0, { min: 0, max: 1 });
    this.addInputInterface("value_if", "NumberOption", 1);
    this.addInputInterface("value_if_not", "NumberOption", 0);
    this.addOutputInterface("Result");
  }

  calculate() {
    const chance = this.getInterface("chance").value;
    const value_if = this.getInterface("value_if").value;
    const value_if_not = this.getInterface("value_if_not").value;
    var result;
    // short for if ...
    result =
      (value_if - value_if_not) * (Math.random() < chance) + value_if_not;
    this.getInterface("Result").value = result;
  }
}
