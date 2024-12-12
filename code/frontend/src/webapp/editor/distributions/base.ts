import type { CalculateFunctionReturnType, CalculationContext, NodeInterface } from "baklavajs";
import type { NodeValidationError } from "../common/validation";

const numeric_tolerance = 1e-5;

export interface DistributionConfiguration {
  inputs: { [key: string]: () => NodeInterface };
  outputs: { [key: string]: () => NodeInterface };
  validate_input: (params: any, registerValidationError: (error: NodeValidationError) => void) => void;
  generate_output: (params: any, context: CalculationContext) => CalculateFunctionReturnType<any>;
}

export const validateLowerUpper = (
  lower: number,
  upper: number,
  registerValidationError: (error: NodeValidationError) => void
) => {
  if (!(lower + numeric_tolerance < upper)) {
    registerValidationError({
      type: "error",
      message: `Lower bound '${lower}' can not be larger than upper bound '${upper}'.`
    });
  }
};
