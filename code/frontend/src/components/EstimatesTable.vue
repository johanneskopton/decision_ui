<script setup lang="ts">
  import { onMounted } from "vue";

  import { useModelStore, type EstimatesTableRow } from "../state/model";
  import csv_parser from "../helper/csv_parser";

  const { live = false } = defineProps<{ live?: boolean }>();

  const modelStore = useModelStore();

  const getEstimatesData = () => {
    if (live) {
      return modelStore.estimates;
    } else {
      if (modelStore.decisionSupportResult && modelStore.decisionSupportResult.estimates) {
        return csv_parser(modelStore.decisionSupportResult.estimates);
      } else {
        return [];
      }
    }
  };

  const estimatesData = getEstimatesData();

  const title = () => {
    return live ? "Estimate editor" : "Generated estimates";
  };

  onMounted(() => {
    const estimate_names: string[] = [];
    modelStore.baklava.editor.graph.nodes.forEach(node => {
      if (node.type == "Estimate") {
        estimate_names.push(node.title);
      }
    });
    modelStore.estimates = modelStore.estimates.filter(value => {
      return estimate_names.includes(value.variable);
    });
  });

  const onLowerChange = (newVal: string, oldVal: string, row: EstimatesTableRow) => {
    modelStore.baklava.editor.graph.nodes.forEach(node => {
      if (node.type == "Estimate" && node.title == row.variable) {
        const distribution = node.inputs.distribution.value;
        if (distribution == "constant") {
          node.inputs.value.value = Number(newVal);
        } else {
          node.inputs.lower.value = Number(newVal);
        }
      }
    });
  };

  const onUpperChange = (newVal: string, oldVal: string, row: EstimatesTableRow) => {
    modelStore.baklava.editor.graph.nodes.forEach(node => {
      if (node.type == "Estimate" && node.title == row.variable) {
        const distribution = node.inputs.distribution.value;
        if (distribution == "constant") {
          node.inputs.value.value = Number(newVal);
        } else {
          node.inputs.upper.value = Number(newVal);
        }
      }
    });
  };
</script>

<template>
  <v-card color="white" elevation="1" class="table-container" :class="[live ? 'fullwidth' : 'narrow']" rounded>
    <v-card-title>{{ title() }}</v-card-title>
    <vue-excel-editor v-if="estimatesData.length > 0" v-model="estimatesData">
      <vue-excel-column readonly field="label" label="label" width="150px" />
      <vue-excel-column readonly field="variable" label="variable" width="150px" />
      <vue-excel-column readonly field="distribution" label="distribution" />
      <vue-excel-column :readonly="!live" :change="onLowerChange" field="lower" label="lower" type="number" />
      <!--<vue-excel-column readonly field="median" label="median" />-->
      <vue-excel-column :readonly="!live" :change="onUpperChange" field="upper" label="upper" type="number" />
    </vue-excel-editor>
    <v-alert v-else type="info" elevation="2">
      <span v-if="live"> No estimates yet.. </span>
      <span v-else> No estimates from backend yet.. Run the model first! </span>
    </v-alert>
  </v-card>
</template>

<style lang="scss">
  @use "vuetify/lib/styles/main.sass" as v;
  .table-container.narrow {
    width: 45%;
  }
  .table-container.fullwidth {
    width: 100%;
  }
  .vue-excel-editor {
    margin: 16px;
  }
</style>
