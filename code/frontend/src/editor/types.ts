import { NodeInterfaceType } from "baklavajs";

export const probabilisticType = new NodeInterfaceType<number[]>("probabilistic");
export const probabilisticIntegerType = new NodeInterfaceType<number[]>("probabilistic_int");
export const probabilisticSeriesType = new NodeInterfaceType<number[][]>("probabilistic_series");

export const deterministicType = new NodeInterfaceType<number>("deterministic");
export const deterministicIntegerType = new NodeInterfaceType<number>("deterministic_int");

// add conversions
deterministicType.addConversion(probabilisticType, v => [v]);
deterministicIntegerType.addConversion(probabilisticIntegerType, v => [v]);
deterministicIntegerType.addConversion(probabilisticType, v => [v]);
deterministicIntegerType.addConversion(deterministicType, v => v);
probabilisticIntegerType.addConversion(probabilisticType, v => v);