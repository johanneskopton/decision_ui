import {
  defineDynamicNode,
  NodeInterface,
  setType,
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
    const type = (connection?.from as any).type as InterfaceTypeSet | undefined | null;
    if (type === undefined || type == null) {
      // e.g. when connecting a subgraph input
      return DETERMINISTIC_TYPE;
    }
    return type;
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

const registerInteractiveChange = (node: Node<any, any>) => {
  (node as any).interactive = false;
  node.graph?.events.checkConnection.subscribe(node, () => {
    (node as any).interactive = true;
  });
  node.graph?.events.beforeRemoveConnection.subscribe(node, () => {
    (node as any).interactive = true;
  });
};

const isNodeInteractive = (node: Node<any, any>) => {
  return (node as any).interactive;
};

export const registerUpdateForInteractiveConnectionChange = (node: Node<any, any>) => {
  if (!node.graph) {
    console.error("cannot register connection change handlers for unknown graph");
  }
  registerInteractiveChange(node);
  const handler = (connection: IConnection) => {
    // addConnection is called when the graph is being loaded
    // at this time, the type information is incomplete, because
    // connections are added one by one
    // as soon as the node is fully loaded, we dispatch update events
    if (connection.to.nodeId == node.id && isNodeInteractive(node)) {
      // connection concerns current node
      (node as any).connectionUpdate = true;
      (node as any).onUpdate.call(node);
      (node as any).connectionUpdate = false;
    }
  };
  node.graph?.events.addConnection.subscribe(node, handler);
  node.graph?.events.removeConnection.subscribe(node, handler);
};

export const isNodeInteractiveConnectionUpdate = (node: Node<any, any>) => {
  return (node as any).connectionUpdate;
};

export const isNodePartOfSubgraph = (node: Node<any, any>) => {
  return node.graph?.template ? true : false;
};

const fixDynamicNodeUpdateInSubgraph = (node: Node<any, any>) => {
  // fix error that dynamic nodes do not update in the editor inside subgraphs
  if (node.graph) {
    // make inputs, outputs and connections reactive
    node.inputs = reactive(node.inputs);
    node.outputs = reactive(node.outputs);
    (node.graph as any)._connections = reactive((node.graph as any)._connections);
  }
};

export interface IDynamicFlexibleNodeDefinition<I, O> extends IDynamicNodeDefinition<I, O> {
  onConnectionUpdate?: (inputs: I, outputs: O) => DynamicNodeUpdateResult;
}

export const defineFlexibleDynamicNode = <I, O>(definition: IDynamicFlexibleNodeDefinition<I, O>) => {
  return defineDynamicNode<I, O>({
    ...definition,

    onCreate() {
      definition.onCreate?.call(this);
    },

    onPlaced() {
      const node = this as any as Node<any, any>;
      registerUpdateForInteractiveConnectionChange(node);
      fixDynamicNodeUpdateInSubgraph(node);
      definition.onPlaced?.call(this);
    },

    onUpdate(inputs, outputs) {
      const node = this as any as Node<any, any>;
      if (isNodeInteractiveConnectionUpdate(node) && definition.onConnectionUpdate) {
        // console.error(`[node title=${node.title} id=${node.id}] connection update`);
        return definition.onConnectionUpdate.call(this, inputs, outputs);
      } else {
        // console.error(`[node title=${node.title} id=${node.id}] static update`);
        return definition.onUpdate.call(this, inputs, outputs);
      }
    },

    calculate(inputs, context) {
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
