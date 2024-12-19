import { defineStore } from "pinia";
import type { Graph, Node } from "baklavajs";

import { initializeBaklvaState, type BaklavaState } from "../editor";
import type { ValidationFeedback } from "../editor/common/validate";

interface HistogramData {
  values: { [variable: string]: number[] };
  bins: number[];
}

export interface DecisionSupportResult {
  r_script: string;
  estimates_csv: string;
  histogram_data: HistogramData;
}

export interface EVPIResult {
  evpi: { [variable: string]: { [result: string]: number } };
}

export interface EstimatesTableRow {
  label: string;
  variable: string;
  distribution: string;
  lower: number;
  upper: number;
  comment: string;
}

interface Settings {
  frontend: {
    bins: number;
    mcRuns: number;
  };
  backend: {
    bins: number;
    mcRuns: number;
    evpiMcRuns: number;
  };
}

interface NodeValidationErrors {
  nodeTitle: string;
  graphName: string | null;
  errors: ValidationFeedback[];
}

interface GraphValidationErrors {
  graphName: string | null;
  errors: ValidationFeedback[];
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
  evpiResult: EVPIResult | null;
  estimates: { [nodeId: string]: EstimatesTableRow };
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
      frontend: {
        bins: 30,
        mcRuns: 1000
      },
      backend: {
        bins: 100,
        mcRuns: 50000,
        evpiMcRuns: 1000
      }
    },
    decisionSupportResult: null,
    evpiResult: null,
    estimates: {},
    unsaved: true,
    lastSaved: 0,
    name: ""
  };
};

export const useModelStore = defineStore("model", {
  state: (): ModelState => initializeModelState(),
  actions: {
    reset() {
      Object.assign(this, initializeModelState());
    },
    resetValidationErrors() {
      this.validation.nodes = {};
      this.validation.graphs = {};
    },
    addGraphValidationError(graph: Graph, error: ValidationFeedback) {
      if (!(graph.id in this.validation.graphs)) {
        this.validation.graphs[graph.id] = { graphName: graph.template?.name || null, errors: [] };
      }
      this.validation.graphs[graph.id].errors.push(error);
    },
    addNodeValidationError(node: Node<any, any>, error: ValidationFeedback) {
      if (!(node.id in this.validation.nodes)) {
        this.validation.nodes[node.id] = {
          nodeTitle: node.title,
          graphName: node.graph?.template?.name || null,
          errors: []
        };
      }
      this.validation.nodes[node.id].errors.push(error);
    }
  },
  getters: {
    validationErrorCount(state): number {
      return (
        Object.values(state.validation.graphs).reduce((s, g) => s + g.errors.filter(e => e.type == "error").length, 0) +
        Object.values(state.validation.nodes).reduce((s, n) => s + n.errors.filter(e => e.type == "error").length, 0)
      );
    },
    validationInfoCount(state): number {
      return (
        Object.values(state.validation.graphs).reduce((s, g) => s + g.errors.filter(e => e.type == "info").length, 0) +
        Object.values(state.validation.nodes).reduce((s, n) => s + n.errors.filter(e => e.type == "info").length, 0)
      );
    },
    isValidationSuccess(): boolean {
      return this.validationErrorCount == 0;
    }
  }
});
