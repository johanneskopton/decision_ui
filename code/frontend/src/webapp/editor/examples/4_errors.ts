import { useBaklava } from "baklavajs";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";
import { NoteNode } from "../nodes/NoteNode";
import { POSITIVE_NORMAL_DISTRIBUTION } from "../distributions";
import { MathNode } from "../nodes/MathNode";

export const getExampleErrorModel = () => {
  const viewPlugin = useBaklava();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  noteNode.inputs.note.value =
    `This model is not valid. ` +
    `You can inspect the exact error messages from the red exclamation mark button in the bottom right corner. ` +
    `In order to connect the output of the first estimate node, click, hold and drag the cyan connection point ` +
    `'Sample' to the white connection point 'A' of the math node. ` +
    `Also, fix the problem that the lower bound for the second estimate is larger than its upper bound.\n\n` +
    `Unfortunately, only basic mistakes can be detected. ` +
    `The model is not checked conceptionally. You need to make sure it makes sense.`;
  displayedGraph.addNode(noteNode);
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 1000;

  const firstEstNode = new EstimateNode();
  displayedGraph.addNode(firstEstNode);
  firstEstNode.title = "First Estimate";
  firstEstNode.inputs.distribution.value = POSITIVE_NORMAL_DISTRIBUTION;
  firstEstNode.inputs.lower.value = 1000;
  firstEstNode.inputs.upper.value = 2000;
  firstEstNode.position = { x: 300, y: 400 };

  const secondEstNode = new EstimateNode();
  displayedGraph.addNode(secondEstNode);
  secondEstNode.title = "Second Estimate";
  secondEstNode.inputs.distribution.value = POSITIVE_NORMAL_DISTRIBUTION;
  secondEstNode.inputs.lower.value = 2000;
  secondEstNode.inputs.upper.value = 1000;
  secondEstNode.position = { x: 300, y: 700 };

  const mathNode = new MathNode();
  displayedGraph.addNode(mathNode);
  mathNode.position = { x: 650, y: 500 };

  const resultNode = new ResultNode();
  displayedGraph.addNode(resultNode);
  resultNode.position = { x: 1000, y: 450 };

  displayedGraph.addConnection(secondEstNode.outputs.sample, mathNode.inputs.b);
  displayedGraph.addConnection(mathNode.outputs.sample, resultNode.inputs.sample);

  return viewPlugin.editor.save();
};
