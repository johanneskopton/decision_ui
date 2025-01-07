import { useBaklava } from "baklavajs";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";
import { NoteNode } from "../nodes/NoteNode";

export const getTrivialModel = () => {
  const viewPlugin = useBaklava();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  noteNode.inputs.note.value =
    `A trivial model with just on input estimate variable and one output result variable. ` +
    `The distribution of the input sample is visualized as a histogram.`;
  displayedGraph.addNode(noteNode);
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 700;

  const estimateNode = new EstimateNode();
  displayedGraph.addNode(estimateNode);
  estimateNode.position = { x: 300, y: 400 };

  const resultNode = new ResultNode();
  displayedGraph.addNode(resultNode);
  resultNode.position = { x: 700, y: 400 };

  displayedGraph.addConnection(estimateNode.outputs.sample, resultNode.inputs.sample);

  return viewPlugin.editor.save();
};
