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
  </div>
</template>

<script>
  //import HintOverlay from "./HintOverlay.vue";
  import { saveAs } from "file-saver";
  import axios from "axios";

  export default {
    //components: { HintOverlay },
    data() {
      return {};
    },
    created() {
      if (!this.$store.state.model.isInitialized) {
        this.$store.dispatch("initModel");
      }
      this.$store.state.model.engine.calculate();
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
