import { UncertainNode } from "./UncertainNode";

const alpha = Array.from(Array(26)).map((e, i) => i + 65);
const alphabet = alpha.map(x => String.fromCharCode(x));

export class SumNode extends UncertainNode {
  constructor() {
    super();
    this.type = "Sum";
    this.name = "Sum";
    this.summandInterfaces = [];
    this.adding_summand = false;
    this.add_summand();
    this.add_summand();
    this.check_add_summand = this.check_add_summand.bind(this);
    this.check_add_summand();
    this.events.update.addListener(undefined, this.check_add_summand);
  }

  check_add_summand() {
    if (this.summandInterfaces.length > 1 && !this.adding_summand) {
      if (
        this.summandInterfaces[this.summandInterfaces.length - 1].value != 0
      ) {
        this.add_summand();
      }
    }
  }

  add_summand() {
    var id = this.summandInterfaces.length;
    this.adding_summand = true;
    this.summandInterfaces.push(
      this.addInputInterface(alphabet[id], "NumberOption", 0, {
        type: "probabilistic"
      })
    );
    this.adding_summand = false;
  }

  calculate_single(input) {
    let result = 0;
    for (let i = 0; i < this.summandInterfaces.length; i++) {
      result += input[alphabet[i]];
    }
    return result;
  }
}
