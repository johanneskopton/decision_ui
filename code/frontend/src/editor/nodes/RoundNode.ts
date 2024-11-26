import { defineNode, NodeInterface, SelectInterface } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

import { probabilisticType } from "../types";
import { DeterministicNumberInterface } from "../interfaces/deterministic/DeterministicNumberInterface";
import { makeArray } from "@/common/array";

type SupportedOperationType = "floor" | "ceiling" | "round";
const SUPPORTED_OPERATIONS = ["floor", "ceiling", "round"] as SupportedOperationType[];

const operations = {
  floor: (x: number) => Math.floor(x),
  ceiling: (x: number) => Math.ceil(x),
  round: (x: number) => Math.round(x)
};

export const RoundNode = defineNode({
  type: "Round",

  title: "Round",

  inputs: {
    x: () => new DeterministicNumberInterface("X", 1.0).use(setType, probabilisticType),
    operation: () =>
      new SelectInterface<SupportedOperationType>("Operation", "round", SUPPORTED_OPERATIONS).setPort(false)
  },

  outputs: {
    result: () => new NodeInterface<number[]>("Result", [0.0]).use(setType, probabilisticType)
  },

  calculate({ x, operation }, { globalValues }) {
    x = makeArray(x, globalValues.mcRuns);

    const result = [];
    for (let i = 0; i < globalValues.mcRuns; i++) {
      result.push(operations[operation](x[i]));
    }
    return { result };
  }
});
