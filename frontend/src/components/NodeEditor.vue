<template>
  <div class="node-editor-container">
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
        <span>Download</span>
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
        <span>Upload</span>
      </v-tooltip>
      <SaveButton />
    </v-sheet>
  </div>
</template>

<script>
  //import HintOverlay from "./HintOverlay.vue";
  import { saveAs } from "file-saver";

  import SaveButton from "./SaveButton.vue";

  export default {
    //components: { HintOverlay },
    created() {
      this.$store.state.model.engine.calculate();
    },
    watch: {
      model() {
        this.$store.state.model.unsaved = true;
      }
    },
    computed: {
      model() {
        return this.$store.state.model.editor.save();
      }
    },
    methods: {
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
    },
    components: { SaveButton }
  };
</script>

<style lang="scss">
  @import "../style/baklava.scss";
  .node-editor-container {
    height: calc(100vh - 30px);
    width: 100vw;
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
