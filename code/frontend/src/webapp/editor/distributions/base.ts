import type { CalculateFunctionReturnType, CalculationContext, NodeInterface } from "baklavajs";
import type { ValidationFeedback } from "../common/validate";

const numeric_tolerance = 1e-5;

export interface DistributionConfiguration {
  inputs: { [key: string]: () => NodeInterface };
  outputs: { [key: string]: () => NodeInterface };
  validate_input: (params: any, registerValidationError: (error: ValidationFeedback) => void) => void;
  generate_output: (params: any, context: CalculationContext) => CalculateFunctionReturnType<any>;
}

export const validateLowerUpper = (
  lower: number,
  upper: number,
  registerValidationError: (error: ValidationFeedback) => void
) => {
  if (!(lower + numeric_tolerance < upper)) {
    registerValidationError({
      type: "error",
      message: `Lower bound '${lower}' can not be larger than upper bound '${upper}'.`
    });
  }
};
