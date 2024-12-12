<script setup lang="ts">
  import JSZip from "jszip";
  import FileSaver from "file-saver";

  import Dashboard from "./WorkspaceCards.vue";
  import CodeDisplay from "./CodeDisplay.vue";
  import EstimatesTable from "./EstimatesTable.vue";

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
    zip.file("estimates.csv", modelStore.decisionSupportResult.estimates);
    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, "model.zip");
    });
  };
</script>

<template>
  <Dashboard>
    <CodeDisplay />
    <EstimatesTable />

    <v-sheet
      class="floating_btn_group float-left"
      color="white"
      elevation="4"
      rounded
      v-if="modelStore.decisionSupportResult !== null"
      @click="saveZip"
    >
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <v-btn class="ma-2" variant="text" color="secondary" v-bind="props">
            <v-icon> mdi-folder-download-outline </v-icon>
          </v-btn>
        </template>
        <span>Download ZIP</span>
      </v-tooltip>
    </v-sheet>
  </Dashboard>
</template>
