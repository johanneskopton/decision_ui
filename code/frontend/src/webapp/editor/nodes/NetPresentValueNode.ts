import { defineNode, NodeInterface, setType } from "baklavajs";
import { probabilisticSeriesType, probabilisticType } from "../common/types";
import { DeterministicNumberInterface } from "../interfaces/DeterministicNumberInterface";
import { makeArray } from "../common/math";

export const NPVNode = defineNode({
  type: "NetPresentValue",

  title: "Net Present Value",

  inputs: {
    x: () => new NodeInterface<number[][]>("X", [[]]).use(setType, probabilisticSeriesType),
    discount: () => new DeterministicNumberInterface("discount", 10).use(setType, probabilisticType)
  },

  outputs: {
    sample: () => new NodeInterface<number[]>("Sample", []).use(setType, probabilisticType)
  },

  calculate({ x, discount }, { globalValues }) {
    const mcRuns = globalValues.mcRuns;

    if (!Array.isArray(x) || x.length !== mcRuns) {
      // todo error
      return { sample: [] };
    }

    discount = makeArray(discount, mcRuns);

    const sample: number[] = [];
    for (let i = 0; i < globalValues.mcRuns; i++) {
      let npv = 0;
      for (let j = 0; j < x[i].length; j++) {
        npv += x[i][j] / (1 + discount[i] / 100) ** j;
      }
      sample.push(npv);
    }

    return { sample };
  }
});
