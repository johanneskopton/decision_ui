import { Editor } from "@baklavajs/core";
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

import { MathNode } from "../editor/nodes/MathNode";
import { RoundNode } from "../editor/nodes/RoundNode";
import { SumNode } from "../editor/nodes/SumNode";
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
  engine: DependencyEngine<GlobalCalculationData>;
  eventToken: symbol;
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

interface Settings {
  mcRuns: number;
}

interface ModelState {
  baklava: BaklavaState;
  settings: Settings;
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

  const generalCategory = { category: "1. Input & Output" };
  const operationsCategory = { category: "2. Operations" };
  const displayCategory = { category: "3. Display" };

  // register general nodes
  editor.registerNodeType(EstimateNode, generalCategory);
  editor.registerNodeType(ResultNode, generalCategory);

  // register operation nodes
  editor.registerNodeType(MathNode, operationsCategory);
  editor.registerNodeType(RoundNode, operationsCategory);
  editor.registerNodeType(SumNode, operationsCategory);

  // register display nodes
  editor.registerNodeType(DebugNode, displayCategory);
  editor.registerNodeType(HistogramNode, displayCategory);

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
  const engine = new DependencyEngine<{ mcRuns: number }>(editor);

  const eventToken = Symbol();
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
    baklava: {
      editor,
      viewPlugin,
      engine,
      eventToken
    },
    settings: {
      mcRuns: 10000
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
    },
    reset() {
      Object.assign(this, initializeModelState());
    }
  }
});
