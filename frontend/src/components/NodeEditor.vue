<template>
  <div style="height: 100vh; width: 100vw">
    <!--<hint-overlay />-->
    <baklava-editor :plugin="$store.state.model.viewPlugin" />
    <v-sheet
      class="floating_btn_group left"
      color="white"
      elevation="4"
      rounded
    >
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="ma-2"
            text
            dark
            color="secondary"
            @click="saveGraph"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon dark>
              mdi-tray-arrow-down
            </v-icon>
          </v-btn>
        </template>
        <span>Save</span>
      </v-tooltip>
      <input
        type="file"
        ref="loadfile"
        id="loadfile"
        style="display: none"
        @change="loadGraph"
      />
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="ma-2"
            text
            dark
            color="secondary"
            @click="$refs.loadfile.click()"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon dark>
              mdi-tray-arrow-up
            </v-icon>
          </v-btn>
        </template>
        <span>Load</span>
      </v-tooltip>
    </v-sheet>
  </div>
</template>

<script>
  //import HintOverlay from "./HintOverlay.vue";
  import { saveAs } from "file-saver";

  import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
  import { OptionPlugin } from "@baklavajs/plugin-options-vue";
  import HistogramOption from "./HistogramOption.vue";
  import colors from "vuetify/lib/util/colors";
  import { MathNode } from "../nodes/MathNode";
  import { SumNode } from "../nodes/SumNode";
  import { DisplayNode } from "../nodes/DisplayNode";
  import { ResultNode } from "../nodes/ResultNode";
  import { EstimateNode } from "../nodes/EstimateNode";
  import { ChanceEventNode } from "../nodes/ChanceEventNode";
  import { VVNode } from "../nodes/VVNode";
  import { NPVNode } from "../nodes/NPVNode";

  export default {
    //components: { HintOverlay },
    created() {
      if (!this.$store.state.model.isInitialized) {
        // Register the plugins
        // The view plugin is used for rendering the nodes
        this.$store.state.model.editor.use(this.$store.state.model.viewPlugin);
        // The option plugin provides some default option UI elements
        this.$store.state.model.editor.use(new OptionPlugin());
        // The engine plugin calculates the nodes in the graph in the
        // correct order using the "calculate" methods of the nodes
        this.$store.state.model.editor.use(this.$store.state.model.engine);
        // The interface type plugin allows for custom interface types
        const intfTypePlugin = new InterfaceTypePlugin();
        this.$store.state.model.editor.use(intfTypePlugin);
        // Define interface types
        intfTypePlugin.addType("probabilistic", colors.purple.accent1);
        intfTypePlugin.addType("probabilistic_series", colors.teal.accent1);
        intfTypePlugin.addType("deterministic", colors.shades.white);
        intfTypePlugin.addType("deterministic_int", colors.grey.lighten1);

        // Show a minimap in the top right corner
        this.$store.state.model.viewPlugin.enableMinimap = false;

        // register the nodes we have defined, so they can be
        // added by the user as well as saved & loaded.
        this.$store.state.model.editor.registerNodeType("Math", MathNode);
        this.$store.state.model.editor.registerNodeType("Display", DisplayNode);
        this.$store.state.model.editor.registerNodeType("Result", ResultNode);
        this.$store.state.model.editor.registerNodeType(
          "Estimate",
          EstimateNode
        );
        this.$store.state.model.editor.registerNodeType("Sum", SumNode);
        this.$store.state.model.editor.registerNodeType("VV", VVNode);
        this.$store.state.model.editor.registerNodeType("NPV", NPVNode);
        this.$store.state.model.editor.registerNodeType(
          "ChanceEvent",
          ChanceEventNode
        );

        // register custom options
        this.$store.state.model.viewPlugin.registerOption(
          "HistogramOption",
          HistogramOption
        );

        // add some nodes so the screen is not empty on startup

        const node1 = this.addNodeWithCoordinates(MathNode, 100, 140);
        const node2 = this.addNodeWithCoordinates(ResultNode, 400, 140);
        this.$store.state.model.editor.addConnection(
          node1.getInterface("Result"),
          node2.getInterface("Value")
        );

        this.$store.commit("setInitialized");
      }
      this.$store.state.model.engine.calculate();
    },
    methods: {
      addNodeWithCoordinates(nodeType, x, y) {
        const n = new nodeType();
        this.$store.state.model.editor.addNode(n);
        n.position.x = x;
        n.position.y = y;
        return n;
      },
      saveGraph() {
        var blob = new Blob(
          [JSON.stringify(this.$store.state.model.editor.save(), null, 2)],
          {
            type: "application/json;charset=utf-8"
          }
        );
        saveAs(blob, "graph.json");
      },
      loadGraph() {
        var file = this.$el.querySelector("#loadfile").files[0];
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            this.$store.state.model.editor.load(JSON.parse(reader.result));
          },
          false
        );
        reader.readAsText(file);
      }
    }
  };
</script>

<style lang="scss">
  @import "../style/baklava.scss";

  .floating_btn_group {
    position: absolute;
    bottom: 16px;
    z-index: 5;
  }

  .floating_btn_group.left {
    left: 16px;
  }

  .node.error {
    .__title {
      background-color: var(--v-error-darken2);
    }
    .node-interface .dark-num-input {
      background-color: var(--v-error-lighten1);
      .__content:hover,
      .__button:hover {
        background-color: var(--v-error-lighten2);
      }
    }
    .node-option {
      .__selected {
        background-color: var(--v-error-lighten1);
      }
    }
  }
</style>
