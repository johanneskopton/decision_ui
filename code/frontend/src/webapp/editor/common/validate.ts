import type { Graph, Node } from "baklavajs";
import { FLEXIBLE_TYPE_NAME } from "./types";

export interface ValidationFeedback {
  type: "error" | "info";
  message: string;
}

export type RegisterNodeValidationErrorFunc = (node: Node<any, any>, error: ValidationFeedback) => void;

const hasNodeOfType = (graph: Graph, type: string) => {
  for (const node of graph.nodes) {
    if (node.type == type) {
      return true;
    }
  }
  return false;
};

export const isMainGraph = (graph: Graph) => {
  return graph.template == undefined || graph.template == null;
};

export const isNodeConnected = (node: Node<any, any>) => {
  for (const intf of Object.values(node.inputs)) {
    if (intf.port && intf.connectionCount > 0) {
      return true;
    }
  }
  for (const intf of Object.values(node.outputs)) {
    if (intf.port && intf.connectionCount > 0) {
      return true;
    }
  }

  return false;
};

export const validateGraph = (
  graph: Graph,
  addGraphValidationError: (graph: Graph, error: ValidationFeedback) => void,
  addNodeValidationError: (node: Node<any, any>, error: ValidationFeedback) => void
) => {
  if (isMainGraph(graph) && !hasNodeOfType(graph, "Result")) {
    addGraphValidationError(graph, {
      type: "error",
      message: "Model requires at least one Result node."
    });
  }

  if (isMainGraph(graph) && !hasNodeOfType(graph, "Estimate")) {
    addGraphValidationError(graph, {
      type: "error",
      message: "Model requires at least one Estimate node."
    });
  }

  if (!isMainGraph(graph) && !hasNodeOfType(graph, "__baklava_SubgraphInputNode")) {
    addGraphValidationError(graph, {
      type: "error",
      message: "Subgraph requires at least one Subgraph Input node."
    });
  }

  if (!isMainGraph(graph) && !hasNodeOfType(graph, "__baklava_SubgraphOutputNode")) {
    addGraphValidationError(graph, {
      type: "error",
      message: "Subgraph requires at least one Subgraph Output node."
    });
  }

  // check flexible inputs are connected to outputs with known interface type
  for (const node of graph.nodes) {
    for (const intf of Object.values(node.inputs)) {
      if (intf.connectionCount > 0 && (intf as any).type == FLEXIBLE_TYPE_NAME) {
        const connection = graph.connections.find(c => c.to.id == intf.id);
        if (connection && !(connection.from as any).type) {
          addNodeValidationError(node, {
            type: "error",
            message:
              `Node input '${intf.name}' needs to be connected to an output with a non-generic type. ` +
              `Use a TypeConstraint node to specify the type of the input.`
          });
        }
      }
    }
  }

  // check all nodes are connected to something
  for (const node of graph.nodes) {
    if (!isNodeConnected(node)) {
      switch (node.type) {
        case "Note": {
          break;
        }
        case "Result": {
          addNodeValidationError(node, {
            type: "error",
            message: "Result node needs to be connected."
          });
          break;
        }
        case "__baklava_SubgraphOutputNode": {
          addNodeValidationError(node, {
            type: "error",
            message: "Subgraph output node needs to be connected."
          });
          break;
        }
        default: {
          addNodeValidationError(node, {
            type: "info",
            message: `Node is not connected.`
          });
        }
      }
    }
  }
};
