import { NumericNode } from "./NumericNode";

export class UncertainNode extends NumericNode {
  constructor() {
    super();
    this.getInterface("Result").type = "probabilistic";
  }

  calculate() {
    var result = [];
    var input_interfaces = this.inputInterfaces;
    var input_values = new Object();
    Object.keys(input_interfaces).forEach(e => {
      input_values[e] = input_interfaces[e].value;
    });
    for (var i = 0; i < 10; i++) {
      var input_values_sample = new Object();
      Object.keys(input_values).forEach(e => {
        if (input_values[e].length) {
          input_values_sample[e] = input_values[e][i];
        } else {
          input_values_sample[e] = input_values[e];
        }
      });
      result.push(this.calculate_single(input_values_sample));
    }

    this.getInterface("Result").value = result;
    this.check_valid();
  }
}
