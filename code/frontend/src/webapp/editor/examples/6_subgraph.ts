import { createGraphNodeType, Editor, Graph, GraphInputNode, GraphOutputNode, GraphTemplate } from "baklavajs";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";
import { ToSeriesNode } from "../nodes/ToSeriesNode";
import { NPVNode } from "../nodes/NetPresentValueNode";
import { TypeConstraintNode } from "../nodes/TypeConstraintNode";
import { DETERMINISTIC_TYPE, PROBABILISTIC_TYPE } from "../common/types";
import { initializeBaklvaState } from "../common/initialize";
import { NoteNode } from "../nodes/NoteNode";

const getNpvSubgraph = (editor: Editor) => {
  const subgraph = new Graph(editor);

  const noteNode = new NoteNode();
  subgraph.addNode(noteNode);
  noteNode.inputs.note.value =
    `Subgraphs require at least one subgraph input node and at least one subgraph output node. ` +
    `There can be more than one, though. ` +
    `Input nodes need to be connected to a 'Type Constraint' node in order to work correctly. ` +
    `The type constraint specifies the data type of the respective input (e.g. deterministic or probabilistic). ` +
    `Input nodes are represented as connection points in the graph that embedds a subgraph.`;
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 900;

  const sampleInputNode = new GraphInputNode();
  sampleInputNode.title = "Sample Input";
  sampleInputNode.inputs.name.value = "Sample";
  subgraph.addNode(sampleInputNode);
  sampleInputNode.position = { x: 300, y: 400 };

  const sampleTypeConstraintNode = new TypeConstraintNode();
  sampleTypeConstraintNode.inputs.type.value = PROBABILISTIC_TYPE;
  subgraph.addNode(sampleTypeConstraintNode);
  sampleTypeConstraintNode.position = { x: 550, y: 400 };

  const discountInputNode = new GraphInputNode();
  discountInputNode.title = "Discount Input";
  discountInputNode.inputs.name.value = "Discount";
  subgraph.addNode(discountInputNode);
  discountInputNode.position = { x: 300, y: 650 };

  const discountTypeConstraintNode = new TypeConstraintNode();
  discountTypeConstraintNode.inputs.type.value = PROBABILISTIC_TYPE;
  subgraph.addNode(discountTypeConstraintNode);
  discountTypeConstraintNode.position = { x: 550, y: 650 };

  const toSeriesNode = new ToSeriesNode();
  subgraph.addNode(toSeriesNode);
  toSeriesNode.position = { x: 800, y: 400 };

  const npvNode = new NPVNode();
  subgraph.addNode(npvNode);
  npvNode.position = { x: 1050, y: 550 };

  const outputNode = new GraphOutputNode();
  outputNode.title = "Output";
  outputNode.inputs.name.value = "NPV Sample";
  subgraph.addNode(outputNode);
  outputNode.position = { x: 1300, y: 400 };

  subgraph.addConnection(sampleInputNode.outputs.placeholder, sampleTypeConstraintNode.inputs.sample);
  subgraph.addConnection(sampleTypeConstraintNode.outputs.sample, toSeriesNode.inputs.x);
  subgraph.addConnection(discountInputNode.outputs.placeholder, discountTypeConstraintNode.inputs.sample);
  subgraph.addConnection(discountTypeConstraintNode.outputs.sample, npvNode.inputs.discount);
  subgraph.addConnection(toSeriesNode.outputs.series, npvNode.inputs.x);
  subgraph.addConnection(npvNode.outputs.sample, outputNode.inputs.placeholder);

  return subgraph;
};

export const getSubgraphModel = () => {
  const { editor, viewPlugin } = initializeBaklvaState();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  displayedGraph.addNode(noteNode);
  noteNode.inputs.note.value =
    `This model calculates the same net present value (as in the previous example) but uses a subgraph node. ` +
    `Subgraphs hide complexity, which allows building larger models. ` +
    `Subgraphs can also be reused multiple times, and are translated to standalone R functions. ` +
    `You can edit the subgraph 'NPV 10-year' from the 3-dot menu of the green graph instance node.`;
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 900;

  const template = GraphTemplate.fromGraph(getNpvSubgraph(editor), editor);
  template.name = "NPV 10-year";

  const SubgraphNodeType = createGraphNodeType(template);
  editor.addGraphTemplate(template);

  const sampleEstNode = new EstimateNode();
  displayedGraph.addNode(sampleEstNode);
  sampleEstNode.title = "Cost Estimate";
  sampleEstNode.inputs.distribution.value = "posnorm";
  sampleEstNode.inputs.lower.value = 1000;
  sampleEstNode.inputs.upper.value = 2000;
  sampleEstNode.position = { x: 300, y: 400 };

  const discountEstNode = new EstimateNode();
  displayedGraph.addNode(discountEstNode);
  discountEstNode.title = "Discount Estimate";
  discountEstNode.inputs.distribution.value = "posnorm";
  discountEstNode.inputs.lower.value = 9;
  discountEstNode.inputs.upper.value = 11;
  discountEstNode.position = { x: 300, y: 700 };

  const subNode = new SubgraphNodeType();
  displayedGraph.addNode(subNode);
  subNode.position = { x: 600, y: 500 };

  const resultNode = new ResultNode();
  displayedGraph.addNode(resultNode);
  resultNode.position = { x: 900, y: 400 };

  displayedGraph.addConnection(sampleEstNode.outputs.sample, subNode.inputs[Object.keys(subNode.inputs)[0]]);
  displayedGraph.addConnection(discountEstNode.outputs.sample, subNode.inputs[Object.keys(subNode.inputs)[1]]);
  displayedGraph.addConnection(subNode.outputs[Object.keys(subNode.outputs)[0]], resultNode.inputs.sample);

  return viewPlugin.editor.save();
};
