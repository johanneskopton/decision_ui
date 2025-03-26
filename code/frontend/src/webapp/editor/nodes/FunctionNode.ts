import { Node, NodeInterface, SelectInterface, type CalculateFunctionReturnType } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

import {
  DETERMINISTIC_INT_TYPE,
  DETERMINISTIC_TYPE,
  flexibleType,
  INTEGER_TYPE_SET,
  isDeterministicType,
  isSeriesType,
  PROBABILISTIC_INT_TYPE,
  PROBABILISTIC_SERIES_TYPE,
  PROBABILISTIC_TYPE,
  type InterfaceTypeSet
} from "../common/types";

import { FlexibleNumberInterface } from "../interfaces/FlexibleNumberInterface";
import { defineFlexibleDynamicNode, getInputInterfaceType, getOutputInterfaceForType } from "../common/nodes";

type SupportedOperationType =
  | "floor"
  | "ceiling"
  | "round"
  | "trunc"
  | "abs"
  | "sqrt"
  | "log"
  | "log10"
  | "exp"
  | "sin"
  | "cos"
  | "tan";
const SUPPORTED_OPERATIONS = [
  "abs",
  "ceiling",
  "cos",
  "exp",
  "floor",
  "log",
  "log10",
  "round",
  "sin",
  "sqrt",
  "tan",
  "trunc"
] as SupportedOperationType[];

const JS_OPERATIONS = {
  floor: (x: number) => Math.floor(x),
  ceiling: (x: number) => Math.ceil(x),
  round: (x: number) => Math.round(x),
  trunc: (x: number) => Math.trunc(x),
  abs: (x: number) => Math.abs(x),
  sqrt: (x: number) => Math.sqrt(x),
  log: (x: number) => Math.log(x),
  log10: (x: number) => Math.log10(x),
  exp: (x: number) => Math.exp(x),
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x),
  tan: (x: number) => Math.tan(x)
};

const OPERATION_RETURNS_INTEGER: { [operation: string]: boolean } = {
  floor: true,
  ceiling: true,
  round: true,
  trunc: true,
  abs: false,
  sqrt: false,
  log: false,
  log10: false,
  exp: false,
  sin: false,
  cos: false,
  tan: false
};

export const FunctionNode = defineFlexibleDynamicNode({
  type: "Function",

  title: "Function",

  inputs: {
    output_type: () =>
      new NodeInterface<InterfaceTypeSet>("Output Type", DETERMINISTIC_INT_TYPE).setPort(false).setHidden(true),
    x: () => new FlexibleNumberInterface("X", 1.0).use(setType, flexibleType),
    operation: () =>
      new SelectInterface<SupportedOperationType>("Operation", "round", SUPPORTED_OPERATIONS).setPort(false)
  },

  onUpdate({ output_type, operation }) {
    const node = this as any as Node<any, any>;
    let new_output_type = output_type;
    let changed = false;
    if (OPERATION_RETURNS_INTEGER[operation] && !INTEGER_TYPE_SET.includes(output_type)) {
      // make output type integer type
      new_output_type =
        output_type == DETERMINISTIC_TYPE
          ? DETERMINISTIC_INT_TYPE
          : output_type == PROBABILISTIC_TYPE
            ? PROBABILISTIC_INT_TYPE
            : PROBABILISTIC_SERIES_TYPE;
      changed = true;
      (node.inputs.output_type as any)._value = new_output_type;
    }
    if (!OPERATION_RETURNS_INTEGER[operation] && INTEGER_TYPE_SET.includes(output_type)) {
      // make output type floating point type
      new_output_type =
        output_type == DETERMINISTIC_INT_TYPE
          ? DETERMINISTIC_TYPE
          : output_type == PROBABILISTIC_INT_TYPE
            ? PROBABILISTIC_TYPE
            : PROBABILISTIC_SERIES_TYPE;
      changed = true;
      (node.inputs.output_type as any)._value = new_output_type;
    }
    const output_intf = getOutputInterfaceForType(new_output_type);
    return { outputs: output_intf, forceUpdateOutputs: changed ? [Object.keys(output_intf)[0]] : undefined };
  },

  onConnectionUpdate({ operation }) {
    const node = this as any as Node<any, any>;
    let outputType: InterfaceTypeSet = OPERATION_RETURNS_INTEGER[operation]
      ? PROBABILISTIC_INT_TYPE
      : PROBABILISTIC_TYPE;

    // determine output type based on current values and connections
    const x_type = getInputInterfaceType(node, "x");
    if (isDeterministicType(x_type)) {
      // output will be deterministic
      outputType = OPERATION_RETURNS_INTEGER[operation] ? DETERMINISTIC_INT_TYPE : DETERMINISTIC_TYPE;
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
      case DETERMINISTIC_INT_TYPE:
      case DETERMINISTIC_TYPE: {
        return { value: JS_OPERATIONS[operation](x as number) };
      }
      case PROBABILISTIC_INT_TYPE:
      case PROBABILISTIC_TYPE: {
        x = x as number[];
        const sample = [];
        for (let i = 0; i < mcRuns; i++) {
          sample.push(JS_OPERATIONS[operation](x[i]));
        }
        return { sample };
      }
      case PROBABILISTIC_SERIES_TYPE: {
        x = x as number[][];
        const series: number[][] = [];
        for (let i = 0; i < mcRuns; i++) {
          const values: number[] = [];
          for (let j = 0; j < x[i].length; j++) {
            values.push(JS_OPERATIONS[operation](x[i][j]));
          }
          series.push(values);
        }
        return { series };
      }
    }
  }
});
