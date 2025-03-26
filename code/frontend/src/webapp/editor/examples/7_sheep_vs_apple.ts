import { AbstractNode, createGraphNodeType, Editor, Graph, GraphOutputNode, GraphTemplate } from "baklavajs";

import { ToSeriesNode } from "../nodes/ToSeriesNode";
import { NPVNode } from "../nodes/NetPresentValueNode";
import { PROBABILISTIC_TYPE } from "../common/types";
import {
  addEstimateNode,
  addGraphInputNode,
  addGraphOutputNode,
  addMathNode,
  addResultNode,
  addTypeConstraintNode
} from "./common";
import { DETERMINISTIC_DISTRIBUTION, POSITIVE_NORMAL_DISTRIBUTION } from "../distributions";
import { initializeBaklvaState } from "../common/initialize";
import { NoteNode } from "../nodes/NoteNode";

const getNpvTemplate = (editor: Editor) => {
  const subgraph = new Graph(editor);

  const sampleInputNode = addGraphInputNode(subgraph, "Subgraph Input", "Sample", { x: 300, y: 400 });
  const discountInputNode = addGraphInputNode(subgraph, "Subgraph Input", "Discount", { x: 300, y: 650 });

  const toSeriesNode = new ToSeriesNode();
  subgraph.addNode(toSeriesNode);
  toSeriesNode.position = { x: 600, y: 400 };

  const npvNode = new NPVNode();
  subgraph.addNode(npvNode);
  npvNode.position = { x: 850, y: 550 };

  const outputNode = new GraphOutputNode();
  outputNode.title = "Subgraph Output";
  outputNode.inputs.name.value = "NPV";
  subgraph.addNode(outputNode);
  outputNode.position = { x: 1100, y: 400 };

  subgraph.addConnection(sampleInputNode.outputs.placeholder, toSeriesNode.inputs.x);
  subgraph.addConnection(discountInputNode.outputs.placeholder, npvNode.inputs.discount);
  subgraph.addConnection(toSeriesNode.outputs.series, npvNode.inputs.x);
  subgraph.addConnection(npvNode.outputs.sample, outputNode.inputs.placeholder);

  const template = GraphTemplate.fromGraph(subgraph, editor);
  template.name = "NPV 10-year";

  return template;
};

