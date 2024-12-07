import { SelectInterface, type CalculateFunctionReturnType } from "baklavajs";
import { DETERMINISTIC_TYPE, PROBABILISTIC_SERIES_TYPE, PROBABILISTIC_TYPE } from "../common/types";
import {
  defineFlexibleDynamicNode,
  getOutputInterfaceForType,
  isDeterministic,
  isProbabilistic,
  isSeries
} from "../common/nodes";

export const TypeConstraintNode = defineFlexibleDynamicNode({
  type: "TypeConstraint",

  title: "Type Constraint",

  inputs: {
    type: () =>
      new SelectInterface("Type", DETERMINISTIC_TYPE, [
        DETERMINISTIC_TYPE,
        PROBABILISTIC_TYPE,
        PROBABILISTIC_SERIES_TYPE
      ]).setPort(false)
  },

  onUpdate({ type }) {
    return {
      inputs: getOutputInterfaceForType(type),
      outputs: getOutputInterfaceForType(type)
    };
  },

  calculate({ type, ...input }): CalculateFunctionReturnType<any> {
    switch (type) {
      case DETERMINISTIC_TYPE: {
        if (isDeterministic(input.value)) {
          return { value: input.value };
        }
        console.error("input is not deterministc!");
        return { value: null };
      }
      case PROBABILISTIC_TYPE: {
        if (isProbabilistic(input.sample)) {
          return { sample: input.sample };
        }
        console.error("input is not probabilistic!");
        return { sample: null };
      }
      case PROBABILISTIC_SERIES_TYPE: {
        if (isSeries(input.series)) {
          return { series: input.series };
        }
        console.error("input is not a series!");
        return { series: null };
      }
    }
    return null;
  }
});
