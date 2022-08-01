import { UncertainNode } from "./UncertainNode";

export class UncertainSeriesNode extends UncertainNode {
  constructor() {
    super();
    this.getInterface("Result").type = "probabilistic_series";
  }
}
