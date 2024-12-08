import { Editor } from "@baklavajs/core";
import { useBaklava, type IBaklavaViewModel } from "@baklavajs/renderer-vue";
import { applyResult, DependencyEngine } from "@baklavajs/engine";
import { BaklavaInterfaceTypes } from "@baklavajs/interface-types";

import {
  probabilisticType,
  probabilisticIntegerType,
  probabilisticSeriesType,
  deterministicType,
  deterministicIntegerType
} from "./common/types";

import { MathNode } from "./nodes/MathNode";
import { RoundNode } from "./nodes/RoundNode";
import { SumNode } from "./nodes/SumNode";
import { EstimateNode } from "./nodes/EstimateNode";
import { DebugNode } from "./nodes/DebugNode";
import { HistogramNode } from "./nodes/HistogramNode";
import { ResultNode } from "./nodes/ResultNode";
import { NoteNode } from "./nodes/NoteNode";
import { ToSeriesNode } from "./nodes/ToSeriesNode";
import { NPVNode } from "./nodes/NetPresentValueNode";
import { ValueVarierNode } from "./nodes/ValueVarierNode";
import { ComparisonNode } from "./nodes/ComparisonNode";

import { useModelStore } from "../state/model";
import { TypeConstraintNode } from "./nodes/TypeConstraintNode";

export interface GlobalCalculationData {
  mcRuns: number;
}

export interface BaklavaState {
  viewPlugin: IBaklavaViewModel;
  editor: Editor;
  engine: DependencyEngine<GlobalCalculationData>;
  eventToken: symbol;
}

export const initializeBaklvaState = (): BaklavaState => {
  const viewPlugin = useBaklava();
  viewPlugin.settings.nodes.resizable = true;
  viewPlugin.settings.nodes.maxWidth = 800;
  const editor = viewPlugin.editor;
  const types = new BaklavaInterfaceTypes(editor, { viewPlugin });

  // register interface types
  types.addTypes(
    probabilisticType,
    probabilisticIntegerType,
    probabilisticSeriesType,
    deterministicType,
    deterministicIntegerType
  );

  const generalCategory = { category: "Input & Output" };
  const operationsCategory = { category: "Operations" };
  const displayCategory = { category: "Display" };
  const seriesCategory = { category: "Series" };

  // register general nodes
  editor.registerNodeType(EstimateNode, generalCategory);
  editor.registerNodeType(ResultNode, generalCategory);

  // register operation nodes
  editor.registerNodeType(MathNode, operationsCategory);
  editor.registerNodeType(RoundNode, operationsCategory);
  editor.registerNodeType(SumNode, operationsCategory);
  editor.registerNodeType(ComparisonNode, operationsCategory);

  // register display nodes
  editor.registerNodeType(DebugNode, displayCategory);
  editor.registerNodeType(HistogramNode, displayCategory);
  editor.registerNodeType(NoteNode, displayCategory);

  // register series nodes
  editor.registerNodeType(ToSeriesNode, seriesCategory);
  editor.registerNodeType(NPVNode, seriesCategory);
  editor.registerNodeType(ValueVarierNode, seriesCategory);

  // register subgraph nodes
  editor.registerNodeType(TypeConstraintNode, operationsCategory);

  // auto modify node titles to make them unique
  const eventToken = Symbol();
  editor.graph.events.beforeAddNode.subscribe(eventToken, (node, _, graph) => {
    const isTitleUnique = (title: string) => {
      return !graph.nodes.find(n => n.title == title);
    };
    if (!isTitleUnique(node.title)) {
      let i = 2;
      while (!isTitleUnique(node.title + " " + i)) i++;
      node.title = node.title + " " + i;
    }
  });

  // initialize engine
  const engine = new DependencyEngine<{ mcRuns: number }>(editor);

  engine.events.afterRun.subscribe(eventToken, result => {
    engine.pause();
    applyResult(result, editor);
    engine.resume();
  });

  engine.hooks.gatherCalculationData.subscribe(eventToken, () => {
    const modelStore = useModelStore();
    return { mcRuns: modelStore.settings.mcRuns };
  });

  return {
    editor,
    viewPlugin,
    engine,
    eventToken
  };
};
