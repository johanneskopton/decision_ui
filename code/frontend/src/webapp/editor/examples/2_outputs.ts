import { useBaklava } from "baklavajs";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";
import { NoteNode } from "../nodes/NoteNode";
import { NORMAL_DISTRIBUTION } from "../distributions";

export const getExampleMultipleOutputsModel = () => {
  const viewPlugin = useBaklava();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  noteNode.inputs.note.value =
    `A model may have any number of input estimate nodes or output result nodes.\n\n` +
    `In order to see nodes that are outside of the current view, you can move the work space of the editor by ` +
    `clicking and holding the left mouse button. ` +
    `To zoom in and out, use the mouse scroll wheel. ` +
    `Alternatively, click the 'Zoom to Fit' button in the top menu.`;
  displayedGraph.addNode(noteNode);
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 700;

  const firstEstimateNode = new EstimateNode();
  displayedGraph.addNode(firstEstimateNode);
  firstEstimateNode.title = "First Estimate";
  firstEstimateNode.inputs.distribution.value = NORMAL_DISTRIBUTION;
  firstEstimateNode.inputs.lower.value = 100;
  firstEstimateNode.inputs.upper.value = 200;
  firstEstimateNode.position = { x: 300, y: 400 };

  const firstResultNode = new ResultNode();
  firstResultNode.title = "First Result";
  displayedGraph.addNode(firstResultNode);
  firstResultNode.position = { x: 700, y: 350 };

  const secondEstimateNode = new EstimateNode();
  displayedGraph.addNode(secondEstimateNode);
  secondEstimateNode.title = "Second Estimate";
  secondEstimateNode.inputs.distribution.value = NORMAL_DISTRIBUTION;
  secondEstimateNode.inputs.lower.value = 150;
  secondEstimateNode.inputs.upper.value = 250;
  secondEstimateNode.position = { x: 300, y: 800 };

  const secondResultNode = new ResultNode();
  displayedGraph.addNode(secondResultNode);
  secondResultNode.title = "Second Result";
  secondResultNode.position = { x: 700, y: 750 };

  const thirdEstimateNode = new EstimateNode();
  displayedGraph.addNode(thirdEstimateNode);
  thirdEstimateNode.title = "Third Estimate";
  thirdEstimateNode.inputs.distribution.value = NORMAL_DISTRIBUTION;
  thirdEstimateNode.inputs.lower.value = 200;
  thirdEstimateNode.inputs.upper.value = 300;
  thirdEstimateNode.position = { x: 300, y: 1200 };

  const thirdResultNode = new ResultNode();
  thirdResultNode.title = "Third Result";
  displayedGraph.addNode(thirdResultNode);
  thirdResultNode.position = { x: 700, y: 1150 };

  displayedGraph.addConnection(firstEstimateNode.outputs.sample, firstResultNode.inputs.sample);
  displayedGraph.addConnection(secondEstimateNode.outputs.sample, secondResultNode.inputs.sample);
  displayedGraph.addConnection(thirdEstimateNode.outputs.sample, thirdResultNode.inputs.sample);

  return viewPlugin.editor.save();
};