const getDecisionTemplate = (editor: Editor, NpvSubgraphType: new () => AbstractNode) => {
  const subgraph = new Graph(editor);

  const sheepIncomeInput = addGraphInputNode(subgraph, "Subgraph Input", "Sheep Income", { x: 300, y: 24 });
  const appleIncomeInput = addGraphInputNode(subgraph, "Subgraph Input", "Apple Income", { x: 300, y: 237 });
  const sheepCostsInput = addGraphInputNode(subgraph, "Subgraph Input", "Sheep Costs", { x: 300, y: 455 });
  const appleCostsInput = addGraphInputNode(subgraph, "Subgraph Input", "Apple Costs", { x: 300, y: 670 });

  const sheepIncomeConstraint = addTypeConstraintNode(subgraph, PROBABILISTIC_TYPE, { x: 570, y: 0 });
  const appleIncomeConstraint = addTypeConstraintNode(subgraph, PROBABILISTIC_TYPE, { x: 570, y: 200 });
  const sheepCostsConstraint = addTypeConstraintNode(subgraph, PROBABILISTIC_TYPE, { x: 570, y: 430 });
  const appleCostsConstraint = addTypeConstraintNode(subgraph, PROBABILISTIC_TYPE, { x: 570, y: 650 });

  const totalIncome = addMathNode(subgraph, "Total Income", "add", { x: 995, y: 0 });
  const totalCosts = addMathNode(subgraph, "Total Costs", "add", { x: 995, y: 630 });
  const totalGain = addMathNode(subgraph, "Total Gain", "subtract", { x: 1260, y: 190 });
  const sheepOnlyGain = addMathNode(subgraph, "Sheep Only Gain", "subtract", { x: 1260, y: 470 });

  const discountInput = addGraphInputNode(subgraph, "Subgraph Input", "Discount", { x: 1260, y: 870 });

  const bothNpvNode = new NpvSubgraphType();
  subgraph.addNode(bothNpvNode);
  bothNpvNode.position = { x: 1700, y: 180 };

  const sheepOnlyNpvNode = new NpvSubgraphType();
  subgraph.addNode(sheepOnlyNpvNode);
  sheepOnlyNpvNode.position = { x: 1700, y: 450 };

  const benefitMath = addMathNode(subgraph, "Decision Benefit", "subtract", { x: 1700, y: 760 });

  const benefitNpvNode = new NpvSubgraphType();
  subgraph.addNode(benefitNpvNode);
  benefitNpvNode.position = { x: 2010, y: 800 };

  const bothNpvOutput = addGraphOutputNode(subgraph, "Subgraph Output", "Both NPV", { x: 2400, y: 165 });
  const sheepOnlyNpvOutput = addGraphOutputNode(subgraph, "Subgraph Output", "Sheep Only NPV", { x: 2400, y: 460 });
  const benefitNpvOutput = addGraphOutputNode(subgraph, "Subgraph Output", "Decision Benefit NPV", { x: 2400, y: 700 });

  subgraph.addConnection(sheepIncomeInput.outputs.placeholder, sheepIncomeConstraint.inputs.sample);
  subgraph.addConnection(appleIncomeInput.outputs.placeholder, appleIncomeConstraint.inputs.sample);
  subgraph.addConnection(sheepCostsInput.outputs.placeholder, sheepCostsConstraint.inputs.sample);
  subgraph.addConnection(appleCostsInput.outputs.placeholder, appleCostsConstraint.inputs.sample);

  subgraph.addConnection(sheepIncomeConstraint.outputs.sample, totalIncome.inputs.a);
  subgraph.addConnection(appleIncomeConstraint.outputs.sample, totalIncome.inputs.b);

  subgraph.addConnection(sheepCostsConstraint.outputs.sample, totalCosts.inputs.a);
  subgraph.addConnection(appleCostsConstraint.outputs.sample, totalCosts.inputs.b);

  subgraph.addConnection(totalIncome.outputs.sample, totalGain.inputs.a);
  subgraph.addConnection(totalCosts.outputs.sample, totalGain.inputs.b);

  subgraph.addConnection(sheepIncomeConstraint.outputs.sample, sheepOnlyGain.inputs.a);
  subgraph.addConnection(sheepCostsConstraint.outputs.sample, sheepOnlyGain.inputs.b);

  subgraph.addConnection(totalGain.outputs.sample, bothNpvNode.inputs[Object.keys(bothNpvNode.inputs)[0]]);
  subgraph.addConnection(discountInput.outputs.placeholder, bothNpvNode.inputs[Object.keys(bothNpvNode.inputs)[1]]);

  subgraph.addConnection(
    sheepOnlyGain.outputs.sample,
    sheepOnlyNpvNode.inputs[Object.keys(sheepOnlyNpvNode.inputs)[0]]
  );
  subgraph.addConnection(
    discountInput.outputs.placeholder,
    sheepOnlyNpvNode.inputs[Object.keys(sheepOnlyNpvNode.inputs)[1]]
  );

  subgraph.addConnection(totalGain.outputs.sample, benefitMath.inputs.a);
  subgraph.addConnection(sheepOnlyGain.outputs.sample, benefitMath.inputs.b);

  subgraph.addConnection(benefitMath.outputs.sample, benefitNpvNode.inputs[Object.keys(benefitNpvNode.inputs)[0]]);
  subgraph.addConnection(
    discountInput.outputs.placeholder,
    benefitNpvNode.inputs[Object.keys(benefitNpvNode.inputs)[1]]
  );

  subgraph.addConnection(bothNpvNode.outputs[Object.keys(bothNpvNode.outputs)[0]], bothNpvOutput.inputs.placeholder);
  subgraph.addConnection(
    sheepOnlyNpvNode.outputs[Object.keys(sheepOnlyNpvNode.outputs)[0]],
    sheepOnlyNpvOutput.inputs.placeholder
  );
  subgraph.addConnection(
    benefitNpvNode.outputs[Object.keys(benefitNpvNode.outputs)[0]],
    benefitNpvOutput.inputs.placeholder
  );

  const template = GraphTemplate.fromGraph(subgraph, editor);
  template.name = "Decision";

  return template;
};

