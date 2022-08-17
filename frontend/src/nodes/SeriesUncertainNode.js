import { UncertainNode } from "./UncertainNode";

export class SeriesUncertainNode extends UncertainNode {
  constructor() {
    super();
    this.getInterface("Result").type = "probabilistic_series";
  }
}
