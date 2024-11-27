import { Node, NodeInterface, SelectInterface, type CalculateFunctionReturnType } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

import {
  DETERMINISTIC_INT_TYPE,
  flexibleType,
  isDeterministicType,
  isSeriesType,
  PROBABILISTIC_INT_TYPE,
  PROBABILISTIC_SERIES_TYPE,
  type InterfaceTypeSet
} from "../common/types";

import { FlexibleNumberInterface } from "../interfaces/FlexibleNumberInterface";
import { defineFlexibleDynamicNode, getInputInterfaceType, getOutputInterfaceForType } from "../common/nodes";

type SupportedOperationType = "floor" | "ceiling" | "round";
const SUPPORTED_OPERATIONS = ["floor", "ceiling", "round"] as SupportedOperationType[];

const operations = {
  floor: (x: number) => Math.floor(x),
  ceiling: (x: number) => Math.ceil(x),
  round: (x: number) => Math.round(x)
};

export const RoundNode = defineFlexibleDynamicNode({
  type: "Round",

  title: "Round",

  inputs: {
    output_type: () => new NodeInterface<InterfaceTypeSet>("Output Type", DETERMINISTIC_INT_TYPE).setHidden(true),
    x: () => new FlexibleNumberInterface("X", 1.0).use(setType, flexibleType),
    operation: () =>
      new SelectInterface<SupportedOperationType>("Operation", "round", SUPPORTED_OPERATIONS).setPort(false)
  },

  onFirstUpdate(inputValues) {
    return { outputs: getOutputInterfaceForType(inputValues.output_type) };
  },

  onUpdate() {
    const node = this as any as Node<any, any>;
    let outputType: InterfaceTypeSet = PROBABILISTIC_INT_TYPE;

    // determine output type based on current values and connections
    const x_type = getInputInterfaceType(node, "x");
    if (isDeterministicType(x_type)) {
      // output will be deterministic
      outputType = DETERMINISTIC_INT_TYPE;
    } else if (isSeriesType(x_type)) {
      // output will be series
      outputType = PROBABILISTIC_SERIES_TYPE;
    }

    // remember output type in hidden interface (so it is stored to json)
    (node.inputs.output_type as any)._value = outputType;

    return { outputs: getOutputInterfaceForType(outputType) };
  },

  calculate({ x, operation, output_type }, { globalValues }): CalculateFunctionReturnType<any> {
    const mcRuns = globalValues.mcRuns;
    switch (output_type) {
      case DETERMINISTIC_INT_TYPE: {
        return { value: operations[operation](x as number) };
      }
      case PROBABILISTIC_INT_TYPE: {
        x = x as number[];
        const sample = [];
        for (let i = 0; i < mcRuns; i++) {
          sample.push(operations[operation](x[i]));
        }
        return { sample };
      }
      case PROBABILISTIC_SERIES_TYPE: {
        x = x as number[][];
        const series: number[][] = [];
        for (let i = 0; i < mcRuns; i++) {
          const values: number[] = [];
          for (let j = 0; j < x[i].length; j++) {
            values.push(operations[operation](x[i][j]));
          }
          series.push(values);
        }
        return { series };
      }
    }
  }
});
