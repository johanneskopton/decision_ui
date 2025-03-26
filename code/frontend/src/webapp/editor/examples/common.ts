import { Graph, GraphInputNode, GraphOutputNode } from "baklavajs";
import { TypeConstraintNode } from "../nodes/TypeConstraintNode";
import { MathNode, type SupportedMathOperationType } from "../nodes/MathNode";
import type { InterfaceTypeSet } from "../common/types";
import { DETERMINISTIC_DISTRIBUTION, type AvailableDistributionsType } from "../distributions";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";

export const addEstimateNode = (
  graph: Graph,
  title: string,
  comment: string,
  distribution: AvailableDistributionsType,
  params: any,
  position: { x: number; y: number }
) => {
  const node = new EstimateNode();
  graph.addNode(node);
  node.title = title;
  node.inputs.comment.value = comment;
  node.inputs.distribution.value = distribution;
  node.position = position;
  if (distribution == DETERMINISTIC_DISTRIBUTION) {
    node.inputs.value.value = params.value;
  } else {
    node.inputs.lower.value = params.lower;
    node.inputs.upper.value = params.upper;
  }
  return node;
};

export const addResultNode = (graph: Graph, title: string, position: { x: number; y: number }) => {
  const node = new ResultNode();
  graph.addNode(node);
  node.title = title;
  node.position = position;
  return node;
};

export const addGraphInputNode = (graph: Graph, title: string, name: string, position: { x: number; y: number }) => {
  const node = new GraphInputNode();
  graph.addNode(node);
  node.title = title;
  node.inputs.name.value = name;
  node.position = position;
  return node;
};

export const addGraphOutputNode = (graph: Graph, title: string, name: string, position: { x: number; y: number }) => {
  const node = new GraphOutputNode();
  graph.addNode(node);
  node.title = title;
  node.inputs.name.value = name;
  node.position = position;
  return node;
};

export const addTypeConstraintNode = (graph: Graph, type: InterfaceTypeSet, position: { x: number; y: number }) => {
  const node = new TypeConstraintNode();
  graph.addNode(node);
  node.inputs.type.value = type;
  node.position = position;
  return node;
};

export const addMathNode = (
  graph: Graph,
  title: string,
  operation: SupportedMathOperationType,
  position: { x: number; y: number }
) => {
  const node = new MathNode();
  graph.addNode(node);
  node.title = title;
  node.inputs.operation.value = operation;
  node.position = position;
  return node;
};
