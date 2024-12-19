import { defineDynamicNode, SelectInterface, TextInterface } from "baklavajs";

import {
  AVAILABLE_DISTRIBUTIONS,
  DISRTIBUTIONS,
  NORMAL_DISTRIBUTION,
  type AvailableDistributionsType
} from "../distributions";

import type { ValidationFeedback } from "../common/validate";

export const EstimateNode = defineDynamicNode({
  type: "Estimate",

  title: "Estimate",

  inputs: {
    distribution: () =>
      new SelectInterface<AvailableDistributionsType>(
        "Distribution",
        NORMAL_DISTRIBUTION,
        AVAILABLE_DISTRIBUTIONS
      ).setPort(false),
    comment: () => new TextInterface("comment", "").setHidden(true).setPort(false)
  },

  outputs: {},

  onUpdate({ distribution }) {
    return {
      inputs: DISRTIBUTIONS[distribution].inputs,
      outputs: DISRTIBUTIONS[distribution].outputs
    };
  },

  calculate({ distribution, ...params }, context) {
    DISRTIBUTIONS[distribution].validate_input(params, (error: ValidationFeedback) => {
      context.globalValues.registerValidationError(this, error);
    });
    return DISRTIBUTIONS[distribution].generate_output(params, context);
  }
});
