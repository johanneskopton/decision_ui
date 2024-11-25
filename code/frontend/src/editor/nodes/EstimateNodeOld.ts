import { UVType, UV } from "../../common/UncertainVariable";
import { UncertainNode } from "./UncertainNode";
import store from "../../vuex_store";
import { DynamicNode, NodeInterface, SelectInterface, setType, type CalculateFunction, type CalculationContext, defineDynamicNode } from "baklavajs";

import { NORMAL_DISTRIBUTION, type DistributionSetType } from "../distributions/normal";
import { BaseNode } from "./BaseNode";
import { probabilisticType } from "../types";

interface EstimateInputs {
  distribution: DistributionSetType;
}

interface EstimateOutputs {
  sample: number[];
}

export class EstimateNode extends DynamicNodeNode<EstimateInputs, EstimateOutputs> {

  public type = "Estimate";

  public get title() {
    return this.type;
  };

  public inputs = {
    distribution: new SelectInterface<DistributionSetType>("distribution", NORMAL_DISTRIBUTION, [NORMAL_DISTRIBUTION]).setPort(false),
  }

  public outputs = {
    sample: new NodeInterface<number[]>("sample", [0.0]).use(setType, probabilisticType),
  }

  constructor() {
    super();
    this.initializeIo();
  }

  public onUpdate() {

  }

  public calculate: CalculateFunction<EstimateInputs, EstimateOutputs> = (inputs, context): EstimateOutputs => {
    return this._calculate(inputs, context);
  }

  public _calculate({ distribution }: EstimateInputs, context: CalculationContext): EstimateOutputs {

    return { sample: [] };
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

  public calculate: CalculateFunction<I, NumericOutputs> = (inputs, context) => {
    return super.calculate(inputs, context);
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
