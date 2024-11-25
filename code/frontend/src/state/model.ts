import { Editor, type IEngine } from "@baklavajs/core";
import { useBaklava, type IBaklavaViewModel, type ICommand } from "@baklavajs/renderer-vue";
import { applyResult, DependencyEngine } from "@baklavajs/engine";
import { BaklavaInterfaceTypes } from "@baklavajs/interface-types";
// import { OptionPlugin } from "@baklavajs/plugin-options-vue";

import {
  probabilisticType,
  probabilisticIntegerType,
  probabilisticSeriesType,
  deterministicType,
  deterministicIntegerType
} from "../editor/types";

import { ProbabilisticMathNode } from "../editor/nodes/MathNode";
import { EstimateNode } from "../editor/nodes/EstimateNode";
import { DebugNode } from "../editor/nodes/DebugNode";
import { HistogramNode } from "../editor/nodes/HistogramNode";
import { ResultNode } from "../editor/nodes/ResultNode";
import { defineStore } from "pinia";

interface GlobalCalculationData {
  mcRuns: number;
}

interface BaklavaState {
  viewPlugin: IBaklavaViewModel;
  editor: Editor;
  engine: IEngine<GlobalCalculationData>;
}

interface HistogramData {
  density: {
    Result: number[];
  };
  bins: number[];
}

export interface DecisionSupportResult {
  r_script: string;
  estimates: string;
  hist: HistogramData[];
  evpi: number[];
}

export interface EstimatesTableRow {
  label: string;
  variable: string;
  distribution: string;
  lower: number;
  upper: number;
}

interface ModelState {
  baklava: BaklavaState;
  decisionSupportResult: DecisionSupportResult | null;
  estimates: EstimatesTableRow[];
  unsaved: boolean;
  lastSaved: number;
  name: string;
}

const initializeModelState = (): ModelState => {
  const viewPlugin = useBaklava();
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

  // register nodes
  editor.registerNodeType(ProbabilisticMathNode, { category: "Probabilistic" });
  editor.registerNodeType(EstimateNode, { category: "Input / Output" });
  editor.registerNodeType(ResultNode, { category: "Input / Output" });
  editor.registerNodeType(DebugNode, { category: "Display" });
  editor.registerNodeType(HistogramNode, { category: "Display" });

  // add commands
  type RefreshCommand = ICommand<string, [id: string]>;
  viewPlugin.commandHandler.registerCommand<RefreshCommand>("RefreshCommand", {
    canExecute: () => true,
    execute: () => {
      if (viewPlugin.editor.graph.nodes.length > 0) {
        viewPlugin.editor.graph.nodes[0].events.update.emit(null);
      }
      return "";
    }
  });

  // initialize engine
  const engine = new DependencyEngine(editor);
  const token = Symbol();
  engine.events.afterRun.subscribe(token, result => {
    engine.pause();
    applyResult(result, editor);
    engine.resume();
  });

  engine.start();

  return {
    baklava: {
      editor,
      viewPlugin,
      engine
    },
    decisionSupportResult: null,
    estimates: [],
    unsaved: true,
    lastSaved: 0,
    name: ""
  };
};

export const useModelStore = defineStore("model", {
  state: (): ModelState => initializeModelState(),
  actions: {
    setDecisionSupportResult(newResult: DecisionSupportResult) {
      if (!this.decisionSupportResult) {
        this.decisionSupportResult = newResult;
      } else {
        this.decisionSupportResult = {
          ...this.decisionSupportResult,
          ...newResult
        };
      }
    }
  }
});
