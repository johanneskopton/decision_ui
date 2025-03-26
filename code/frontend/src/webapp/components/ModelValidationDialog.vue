<script setup lang="ts">
  import { useModelStore } from "../state/model";
  import { ref } from "vue";

  const show_dialog = ref<boolean>(false);
  const modelStore = useModelStore();

  defineExpose({
    showDialog: () => {
      show_dialog.value = true;
    }
  });
</script>

<template>
  <v-dialog v-model="show_dialog" class="dialog">
    <v-card>
      <v-card-title class="text-h5"> Model Validation </v-card-title>
      <v-card-text class="cardText">
        <div class="intro">
          <span v-if="modelStore.validationErrorCount + modelStore.validationInfoCount == 0">
            Your model looks good!
          </span>
          <span v-else-if="modelStore.validationErrorCount + modelStore.validationInfoCount == 1">
            There is one potential problem with your model:
          </span>
          <span v-else>
            There are {{ modelStore.validationErrorCount + modelStore.validationInfoCount }} potential problems with
            your model:
          </span>
        </div>
        <v-list v-for="(item, graph_id) in modelStore.validation.graphs" :key="graph_id" lines="one" density="compact">
          <v-list-subheader>
            <span v-if="!item.graphName">Main Graph</span>
            <span v-else>Subgraph '{{ item.graphName }}'</span>
          </v-list-subheader>
          <template v-for="(error, idx) in item.errors" :key="idx">
            <v-list-item :class="error.type == 'error' ? 'error' : ''">
              <template #prepend>
                <v-icon v-if="error.type == 'error'" size="large" color="error">mdi-alert-circle-outline</v-icon>
                <v-icon v-if="error.type == 'info'" size="large">mdi-information-outline</v-icon>
              </template>
              <template #title>
                {{ error.message }}
              </template>
            </v-list-item>
          </template>
        </v-list>
        <v-list v-for="(item, node_id) in modelStore.validation.nodes" :key="node_id" lines="one" density="compact">
          <v-list-subheader>
            Node '{{ item.nodeTitle }}' of
            <span v-if="!item.graphName"> the Main Graph </span>
            <span v-else> Subgraph '{{ item.graphName }}' </span>
          </v-list-subheader>
          <template v-for="(error, idx) in item.errors" :key="idx">
            <v-list-item :class="error.type == 'error' ? 'error' : ''">
              <template #prepend>
                <v-icon v-if="error.type == 'error'" size="large" color="error">mdi-alert-circle-outline</v-icon>
                <v-icon v-if="error.type == 'info'" size="large">mdi-information-outline</v-icon>
              </template>

              <template #title>
                {{ error.message }}
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="text" @click="show_dialog = false"> Got It </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .dialog {
    .v-card {
      max-width: 50em;
      padding: 0.75em;
      margin: 0 auto;
      width: auto;
    }

    .v-card-title {
      margin-top: 0.25em;
      margin-left: 0.25em;
    }

    .intro {
      color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    }

    .v-list-item {
      padding-left: 0;
      grid-template-columns: 2.5em 1fr auto;

      & ::v-deep(.v-list-item-title) {
        color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
        white-space: normal !important;
      }

      &.error ::v-deep(.v-list-item-title) {
        color: rgba(var(--v-theme-error), var(--v-medium-emphasis-opacity));
      }
    }

    .v-list-subheader {
      padding-inline-start: 0 !important;
      font-size: 1em;
      margin: 0.5em 0;
      color: rgba(var(--v-theme-on-surface), 1);
    }

    .v-card-text {
      max-height: 40em;
      overflow: auto;
    }
  }
</style>
