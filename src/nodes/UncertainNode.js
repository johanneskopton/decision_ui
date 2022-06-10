import { NumericNode } from "./NumericNode";

export class UncertainNode extends NumericNode {
  constructor() {
    super();
  }

  calculate() {
    var result = [];
    for (var i = 0; i < 10; i++) {
      result.push(this.calculate_single());
    }

    this.getInterface("Result").value = result;
    this.check_valid();
  }
}
