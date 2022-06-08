import { Node } from "@baklavajs/core";

export class SumNode extends Node {
  constructor() {
    super();
    this.type = "SumNode";
    this.name = "Sum";
    this.summandInterfaces = [];
    this.adding_summand = false;
    this.add_summand();
    this.add_summand();
    this.addOutputInterface("Result");
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
    this.summandInterfaces.push(this.addInputInterface(id, "NumberOption", 0));
    this.adding_summand = false;
  }

  calculate() {
    let result = 0;
    for (let i = 0; i < this.summandInterfaces.length; i++) {
      result += this.getInterface(i).value;
    }

    this.getInterface("Result").value = result;
  }
}
