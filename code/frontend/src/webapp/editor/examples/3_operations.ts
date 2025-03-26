import { useBaklava } from "baklavajs";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";
import { NoteNode } from "../nodes/NoteNode";
import { DETERMINISTIC_DISTRIBUTION, POSITIVE_NORMAL_DISTRIBUTION } from "../distributions";
import { MathNode } from "../nodes/MathNode";

export const getExampleOperationsModel = () => {
  const viewPlugin = useBaklava();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  noteNode.inputs.note.value =
    `This model sums up a probabilistic and deterministic estimate. ` +
    `A probabilistic estimate is represented by a sample from the respective probability distribution. ` +
    `A determinisitc estimate is represented by a single constant number. ` +
    `This is highlighted by the colored connection points (cyan means sample, yellow means constant value). ` +
    `The corresponding 'Math' node accepts both types and applies a meaningful conversion to them. ` +
    `In this case, the deterministic value 1000 is added to each sample value of the probabilisitic estimate. ` +
    `A similar conversion is applied for all operation nodes that have white connection points.`;
  displayedGraph.addNode(noteNode);
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 1000;

  const probEstNode = new EstimateNode();
  displayedGraph.addNode(probEstNode);
  probEstNode.title = "Probabilistic Estimate";
  probEstNode.inputs.distribution.value = POSITIVE_NORMAL_DISTRIBUTION;
  probEstNode.inputs.lower.value = 1000;
  probEstNode.inputs.upper.value = 2000;
  probEstNode.position = { x: 300, y: 400 };

  const detEstNode = new EstimateNode();
  displayedGraph.addNode(detEstNode);
  detEstNode.title = "Deterministic Estimate";
  detEstNode.inputs.distribution.value = DETERMINISTIC_DISTRIBUTION;
  detEstNode.inputs.value.value = 1000;
  detEstNode.position = { x: 300, y: 700 };

  const mathNode = new MathNode();
  displayedGraph.addNode(mathNode);
  mathNode.position = { x: 650, y: 500 };

  const resultNode = new ResultNode();
  displayedGraph.addNode(resultNode);
  resultNode.position = { x: 1000, y: 450 };

  displayedGraph.addConnection(probEstNode.outputs.sample, mathNode.inputs.a);
  displayedGraph.addConnection(detEstNode.outputs.value, mathNode.inputs.b);
  displayedGraph.addConnection(mathNode.outputs.sample, resultNode.inputs.sample);

  return viewPlugin.editor.save();
};
