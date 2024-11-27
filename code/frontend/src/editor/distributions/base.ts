import type { CalculateFunctionReturnType, CalculationContext, NodeInterface } from "baklavajs";

export interface DistributionConfiguration {
  inputs: { [key: string]: () => NodeInterface };
  outputs: { [key: string]: () => NodeInterface };
  generate_output: (params: any, context: CalculationContext) => CalculateFunctionReturnType<any>;
}
