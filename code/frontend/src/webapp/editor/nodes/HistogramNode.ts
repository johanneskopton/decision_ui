import { defineNode, NodeInterface, setType } from "baklavajs";
import { markRaw } from "vue";

import HistogramOption from "../components/HistogramOption.vue";
import { flexibleType, type FlexibleNumber } from "../common/types";

export const HistogramNode = defineNode({
  type: "Histogram",

  title: "Histogram",

  inputs: {
    value: () => new NodeInterface<FlexibleNumber>("Value", null as any).use(setType, flexibleType)
  },

  outputs: {
    display: () =>
      new NodeInterface<FlexibleNumber>("Histogram", null as any).setComponent(markRaw(HistogramOption)).setPort(false)
  },

  calculate({ value }) {
    return {
      display: value
    };
  },

  onPlaced() {
    this.width = 300;
  }
});