export const getExampleSheepVsAppleModel = () => {
  const { editor, viewPlugin } = initializeBaklvaState();
  const displayedGraph = viewPlugin.displayedGraph;

  const noteNode = new NoteNode();
  displayedGraph.addNode(noteNode);
  noteNode.inputs.note.value =
    `This model investigates the decision of whether to add an apple agroforestry. ` +
    `It is based on the Seminar 9.1 of the lecture 'Decision Analysis and Forecasting for Agricultural Development' ` +
    `by Cory Whitney and Eike Luedeling, see:\n` +
    `https://agtools.app/decision_analysis/#section-voi_1`;
  noteNode.position = { x: 570, y: 100 };
  noteNode.width = 550;

  const npvTemplate = getNpvTemplate(editor);
  const NpvSubgraphType = createGraphNodeType(npvTemplate);
  editor.addGraphTemplate(npvTemplate);

  const decisionTemplate = getDecisionTemplate(editor, NpvSubgraphType);
  const DecisionSubgraphType = createGraphNodeType(decisionTemplate);
  editor.addGraphTemplate(decisionTemplate);

  const sheepIncome = addEstimateNode(
    displayedGraph,
    "Sheep Income",
    "Income from sheep (euro/year)",
    POSITIVE_NORMAL_DISTRIBUTION,
    { lower: 3000, upper: 5000 },
    { x: 300, y: 200 }
  );

  const appleIncome = addEstimateNode(
    displayedGraph,
    "Apple Income",
    "Income from apple (euro/year)",
    POSITIVE_NORMAL_DISTRIBUTION,
    { lower: 30000, upper: 60000 },
    { x: 300, y: 480 }
  );

  const sheepCosts = addEstimateNode(
    displayedGraph,
    "Sheep Costs",
    "Cost of sheep (euro/year)",
    POSITIVE_NORMAL_DISTRIBUTION,
    { lower: 1000, upper: 2500 },
    { x: 300, y: 770 }
  );

  const appleCosts = addEstimateNode(
    displayedGraph,
    "Apple Costs",
    "Cost of apple (euro/year)",
    POSITIVE_NORMAL_DISTRIBUTION,
    { lower: 15000, upper: 30000 },
    { x: 300, y: 1045 }
  );

  const discount = addEstimateNode(
    displayedGraph,
    "Discount",
    "Discount rate per year in %",
    DETERMINISTIC_DISTRIBUTION,
    { value: 10 },
    { x: 600, y: 1080 }
  );

  const decisionNode = new DecisionSubgraphType();
  displayedGraph.addNode(decisionNode);
  decisionNode.position = { x: 880, y: 500 };

  const bothResult = addResultNode(displayedGraph, "Both", { x: 1180, y: 220 });
  const sheepOnlyResult = addResultNode(displayedGraph, "Sheep Only", { x: 1530, y: 300 });
  const benefitResult = addResultNode(displayedGraph, "Decision Benefit", { x: 1180, y: 680 });
  benefitResult.width = 500;

  const inputKeys = Object.keys(decisionNode.inputs);
  const outputKeys = Object.keys(decisionNode.outputs);
  displayedGraph.addConnection(sheepIncome.outputs.sample, decisionNode.inputs[inputKeys[0]]);
  displayedGraph.addConnection(appleIncome.outputs.sample, decisionNode.inputs[inputKeys[1]]);
  displayedGraph.addConnection(sheepCosts.outputs.sample, decisionNode.inputs[inputKeys[2]]);
  displayedGraph.addConnection(appleCosts.outputs.sample, decisionNode.inputs[inputKeys[3]]);
  displayedGraph.addConnection(discount.outputs.value, decisionNode.inputs[inputKeys[4]]);
  displayedGraph.addConnection(decisionNode.outputs[outputKeys[0]], bothResult.inputs.sample);
  displayedGraph.addConnection(decisionNode.outputs[outputKeys[1]], sheepOnlyResult.inputs.sample);
  displayedGraph.addConnection(decisionNode.outputs[outputKeys[2]], benefitResult.inputs.sample);

  displayedGraph.scaling = 0.8;
  displayedGraph.panning = { x: 50, y: 0 };

  return editor.save();
};
