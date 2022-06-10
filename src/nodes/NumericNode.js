import { Node } from "@baklavajs/core";

export class NumericNode extends Node {
  constructor() {
    super();
    this.addOutputInterface("Result");
  }

  check_valid() {}
}
