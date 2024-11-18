import { UncertainNode } from "./UncertainNode";

export class ComparisonNode extends UncertainNode {
  constructor() {
    super();
    this.getInterface("Result").type = "probabilistic_int";
    this.type = "Comparison";
    this.name = "Comparison";
    this.addInputInterface("A", "NumberOption", 1, { type: "probabilistic" });
    this.addInputInterface("B", "NumberOption", 10, { type: "probabilistic" });
    this.addOption("Operation", "SelectOption", ">", undefined, {
      items: [">", "<", "<=", ">="]
    });
  }

  calculate_single(input) {
    const operations = {
      ">": (A, B) => A > B,
      "<": (A, B) => A < B,
      "<=": (A, B) => A <= B,
      ">=": (A, B) => A >= B
    };
    var result;
    const operation = this.getOptionValue("Operation");
    result = operations[operation](input.A, input.B) * 1;
    return result;
  }
}
