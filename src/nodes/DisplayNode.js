import { Node } from "@baklavajs/core";

export class DisplayNode extends Node {
  constructor() {
    super();
    this.type = "DisplayNode";
    this.name = "Display";
    this.addInputInterface("Value", undefined, 0, { type: "probabilistic" });
    this.addOption("ValueText", "HistogramOption");
  }
  calculate() {
    let value = this.getInterface("Value").value;
    if (typeof value === "number") {
      value = value.toFixed(3);
    }
    this.setOptionValue("ValueText", value);
  }
}
