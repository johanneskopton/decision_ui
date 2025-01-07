import { useBaklava } from "baklavajs";
import { EstimateNode } from "../nodes/EstimateNode";
import { ResultNode } from "../nodes/ResultNode";
import { NoteNode } from "../nodes/NoteNode";
import { ToSeriesNode } from "../nodes/ToSeriesNode";
import { NPVNode } from "../nodes/NetPresentValueNode";

export const getNpvModel = () => {
  const viewPlugin = useBaklava();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  displayedGraph.addNode(noteNode);
  noteNode.inputs.note.value =
    `A model calculating the net present value of a probabilistic cost estimate typically ranging between ` +
    `$1.000 and $2.000 over a time period of 10 years with a cumulative discount rate of 10 percent per year.`;
  noteNode.position = { x: 300, y: 100 };
  noteNode.width = 700;

  const estimateNode = new EstimateNode();
  displayedGraph.addNode(estimateNode);
  estimateNode.title = "Cost Estimate";
  estimateNode.inputs.distribution.value = "posnorm";
  estimateNode.inputs.lower.value = 1000;
  estimateNode.inputs.upper.value = 2000;
  estimateNode.position = { x: 300, y: 400 };

  const toSeriesNode = new ToSeriesNode();
  displayedGraph.addNode(toSeriesNode);
  toSeriesNode.position = { x: 600, y: 400 };

  const npvNode = new NPVNode();
  displayedGraph.addNode(npvNode);
  npvNode.position = { x: 900, y: 400 };

  const resultNode = new ResultNode();
  displayedGraph.addNode(resultNode);
  resultNode.position = { x: 1200, y: 400 };

  displayedGraph.addConnection(estimateNode.outputs.sample, toSeriesNode.inputs.x);
  displayedGraph.addConnection(toSeriesNode.outputs.series, npvNode.inputs.x);
  displayedGraph.addConnection(npvNode.outputs.sample, resultNode.inputs.sample);

  return viewPlugin.editor.save();
};
