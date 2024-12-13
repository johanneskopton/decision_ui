<script setup lang="ts">
  import { useModelStore } from "../state/model";
  import RunButton from "./RunButton.vue";
  import { storeToRefs } from "pinia";
  import { computed } from "vue";

  const { decisionSupportResult } = storeToRefs(useModelStore());

  const evpi = computed(() => {
    if (!decisionSupportResult.value) return [];
    if (!decisionSupportResult.value.evpi) return [];
    return decisionSupportResult.value.evpi;
  });

  const result_vars = computed(() => {
    const evpi_line = evpi.value[0];
    const res: string[] = [];
    Object.keys(evpi_line).forEach(key => {
      if (key != "variable" && key != "$id") {
        res.push(key);
      }
    });
    return res;
  });
</script>

<template>
  <v-card color="white" elevation="1" class="card" rounded>
    <v-card-title>Expected Value Of Perfect Information (EVPI)</v-card-title>
    <vue-excel-editor v-if="evpi.length > 0" v-model="evpi" width="100%" class="table">
      <vue-excel-column readonly field="variable" label="variable" width="200px" />
      <vue-excel-column
        v-for="result_var in result_vars"
        :key="result_var"
        :field="result_var"
        :label="result_var"
        readonly
        width="150px"
        type="number"
      />
    </vue-excel-editor>
    <RunButton get-evpi :evpi-set="evpi.length > 0" />
  </v-card>
</template>

<style scoped lang="scss">
  .card {
    flex-basis: 30em;
  }

  .table {
    margin-top: 16px;
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 4em;
  }
</style>
