import { useBaklava } from "baklavajs";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";
import { NoteNode } from "../nodes/NoteNode";
import { MathNode } from "../nodes/MathNode";

export const getMultipleOutputsModel = () => {
  const viewPlugin = useBaklava();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  noteNode.inputs.note.value = `A simple model with multiple input estimate variables and multiple output result variables.`;
  displayedGraph.addNode(noteNode);
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 250;

  const firstEstimateNode = new EstimateNode();
  firstEstimateNode.title = "First Estimate";
  displayedGraph.addNode(firstEstimateNode);
  firstEstimateNode.position = { x: 600, y: 100 };

  const firstResultNode = new ResultNode();
  firstResultNode.title = "First Result";
  displayedGraph.addNode(firstResultNode);
  firstResultNode.position = { x: 900, y: 100 };

  const secondEstimateNode = new EstimateNode();
  secondEstimateNode.title = "Second Estimate";
  secondEstimateNode.inputs.distribution.value = "deterministic";
  displayedGraph.addNode(secondEstimateNode);
  secondEstimateNode.position = { x: 300, y: 400 };

  const thirdEstimateNode = new EstimateNode();
  thirdEstimateNode.title = "Third Estimate";
  displayedGraph.addNode(thirdEstimateNode);
  thirdEstimateNode.position = { x: 300, y: 650 };

  const mathNode = new MathNode();
  displayedGraph.addNode(mathNode);
  mathNode.position = { x: 600, y: 500 };

  const secondResultNode = new ResultNode();
  secondResultNode.title = "Second Result";
  displayedGraph.addNode(secondResultNode);
  secondResultNode.position = { x: 900, y: 500 };

  displayedGraph.addConnection(firstEstimateNode.outputs.sample, firstResultNode.inputs.sample);
  displayedGraph.addConnection(secondEstimateNode.outputs.value, mathNode.inputs.a);
  displayedGraph.addConnection(thirdEstimateNode.outputs.sample, mathNode.inputs.b);
  displayedGraph.addConnection(mathNode.outputs.sample, secondResultNode.inputs.sample);

  return viewPlugin.editor.save();
};
