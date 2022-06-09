import { Node } from "@baklavajs/core";

export class UncertainNode extends Node {
  constructor() {
    super();
    this.addOutputInterface("Result");
  }

  calculate() {
    var result = [];
    for (var i = 0; i < 10; i++) {
      result.push(this.calculate_single());
    }

    this.getInterface("Result").value = result;
  }
}
