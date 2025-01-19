<script setup lang="ts">
  import { ref, useTemplateRef } from "vue";

  import ExecutionErrorDialog from "./ExecutionErrorDialog.vue";

  import clean_model_json from "../helper/clean_model_json";

  import { useModelStore, type DecisionSupportResult, type EVPIResult } from "../state/model";
  import { useUserStore } from "../state/user";

  import { doRunModel, type ExecutionError } from "../backend/models";

  const { getEvpi = false } = defineProps<{ getEvpi?: boolean }>();

  const modelStore = useModelStore();
  const userStore = useUserStore();

  const loading = ref<boolean>(false);
  const show_unknown_error = ref<boolean>(false);
  const executionErrorDialog = useTemplateRef<typeof ExecutionErrorDialog>("executionErrorDialog");
  const success = ref<boolean>();
  const show_unauthorized = ref<boolean>(false);

  const callBackend = async () => {
    if (!userStore.isLoggedIn) {
      show_unauthorized.value = true;
      return;
    }

    loading.value = true;
    const model = clean_model_json(modelStore.baklava.editor.save());

    await doRunModel({
      token: userStore.login.token,
      model,
      mcRuns: getEvpi ? modelStore.settings.backend.evpiMcRuns : modelStore.settings.backend.mcRuns,
      bins: modelStore.settings.backend.bins,
      timeout: modelStore.settings.backend.timeout,
      getEvpi,
      onSuccess: result => {
        loading.value = false;
        success.value = true;
        if (getEvpi) {
          modelStore.evpiResult = result as EVPIResult;
        } else {
          modelStore.decisionSupportResult = result as DecisionSupportResult;
        }
      },
      onUnknownError: () => {
        loading.value = false;
        show_unknown_error.value = true;
      },
      onExecutionError: (error: ExecutionError) => {
        loading.value = false;
        executionErrorDialog.value?.showDialog(error);
      }
    });
  };
</script>

<template>
  <v-tooltip location="top" open-delay="500" :disabled="getEvpi">
    <template #activator="{ props }">
      <v-btn
        class="runButton ma-2 hoverable"
        size="large"
        :color="modelStore.isValidationSuccess ? 'primary' : 'error'"
        v-bind="props"
        :loading="loading"
        @click="callBackend"
      >
        <span v-if="getEvpi" class="button_text"> Calculate EVPI&nbsp;</span>
        <v-icon v-if="!getEvpi" class="onhover"> mdi-rocket-launch-outline </v-icon>
        <v-icon v-if="!getEvpi" class="onnohover"> mdi-rocket-outline </v-icon>
        <div v-else>
          <v-icon v-if="!modelStore.evpiResult"> mdi-table-question </v-icon>
          <v-icon v-else> mdi-table-refresh </v-icon>
        </div>
      </v-btn>
    </template>
    <span>Run Model</span>
  </v-tooltip>

  <v-snackbar v-model="success" :timeout="2000" color="secondary">
    Model successfully executed!
    <template #actions>
      <v-btn color="white" variant="text" @click="success = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-snackbar v-model="show_unknown_error" :timeout="2000" color="error">
    Unknown server error!
    <template #actions>
      <v-btn color="white" variant="text" @click="show_unknown_error = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-dialog v-model="show_unauthorized" max-width="400">
    <v-card class="notAuthorizedCard">
      <v-card-title class="text-h5"> Not authorized </v-card-title>

      <v-card-text>
        In order to make backend calls (i. e. run the heavy calculations on our servers), you need to be logged in.
      </v-card-text>

      <v-card-actions>
        <v-btn color="grey" variant="text" @click="show_unauthorized = false"> Cancel </v-btn>
        <v-btn color="primary" variant="text" to="/login" @click="show_unauthorized = false"> Login </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ExecutionErrorDialog ref="executionErrorDialog" />
</template>

<style scoped lang="scss">
  .runButton {
    height: auto;
    padding: 0.857em;

    &.hoverable .onhover,
    &.hoverable:hover .onnohover {
      display: none;
    }

    &.hoverable .onnohover,
    &.hoverable:hover .onhover {
      display: inherit;
    }
  }

  .notAuthorizedCard {
    padding: 0.5em;
  }
</style>
