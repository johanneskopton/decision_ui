import { defineNode, NodeInterface, SelectInterface } from "baklavajs";
import { setType } from "@baklavajs/interface-types";

import { probabilisticType } from "../types";
import { DeterministicNumberInterface } from "../interfaces/deterministic/DeterministicNumberInterface";
import { makeArray } from "@/common/array";

type SupportedOperationType = "add" | "subtract" | "multiply" | "divide";
const SUPPORTED_OPERATIONS = ["add", "subtract", "multiply", "divide"] as SupportedOperationType[];

const operations = {
  add: (a: number, b: number) => a + b,
  subtract: (a: number, b: number) => a - b,
  multiply: (a: number, b: number) => a * b,
  divide: (a: number, b: number) => a / b
};

export const MathNode = defineNode({
  type: "Math",

  title: "Math",

  inputs: {
    a: () => new DeterministicNumberInterface("A", 1.0).use(setType, probabilisticType),
    b: () => new DeterministicNumberInterface("B", 2.0).use(setType, probabilisticType),
    operation: () =>
      new SelectInterface<SupportedOperationType>("Operation", "add", SUPPORTED_OPERATIONS).setPort(false)
  },

  outputs: {
    result: () => new NodeInterface<number[]>("Result", [0.0]).use(setType, probabilisticType)
  },

  calculate({ a, b, operation }, { globalValues }) {
    a = makeArray(a, globalValues.mcRuns);
    b = makeArray(b, globalValues.mcRuns);

    if (a.length !== b.length || a.length !== globalValues.mcRuns) {
      // report error
    }

    const result = [];
    for (let i = 0; i < globalValues.mcRuns; i++) {
      result.push(operations[operation](a[i], b[i]));
    }
    return { result };
  }
});
