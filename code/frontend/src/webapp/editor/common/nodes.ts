import {
  defineDynamicNode,
  NodeInterface,
  setType,
  type DynamicNode,
  type DynamicNodeDefinition,
  type DynamicNodeUpdateResult,
  type IConnection,
  type IDynamicNodeDefinition,
  type Node
} from "baklavajs";
import {
  DETERMINISTIC_INT_TYPE,
  DETERMINISTIC_TYPE,
  deterministicIntegerType,
  deterministicType,
  PROBABILISTIC_INT_TYPE,
  PROBABILISTIC_SERIES_TYPE,
  PROBABILISTIC_TYPE,
  probabilisticIntegerType,
  probabilisticSeriesType,
  probabilisticType,
  type FlexibleNumber,
  type InterfaceTypeSet
} from "./types";
import { reactive } from "vue";

export const isInputInterfaceDeterministic = (node: Node<any, any>, key: string) => {
  if (node.inputs[key].connectionCount > 0) {
    // check connection to key
    const connection = node.graph?.connections.find(c => c.to.id == node.inputs[key].id);
    if (((connection?.from as any).type as string) != "deterministic") {
      return false;
    }
  } else if (Array.isArray(node.inputs[key].value)) {
    return false;
  }
  return true;
};

export const getInputInterfaceType = (node: Node<any, any>, key: string): InterfaceTypeSet => {
  if (node.inputs[key].connectionCount > 0) {
    // check connection to key
    const connection = node.graph?.connections.find(c => c.to.id == node.inputs[key].id);
    return (connection?.from as any).type as InterfaceTypeSet;
  }
  return DETERMINISTIC_TYPE;
};

export const isDeterministic = (value: FlexibleNumber) => {
  return !Array.isArray(value);
};

export const isSeries = (value: FlexibleNumber) => {
  return Array.isArray(value) && Array.isArray(value[0]);
};

export const isProbabilistic = (value: FlexibleNumber) => {
  return Array.isArray(value) && !Array.isArray(value[0]);
};

export const registerUpdateForInputConnectionChange = (node: DynamicNode<any, any>) => {
  const connectionHandler = (connection: IConnection) => {
    if (connection.to.nodeId == node.id) {
      // connection concerns current node
      // update node outputs
      (node as any).onUpdate.call(node);
    }
  };
  if (!node.graph) {
    console.error("cannot register connection change handlers for unknown graph");
  }
  node.graph?.events.addConnection.subscribe(node, connectionHandler);
  node.graph?.events.removeConnection.subscribe(node, connectionHandler);
};

export const isNodePartOfSubgraph = (node: Node<any, any>) => {
  console.log(`[node=${node.id}] graph.template = ${node.graph?.template}`);
  return node.graph?.template ? true : false;
};

export interface IDynamicFlexibleNodeDefinition<I, O> extends IDynamicNodeDefinition<I, O> {
  onFirstUpdate: (inputs: I, outputs: O) => DynamicNodeUpdateResult;
}

export const defineFlexibleDynamicNode = <I, O>(definition: IDynamicFlexibleNodeDefinition<I, O>) => {
  return defineDynamicNode<I, O>({
    ...definition,

    onCreate() {
      const node = this as any as Node<any, any>;
      // console.error("[node=" + (this as any).id + "] dynamic node create");
      (this as any).loading = false;
      node.hooks.beforeLoad.subscribe(Symbol(), (state, n) => {
        (n as any).loading = true;
        return state;
      });

      // fix error that dynamic nodes do not update in subgraphs
      node.inputs = reactive(node.inputs);
      node.outputs = reactive(node.outputs);

      definition.onCreate?.call(this);
    },

    onPlaced() {
      const node = this as any as Node<any, any>;
      console.error(`[node id=${node.id} title=${node.title}] dynamic node placed`);
      registerUpdateForInputConnectionChange(this as any);
      definition.onPlaced?.call(this);
    },

    onUpdate(inputs, outputs) {
      const node = this as any as Node<any, any>;
      console.error(
        `[node id=${node.id} title=${node.title}] dynamic node update, loading = ${(this as any).loading}, graph=${node.graph?.nodes.length}`
      );
      if ((node as any).loading) {
        (node as any).loading = false;
        return definition.onFirstUpdate.call(this, inputs, outputs);
      } else {
        return definition.onUpdate.call(this, inputs, outputs);
      }
    },

    calculate(inputs, context) {
      const node = this as any as Node<any, any>;
      console.error(
        `[node id=${node.id} title=${node.title}] dynamic node calculate, graph=${node.graph?.nodes.length}`
      );
      // if ((this as any).beforeFirstCalculation) {
      //console.error("[node=" + (this as any).id + "] dynamic node set before first calulation = false");
      // (this as any).loaded = true;
      // }
      return definition.calculate?.call(this, inputs, context);
    }
  });
};

const outputInterfaceForType: { [key: string]: DynamicNodeDefinition } = {
  [DETERMINISTIC_TYPE]: {
    value: () => new NodeInterface<number>("Value", null as any).use(setType, deterministicType)
  },
  [DETERMINISTIC_INT_TYPE]: {
    value: () => new NodeInterface<number>("Value", null as any).use(setType, deterministicIntegerType)
  },
  [PROBABILISTIC_TYPE]: {
    sample: () => new NodeInterface<number[]>("Sample", null as any).use(setType, probabilisticType)
  },
  [PROBABILISTIC_INT_TYPE]: {
    sample: () => new NodeInterface<number[]>("Sample", null as any).use(setType, probabilisticIntegerType)
  },
  [PROBABILISTIC_SERIES_TYPE]: {
    series: () => new NodeInterface<number[][]>("Series", null as any).use(setType, probabilisticSeriesType)
  }
};

export const getOutputInterfaceForType = (key: string) => outputInterfaceForType[key];
