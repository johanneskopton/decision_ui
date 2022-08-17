import { Node } from "@baklavajs/core";

export class NumericNode extends Node {
  constructor() {
    super();
    this.addOutputInterface("Result");
  }
  check_valid() {
    return true;
  }
  set_error(is_error) {
    this.customClasses = is_error ? "error" : "no_error";
  }

  calculate() {
    if (typeof this._calculate === "function") {
      // additional operations, that only need to be executed once on every change
      // not every mc run
      this._calculate();
    }
    if (this.check_valid()) {
      this.set_error(false);
      let result = this.calculate_scalar();
      this.getInterface("Result").value = result;
    } else {
      this.set_error(true);
      this.getInterface("Result").value = NaN;
    }
  }

  calculate_scalar() {
    var input_interfaces = this.inputInterfaces;
    var input_values = new Object();
    Object.keys(input_interfaces).forEach(e => {
      input_values[e] = input_interfaces[e].value;
    });
    var input_values_sample = new Object();
    Object.keys(input_values).forEach(e => {
      if (input_values[e] === null) {
        input_values[e] = 0;
      }
      if (input_values[e].length) {
        // if input is probabilistic
        input_values_sample[e] = input_values[e][0];
      } else {
        // if input is deterministic
        input_values_sample[e] = input_values[e];
      }
    });
    return this.calculate_single(input_values_sample);
  }
}
