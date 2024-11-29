import nj from "@d4c/numjs";

import { defineMathNode } from "./AbstractMathNode";

type SupportedOperationType = "add" | "subtract" | "multiply" | "divide";

export const MathNode = defineMathNode<SupportedOperationType>({
  type: "Math",

  title: "Math",

  availableOperations: ["add", "subtract", "multiply", "divide"],

  defaultOperation: "add" as SupportedOperationType,

  deterministcOperations: {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => a / b
  },

  probabilisticOperations: {
    add: (a, b) => nj.array(a).add(nj.array(b)).tolist() as number[],
    subtract: (a, b) => nj.array(a).subtract(nj.array(b)).tolist() as number[],
    multiply: (a, b) => nj.array(a).multiply(nj.array(b)).tolist() as number[],
    divide: (a, b) => nj.array(a).divide(nj.array(b)).tolist() as number[]
  },

  seriesOperations: {
    add: (a, b) => nj.array(a).add(nj.array(b)).tolist() as number[][],
    subtract: (a, b) => nj.array(a).subtract(nj.array(b)).tolist() as number[][],
    multiply: (a, b) => nj.array(a).multiply(nj.array(b)).tolist() as number[][],
    divide: (a, b) => nj.array(a).divide(nj.array(b)).tolist() as number[][]
  }
});
