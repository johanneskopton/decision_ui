import { Node, SelectInterface, type CalculateFunctionReturnType } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

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

/**
 * Calculate the output of the chance event node if any input is a probabilistic series.
 *
 * @param chance the chance distribution
 * @param value_if the value_if distribution
 * @param value_if_not the value_if_not distribution
 * @returns element-wise mix of both distributions depending on the chance event
 */
const chanceForArray = (chance: number[], value_if: number[], value_if_not: number[]): number[] => {
  const shape = chance.length;
  const result = new Array(shape);
  for (let i = 0; i < shape; i++) {
    result[i] = (value_if[i] - value_if_not[i]) * +(Math.random() < chance[i]) + value_if_not[i];
  }
  return result;
};

/**
 * Calculate the output of the chance event node if any input is a probabilistic series.
 *
 * @param chance the chance series distribution
 * @param value_if the value_if series distribution
 * @param value_if_not the value_if_not series distribution
 * @returns element-wise mix of both distributions depending on the chance event
 */
const chanceForSeries = (chance: number[][], value_if: number[][], value_if_not: number[][]): number[][] => {
  const shape = [chance.length, chance[0].length];
  const result = new Array(shape[0]);
  for (let j = 0; j < shape[0]; j++) {
    result[j] = new Array(shape[1]);
    for (let i = 0; i < shape[1]; i++) {
      result[j][i] = (value_if[j][i] - value_if_not[j][i]) * +(Math.random() < chance[j][i]) + value_if_not[j][i];
    }
  }
  return result;
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

        return { sample: chanceForArray(chance_array, value_if_array, value_if_not_array) };
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
        return { series: chanceForSeries(chance_series, value_if_series, value_if_not_series) };
      }

      default:
        return null;
    }
  },

  onPlaced() {
    this.width = 230;
  }
});
