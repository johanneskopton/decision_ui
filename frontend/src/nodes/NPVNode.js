import { UncertainNode } from "./UncertainNode";
import nj from "numjs";

export class NPVNode extends UncertainNode {
  constructor() {
    super();
    this.type = "NPV";
    this.name = "Net Present Value";
    this.addInputInterface("x", undefined, undefined, {
      type: "probabilistic_series"
    });
    this.addInputInterface("discount", "NumberOption", 10, {
      type: "probabilistic"
    });
  }

  calculate_single(input) {
    var result = 0;
    var i = 0;
    if (input.x) {
      input.x.tolist().forEach(e => {
        result += e * (1 - input.discount / 100) ** i;
        i++;
      });
      return result;
    } else {
      return 0;
    }
  }
}
