<script setup lang="ts">
  import { isMainGraph } from "@/editor/common/validation";
  import { useModelStore } from "@/state/model";
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
    <v-card max-width="70%">
      <v-card-title class="text-h5"> Model Validation </v-card-title>
      <v-card-text>
        <span v-if="modelStore.validationErrorCount + modelStore.validationInfoCount == 0">
          Your model looks good!
        </span>
        <v-list v-for="(item, graph_id) in modelStore.validation.graphs" :key="graph_id" lines="one" density="compact">
          <v-list-subheader>
            <span v-if="isMainGraph(item.graph)">Main Graph</span>
            <span v-else>Subgraph '{{ item.graph.template?.name }}''</span>
          </v-list-subheader>
          <template v-for="(error, idx) in item.errors" :key="idx">
            <v-list-item>
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
          <v-list-subheader>Node '{{ item.node.title }}'</v-list-subheader>
          <template v-for="(error, idx) in item.errors" :key="idx">
            <v-list-item>
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
      padding: 0.75em;
      margin: 0 auto;
      min-width: 30em;
    }

    .v-list-item {
      grid-template-columns: 2.5em 1fr auto;
    }
  }
</style>
