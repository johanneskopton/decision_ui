import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { Engine } from "@baklavajs/plugin-engine";

export default {
  state() {
    return {
      editor: new Editor(),
      viewPlugin: new ViewPlugin(),
      engine: new Engine(true),
      isInitialized: false,
      decisionSupportResult: false,
      estimates: []
    };
  },
  mutations: {
    setInitialized(state) {
      state.isInitialized = true;
    },
    setDecisionSupportResult(state, decisionSupportResult) {
      state.decisionSupportResult = decisionSupportResult;
    }
  }
};
