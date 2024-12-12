import type { Graph, Node } from "baklavajs";

export interface NodeValidationError {
  type: "error" | "info";
  message: string;
}

export interface GraphValidationError {
  type: "error" | "info";
  message: string;
}

export type RegisterNodeValidationErrorFunc = (node: Node<any, any>, error: NodeValidationError) => void;

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

export const validateGraph = (
  graph: Graph,
  addGraphValidationError: (graph: Graph, error: GraphValidationError) => void
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
};
