import nj, { NdArray } from "@d4c/numjs";
import cwise from "cwise";

import { defineMathNode } from "./AbstractMathNode";

type SupportedOperationType = ">" | "<" | ">=" | "<=";

const greaterThan = cwise({
  args: ["array", "array"],
  body: function gt(a, b) {
    a = +(a > b);
  }
});

const greaterThanOrEqual = cwise({
  args: ["array", "array"],
  body: function gteq(a, b) {
    a = +(a >= b);
  }
});

const lowerThan = cwise({
  args: ["array", "array"],
  body: function lt(a, b) {
    a = +(a < b);
  }
});

const lowerThanOrEqual = cwise({
  args: ["array", "array"],
  body: function lteq(a, b) {
    a = +(a <= b);
  }
});

const applyCwise = (func: cwise.Return, a: nj.NdArray, b: nj.NdArray) => {
  const x = NdArray.new(a).clone();
  func(x.selection, b.selection);
  return x;
};

const applyCwiseArray = (func: cwise.Return, a: number[], b: number[]) => {
  return applyCwise(func, nj.array(a), nj.array(b)).tolist() as number[];
};

const applyCwiseSeries = (func: cwise.Return, a: number[][], b: number[][]) => {
  return applyCwise(func, nj.array(a), nj.array(b)).tolist() as number[][];
};

export const ComparisonNode = defineMathNode<SupportedOperationType>({
  type: "Comparison",

  title: "Comparison",

  availableOperations: [">", "<", ">=", "<="],

  defaultOperation: ">",

  deterministcOperations: {
    ">": (a, b) => +(a > b),
    "<": (a, b) => +(a < b),
    "<=": (a, b) => +(a <= b),
    ">=": (a, b) => +(a >= b)
  },

  probabilisticOperations: {
    ">": (a, b) => applyCwiseArray(greaterThan, a, b),
    "<": (a, b) => applyCwiseArray(lowerThan, a, b),
    ">=": (a, b) => applyCwiseArray(greaterThanOrEqual, a, b),
    "<=": (a, b) => applyCwiseArray(lowerThanOrEqual, a, b)
  },

  seriesOperations: {
    ">": (a, b) => applyCwiseSeries(greaterThan, a, b),
    "<": (a, b) => applyCwiseSeries(lowerThan, a, b),
    ">=": (a, b) => applyCwiseSeries(greaterThanOrEqual, a, b),
    "<=": (a, b) => applyCwiseSeries(lowerThanOrEqual, a, b)
  }
});
