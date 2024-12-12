import { defineNode, NodeInterface, setType } from "baklavajs";
import { markRaw } from "vue";

import HistogramOption from "../components/HistogramOption.vue";

import { probabilisticType, type FlexibleNumber } from "../common/types";

export const ResultNode = defineNode({
  type: "Result",

  title: "Result",

  inputs: {
    value: () => new NodeInterface<number[]>("Value", null as any).use(setType, probabilisticType)
  },

  outputs: {
    display: () =>
      new NodeInterface<FlexibleNumber>("Histogram", null as any).setComponent(markRaw(HistogramOption)).setPort(false)
  },

  calculate({ value }, context) {
    if (value == undefined || value == null) {
      context.globalValues.registerValidationError(this, {
        type: "error",
        message: "Result node needs to be connected."
      });
    }
    return {
      display: value
    };
  },

  onPlaced() {
    this.width = 300;
  }
});
