import { SeriesUncertainNode } from "./SeriesUncertainNode";

export class SeriesMathNode extends SeriesUncertainNode {
  constructor() {
    super();
    this.type = "SeriesMath";
    this.name = "Math";
    this.addInputInterface("A", undefined, NaN, {
      type: "probabilistic_series"
    });
    this.addInputInterface("B", undefined, NaN, {
      type: "probabilistic_series"
    });
    this.addOption("Operation", "SelectOption", "Add", undefined, {
      items: ["Add", "Subtract", "Multiply", "Divide"]
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
      Add: (A, B) => A.add(B),
      Subtract: (A, B) => A.subtract(B),
      Multiply: (A, B) => A.multiply(B),
      Divide: (A, B) => A.divide(B)
    };
    const operation = this.getOptionValue("Operation");
    return operations[operation](input.A, input.B);
  }
}
