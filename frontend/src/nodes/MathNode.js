import { UncertainNode } from "./UncertainNode";

export class MathNode extends UncertainNode {
  constructor() {
    super();
    this.type = "Math";
    this.name = "Math";
    this.addInputInterface("A", "NumberOption", 1, { type: "probabilistic" });
    this.addInputInterface("B", "NumberOption", 10, { type: "probabilistic" });
    this.addOption("Operation", "SelectOption", "Add", undefined, {
      items: ["Add", "Subtract", "Multiply", "Divide"]
    });
  }

  calculate_single(input) {
    const operations = {
      Add: (A, B) => A + B,
      Subtract: (A, B) => A - B,
      Multiply: (A, B) => A * B,
      Divide: (A, B) => A / B
    };
    var result;
    const operation = this.getOptionValue("Operation");
    result = operations[operation](input.A, input.B);
    return result;
  }
}
