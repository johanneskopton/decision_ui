<script setup lang="ts">

import { BaklavaEditor } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";
</script>

<template>
  <div class="node-editor-container">
    <!--<hint-overlay />-->
    <BaklavaEditor :view-model="$store.state.model.viewPlugin" />
    <v-sheet
      class="button-container"
      color="white"
      elevation="4"
      rounded
    >
    <v-btn-toggle
      multiple
      class="button-toggle"
    >
      <v-tooltip location="top" text="Download">
        <template v-slot:activator="{ props }">
          <v-btn
            class="ma-2 dark"
            variant="text"
            color="secondary"
            @click="saveGraph"
            v-bind="props"
          >
            <v-icon class="dark">
              mdi-tray-arrow-down
            </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <input
        type="file"
        ref="loadfile"
        id="loadfile"
        style="display: none"
        @change="loadGraph"
      />
      <v-tooltip location="top" text="Upload">
        <template v-slot:activator="{ props }">
          <v-btn
            class="ma-2 dark"
            variant="text"
            color="secondary"
            @click="$refs.loadfile.click()"
            v-bind="props"
          >
            <v-icon class="dark">
              mdi-tray-arrow-up
            </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <SaveButton />
      </v-btn-toggle>
    </v-sheet>
  </div>
</template>

<script lang="ts">
  //import HintOverlay from "./HintOverlay.vue";
  import { saveAs } from "file-saver";

  import SaveButton from "./SaveButton.vue";
  import clean_model_json from "../helper/clean_model_json";

  export default {
    //components: { HintOverlay },
    created() {
      // this.$store.state.model.engine.calculate();
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
        let model = this.$store.state.model.editor.save();
        model = clean_model_json(model);
        const blob = new Blob([JSON.stringify(model, null, 2)], {
          type: "application/json;charset=utf-8"
        });
        saveAs(blob, "graph.json");
      },
      loadGraph() {
        const file = this.$el.querySelector("#loadfile").files[0];
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

<style scoped lang="scss">
  @use "../style/baklava.scss";
  
  .node-editor-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .button-container {
    position: absolute;
    bottom: 1em;
    right: 10em;
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
