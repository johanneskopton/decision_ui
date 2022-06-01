import { UVType, UV } from "./UncertainVariable";
import { Node } from "@baklavajs/core";

export class UVNode extends Node {
  constructor() {
    super();
    this.type = "Uncertain Input";
    this.name = "Uncertain Input";
    this.addOption(
      "Probability distribution",
      "SelectOption",
      "Normal",
      undefined,
      {
        items: Object.keys(UVType)
      }
    );
    this.uv_type = false;
    this.update_uv_type = this.update_uv_type.bind(this);
    this.update_uv_type();
    this.events.update.addListener(undefined, this.update_uv_type);
    this.addOutputInterface("Output");
  }

  update_uv_type() {
    if (this.uv_type.name != this.getOptionValue("Probability distribution")) {
      let old_uv_type = this.uv_type;
      this.uv_type = UVType[this.getOptionValue("Probability distribution")];
      this.uv_type.params.forEach(element => {
        if (!old_uv_type || !old_uv_type.params.includes(element)) {
          this.addInputInterface(element, "NumberOption", 0);
        }
      });
      if (old_uv_type) {
        old_uv_type.params.forEach(element => {
          if (!this.uv_type.params.includes(element)) {
            this.removeInterface(element);
          }
        });
      }
    }
  }

  calculate() {
    let params = new Object();
    this.uv_type.params.forEach(element => {
      params[element] = this.getInterface(element).value;
    });
    this.uv = new UV(this.uv_type, params);
    let result;
    if (this.uv.is_valid) {
      result = this.uv.get_most_likely();
    } else {
      result = NaN;
    }

    this.getInterface("Output").value = result;
  }
}
