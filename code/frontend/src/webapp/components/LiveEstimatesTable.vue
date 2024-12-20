<script setup lang="ts">
  import { computed, useTemplateRef } from "vue";
  import type { Node } from "baklavajs";
  import FileSaver from "file-saver";

  import { useModelStore, type EstimatesTableRow } from "../state/model";
  import { DETERMINISTIC_DISTRIBUTION } from "../editor/distributions";
  import {
    convertEstimatesToCSV,
    parseEstimatesFromCSV,
    UPDATEDABLE_ESTIMATE_FIELDS
  } from "../editor/common/estimates";

  const modelStore = useModelStore();
  const uploadEstimatesInput = useTemplateRef<HTMLInputElement>("uploadEstimatesInput");

  interface Row extends EstimatesTableRow {
    nodeId: string;
  }

  interface Field {
    name: string;
    type: string;
  }

  const estimatesData = computed(() => {
    return Object.keys(modelStore.estimates).map((nodeId: string) => {
      return { ...modelStore.estimates[nodeId], nodeId } as Row;
    });
  });

  const onDownload = () => {
    FileSaver.saveAs(new Blob([convertEstimatesToCSV(modelStore.estimates)], { type: "text/csv" }), "estimates.csv");
  };

  const onUploadEstimates = async () => {
    if (uploadEstimatesInput.value && uploadEstimatesInput.value.files) {
      const csv = await uploadEstimatesInput.value.files[0].text();
      const estimates = await parseEstimatesFromCSV(csv);
      for (const nodeId in estimates) {
        const node = modelStore.baklava.editor.graph.nodes.find(n => n.id == nodeId);
        if (node) {
          for (const field of UPDATEDABLE_ESTIMATE_FIELDS) {
            updateNodeField(node as Node<any, any>, field, `${estimates[nodeId][field]}`, estimates[nodeId]);
          }
        }
      }
    }
  };

  const updateNodeField = (node: Node<any, any>, field: string, value: string, row: EstimatesTableRow) => {
    if (field == "label") {
      node.title = value;
    } else if (field == "distribution") {
      node.inputs.distribution.value = value == "const" ? DETERMINISTIC_DISTRIBUTION : value;
    } else if (field == "lower" || field == "upper") {
      if (row.distribution == "const") {
        node.inputs.value.value = parseFloat(value);
      } else {
        node.inputs[field].value = parseFloat(value);
      }
    } else {
      node.inputs[field].value = value;
    }
  };

  const onFieldChange = (newVal: string, oldVal: string, row: Row, field: Field) => {
    modelStore.baklava.editor.graph.nodes.forEach(node => {
      if (node.id == row.nodeId) {
        updateNodeField(node as Node<any, any>, field.name, newVal, row);
      }
    });
  };
</script>

<template>
  <v-card color="white" elevation="1" class="estimatesTableCard" rounded>
    <v-card-item>
      <template #title> Estimate editor </template>
      <template #subtitle> All estimates of the model synchronized with the model editor: </template>
      <template #append>
        <v-btn-group density="compact">
          <v-tooltip location="bottom" text="download table as CSV" open-delay="500">
            <template #activator="{ props }">
              <v-btn v-show="estimatesData.length > 0" density="compact" v-bind="props" @click.prevent="onDownload">
                <template #prepend>
                  <v-icon> mdi-tray-arrow-down </v-icon>
                </template>
                download
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="bottom" text="upload CSV file" open-delay="500">
            <template #activator="{ props }">
              <v-btn
                v-show="estimatesData.length > 0"
                density="compact"
                v-bind="props"
                @click="uploadEstimatesInput?.click()"
              >
                <template #prepend>
                  <v-icon> mdi-tray-arrow-up </v-icon>
                </template>
                <input ref="uploadEstimatesInput" type="file" style="display: none" @change="onUploadEstimates" />
                upload
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="bottom" text="go to help section" open-delay="500">
            <template #activator="{ props }">
              <v-btn v-bind="props" to="/user/workspace/help/user-interface/estimate-editor/">
                <template #prepend>
                  <v-icon size="large"> mdi-help-circle-outline </v-icon>
                </template>
                Help
              </v-btn>
            </template>
          </v-tooltip>
        </v-btn-group>
      </template>
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
        class="estimatesTable"
      >
        <vue-excel-column :change="onFieldChange" mandatory field="label" label="Label" width="150px" sticky />
        <vue-excel-column readonly field="variable" label="Variable Name" width="150px" bg-color="#aaa" />
        <vue-excel-column
          :change="onFieldChange"
          field="distribution"
          label="Distribution"
          type="select"
          :options="['const', 'norm', 'posnorm', 'tnorm_0_1']"
        />
        <vue-excel-column :change="onFieldChange" field="lower" label="Lower" type="number" />
        <vue-excel-column :change="onFieldChange" field="upper" label="Upper" type="number" />
        <vue-excel-column :change="onFieldChange" field="comment" label="Comment" type="string" width="300px" />
        <vue-excel-column field="nodeId" invisible />
      </vue-excel-editor>
      <v-alert v-else type="info" elevation="2">
        No estimates yet. Please add an Estimate node in the graph editor.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
  .estimatesTable ::v-deep(td[cell-rc$="variable"]) {
    background: #f3f3f3;
    color: #999;
  }
</style>
