import { defineNode, NodeInterface, NumberInterface, setType } from "baklavajs";
import { deterministicType, probabilisticSeriesType, probabilisticType } from "../common/types";

export const NPVNode = defineNode({
  type: "NPV",

  title: "Net Present Value",

  inputs: {
    x: () => new NodeInterface<number[][]>("X", [[]]).use(setType, probabilisticSeriesType),
    discount: () => new NumberInterface("discount", 10).use(setType, deterministicType)
  },

  outputs: {
    sample: () => new NodeInterface<number[]>("Sample", []).use(setType, probabilisticType)
  },

  calculate({ x, discount }, { globalValues }) {
    if (!Array.isArray(x) || x.length !== globalValues.mcRuns) {
      // todo error
      return { sample: [] };
    }

    const sample: number[] = [];
    for (let i = 0; i < globalValues.mcRuns; i++) {
      let npv = 0;
      for (let j = 0; j < x[i].length; j++) {
        npv += x[i][j] / (1 + discount / 100) ** j;
      }
      sample.push(npv);
    }

    return { sample };
  }
});
