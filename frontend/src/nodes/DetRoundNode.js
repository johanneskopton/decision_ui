import { NumericNode } from "./NumericNode";

export class DetRoundNode extends NumericNode {
  constructor() {
    super();
    this.getInterface("Result").type = "deterministic_int";
    this.type = "RoundDeterministic";
    this.name = "RoundDeterministic";
    this.addInputInterface("x", "NumberOption", 0, { type: "deterministic" });
    this.addOption("Operation", "SelectOption", "round", undefined, {
      items: ["floor", "ceiling", "round"]
    });
  }

  calculate_single(input) {
    const operations = {
      floor: x => Math.floor(x),
      ceiling: x => Math.ceil(x),
      round: x => Math.round(x)
    };
    var result;
    const operation = this.getOptionValue("Operation");
    var x = input.x;
    x = Array.isArray(x) ? x[0] : x;
    result = operations[operation](x);
    return result;
  }
}
