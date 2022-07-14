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
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ma-2 hoverable"
          fab
          dark
          large
          bottom
          right
          color="primary"
          @click="callBackend"
          v-bind="attrs"
          v-on="on"
          :loading="loading_mc"
        >
          <v-icon dark class="onhover">
            mdi-rocket-launch-outline
          </v-icon>
          <v-icon dark class="onnohover">
            mdi-rocket-outline
          </v-icon>
        </v-btn>
      </template>
      <span>Run</span>
    </v-tooltip>
    <v-snackbar v-model="network_error_msg" :timeout="2000" color="error">
      <!--<v-icon>mdi-server-network-off</v-icon>-->
      No connection to server!
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="network_error_msg = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="network_success_msg" :timeout="2000" color="secondary">
      <!--<v-icon>mdi-chart-histogram</v-icon>-->
      decisionSupport successfully executed!
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="network_error_msg = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
  //import HintOverlay from "./HintOverlay.vue";
  import { saveAs } from "file-saver";
  import axios from "axios";

  import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
  import { OptionPlugin } from "@baklavajs/plugin-options-vue";
  import HistogramOption from "./HistogramOption.vue";
  import colors from "vuetify/lib/util/colors";
  import { MathNode } from "../nodes/MathNode";
  import { SumNode } from "../nodes/SumNode";
  import { DisplayNode } from "../nodes/DisplayNode";
  import { UVNode } from "../nodes/UVNode";
  import { ChanceEventNode } from "../nodes/ChanceEventNode";

  export default {
    //components: { HintOverlay },
    data() {
      return {
        loading_mc: false,
        network_error_msg: false,
        network_success_msg: false
      };
    },
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
        intfTypePlugin.addType("deterministic", colors.shades.white);

        // Show a minimap in the top right corner
        this.$store.state.model.viewPlugin.enableMinimap = false;

        // register the nodes we have defined, so they can be
        // added by the user as well as saved & loaded.
        this.$store.state.model.editor.registerNodeType("Math", MathNode);
        this.$store.state.model.editor.registerNodeType("Display", DisplayNode);
        this.$store.state.model.editor.registerNodeType(
          "UncertainInput",
          UVNode
        );
        this.$store.state.model.editor.registerNodeType("Sum", SumNode);
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
        const node2 = this.addNodeWithCoordinates(DisplayNode, 400, 140);
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
      },
      callBackend() {
        var model = this.$store.state.model.editor.save();
        this.loading_mc = true;
        axios
          .post("http://localhost:8000/api/v1/decision_support", model)
          .then(response => this.receiveResults(response))
          .catch(response => this.receiveResultsError(response));
      },
      receiveResults(response) {
        this.loading_mc = false;
        console.log(response);
        if (response.status == 200) {
          this.network_success_msg = true;
        }
        this.$store.commit("setDecisionSupportResult", response.data);
      },
      receiveResultsError(response) {
        this.loading_mc = false;
        console.log(response);
        if (response.code == "ERR_NETWORK") {
          this.network_error_msg = true;
        }
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

  button.v-btn--right {
    position: absolute;
    bottom: 8px;
    z-index: 5;
    right: 8px;
  }

  button.hoverable .onhover,
  button.hoverable:hover .onnohover {
    display: none;
  }

  button.hoverable .onnohover,
  button.hoverable:hover .onhover {
    display: inherit;
  }
</style>
