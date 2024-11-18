import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { Engine } from "@baklavajs/plugin-engine";
import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
import { OptionPlugin } from "@baklavajs/plugin-options-vue";

import colors from "vuetify/lib/util/colors";

import HistogramOption from "./components/HistogramOption.vue";
import SeriesDiagramOption from "./components/SeriesDiagramOption.vue";
import { MathNode } from "./nodes/MathNode";
import { SeriesMathNode } from "./nodes/SeriesMathNode";
import { SumNode } from "./nodes/SumNode";
import { DisplayNode } from "./nodes/DisplayNode";
import { ResultNode } from "./nodes/ResultNode";
import { EstimateNode } from "./nodes/EstimateNode";
import { ChanceEventNode } from "./nodes/ChanceEventNode";
import { SeriesChanceEventNode } from "./nodes/SeriesChanceEventNode";
import { VVNode } from "./nodes/VVNode";
import { NPVNode } from "./nodes/NPVNode";
import { SeriesDisplayNode } from "./nodes/SeriesDisplayNode";
import { ToSeriesNode } from "./nodes/ToSeriesNode";
import { RoundNode } from "./nodes/RoundNode";
import { DetRoundNode } from "./nodes/DetRoundNode";
import { ComparisonNode } from "./nodes/ComparisonNode";
import { SeriesComparisonNode } from "./nodes/SeriesComparisonNode";

export default {
  state() {
    return {
      editor: undefined,
      viewPlugin: undefined,
      engine: new Engine(true),
      isInitialized: false,
      decisionSupportResult: undefined,
      estimates: [],
      lastSaved: undefined,
      name: undefined,
      unsaved: false
    };
  },
  mutations: {
    setInitialized(state) {
      state.isInitialized = true;
    },
    setDecisionSupportResult(state, decisionSupportResult) {
      if (!state.decisionSupportResult) {
        state.decisionSupportResult = decisionSupportResult;
      } else {
        state.decisionSupportResult = {
          ...state.decisionSupportResult,
          ...decisionSupportResult
        };
      }
    }
  },
  actions: {
    initModel(context) {
      context.state.editor = new Editor();
      context.state.viewPlugin = new ViewPlugin();
      // context.state.engine = new Engine();
      context.state.decisionSupportResult = false;
      context.state.estimates = [];
      context.state.lastSaved = undefined;
      context.state.name = undefined;

      // Register the plugins
      // The view plugin is used for rendering the nodes
      context.state.editor.use(context.state.viewPlugin);
      // The option plugin provides some default option UI elements
      context.state.editor.use(new OptionPlugin());
      // The engine plugin calculates the nodes in the graph in the
      // correct order using the "calculate" methods of the nodes
      context.state.editor.use(context.state.engine);
      // The interface type plugin allows for custom interface types
      const intfTypePlugin = new InterfaceTypePlugin();
      context.state.editor.use(intfTypePlugin);
      // Define interface types
      intfTypePlugin.addType("probabilistic", colors.purple.accent1);
      intfTypePlugin.addType("probabilistic_int", colors.purple.lighten4);
      intfTypePlugin.addType("probabilistic_series", colors.teal.accent1);
      intfTypePlugin.addType("deterministic", colors.amber.accent1);
      intfTypePlugin.addType("deterministic_int", colors.amber.lighten5);
      // Define type conversions
      intfTypePlugin.addConversion("deterministic", "probabilistic", v => v);
      intfTypePlugin.addConversion(
        "deterministic_int",
        "probabilistic_int",
        v => v
      );
      intfTypePlugin.addConversion(
        "deterministic_int",
        "probabilistic",
        v => v
      );
      intfTypePlugin.addConversion(
        "deterministic_int",
        "deterministic",
        v => v
      );
      intfTypePlugin.addConversion(
        "probabilistic_int",
        "probabilistic",
        v => v
      );
      // Show a minimap in the top right corner
      context.state.viewPlugin.enableMinimap = false;
      // register the nodes we have defined, so they can be
      // added by the user as well as saved & loaded.
      context.state.editor.registerNodeType("Math", MathNode);
      context.state.editor.registerNodeType("Comparison", ComparisonNode);
      context.state.editor.registerNodeType("Round", RoundNode);
      context.state.editor.registerNodeType("RoundDeterministic", DetRoundNode);
      context.state.editor.registerNodeType("Display", DisplayNode);
      context.state.editor.registerNodeType("Result", ResultNode);
      context.state.editor.registerNodeType("Estimate", EstimateNode);
      context.state.editor.registerNodeType("Sum", SumNode);
      context.state.editor.registerNodeType("ChanceEvent", ChanceEventNode);
      context.state.editor.registerNodeType("ValueVarier", VVNode);
      context.state.editor.registerNodeType("ToSeries", ToSeriesNode);
      context.state.editor.registerNodeType("NPV", NPVNode);
      context.state.editor.registerNodeType("SeriesMath", SeriesMathNode);
      context.state.editor.registerNodeType(
        "SeriesComparison",
        SeriesComparisonNode
      );
      context.state.editor.registerNodeType(
        "SeriesChanceEvent",
        SeriesChanceEventNode
      );
      context.state.editor.registerNodeType("SeriesDisplay", SeriesDisplayNode);
      // register custom options
      context.state.viewPlugin.registerOption(
        "HistogramOption",
        HistogramOption
      );
      context.state.viewPlugin.registerOption(
        "SeriesDiagramOption",
        SeriesDiagramOption
      );

      let addNodeWithCoordinates = function(nodeType, x, y) {
        const n = new nodeType();
        context.state.editor.addNode(n);
        n.position.x = x;
        n.position.y = y;
        return n;
      };
      // add some nodes so the screen is not empty on startup
      const node1 = addNodeWithCoordinates(MathNode, 100, 140);
      const node2 = addNodeWithCoordinates(ResultNode, 400, 140);
      context.state.editor.addConnection(
        node1.getInterface("Result"),
        node2.getInterface("Value")
      );
      context.commit("setInitialized");
    }
  }
};
