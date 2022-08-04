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

  calculate_single(input) {
    const operations = {
      Add: (A, B) => A.add(B),
      Subtract: (A, B) => A.subtract(B),
      Multiply: (A, B) => A.multiply(B),
      Divide: (A, B) => A.divide(B)
    };
    var result;
    const operation = this.getOptionValue("Operation");
    if (
      typeof input.A == "object" &&
      typeof input.B == "object" &&
      input.A.shape[0] == input.B.shape[0]
    ) {
      result = operations[operation](input.A, input.B);
      this.set_error(false);
      return result;
    } else {
      this.set_error(true);
      return NaN;
    }
  }
}
