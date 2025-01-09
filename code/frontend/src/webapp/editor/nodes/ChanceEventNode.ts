import { Node, SelectInterface, type CalculateFunctionReturnType } from "baklavajs";
import { setType } from "@baklavajs/interface-types";
import cwise from "cwise";
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

import {
  isSeries,
  getInputInterfaceType,
  defineFlexibleDynamicNode,
  getOutputInterfaceForType,
  isDeterministic
} from "../common/nodes";
import { FlexibleNumberInterface } from "../interfaces/FlexibleNumberInterface";

import { makeArray, makeSeries } from "../common/math";

const chanceFunc = cwise({
  args: ["array", "array", "array"],
  body: function chance(chance, value_if, value_if_not) {
    chance = (value_if - value_if_not) * +(Math.random() < chance) + value_if_not;
  }
});

const applyCwise = (func: cwise.Return, chance: nj.NdArray, value_if: nj.NdArray, value_if_not: nj.NdArray) => {
  const x = nj.NdArray.new(chance).clone();
  func(x.selection, value_if.selection, value_if_not.selection);
  return x;
};

const applyCwiseArray = (func: cwise.Return, chance: number[], value_if: number[], value_if_not: number[]) => {
  return applyCwise(func, nj.array(chance), nj.array(value_if), nj.array(value_if_not)).tolist() as number[];
};

const applyCwiseSeries = (func: cwise.Return, chance: number[][], value_if: number[][], value_if_not: number[][]) => {
  return applyCwise(func, nj.array(chance), nj.array(value_if), nj.array(value_if_not)).tolist() as number[][];
};

export const ChanceEventNode = defineFlexibleDynamicNode({
  type: "ChanceEvent",

  title: "Chance Event",

  inputs: {
    output_type: () =>
      new SelectInterface<InterfaceTypeSet>("Output Type", DETERMINISTIC_TYPE, [
        DETERMINISTIC_TYPE,
        PROBABILISTIC_TYPE,
        PROBABILISTIC_SERIES_TYPE
      ])
        .setPort(false)
        .setHidden(true),
    chance: () => new FlexibleNumberInterface("Chance", 0.5).use(setType, flexibleType),
    value_if: () => new FlexibleNumberInterface("Value If", 1.0).use(setType, flexibleType),
    value_if_not: () => new FlexibleNumberInterface("Value If Not", 0.0).use(setType, flexibleType)
  },

  onUpdate({ output_type }) {
    return { outputs: getOutputInterfaceForType(output_type) };
  },

  onConnectionUpdate() {
    const node = this as any as Node<any, any>;
    let outputType: InterfaceTypeSet = PROBABILISTIC_TYPE;

    // determine output type based on current values and connections
    const chance_type = getInputInterfaceType(node, "chance");
    const value_if_type = getInputInterfaceType(node, "value_if");
    const value_if_not_type = getInputInterfaceType(node, "value_if_not");

    if (
      isDeterministicType(chance_type) &&
      isDeterministicType(value_if_type) &&
      isDeterministicType(value_if_not_type)
    ) {
      // output will be deterministic
      outputType = DETERMINISTIC_TYPE;
    } else if (isSeriesType(chance_type) || isSeriesType(value_if_type) || isSeriesType(value_if_not_type)) {
      // output will be series
      outputType = PROBABILISTIC_SERIES_TYPE;
    }

    // remember output type in hidden interface (so it is stored to json)
    (node.inputs.output_type as any)._value = outputType;

    return { outputs: getOutputInterfaceForType(outputType) };
  },

  calculate({ chance, value_if, value_if_not, output_type }, { globalValues }): CalculateFunctionReturnType<any> {
    const mcRuns = globalValues.mcRuns;

    switch (output_type) {
      case DETERMINISTIC_TYPE: {
        if (!isDeterministic(chance) || !isDeterministic(value_if) || !isDeterministic(value_if_not)) {
          console.error("input is not determistic, although output shall be");
          return { value: null };
        }
        chance = chance as number;
        value_if = value_if as number;
        value_if_not = value_if_not as number;
        return {
          value: (value_if - value_if_not) * +(Math.random() < chance) + value_if_not
        };
      }
      case PROBABILISTIC_TYPE: {
        if (isSeries(chance) || isSeries(value_if) || isSeries(value_if_not)) {
          console.error("input is series, although output shall be probabilistic");
          return { sample: null };
        }

        const chance_array = makeArray(chance, mcRuns);
        const value_if_array = makeArray(value_if, mcRuns);
        const value_if_not_array = makeArray(value_if_not, mcRuns);

        if (chance_array.length + value_if_array.length + value_if_not_array.length !== 3 * mcRuns) {
          // report error
        }

        return { sample: applyCwiseArray(chanceFunc, chance_array, value_if_array, value_if_not_array) };
      }
      case PROBABILISTIC_SERIES_TYPE: {
        if (!isSeries(chance) && !isSeries(value_if) && !isSeries(value_if_not)) {
          console.error("at least one input needs to be a series");
          return { series: null };
        }
        const n = isSeries(chance)
          ? (chance as number[][])[0].length
          : isSeries(value_if)
            ? (value_if as number[][])[0].length
            : (value_if_not as number[][])[0].length;
        const chance_series = makeSeries(chance, mcRuns, n);
        const value_if_series = makeSeries(value_if, mcRuns, n);
        const value_if_not_series = makeSeries(value_if_not, mcRuns, n);
        return { series: applyCwiseSeries(chanceFunc, chance_series, value_if_series, value_if_not_series) };
      }

      default:
        return null;
    }
  },

  onPlaced() {
    this.width = 230;
  }
});
