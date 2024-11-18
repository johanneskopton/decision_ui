import { SeriesUncertainNode } from "./SeriesUncertainNode";
import nj from "numjs";

export class SeriesComparisonNode extends SeriesUncertainNode {
  constructor() {
    super();
    this.type = "SeriesComparison";
    this.name = "Comparison";
    this.addInputInterface("A", undefined, NaN, {
      type: "probabilistic_series"
    });
    this.addInputInterface("B", undefined, NaN, {
      type: "probabilistic_series"
    });
    this.addOption("Operation", "SelectOption", ">", undefined, {
      items: [">", "<", "<=", ">="]
    });
  }

  check_valid() {
    let A = this.getInterface("A").value[0];
    let B = this.getInterface("B").value[0];
    return (
      typeof A == "object" && typeof B == "object" && A.shape[0] == B.shape[0]
    );
  }

  calculate_single(input) {
    const operations = {
      ">": (A, B) => A > B,
      "<": (A, B) => A < B,
      "<=": (A, B) => A <= B,
      ">=": (A, B) => A >= B
    };
    const operation = this.getOptionValue("Operation");
    var result = nj.zeros(input.A.shape);
    var operation_function = operations[operation];
    for (let i = 0; i < input.A.shape[0]; i++) {
      result.set(i, operation_function(input.A.get(i), input.B.get(i)) * 1);
    }
    return result;
  }
}
