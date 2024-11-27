import { Node, NodeInterface, SelectInterface, type CalculateFunctionReturnType } from "baklavajs";
import { setType } from "@baklavajs/interface-types";
import nj from "@d4c/numjs";

import {
  DETERMINISTIC_TYPE,
  flexibleType,
  isDeterministicType,
  isSeriesType,
  PROBABILISTIC_SERIES_TYPE,
  PROBABILISTIC_TYPE,
  type InterfaceTypeSet
} from "../common/types";

import { isSeries, getInputInterfaceType, defineFlexibleDynamicNode, getOutputInterfaceForType } from "../common/nodes";
import { FlexibleNumberInterface } from "../interfaces/FlexibleNumberInterface";

import { makeArray, makeSeries } from "../common/math";

type SupportedOperationType = "add" | "subtract" | "multiply" | "divide";
const SUPPORTED_OPERATIONS = ["add", "subtract", "multiply", "divide"] as SupportedOperationType[];

const basic_operations = {
  add: (a: number, b: number) => a + b,
  subtract: (a: number, b: number) => a - b,
  multiply: (a: number, b: number) => a * b,
  divide: (a: number, b: number) => a / b
};

const series_operations = {
  add: (a: nj.NdArray, b: nj.NdArray) => a.add(b),
  subtract: (a: nj.NdArray, b: nj.NdArray) => a.subtract(b),
  multiply: (a: nj.NdArray, b: nj.NdArray) => a.multiply(b),
  divide: (a: nj.NdArray, b: nj.NdArray) => a.divide(b)
};

export const MathNode = defineFlexibleDynamicNode({
  type: "Math",

  title: "Math",

  inputs: {
    output_type: () => new NodeInterface<InterfaceTypeSet>("Output Type", DETERMINISTIC_TYPE).setHidden(true),
    a: () => new FlexibleNumberInterface("A", 1.0).use(setType, flexibleType),
    b: () => new FlexibleNumberInterface("B", 2.0).use(setType, flexibleType),
    operation: () =>
      new SelectInterface<SupportedOperationType>("Operation", "add", SUPPORTED_OPERATIONS).setPort(false)
  },

  onFirstUpdate(inputValues) {
    return { outputs: getOutputInterfaceForType(inputValues.output_type) };
  },

  onUpdate() {
    const node = this as any as Node<any, any>;
    let outputType: InterfaceTypeSet = PROBABILISTIC_TYPE;

    // determine output type based on current values and connections
    const a_type = getInputInterfaceType(node, "a");
    const b_type = getInputInterfaceType(node, "b");
    if (isDeterministicType(a_type) && isDeterministicType(b_type)) {
      // output will be deterministic
      outputType = DETERMINISTIC_TYPE;
    } else if (isSeriesType(a_type) || isSeriesType(b_type)) {
      // output will be series
      outputType = PROBABILISTIC_SERIES_TYPE;
    }

    // remember output type in hidden interface (so it is stored to json)
    (node.inputs.output_type as any)._value = outputType;

    return { outputs: getOutputInterfaceForType(outputType) };
  },

  calculate({ a, b, operation, output_type }, { globalValues }): CalculateFunctionReturnType<any> {
    const mcRuns = globalValues.mcRuns;

    switch (output_type) {
      case DETERMINISTIC_TYPE: {
        return {
          value: basic_operations[operation](a as number, b as number)
        };
      }
      case PROBABILISTIC_TYPE: {
        const a_array = makeArray(a, mcRuns);
        const b_array = makeArray(b, mcRuns);

        if (a_array.length !== b_array.length || a_array.length !== mcRuns) {
          // report error
        }

        const sample: number[] = [];
        for (let i = 0; i < mcRuns; i++) {
          sample.push(basic_operations[operation](a_array[i], b_array[i]));
        }
        return { sample };
      }
      case PROBABILISTIC_SERIES_TYPE: {
        const n = isSeries(a) ? (a as number[][])[0].length : (b as number[][])[0].length;
        const a_series = nj.array(makeSeries(a, mcRuns, n));
        const b_series = nj.array(makeSeries(b, mcRuns, n));
        return {
          series: series_operations[operation](a_series, b_series).tolist()
        };
      }

      default:
        return null;
    }
  }
});
