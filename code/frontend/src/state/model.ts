import { defineStore } from "pinia";

import { initializeBaklvaState, type BaklavaState } from "../editor";

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
  return {
    baklava: initializeBaklvaState(),
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
    }
  }
});
