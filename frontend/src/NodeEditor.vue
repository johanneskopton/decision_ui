<template>
  <div style="height: 100vh; width: 100vw">
    <!--<hint-overlay />-->
    <baklava-editor :plugin="viewPlugin" />
    <div class="floating_btn_group left">
      <v-btn class="ma-2" text dark color="secondary" @click="saveGraph">
        <v-icon dark>
          mdi-tray-arrow-down
        </v-icon>
      </v-btn>
      <input
        type="file"
        ref="loadfile"
        id="loadfile"
        style="display: none"
        @change="loadGraph"
      />
      <v-btn
        class="ma-2"
        text
        dark
        color="secondary"
        @click="$refs.loadfile.click()"
      >
        <v-icon dark>
          mdi-tray-arrow-up
        </v-icon>
      </v-btn>
    </div>
    <div class="floating_btn_group right">
      <v-btn
        class="ma-2 hoverable"
        fab
        dark
        large
        color="primary"
        @click="callBackend"
      >
        <v-icon dark class="onhover">
          mdi-rocket-launch-outline
        </v-icon>
        <v-icon dark class="onnohover">
          mdi-rocket-outline
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
  //import HintOverlay from "./HintOverlay.vue";
  import { Editor } from "@baklavajs/core";
  import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
  import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
  import { OptionPlugin } from "@baklavajs/plugin-options-vue";
  import { Engine } from "@baklavajs/plugin-engine";
  import HistogramOption from "./components/histogramOption.vue";
  import colors from "vuetify/lib/util/colors";
  import { MathNode } from "./nodes/MathNode";
  import { SumNode } from "./nodes/SumNode";
  import { DisplayNode } from "./nodes/DisplayNode";
  import { UVNode } from "./nodes/UVNode";
  import { ChanceEventNode } from "./nodes/ChanceEventNode";
  import { saveAs } from "file-saver";
  import axios from "axios";

  export default {
    //components: { HintOverlay },
    data() {
      return {
        editor: new Editor(),
        viewPlugin: new ViewPlugin(),
        engine: new Engine(true)
      };
    },
    created() {
      // Register the plugins
      // The view plugin is used for rendering the nodes
      this.editor.use(this.viewPlugin);
      // The option plugin provides some default option UI elements
      this.editor.use(new OptionPlugin());
      // The engine plugin calculates the nodes in the graph in the
      // correct order using the "calculate" methods of the nodes
      this.editor.use(this.engine);
      // The interface type plugin allows for custom interface types
      const intfTypePlugin = new InterfaceTypePlugin();
      this.editor.use(intfTypePlugin);
      // Define interface types
      intfTypePlugin.addType("probabilistic", colors.purple.accent1);
      intfTypePlugin.addType("deterministic", colors.shades.white);

      // Show a minimap in the top right corner
      this.viewPlugin.enableMinimap = false;

      // register the nodes we have defined, so they can be
      // added by the user as well as saved & loaded.
      this.editor.registerNodeType("Math", MathNode);
      this.editor.registerNodeType("Display", DisplayNode);
      this.editor.registerNodeType("UncertainInput", UVNode);
      this.editor.registerNodeType("Sum", SumNode);
      this.editor.registerNodeType("ChanceEvent", ChanceEventNode);

      // register custom options
      this.viewPlugin.registerOption("HistogramOption", HistogramOption);

      // add some nodes so the screen is not empty on startup
      const node1 = this.addNodeWithCoordinates(MathNode, 100, 140);
      const node2 = this.addNodeWithCoordinates(DisplayNode, 400, 140);
      this.editor.addConnection(
        node1.getInterface("Result"),
        node2.getInterface("Value")
      );
      this.engine.calculate();
    },
    methods: {
      addNodeWithCoordinates(nodeType, x, y) {
        const n = new nodeType();
        this.editor.addNode(n);
        n.position.x = x;
        n.position.y = y;
        return n;
      },
      saveGraph() {
        var blob = new Blob([JSON.stringify(this.editor.save(), null, 2)], {
          type: "application/json;charset=utf-8"
        });
        saveAs(blob, "graph.json");
      },
      loadGraph() {
        var file = this.$el.querySelector("#loadfile").files[0];
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            this.editor.load(JSON.parse(reader.result));
          },
          false
        );
        reader.readAsText(file);
      },
      callBackend() {
        var model = this.editor.save();
        axios
          .post("http://localhost:8000/api/v1/decision_support", model)
          .then(function(response) {
            console.log(response);
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    }
  };
</script>

<style lang="scss">
  @import "./style/baklava.scss";

  .floating_btn_group {
    position: absolute;
    bottom: 1rem;
    z-index: 5;
  }

  .floating_btn_group.left {
    left: 1rem;
  }

  .floating_btn_group.right {
    right: 1rem;
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
