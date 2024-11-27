import { defineDynamicNode, IntegerInterface, NodeInterface, setType } from "baklavajs";
import { DeterministicNumberInterface } from "../interfaces/deterministic/DeterministicNumberInterface";
import { probabilisticType } from "../common/types";
import { makeArray } from "../common/math";

const ALPHABET_ORD = Array.from(Array(26)).map((e, i) => i + 65);
const ALPHABET_CHAR = ALPHABET_ORD.map(x => String.fromCharCode(x));

export const SumNode = defineDynamicNode({
  type: "Sum",

  title: "Sum",

  inputs: {
    n_inputs: () => new IntegerInterface("Inputs", 1).setPort(false).setHidden(true)
  } as { [key: string]: () => NodeInterface },

  outputs: {
    result: () => new NodeInterface<number[]>("Result", [0.0]).use(setType, probabilisticType)
  },

  onUpdate({ n_inputs }) {
    const inputs = this.inputs as any as { [key: string]: NodeInterface };

    // count the number if input interfaces that are non-zero or connected
    let n_usedInputs = 0;
    for (const k of Object.keys(inputs as any)) {
      if (inputs[k].value != 0 || inputs[k].connectionCount > 0) {
        n_usedInputs += 1;
      }
    }

    const n_newInputs = Math.max(n_inputs, n_usedInputs);
    (inputs.n_inputs as any)._value = n_newInputs;

    // create one more input interface than there are used interfaces
    const newInputs: { [key: string]: () => NodeInterface } = {};
    for (let i = 0; i < n_newInputs; i++) {
      newInputs[ALPHABET_CHAR[i].toLowerCase()] = () =>
        new DeterministicNumberInterface(ALPHABET_CHAR[i].toUpperCase(), 0.0);
    }

    return {
      inputs: newInputs
    };
  },

  calculate({ n_inputs: _, ...inputValues }, { globalValues }) {
    const inputArrays: { [key: string]: number[] } = {};
    Object.keys(inputValues).forEach(key => {
      inputArrays[key] = makeArray(inputValues[key], globalValues.mcRuns);
    });

    const result = [];
    for (let i = 0; i < globalValues.mcRuns; i++) {
      let sum = 0.0;
      Object.keys(inputArrays).forEach(key => {
        sum += inputArrays[key][i];
      });
      result.push(sum);
    }

    return {
      result
    };
  }
});
