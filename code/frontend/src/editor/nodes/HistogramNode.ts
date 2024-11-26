import { defineNode, NodeInterface } from "baklavajs";
import { markRaw } from "vue";

import HistogramOption from "../components/HistogramOption.vue";

export const HistogramNode = defineNode({
  type: "Histogram",

  title: "Histogram",

  inputs: {
    value: () => new NodeInterface<any>("Value", [])
  },

  outputs: {
    display: () => new NodeInterface("Histogram", []).setComponent(markRaw(HistogramOption)).setPort(false)
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
