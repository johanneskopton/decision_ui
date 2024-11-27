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

export const registerUpdateForInputConnectionChange = (node: DynamicNode<any, any>) => {
  const connectionHandler = (connection: IConnection) => {
    if (connection.to.nodeId == node.id) {
      // connection concerns current node
      // update node outputs
      (node as any).onUpdate();
    }
  };
  node.graph?.events.addConnection.subscribe(node, connectionHandler);
  node.graph?.events.removeConnection.subscribe(node, connectionHandler);
};

interface IDynamicFlexibleNodeDefinition<I, O> extends IDynamicNodeDefinition<I, O> {
  onFirstUpdate: (inputs: I, outputs: O) => DynamicNodeUpdateResult;
}

export const defineFlexibleDynamicNode = <I, O>(definition: IDynamicFlexibleNodeDefinition<I, O>) => {
  return defineDynamicNode<I, O>({
    ...definition,

    onCreate() {
      (this as any).beforeFirstCalculation = true;
      definition.onCreate?.call(this);
    },

    onPlaced() {
      registerUpdateForInputConnectionChange(this as any);
    },

    onUpdate(inputs, outputs) {
      if ((this as any).beforeFirstCalculation) {
        return definition.onFirstUpdate.call(this, inputs, outputs);
      } else {
        return definition.onUpdate.call(this, inputs, outputs);
      }
    },

    calculate(inputs, context) {
      (this as any).beforeFirstCalculation = false;
      return definition.calculate?.call(this, inputs, context);
    }
  });
};

const outputInterfaceForType: { [key: string]: DynamicNodeDefinition } = {
  [DETERMINISTIC_TYPE]: {
    value: () => new NodeInterface<number>("Value", 0.0).use(setType, deterministicType)
  },
  [DETERMINISTIC_INT_TYPE]: {
    value: () => new NodeInterface<number>("Value", 0).use(setType, deterministicIntegerType)
  },
  [PROBABILISTIC_TYPE]: {
    sample: () => new NodeInterface<number[]>("Sample", []).use(setType, probabilisticType)
  },
  [PROBABILISTIC_INT_TYPE]: {
    sample: () => new NodeInterface<number[]>("Sample", []).use(setType, probabilisticIntegerType)
  },
  [PROBABILISTIC_SERIES_TYPE]: {
    series: () => new NodeInterface<number[][]>("Series", []).use(setType, probabilisticSeriesType)
  }
};

export const getOutputInterfaceForType = (key: string) => outputInterfaceForType[key];
