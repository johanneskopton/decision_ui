import { NodeInterfaceType } from "baklavajs";

export const ESTIMATE_NODE_TYPE = "Estimate";
export const RESULT_NODE_TYPE = "Result";
export const SUBGRAPH_INPUT_NODE_TYPE = "__baklava_SubgraphInputNode";
export const SUBGRAPH_OUTPUT_NODE_TYPE = "__baklava_SubgraphOutputNode";
export const SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX = "__baklava_GraphNode";

export const FLEXIBLE_TYPE_NAME = "flexible";

export const DETERMINISTIC_TYPE = "deterministic";
export const DETERMINISTIC_INT_TYPE = "deterministic_int";

export const PROBABILISTIC_TYPE = "probabilistic";
export const PROBABILISTIC_INT_TYPE = "probabilistic_int";
export const PROBABILISTIC_SERIES_TYPE = "probabilistic_series";

export type InterfaceTypeSet =
  | "flexible"
  | "probabilistic"
  | "probabilistic_int"
  | "probabilistic_series"
  | "deterministic"
  | "deterministic_int";

export type FlexibleNumber = number | number[] | number[][];

export const DETERMINISTIC_TYPE_SET = [DETERMINISTIC_TYPE, DETERMINISTIC_INT_TYPE];
export const PROBABILISTIC_TYPE_SET = [PROBABILISTIC_TYPE, PROBABILISTIC_INT_TYPE];
export const SERIES_TYPE_SET = [PROBABILISTIC_SERIES_TYPE];

export const isDeterministicType = (name: InterfaceTypeSet) => DETERMINISTIC_TYPE_SET.includes(name);
export const isProbabilisticType = (name: InterfaceTypeSet) => PROBABILISTIC_TYPE_SET.includes(name);
export const isSeriesType = (name: InterfaceTypeSet) => SERIES_TYPE_SET.includes(name);

export const flexibleType = new NodeInterfaceType<FlexibleNumber>(FLEXIBLE_TYPE_NAME);

export const deterministicType = new NodeInterfaceType<number>(DETERMINISTIC_TYPE);
export const deterministicIntegerType = new NodeInterfaceType<number>(DETERMINISTIC_INT_TYPE);

export const probabilisticType = new NodeInterfaceType<number[]>(PROBABILISTIC_TYPE);
export const probabilisticIntegerType = new NodeInterfaceType<number[]>(PROBABILISTIC_INT_TYPE);
export const probabilisticSeriesType = new NodeInterfaceType<number[][]>(PROBABILISTIC_SERIES_TYPE);

// define conversions
deterministicType.addConversion(flexibleType, v => v);
deterministicIntegerType.addConversion(flexibleType, v => v);

probabilisticType.addConversion(flexibleType, v => v);
probabilisticIntegerType.addConversion(flexibleType, v => v);
probabilisticSeriesType.addConversion(flexibleType, v => v);

deterministicIntegerType.addConversion(deterministicType, v => v);
probabilisticIntegerType.addConversion(probabilisticType, v => v);
