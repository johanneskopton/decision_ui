<script setup lang="ts">
  import { useModelStore } from "../state/model";
  import RunButton from "./RunButton.vue";
  import { storeToRefs } from "pinia";
  import { computed } from "vue";

  const modelStore = useModelStore();
  const { evpiResult } = storeToRefs(modelStore);

  const result_variables = computed((): string[] => {
    if (evpiResult.value == null) {
      return [];
    }
    const evpi = evpiResult.value.evpi;
    return Object.keys(evpi[Object.keys(evpi)[0]]);
  });

  const table_data = computed(() => {
    if (evpiResult.value == null) {
      return [];
    }
    const evpi = evpiResult.value.evpi;
    return Object.keys(evpi).map(k => {
      return { variable: k, ...evpi[k] };
    });
  });
</script>

<template>
  <v-card color="white" elevation="1" class="card" rounded>
    <v-card-title>Expected Value Of Perfect Information (EVPI)</v-card-title>
    <vue-excel-editor v-if="evpiResult" v-model="table_data" width="100%" class="table">
      <vue-excel-column readonly field="variable" label="variable" width="200px" />
      <vue-excel-column
        v-for="v in result_variables"
        :key="v"
        :field="v"
        :label="v"
        readonly
        width="150px"
        type="number"
      />
    </vue-excel-editor>
    <RunButton get-evpi />
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
