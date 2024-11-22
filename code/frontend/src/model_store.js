import { Editor } from "@baklavajs/core";
import { useBaklava } from "@baklavajs/renderer-vue";
import { DependencyEngine } from "@baklavajs/engine";
import { BaklavaInterfaceTypes } from "@baklavajs/interface-types";
// import { OptionPlugin } from "@baklavajs/plugin-options-vue";

import {
  probabilisticType,
  probabilisticIntegerType,
  probabilisticSeriesType,
  deterministicType,
  deterministicIntegerType
} from "./editor/types";

import TestNode from "./editor/nodes/TestNode";

import colors from "vuetify/util/colors";

import HistogramOption from "./components/HistogramOption.vue";
import SeriesDiagramOption from "./components/SeriesDiagramOption.vue";
import { MathNode } from "./editor/nodes/MathNode";
import { SeriesMathNode } from "./editor/nodes/SeriesMathNode";
import { SumNode } from "./editor/nodes/SumNode";
import { DisplayNode } from "./editor/nodes/DisplayNode";
import { ResultNode } from "./editor/nodes/ResultNode";
import { EstimateNode } from "./editor/nodes/EstimateNode";
import { ChanceEventNode } from "./editor/nodes/ChanceEventNode";
import { SeriesChanceEventNode } from "./editor/nodes/SeriesChanceEventNode";
import { VVNode } from "./editor/nodes/VVNode";
import { NPVNode } from "./editor/nodes/NPVNode";
import { SeriesDisplayNode } from "./editor/nodes/SeriesDisplayNode";
import { ToSeriesNode } from "./editor/nodes/ToSeriesNode";
import { RoundNode } from "./editor/nodes/RoundNode";
import { DetRoundNode } from "./editor/nodes/DetRoundNode";
import { ComparisonNode } from "./editor/nodes/ComparisonNode";
import { SeriesComparisonNode } from "./editor/nodes/SeriesComparisonNode";

export default {
  state() {
    return {
      editor: undefined,
      viewPlugin: undefined,
      engine: undefined,
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
      context.state.editor.registerNodeType(TestNode);

      context.state.engine = new DependencyEngine(context.state.editor);
      context.state.viewPlugin = useBaklava(context.state.editor);
      // context.state.engine = new Engine();
      context.state.decisionSupportResult = false;
      context.state.estimates = [];
      context.state.lastSaved = undefined;
      context.state.name = undefined;

      // Register the plugins
      // The view plugin is used for rendering the nodes
      // context.state.editor.use(context.state.viewPlugin);
      // The option plugin provides some default option UI elements
      // context.state.editor.use(new OptionPlugin());
      // The engine plugin calculates the nodes in the graph in the
      // correct order using the "calculate" methods of the nodes
      // context.state.editor.use(context.state.engine);
      // The interface type plugin allows for custom interface types
      // const intfTypePlugin = new InterfaceTypePlugin();
      // context.state.editor.use(intfTypePlugin);
      // Define interface types

      const types = new BaklavaInterfaceTypes(context.state.editor, {
        viewPlugin: context.state.viewPlugin
      });
      types.addTypes(
        probabilisticType,
        probabilisticIntegerType,
        probabilisticSeriesType,
        deterministicType,
        deterministicIntegerType
      );

      // types.addConversion()
      // Define type conversions

      // Show a minimap in the top right corner
      context.state.viewPlugin.enableMinimap = false;
      // register the nodes we have defined, so they can be
      // added by the user as well as saved & loaded.
      /*context.state.editor.registerNodeType("Math", MathNode);
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
      */
    }
  }
};
