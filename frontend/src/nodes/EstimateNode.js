import { UVType, UV } from "../UncertainVariable";
import { UncertainNode } from "./UncertainNode";
import store from "../vuex_store";

export class EstimateNode extends UncertainNode {
  constructor() {
    super();
    this.type = "Estimate";
    this.name = "Estimate";
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
          this.addOption(element, "NumberOption", (element == "upper") * 1);
        }
      });
      if (old_uv_type) {
        old_uv_type.params.forEach(element => {
          if (!this.uv_type.params.includes(element)) {
            this.removeOption(element);
          }
        });
      }
      if (this.getOptionValue("Probability distribution") == "deterministic") {
        this.removeInterface("Result");
        this.addOutputInterface("Result");
        this.getInterface("Result").type = "deterministic";
      } else if (old_uv_type.name == "deterministic") {
        // only if it was deterministic before
        this.removeInterface("Result");
        this.addOutputInterface("Result");
        this.getInterface("Result").type = "probabilistic";
      }
    }
  }

  calculate_scalar(MC_RUNS) {
    let params = new Object();
    this.uv_type.params.forEach(element => {
      params[element] = this.getOptionValue(element);
    });
    this.uv = new UV(this.uv_type, params);
    let result = [];
    if (this.uv.is_valid) {
      for (let i = 0; i < MC_RUNS; i++) {
        result.push(this.uv.get_random_sample());
      }
      this.set_error(false);
    } else {
      result = NaN;
      this.set_error(true);
    }
    return result;
  }

  _calculate() {
    var estimate_obj = {};
    this.uv_type.params.forEach(element => {
      if (element == "value") {
        let value = this.getOptionValue(element);
        estimate_obj["lower"] = value;
        estimate_obj["upper"] = value;
      }
      estimate_obj[element] = this.getOptionValue(element);
    });
    estimate_obj["label"] = this.name;
    estimate_obj["variable"] = this.name;
    estimate_obj["distribution"] = this.getOptionValue(
      "Probability distribution"
    );
    // estimate_obj["median"] = "";
    store.state.model.estimates = store.state.model.estimates.filter(function(
      value
    ) {
      return value["variable"] != this.name;
    },
    this);
    store.state.model.estimates.push(estimate_obj);
  }
}
