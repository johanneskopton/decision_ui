<script setup lang="ts">
  import { onMounted, onUnmounted, useTemplateRef } from "vue";
  import { BaklavaEditor } from "@baklavajs/renderer-vue";
  import { saveAs } from "file-saver";

  import SaveButton from "./SaveButton.vue";

  import clean_model_json from "../helper/clean_model_json";
  import { useModelStore } from "../state/model";

  import "@baklavajs/themes/dist/syrup-dark.css";

  const modelStore = useModelStore();
  const loadfile = useTemplateRef<HTMLInputElement>("loadfile");

  const token = Symbol();
  modelStore.baklava.editor.nodeEvents.update.subscribe(token, () => {
    modelStore.unsaved = true;
  });

  const updateGraphCalculation = () => {
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
          updateGraphCalculation();
        },
        false
      );
      reader.readAsText(file);
    }
  };

  onMounted(() => {
    updateGraphCalculation();
  });

  onMounted(() => {
    modelStore.baklava.engine.start();
  });

  onUnmounted(() => {
    modelStore.baklava.engine.stop();
  });
</script>

<template>
  <div class="editor">
    <!--<hint-overlay />-->
    <BaklavaEditor :view-model="modelStore.baklava.viewPlugin as any" />
    <v-sheet class="button-container" color="white" elevation="4" rounded>
      <v-btn-toggle multiple class="button-toggle">
        <v-tooltip location="top" text="Download">
          <template #activator="{ props }">
            <v-btn class="ma-2 dark" variant="text" color="secondary" v-bind="props" @click="saveGraph">
              <v-icon class="dark"> mdi-tray-arrow-down </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <input id="loadfile" ref="loadfile" type="file" style="display: none" @change="loadGraph" />
        <v-tooltip location="top" text="Upload">
          <template #activator="{ props }">
            <v-btn class="ma-2 dark" variant="text" color="secondary" v-bind="props" @click="$refs.loadfile.click()">
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
  .editor {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .editor .button-container {
    position: absolute;
    bottom: 1em;
    right: 10em;
  }
</style>

<style lang="scss">
  .baklava-node-palette h1 {
    font-size: 1.1em;
  }

  .baklava-node[data-node-type="Estimate"],
  .baklava-node[data-node-type="Result"] {
    .__title {
      background-color: #0d5874;
    }
  }

  .baklava-node[data-node-type="ToSeries"] {
    .__title {
      background-color: #76337f;
    }
  }

  .baklava-node[data-node-type^="__baklava_GraphNode"],
  .baklava-node[data-node-type^="__baklava_Subgraph"] {
    .__title {
      background-color: #0d7447;
    }
  }

  .baklava-node-interface[data-interface-type="probabilistic"],
  .baklava-node-interface[data-interface-type="probabilistic_int"] {
    .__port {
      background-color: rgb(36, 138, 163);
    }
  }

  .baklava-node-interface[data-interface-type="deterministic"],
  .baklava-node-interface[data-interface-type="deterministic_int"] {
    .__port {
      background-color: rgb(219, 180, 53);
    }
  }

  .baklava-node-interface[data-interface-type="deterministic_int"],
  .baklava-node-interface[data-interface-type="probabilistic_int"] {
    .__port {
      border-radius: 0%;
    }
  }

  .baklava-node-interface[data-interface-type="probabilistic_series"] {
    .__port {
      background-color: #b05fbb;
    }
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
