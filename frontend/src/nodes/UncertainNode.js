import { NumericNode } from "./NumericNode";

const MC_RUNS = 1000;

export class UncertainNode extends NumericNode {
  constructor() {
    super();
    this.getInterface("Result").type = "probabilistic";
  }

  calculate() {
    if (typeof this._calculate === "function") {
      // additional operations, that only need to be executed once on every change
      // not every mc run
      this._calculate();
    }
    var result = this.calculate_scalar(MC_RUNS);
    this.getInterface("Result").value = result;
    this.check_valid();
  }

  calculate_scalar(mc_runs) {
    var result = [];
    var input_interfaces = this.inputInterfaces;
    var input_values = new Object();
    Object.keys(input_interfaces).forEach(e => {
      input_values[e] = input_interfaces[e].value;
    });
    for (var i = 0; i < mc_runs; i++) {
      var input_values_sample = new Object();
      Object.keys(input_values).forEach(e => {
        if (input_values[e] === null) {
          input_values[e] = 0;
        }
        if (input_values[e].length) {
          // if input is probabilistic
          input_values_sample[e] = input_values[e][i];
        } else {
          // if input is deterministic
          input_values_sample[e] = input_values[e];
        }
      });
      // run one Monte Carlo sample
      result.push(this.calculate_single(input_values_sample));
    }
    return result;
  }
}
