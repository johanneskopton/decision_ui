<script setup lang="ts">
  import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
  import { BaklavaEditor } from "@baklavajs/renderer-vue";
  import { saveAs } from "file-saver";

  import clean_model_json from "../helper/clean_model_json";
  import { getAlwaysNullRef } from "../common/components";
  import { useModelStore } from "../state/model";
  import { useUserStore } from "../state/user";

  import ModelValidationDialog from "./ModelValidationDialog.vue";
  import SaveModelDialog from "./SaveModelDialog.vue";

  import "@baklavajs/themes/dist/syrup-dark.css";

  const modelStore = useModelStore();
  const userStore = useUserStore();
  const loadfile = useTemplateRef<HTMLInputElement>("loadfile");
  const saveModelDialog = useTemplateRef<typeof SaveModelDialog>("saveModelDialog");
  const baklavaRenderKey = ref<number>(1);
  const modelValidationDialog = useTemplateRef<typeof ModelValidationDialog>("modelValidationDialog");
  const toggleNone = getAlwaysNullRef();

  const saveGraph = () => {
    let model = modelStore.baklava.editor.save();
    model = clean_model_json(model);
    const blob = new Blob([JSON.stringify(model, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    saveAs(blob, "graph.json");
  };

  const loadGraph = async () => {
    if (loadfile.value && loadfile.value.files) {
      const json = await loadfile.value.files[0].text();
      modelStore.baklava.engine.stop();

      // reset model store, otherwise bakalva will return error during loading (probably related to subgraphs)
      modelStore.reset();

      // load json file
      modelStore.baklava.editor.load(JSON.parse(json));

      // restart engine and do one calculation
      modelStore.baklava.engine.start();

      // force re-render of baklava editor (otherwise it looks broken)
      baklavaRenderKey.value = baklavaRenderKey.value + 1;
    }
  };

  onMounted(() => {
    modelStore.baklava.engine.start();
  });

  onUnmounted(() => {
    modelStore.baklava.engine.stop();
  });
</script>

<template>
  <div class="editor">
    <BaklavaEditor :key="baklavaRenderKey" :view-model="modelStore.baklava.viewPlugin as any" />
    <v-sheet class="button-container" color="white" elevation="4" rounded>
      <v-btn-toggle v-model="toggleNone" density="default" multiple class="button-toggle">
        <v-tooltip location="top" text="Go to Help" open-delay="500">
          <template #activator="{ props }">
            <v-btn
              class="ma-2 dark"
              variant="text"
              color="secondary"
              v-bind="props"
              to="/user/workspace/help/user-interface/model-editor"
            >
              <v-icon class="dark" size="large"> mdi-help-circle-outline </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip location="top" text="Download Model" open-delay="500">
          <template #activator="{ props }">
            <v-btn class="ma-2 dark" variant="text" color="secondary" v-bind="props" @click="saveGraph">
              <v-icon class="dark" size="large"> mdi-tray-arrow-down </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <input id="loadfile" ref="loadfile" type="file" style="display: none" @change="loadGraph" />
        <v-tooltip location="top" text="Upload Model" open-delay="500">
          <template #activator="{ props }">
            <v-btn class="ma-2 dark" variant="text" color="secondary" v-bind="props" @click="$refs.loadfile.click()">
              <v-icon class="dark" size="large"> mdi-tray-arrow-up </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip v-if="userStore.login.token" location="top" text="Save Model" open-delay="500">
          <template #activator="{ props }">
            <v-btn class="ma-2" variant="text" color="secondary" v-bind="props" @click="saveModelDialog?.openDialog()">
              <v-icon class="dark" size="large"> mdi-content-save-outline </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip location="top" open-delay="500">
          <template #default>
            <span v-if="modelStore.validationErrorCount > 0">Model has Errors</span>
            <span v-else-if="modelStore.validationInfoCount > 0">Model has Warnings</span>
            <span v-else>Model is Valid</span>
          </template>
          <template #activator="{ props }">
            <v-btn
              class="ma-2 dark"
              variant="text"
              color="secondary"
              v-bind="props"
              @click="modelValidationDialog?.showDialog()"
            >
              <v-badge
                v-if="modelStore.validationErrorCount > 0"
                color="error"
                :content="modelStore.validationErrorCount + modelStore.validationInfoCount"
              >
                <v-icon class="dark" size="x-large" color="error"> mdi-alert-circle-outline </v-icon>
              </v-badge>
              <v-badge
                v-else-if="modelStore.validationInfoCount > 0"
                color="info'"
                :content="modelStore.validationErrorCount + modelStore.validationInfoCount"
              >
                <v-icon class="dark" size="x-large"> mdi-information-outline </v-icon>
              </v-badge>
              <v-icon v-else class="dark" size="large"> mdi-check </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </v-btn-toggle>
    </v-sheet>
    <SaveModelDialog ref="saveModelDialog" />
    <ModelValidationDialog ref="modelValidationDialog" />
  </div>
</template>

<style scoped lang="scss">
  .editor {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .button-container {
    position: absolute;
    bottom: 1em;
    right: 10em;
  }

  .button-toggle ::v-deep(.v-btn) {
    margin: 0 !important;
  }
</style>

<style lang="scss">
  .baklava-node-palette h1 {
    font-size: 1.1em;
    margin-top: 1.5em;
    margin-bottom: 1em;
    font-weight: normal;
  }

  .baklava-node-palette section:first-child h1 {
    margin-top: -1em;
  }

  .baklava-node.--palette {
    margin: 0.5em 0;
  }

  .baklava-node.--palette .__title {
    padding: 0.35em 0.75em;
  }

  .baklava-editor:has(
      > .baklava-node-palette > section > div.baklava-node[data-node-type="__baklava_SubgraphInputNode"]
    ) {
    // editor inside a subgraph

    // hide palette nodes in subgraph mode
    .baklava-node.--palette[data-node-type="Histogram"],
    .baklava-node.--palette[data-node-type="Debug"],
    .baklava-node.--palette[data-node-type="Estimate"],
    .baklava-node.--palette[data-node-type="Result"] {
      display: none;
    }

    // hide input-output section in palette
    .baklava-node-palette > section:nth-of-type(2) {
      display: none;
    }

    // hide input-output section in context menu
    .baklava-context-menu div.submenu:nth-of-type(2) {
      display: none;
    }

    // hide input-output section in context menu
    .baklava-context-menu div.submenu:nth-of-type(1) .baklava-context-menu.--nested {
      & div.item:nth-of-type(1),
      & div.item:nth-of-type(2) {
        display: none;
      }
    }
  }

  .baklava-node[data-node-type="Estimate"],
  .baklava-node[data-node-type="Result"] {
    .__title {
      background-color: #0d5874;
    }
  }

  .baklava-node[data-node-type="ToSeries"],
  .baklava-node[data-node-type="NetPresentValue"],
  .baklava-node[data-node-type="ValueVarier"] {
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
