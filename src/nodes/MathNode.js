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
    const A = this.getInterface("A").value;
    const B = this.getInterface("B").value;
    const operations = {
      Add: (A, B) => A + B,
      Subtract: (A, B) => A - B,
      Multiply: (A, B) => A * B,
      Divide: (A, B) => A / B
    };
    var result;
    const operation = this.getOptionValue("Operation");

    if (A.length && B.length) {
      // both are vectors
      if (A.length == B.length) {
        // need to have the same length
        result = A.map((e, i) => operations[operation](e, B[i]));
      } else {
        result = undefined;
      }
    } else if (!isNaN(A) && !isNaN(B)) {
      // both are scalars
      result = operations[operation](A, B);
    } else {
      // one is vector, one is scalar
      if (A.length) {
        // A is the vector
        result = A.map(e => operations[operation](e, B));
      } else {
        // B is the vector
        result = B.map(e => operations[operation](A, e));
      }
    }

    this.getInterface("Result").value = result;
  }
}
