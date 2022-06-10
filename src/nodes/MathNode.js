import { NumericNode } from "./NumericNode";

export class MathNode extends NumericNode {
  constructor() {
    super();
    this.type = "MathNode";
    this.name = "Math";
    this.addInputInterface("A", "NumberOption", 1);
    this.addInputInterface("B", "NumberOption", 10);
    this.addOption("Operation", "SelectOption", "Add", undefined, {
      items: ["Add", "Subtract", "Multiply", "Divide"]
    });
    this.addOutputInterface("Result");
  }

  calculate() {
    const n1 = this.getInterface("A").value;
    const n2 = this.getInterface("B").value;
    const operation = this.getOptionValue("Operation");
    let result;
    if (operation === "Add") {
      result = n1 + n2;
    } else if (operation === "Subtract") {
      result = n1 - n2;
    } else if (operation === "Multiply") {
      result = n1 * n2;
    } else if (operation === "Divide") {
      result = n1 / n2;
    }

    this.getInterface("Result").value = result;
  }
}
