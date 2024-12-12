import { defineStore } from "pinia";

import { initializeBaklvaState, type BaklavaState } from "../editor";
import type { GraphValidationError, NodeValidationError } from "@/editor/common/validation";
import type { Graph, Node } from "baklavajs";

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

interface NodeValidationErrors {
  node: Node<any, any>;
  errors: NodeValidationError[];
}

interface GraphValidationErrors {
  graph: Graph;
  errors: GraphValidationError[];
}

interface ValidationState {
  nodes: { [nodeId: string]: NodeValidationErrors };
  graphs: { [graphId: string]: GraphValidationErrors };
}

interface ModelState {
  baklava: BaklavaState;
  validation: ValidationState;
  settings: Settings;
  decisionSupportResult: DecisionSupportResult | null;
  estimates: EstimatesTableRow[];
  unsaved: boolean;
  lastSaved: number;
  name: string;
}

const initializeModelState = (): ModelState => {
  return {
    baklava: initializeBaklvaState(),
    validation: {
      nodes: {},
      graphs: {}
    },
    settings: {
      mcRuns: 1000
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
    },
    resetNodeValidationErrors() {
      this.validation.nodes = {};
    },
    resetGraphValidationErrors() {
      this.validation.graphs = {};
    },
    addGraphValidationError(graph: Graph, error: GraphValidationError) {
      if (!(graph.id in this.validation.graphs)) {
        this.validation.graphs[graph.id] = { graph, errors: [] };
      }
      this.validation.graphs[graph.id].errors.push(error);
    },
    addNodeValidationError(node: Node<any, any>, error: NodeValidationError) {
      if (!(node.id in this.validation.nodes)) {
        this.validation.nodes[node.id] = { node, errors: [] };
      }
      this.validation.nodes[node.id].errors.push(error);
    }
  },
  getters: {
    validationErrorCount(state) {
      return (
        Object.values(state.validation.graphs).reduce((s, g) => s + g.errors.filter(e => e.type == "error").length, 0) +
        Object.values(state.validation.nodes).reduce((s, n) => s + n.errors.filter(e => e.type == "error").length, 0)
      );
    },
    validationInfoCount(state) {
      return (
        Object.values(state.validation.graphs).reduce((s, g) => s + g.errors.filter(e => e.type == "info").length, 0) +
        Object.values(state.validation.nodes).reduce((s, n) => s + n.errors.filter(e => e.type == "info").length, 0)
      );
    }
  }
});
