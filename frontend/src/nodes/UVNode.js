import { UVType, UV } from "../UncertainVariable";
import { UncertainNode } from "./UncertainNode";

export class UVNode extends UncertainNode {
  constructor() {
    super();
    this.type = "UncertainInput";
    this.name = "UncertainInput";
    this.addOption(
      "Probability distribution",
      "SelectOption",
      "norm",
      undefined,
      {
        items: Object.keys(UVType)
      }
    );
    this.uv_type = false;
    this.update_uv_type = this.update_uv_type.bind(this);
    this.update_uv_type();
    this.events.update.addListener(undefined, this.update_uv_type);
  }

  update_uv_type() {
    if (this.uv_type.name != this.getOptionValue("Probability distribution")) {
      let old_uv_type = this.uv_type;
      this.uv_type = UVType[this.getOptionValue("Probability distribution")];
      this.uv_type.params.forEach(element => {
        if (!old_uv_type || !old_uv_type.params.includes(element)) {
          this.addInputInterface(element, "NumberOption", 0, {
            type: "deterministic"
          });
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

  calculate_single(_) {
    let params = new Object();
    this.uv_type.params.forEach(element => {
      params[element] = this.getInterface(element).value;
    });
    this.uv = new UV(this.uv_type, params);
    let result;
    if (this.uv.is_valid) {
      result = this.uv.get_random_sample();
      this.set_error(false);
    } else {
      result = NaN;
      this.set_error(true);
    }
    return result;
  }

  set_error(is_error) {
    this.customClasses = is_error ? "error" : "no_error";
  }
}
