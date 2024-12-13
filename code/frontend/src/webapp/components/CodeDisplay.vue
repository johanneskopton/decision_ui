<script setup lang="ts">
  import JSZip from "jszip";
  import FileSaver from "file-saver";

  import { useModelStore } from "../state/model";

  const modelStore = useModelStore();

  const saveZip = () => {
    if (modelStore.decisionSupportResult == null) {
      return;
    }

    const zip = new JSZip();
    let r_script = modelStore.decisionSupportResult.r_script;
    r_script = r_script.replace(/\"\/tmp\/decision_ui_estimate_[a-z0-9].*\.csv\"/, '"estimates.csv"');
    zip.file("script.R", r_script);
    zip.file("estimates.csv", modelStore.decisionSupportResult.estimates_csv);
    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, "model.zip");
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(modelStore.decisionSupportResult?.r_script || "");
  };
</script>

<template>
  <v-card color="white" elevation="1" class="codeCard" rounded>
    <v-card-item>
      <template #title>Generated R code</template>
      <template #subtitle>The R script that was used to run the monte carlo simulation:</template>
      <template #append>
        <v-btn-group v-if="modelStore.decisionSupportResult !== null">
          <v-tooltip location="bottom" open-delay="500">
            <template #activator="{ props }">
              <v-btn v-bind="props" @click.prevent="copyCode">
                <template #prepend>
                  <v-icon> mdi-content-copy </v-icon>
                </template>
                Copy
              </v-btn>
            </template>
            <span>Copy to Clipboard</span>
          </v-tooltip>
          <v-tooltip location="bottom" open-delay="500">
            <template #activator="{ props }">
              <v-btn v-bind="props" @click.prevent="saveZip">
                <template #prepend>
                  <v-icon> mdi-folder-download-outline </v-icon>
                </template>
                Download
              </v-btn>
            </template>
            <span>Download as ZIP</span>
          </v-tooltip>
        </v-btn-group>
      </template>
    </v-card-item>

    <highlightjs
      v-if="modelStore.decisionSupportResult !== null"
      language="r"
      :code="modelStore.decisionSupportResult.r_script"
      class="code"
    />
    <v-alert v-else type="info" elevation="2"> No R code to see.. Run the model first! </v-alert>
  </v-card>
</template>

<style scoped lang="scss">
  .codeCard {
    pre {
      margin: 1em;
      overflow-y: scroll;
      border: 1px solid #ddd;
      min-height: 2em;
      font-size: 11pt;
      font-family:
        Roboto Mono,
        monospace !important;
    }
  }
</style>
