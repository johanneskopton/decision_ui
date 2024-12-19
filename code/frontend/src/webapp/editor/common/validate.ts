import type { Graph, Node } from "baklavajs";
import {
  ESTIMATE_NODE_TYPE,
  FLEXIBLE_TYPE_NAME,
  RESULT_NODE_TYPE,
  SUBGRAPH_INPUT_NODE_TYPE,
  SUBGRAPH_OUTPUT_NODE_TYPE
} from "./types";
import { generateVariableName } from "./variables";

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

const isMainGraph = (graph: Graph) => {
  return graph.template == undefined || graph.template == null;
};

const isNodeConnected = (node: Node<any, any>) => {
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

const checkGraphForUniqueEstimateNodeTitles = (
  graph: Graph,
  addNodeValidationError: (node: Node<any, any>, error: ValidationFeedback) => void
) => {
  // check estimate and result nodes have unique name
  for (const node of graph.nodes) {
    if (node.type == ESTIMATE_NODE_TYPE || node.type == RESULT_NODE_TYPE) {
      for (const other of graph.nodes) {
        if (node.id != other.id) {
          if (node.title == other.title) {
            addNodeValidationError(node, {
              type: "error",
              message:
                `The title of both Estimate and Result nodes need to be unique. ` +
                `There is another node with the same title!`
            });
            return; // only show one name error for a graph
          }
          const nodeVariable = generateVariableName(node.title);
          const otherVariable = generateVariableName(other.title);
          if (nodeVariable == otherVariable) {
            addNodeValidationError(node, {
              type: "error",
              message:
                `The variable name '${nodeVariable}' of both Estimate and Result nodes need to be unique. ` +
                `The node with the title '${other.title}' has the same variable name!`
            });
            return; // only show one name error for a graph
          }
        }
      }
    }
  }
};

const checkGraphForUnconnectedNodes = (
  graph: Graph,
  addNodeValidationError: (node: Node<any, any>, error: ValidationFeedback) => void
) => {
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

const checkSubgraphInputsAreTyped = (
  graph: Graph,
  addNodeValidationError: (node: Node<any, any>, error: ValidationFeedback) => void
) => {
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
};

const checkGraphHasRequiredNodes = (
  graph: Graph,
  addGraphValidationError: (graph: Graph, error: ValidationFeedback) => void
) => {
  if (isMainGraph(graph) && !hasNodeOfType(graph, RESULT_NODE_TYPE)) {
    addGraphValidationError(graph, {
      type: "error",
      message: "Model requires at least one Result node."
    });
  }

  if (isMainGraph(graph) && !hasNodeOfType(graph, ESTIMATE_NODE_TYPE)) {
    addGraphValidationError(graph, {
      type: "error",
      message: "Model requires at least one Estimate node."
    });
  }

  if (!isMainGraph(graph) && !hasNodeOfType(graph, SUBGRAPH_INPUT_NODE_TYPE)) {
    addGraphValidationError(graph, {
      type: "error",
      message: "Subgraph requires at least one Subgraph Input node."
    });
  }

  if (!isMainGraph(graph) && !hasNodeOfType(graph, SUBGRAPH_OUTPUT_NODE_TYPE)) {
    addGraphValidationError(graph, {
      type: "error",
      message: "Subgraph requires at least one Subgraph Output node."
    });
  }
};

export const validateGraph = (
  graph: Graph,
  addGraphValidationError: (graph: Graph, error: ValidationFeedback) => void,
  addNodeValidationError: (node: Node<any, any>, error: ValidationFeedback) => void
) => {
  checkGraphHasRequiredNodes(graph, addGraphValidationError);
  checkSubgraphInputsAreTyped(graph, addNodeValidationError);
  checkGraphForUnconnectedNodes(graph, addNodeValidationError);
  checkGraphForUniqueEstimateNodeTitles(graph, addNodeValidationError);
};
