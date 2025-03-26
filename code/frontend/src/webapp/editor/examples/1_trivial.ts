import { useBaklava } from "baklavajs";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";
import { NoteNode } from "../nodes/NoteNode";

export const getExampleTrivialModel = () => {
  const viewPlugin = useBaklava();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  noteNode.inputs.note.value =
    `This model contains the minimal nodes required to form a valid model: ` +
    `a single input estimate node connected to a single result node. ` +
    `Click on the blue rocket button in the right bottom corner to run the monte carlo simulation and inspect the ` +
    `results in the 'Results dashboard' by clicking the diagram button in the left menu.\n\n` +
    `Nodes may be renamed from the 3-dot menu, which influences how they are referenced in diagrams and the R-code.`;
  displayedGraph.addNode(noteNode);
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 900;

  const estimateNode = new EstimateNode();
  displayedGraph.addNode(estimateNode);
  estimateNode.title = "Estimate Node";
  estimateNode.position = { x: 400, y: 400 };

  const resultNode = new ResultNode();
  displayedGraph.addNode(resultNode);
  resultNode.title = "Result Node";
  resultNode.position = { x: 800, y: 400 };

  displayedGraph.addConnection(estimateNode.outputs.sample, resultNode.inputs.sample);

  return viewPlugin.editor.save();
};
