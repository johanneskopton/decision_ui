import { Node } from "@baklavajs/core";

export class NumericNode extends Node {
  constructor() {
    super();
    this.addOutputInterface("Result");
  }
  check_valid() {}
  set_error(is_error) {
    this.customClasses = is_error ? "error" : "no_error";
  }
}
