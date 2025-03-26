<script setup lang="ts">
  import { computed } from "vue";

  import { useModelStore } from "../state/model";
  import { parseCSV } from "../helper/csv_parser";

  const modelStore = useModelStore();

  const estimatesData = computed(() => {
    if (modelStore.decisionSupportResult && modelStore.decisionSupportResult.estimates_csv) {
      return parseCSV(modelStore.decisionSupportResult.estimates_csv);
    } else {
      return [];
    }
  });
</script>

<template>
  <v-card color="white" elevation="1" class="estimatesTable" rounded>
    <v-card-item>
      <template #title> Generated estimates </template>
      <template #subtitle> Backend estimates that were used to run the monte carlo simulation: </template>
    </v-card-item>
    <v-card-text>
      <vue-excel-editor
        v-if="estimatesData.length > 0"
        v-model="estimatesData"
        no-paging
        no-header-edit
        no-sorting
        no-mass-update
        no-footer
      >
        <vue-excel-column readonly field="label" label="label" width="150px" sticky />
        <vue-excel-column readonly field="variable" label="variable" width="150px" />
        <vue-excel-column readonly field="distribution" label="distribution" />
        <vue-excel-column readonly field="lower" label="lower" type="number" />
        <vue-excel-column readonly field="upper" label="upper" type="number" />
      </vue-excel-editor>
      <v-alert v-else type="info" elevation="2"> No estimates from backend yet. Run the model first! </v-alert>
    </v-card-text>
  </v-card>
</template>

<style lang="scss">
  .estimatesTable {
    min-width: 0;
  }

  .vue-excel-editor {
    margin-top: 1em;
    display: block;
    min-width: 0;
  }
</style>
