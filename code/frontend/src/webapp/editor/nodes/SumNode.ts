import { DynamicNode, IntegerInterface, NodeInterface, type CalculateFunctionReturnType } from "baklavajs";
import {
  DETERMINISTIC_TYPE,
  isDeterministicType,
  isSeriesType,
  PROBABILISTIC_SERIES_TYPE,
  PROBABILISTIC_TYPE,
  type InterfaceTypeSet
} from "../common/types";
import { makeArray, makeSeries } from "../common/math";
import { defineFlexibleDynamicNode, getInputInterfaceType, getOutputInterfaceForType, isSeries } from "../common/nodes";
import nj from "@d4c/numjs";
import { FlexibleNumberInterface } from "../interfaces/FlexibleNumberInterface";

const ALPHABET_ORD = Array.from(Array(26)).map((e, i) => i + 65);
const ALPHABET_CHAR = ALPHABET_ORD.map(x => String.fromCharCode(x));

const generateInputInterfaces = (n: number, node: DynamicNode<any, any>) => {
  // create one more input interface than there are used interfaces
  const inputs: { [key: string]: () => NodeInterface } = {};
  for (let i = 0; i < n; i++) {
    inputs[ALPHABET_CHAR[i].toLowerCase()] = () => {
      const intf = new FlexibleNumberInterface(ALPHABET_CHAR[i].toUpperCase(), 0.0);

      intf.events.setValue.subscribe(Symbol(), () => {
        (node as any).onUpdate();
      });
      return intf;
    };
  }

  return inputs;
};

export const SumNode = defineFlexibleDynamicNode({
  type: "Sum",

  title: "Sum",

  inputs: {
    n_inputs: () => new IntegerInterface("Inputs", 1).setPort(false).setHidden(true),
    output_type: () => new NodeInterface("Inputs", DETERMINISTIC_TYPE).setPort(false).setHidden(true)
  } as { [key: string]: () => NodeInterface },

  onUpdate({ n_inputs, output_type }) {
    // generate inputs and output according to serialized static inputs (n_inputs, output_type)
    return { inputs: generateInputInterfaces(n_inputs, this as any), outputs: getOutputInterfaceForType(output_type) };
  },

  onConnectionUpdate() {
    const node = this as any as DynamicNode<any, any>;
    let outputType = PROBABILISTIC_TYPE;

    // check input types
    const inputTypes: { [key: string]: InterfaceTypeSet } = {};
    for (const k of Object.keys(node.inputs as any)) {
      if (!node.inputs[k].hidden) {
        inputTypes[k] = getInputInterfaceType(node, k);
      }
    }

    if (Object.values(inputTypes).every(t => isDeterministicType(t))) {
      // all inputs are deterministc
      outputType = DETERMINISTIC_TYPE;
    } else if (Object.values(inputTypes).find(t => isSeriesType(t))) {
      // there is at least one series input
      outputType = PROBABILISTIC_SERIES_TYPE;
    }

    // remember output type for serialization
    (node.inputs.output_type as any)._value = outputType;

    // count the number if input interfaces that are non-zero or connected
    let n_usedInputs = 0;
    for (const k of Object.keys(node.inputs as any)) {
      if (!node.inputs[k].hidden && (node.inputs[k].value != 0 || node.inputs[k].connectionCount > 0)) {
        n_usedInputs += 1;
      }
    }

    // remember numder of inputs for serialization
    (node.inputs.n_inputs as any)._value = n_usedInputs + 1;

    return {
      inputs: generateInputInterfaces(n_usedInputs + 1, node),
      outputs: getOutputInterfaceForType(outputType)
    };
  },

  calculate({ n_inputs, output_type, ...inputFlex }, { globalValues }): CalculateFunctionReturnType<any> {
    const mcRuns = globalValues.mcRuns;

    switch (output_type) {
      case DETERMINISTIC_TYPE: {
        const inputValues = inputFlex as { [key: string]: number };
        let value = 0.0;
        Object.keys(inputValues).forEach(key => {
          value += inputValues[key];
        });
        return { value };
      }

      case PROBABILISTIC_TYPE: {
        const inputArrays: { [key: string]: number[] } = {};
        Object.keys(inputFlex).forEach(key => {
          inputArrays[key] = makeArray(inputFlex[key], mcRuns);
        });

        const sample = [];
        for (let i = 0; i < mcRuns; i++) {
          let sum = 0.0;
          Object.keys(inputArrays).forEach(key => {
            sum += inputArrays[key][i];
          });
          sample.push(sum);
        }

        return { sample };
      }

      case PROBABILISTIC_SERIES_TYPE: {
        const firstSeries = Object.values(inputFlex).find(v => isSeries(v)) as number[][];
        const n = firstSeries[0].length;

        const inputSeries: { [key: string]: nj.NdArray } = {};
        Object.keys(inputFlex).forEach(key => {
          inputSeries[key] = nj.array(makeSeries(inputFlex[key], mcRuns, n));
        });

        const series = nj.zeros([mcRuns, n]);
        Object.keys(inputSeries).forEach(key => {
          series.add(inputSeries[key], false);
        });

        return { series: series.tolist() as number[][] };
      }
    }
  }
});
