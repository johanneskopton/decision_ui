<template>
  <div style="height: 100vh; width: 100vw">
    <!--<hint-overlay />-->
    <baklava-editor :plugin="viewPlugin" />
    <div class="floating_btn_group">
      <v-btn class="ma-2" fab dark color="secondary" @click="saveGraph">
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
        fab
        dark
        color="secondary"
        @click="$refs.loadfile.click()"
      >
        <v-icon dark>
          mdi-tray-arrow-up
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
  import colors from "vuetify/lib/util/colors";
  import { MathNode } from "./nodes/MathNode";
  import { SumNode } from "./nodes/SumNode";
  import { DisplayNode } from "./nodes/DisplayNode";
  import { UVNode } from "./nodes/UVNode";
  import { ChanceEventNode } from "./nodes/ChanceEventNode";
  import { saveAs } from "file-saver";

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
      this.editor.registerNodeType("Input", UVNode);
      this.editor.registerNodeType("Sum", SumNode);
      this.editor.registerNodeType("ChanceEvent", ChanceEventNode);

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
            // console.log(reader.result);
            res = this.editor.load(JSON.parse(reader.result));
            console.log(res);
          },
          false
        );
        reader.readAsText(file);
      }
    }
  };
</script>

<style lang="scss">
  @import "./style/baklava.scss";

  .floating_btn_group {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    z-index: 5;
  }
</style>
