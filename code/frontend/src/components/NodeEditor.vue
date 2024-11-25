<script setup lang="ts">
  import { onMounted, useTemplateRef } from "vue";
  import { BaklavaEditor } from "@baklavajs/renderer-vue";
  import { saveAs } from "file-saver";

  import SaveButton from "./SaveButton.vue";

  import clean_model_json from "../helper/clean_model_json";
  import { useModelStore } from "../state/model";

  import "@baklavajs/themes/dist/syrup-dark.css";

  const modelStore = useModelStore();
  const loadfile = useTemplateRef<HTMLInputElement>("loadfile");

  const token = Symbol();
  modelStore.baklava.editor.nodeEvents.update.subscribe(token, (state, node) => {
    modelStore.unsaved = true;
  });

  const updateGraph = () => {
    if (modelStore.baklava.editor.graph.nodes.length > 0) {
      modelStore.baklava.editor.graph.nodes[0].events.update.emit(null);
    }
  };

  const saveGraph = () => {
    let model = modelStore.baklava.editor.save();
    model = clean_model_json(model);
    const blob = new Blob([JSON.stringify(model, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    saveAs(blob, "graph.json");
  };

  const loadGraph = () => {
    if (loadfile.value && loadfile.value.files) {
      const file = loadfile.value.files[0];
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          modelStore.baklava.editor.load(JSON.parse(reader.result as string));
          updateGraph();
        },
        false
      );
      reader.readAsText(file);
    }
  };

  onMounted(() => {
    updateGraph();
  });
</script>

<template>
  <div class="node-editor-container">
    <!--<hint-overlay />-->
    <BaklavaEditor :view-model="modelStore.baklava.viewPlugin as any" />
    <v-sheet class="button-container" color="white" elevation="4" rounded>
      <v-btn-toggle multiple class="button-toggle">
        <v-tooltip location="top" text="Download">
          <template v-slot:activator="{ props }">
            <v-btn class="ma-2 dark" variant="text" color="secondary" @click="saveGraph" v-bind="props">
              <v-icon class="dark"> mdi-tray-arrow-down </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <input type="file" ref="loadfile" id="loadfile" style="display: none" @change="loadGraph" />
        <v-tooltip location="top" text="Upload">
          <template v-slot:activator="{ props }">
            <v-btn class="ma-2 dark" variant="text" color="secondary" @click="$refs.loadfile.click()" v-bind="props">
              <v-icon class="dark"> mdi-tray-arrow-up </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <SaveButton />
      </v-btn-toggle>
    </v-sheet>
  </div>
</template>

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
