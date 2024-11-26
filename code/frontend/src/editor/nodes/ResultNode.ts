import { defineNode, NodeInterface, setType } from "baklavajs";
import { markRaw } from "vue";

import HistogramOption from "../components/HistogramOption.vue";

import { probabilisticType } from "../types";

export const ResultNode = defineNode({
  type: "Result",

  title: "Result",

  inputs: {
    value: () => new NodeInterface<any>("Value", []).use(setType, probabilisticType)
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
