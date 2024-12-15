<script setup lang="ts">
  import type { ExecutionError } from "../backend/models";
  import { ref } from "vue";

  const show_dialog = ref<boolean>(false);
  const execution_error = ref<ExecutionError | null>(null);

  defineExpose({
    showDialog: (error: ExecutionError) => {
      execution_error.value = error;
      show_dialog.value = true;
    }
  });
</script>

<template>
  <v-dialog v-model="show_dialog" class="executionErrorDialog">
    <v-card max-width="50em">
      <v-card-title class="text-h5"> Model Execution Error </v-card-title>
      <v-card-text>
        <v-list lines="two">
          <v-list-item title="Reason" :subtitle="execution_error?.reason" />
          <v-list-item title="Estimates">
            <template #subtitle>
              <highlightjs language="txt" :code="execution_error?.estimates || ''" />
            </template>
          </v-list-item>
          <v-list-item title="R-Script">
            <template #subtitle>
              <highlightjs language="r" :code="execution_error?.r_script || ''" />
            </template>
          </v-list-item>
          <v-list-item title="R Error Output">
            <template #subtitle>
              <highlightjs language="txt" :code="execution_error?.stderr || ''" />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="text" @click="show_dialog = false"> Got It </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .executionErrorDialog {
    .v-card {
      padding: 1.5em 1em 1em 1em;
      margin: 0 auto;
    }

    .v-card-text {
      overflow: auto;
    }

    pre {
      max-height: 12em;
      overflow-y: scroll;
      border: 1px solid #ddd;
      background: #eee;
      min-height: 2em;
    }
  }

  .executionErrorDialog ::v-deep(code.hljs) {
    background: #eee !important;
  }
</style>
