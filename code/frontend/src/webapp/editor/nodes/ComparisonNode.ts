import { defineMathNode } from "./AbstractMathNode";

type SupportedOperationType = ">" | "<" | ">=" | "<=";

/**
 * Return element-wise comparison (greater than) of both probabilistic intputs.
 *
 * @param a the first input distribution
 * @param b the second input distribution
 * @returns the element-wise comparison (0=false, 1=true) of both inputs
 */
const greaterThanForArray = (a: number[], b: number[]): number[] => {
  const shape = a.length;
  const result = new Array(shape);
  for (let i = 0; i < shape; i++) {
    result[i] = +(a > b);
  }
  return result;
};

/**
 * Return element-wise comparison (greater than or equal) of both probabilistic intputs.
 *
 * @param a the first input distribution
 * @param b the second input distribution
 * @returns the element-wise comparison (0=false, 1=true) of both inputs
 */
const greaterThanOrEqualForArray = (a: number[], b: number[]): number[] => {
  const shape = a.length;
  const result = new Array(shape);
  for (let i = 0; i < shape; i++) {
    result[i] = +(a >= b);
  }
  return result;
};

/**
 * Return element-wise comparison (lower than) of both probabilistic intputs.
 *
 * @param a the first input distribution
 * @param b the second input distribution
 * @returns the element-wise comparison (0=false, 1=true) of both inputs
 */
const lowerThanForArray = (a: number[], b: number[]): number[] => {
  const shape = a.length;
  const result = new Array(shape);
  for (let i = 0; i < shape; i++) {
    result[i] = +(a < b);
  }
  return result;
};

/**
 * Return element-wise comparison (lower than or equal) of both probabilistic intputs.
 *
 * @param a the first input distribution
 * @param b the second input distribution
 * @returns the element-wise comparison (0=false, 1=true) of both inputs
 */
const lowerThanOrEqualForArray = (a: number[], b: number[]): number[] => {
  const shape = a.length;
  const result = new Array(shape);
  for (let i = 0; i < shape; i++) {
    result[i] = +(a <= b);
  }
  return result;
};

/**
 * Return element-wise comparison (greater than) of both probabilistic series intputs.
 *
 * @param a the first input distribution
 * @param b the second input distribution
 * @returns the element-wise comparison (0=false, 1=true) of both inputs
 */
const greaterThanForSeries = (a: number[][], b: number[][]): number[][] => {
  const shape = [a.length, a[0].length];
  const result = new Array(shape[0]);
  for (let j = 0; j < shape[0]; j++) {
    result[j] = new Array(shape[1]);
    for (let i = 0; i < shape[1]; i++) {
      result[j][i] = +(a[j][i] > b[j][i]);
    }
  }
  return result;
};

/**
 * Return element-wise comparison (greater than or equal) of both probabilistic series intputs.
 *
 * @param a the first input distribution
 * @param b the second input distribution
 * @returns the element-wise comparison (0=false, 1=true) of both inputs
 */
const greaterThanOrEqualForSeries = (a: number[][], b: number[][]): number[][] => {
  const shape = [a.length, a[0].length];
  const result = new Array(shape[0]);
  for (let j = 0; j < shape[0]; j++) {
    result[j] = new Array(shape[1]);
    for (let i = 0; i < shape[1]; i++) {
      result[j][i] = +(a[j][i] >= b[j][i]);
    }
  }
  return result;
};

/**
 * Return element-wise comparison (lower than) of both probabilistic series intputs.
 *
 * @param a the first input distribution
 * @param b the second input distribution
 * @returns the element-wise comparison (0=false, 1=true) of both inputs
 */
const lowerThanForSeries = (a: number[][], b: number[][]): number[][] => {
  const shape = [a.length, a[0].length];
  const result = new Array(shape[0]);
  for (let j = 0; j < shape[0]; j++) {
    result[j] = new Array(shape[1]);
    for (let i = 0; i < shape[1]; i++) {
      result[j][i] = +(a[j][i] < b[j][i]);
    }
  }
  return result;
};

/**
 * Return element-wise comparison (lower than or equal) of both probabilistic series intputs.
 *
 * @param a the first input distribution
 * @param b the second input distribution
 * @returns the element-wise comparison (0=false, 1=true) of both inputs
 */
const lowerThanOrEqualForSeries = (a: number[][], b: number[][]): number[][] => {
  const shape = [a.length, a[0].length];
  const result = new Array(shape[0]);
  for (let j = 0; j < shape[0]; j++) {
    result[j] = new Array(shape[1]);
    for (let i = 0; i < shape[1]; i++) {
      result[j][i] = +(a[j][i] <= b[j][i]);
    }
  }
  return result;
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
    ">": (a, b) => greaterThanForArray(a, b),
    "<": (a, b) => lowerThanForArray(a, b),
    ">=": (a, b) => greaterThanOrEqualForArray(a, b),
    "<=": (a, b) => lowerThanOrEqualForArray(a, b)
  },

  seriesOperations: {
    ">": (a, b) => greaterThanForSeries(a, b),
    "<": (a, b) => lowerThanForSeries(a, b),
    ">=": (a, b) => greaterThanOrEqualForSeries(a, b),
    "<=": (a, b) => lowerThanOrEqualForSeries(a, b)
  }
});
