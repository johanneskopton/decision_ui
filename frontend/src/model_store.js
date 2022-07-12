import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { Engine } from "@baklavajs/plugin-engine";

import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
import { OptionPlugin } from "@baklavajs/plugin-options-vue";
import HistogramOption from "./components/histogramOption.vue";
import colors from "vuetify/lib/util/colors";
import { MathNode } from "./nodes/MathNode";
import { SumNode } from "./nodes/SumNode";
import { DisplayNode } from "./nodes/DisplayNode";
import { UVNode } from "./nodes/UVNode";
import { ChanceEventNode } from "./nodes/ChanceEventNode";

export default {
  state() {
    return {
      editor: new Editor(),
      viewPlugin: new ViewPlugin(),
      engine: new Engine(true),
      isInitialized: false
    };
  },
  mutations: {
    updateEditor(state, editor) {
      state.editor = editor;
    },
    updateViewPlugin(state, view_plugin) {
      state.ViewPlugin = view_plugin;
    },
    updateEngine(state, engine) {
      state.engine = engine;
    },
    setInitialized(state) {
      state.isInitialized = true;
    }
  },
  actions: {
    initModel({ commit, state }) {
      var editor = state.editor;
      var viewPlugin = state.viewPlugin;
      var engine = state.engine;
      // Register the plugins
      // The view plugin is used for rendering the nodes
      editor.use(viewPlugin);
      // The option plugin provides some default option UI elements
      editor.use(new OptionPlugin());
      // The engine plugin calculates the nodes in the graph in the
      // correct order using the "calculate" methods of the nodes
      editor.use(engine);
      // The interface type plugin allows for custom interface types
      const intfTypePlugin = new InterfaceTypePlugin();
      editor.use(intfTypePlugin);
      // Define interface types
      intfTypePlugin.addType("probabilistic", colors.purple.accent1);
      intfTypePlugin.addType("deterministic", colors.shades.white);

      // Show a minimap in the top right corner
      viewPlugin.enableMinimap = false;

      // register the nodes we have defined, so they can be
      // added by the user as well as saved & loaded.
      editor.registerNodeType("Math", MathNode);
      editor.registerNodeType("Display", DisplayNode);
      editor.registerNodeType("UncertainInput", UVNode);
      editor.registerNodeType("Sum", SumNode);
      editor.registerNodeType("ChanceEvent", ChanceEventNode);

      // register custom options
      viewPlugin.registerOption("HistogramOption", HistogramOption);

      // add some nodes so the screen is not empty on startup
      /*
      const node1 = addNodeWithCoordinates(MathNode, 100, 140);
      const node2 = addNodeWithCoordinates(DisplayNode, 400, 140);
      editor.addConnection(
        node1.getInterface("Result"),
        node2.getInterface("Value")
      );
      */
      engine.calculate();

      commit("updateEditor", editor);
      commit("updateViewPlugin", viewPlugin);
      commit("updateEngine", engine);
      commit("setInitialized");
    }
  }
};
