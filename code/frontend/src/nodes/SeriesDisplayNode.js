import { Node } from "@baklavajs/core";

export class SeriesDisplayNode extends Node {
  constructor() {
    super();
    this.type = "SeriesDisplay";
    this.name = "Display";
    this.addInputInterface("Value", undefined, [0], {
      type: "probabilistic_series"
    });
    this.addOption("UseAverage", "CheckboxOption");
    this.addOption("DiagramValue", "SeriesDiagramOption");
  }
  calculate() {
    let value = Object();
    value.value = this.getInterface("Value").value;
    value.use_average = this.getOptionValue("UseAverage");
    this.setOptionValue("DiagramValue", value);
  }
}
