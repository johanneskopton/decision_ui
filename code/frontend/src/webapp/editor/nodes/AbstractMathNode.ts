import { Node, SelectInterface, type CalculateFunctionReturnType, type SelectInterfaceItem } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

import {
  DETERMINISTIC_TYPE,
  flexibleType,
  isDeterministicType,
  isSeriesType,
  PROBABILISTIC_SERIES_TYPE,
  PROBABILISTIC_TYPE,
  type FlexibleNumber,
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

type DeterministicFunction = (a: number, b: number) => number;
type ProbabilistcFunction = (a: number[], b: number[]) => number[];
type SeriesFunction = (a: number[][], b: number[][]) => number[][];
export type DeterministicOperations<T extends string> = { [key in T]: DeterministicFunction };
export type ProbabilisticOperations<T extends string> = { [key in T]: ProbabilistcFunction };
export type SeriesOperations<T extends string> = { [key in T]: SeriesFunction };

interface MathNodeDefinition<T extends string> {
  title: string;
  type: string;
  deterministcOperations: DeterministicOperations<T>;
  probabilisticOperations: ProbabilisticOperations<T>;
  seriesOperations: SeriesOperations<T>;
  defaultOperation: T;
  availableOperations: SelectInterfaceItem<T>[] | T[];
}

type MathInputs<T> = {
  output_type: InterfaceTypeSet;
  a: FlexibleNumber;
  b: FlexibleNumber;
  operation: T;
};

const getMathInputs = <T extends string>(defaultOperation: T, availableOperations: SelectInterfaceItem<T>[]) => {
  return {
    output_type: () =>
      new SelectInterface<InterfaceTypeSet>("Output Type", DETERMINISTIC_TYPE, [
        DETERMINISTIC_TYPE,
        PROBABILISTIC_TYPE,
        PROBABILISTIC_SERIES_TYPE
      ])
        .setPort(false)
        .setHidden(true),
    a: () => new FlexibleNumberInterface("A", 1.0).use(setType, flexibleType),
    b: () => new FlexibleNumberInterface("B", 2.0).use(setType, flexibleType),
    operation: () => new SelectInterface<T>("Operation", defaultOperation, availableOperations).setPort(false)
  };
};

export const defineMathNode = <T extends string>(definition: MathNodeDefinition<T>) =>
  defineFlexibleDynamicNode<MathInputs<T>, any>({
    ...definition,

    inputs: getMathInputs(definition.defaultOperation, definition.availableOperations),

    onFirstUpdate({ output_type }) {
      return { outputs: getOutputInterfaceForType(output_type) };
    },

    onUpdate() {
      const node = this as any as Node<any, any>;
      let outputType: InterfaceTypeSet = PROBABILISTIC_TYPE;

      // determine output type based on current values and connections
      const a_type = getInputInterfaceType(node, "a");
      const b_type = getInputInterfaceType(node, "b");
      console.error(`a_type = ${a_type}, b_type = ${b_type}`);
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

      if (a == null || b == null) {
        console.error("input is not defined");
        switch (output_type) {
          case DETERMINISTIC_TYPE:
            return { value: null };
          case PROBABILISTIC_TYPE:
            return { sample: null };
          case PROBABILISTIC_SERIES_TYPE:
            return { series: null };
        }
        return null;
      }

      switch (output_type) {
        case DETERMINISTIC_TYPE: {
          if (!isDeterministic(a) || !isDeterministic(b)) {
            console.error("input is not determistic, although output shall be");
            return { value: null };
          }
          return {
            value: definition.deterministcOperations[operation](a as number, b as number)
          };
        }
        case PROBABILISTIC_TYPE: {
          if (isSeries(a) || isSeries(b)) {
            console.error("input is series, although output shall be probabilistic");
            return { sample: null };
          }

          const a_array = makeArray(a, mcRuns);
          const b_array = makeArray(b, mcRuns);

          if (a_array.length !== b_array.length || a_array.length !== mcRuns) {
            // report error
          }

          return { sample: definition.probabilisticOperations[operation](a_array, b_array) };
        }
        case PROBABILISTIC_SERIES_TYPE: {
          if (!isSeries(a) && !isSeries(b)) {
            console.error("at least one input needs to be a series");
            return { series: null };
          }
          const n = isSeries(a) ? (a as number[][])[0].length : (b as number[][])[0].length;
          const a_series = makeSeries(a, mcRuns, n);
          const b_series = makeSeries(b, mcRuns, n);
          return {
            series: definition.seriesOperations[operation](a_series, b_series)
          };
        }

        default:
          return null;
      }
    }
  });
