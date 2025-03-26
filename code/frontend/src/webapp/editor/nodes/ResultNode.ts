import { defineNode, NodeInterface, setType } from "baklavajs";
import { markRaw } from "vue";

import HistogramOption from "../components/HistogramOption.vue";

import { probabilisticType, type FlexibleNumber } from "../common/types";

export const ResultNode = defineNode({
  type: "Result",

  title: "Result",

  inputs: {
    sample: () => new NodeInterface<number[]>("Sample", null as any).use(setType, probabilisticType)
  },

  outputs: {
    display: () =>
      new NodeInterface<FlexibleNumber>("Histogram", null as any).setComponent(markRaw(HistogramOption)).setPort(false)
  },

  calculate({ sample }) {
    return {
      display: sample
    };
  },

  onPlaced() {
    this.width = 300;
  }
});
