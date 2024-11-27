import { repeat } from "@/common/array";
import nj from "@d4c/numjs";

import type { FlexibleNumber } from "./types";

export const makeArray = (value: FlexibleNumber, size: number): number[] => {
  if (Array.isArray(value)) {
    return value as number[];
  }
  return repeat(value, size);
};

export const makeSeries = (value: FlexibleNumber, mcRuns: number, series_n: number): number[][] => {
  if (Array.isArray(value) && Array.isArray(value[0])) {
    // value is already a series
    return value as number[][];
  }
  if (Array.isArray(value)) {
    // value is a distribution
    return nj.stack(repeat(value, series_n)).T.tolist() as number[][];
  }
  // value is number
  return nj.stack(repeat(makeArray(value, mcRuns), series_n)).T.tolist() as number[][];
};
