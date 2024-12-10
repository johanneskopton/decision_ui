<script setup lang="ts">
  import { ref } from "vue";

  import ExecutionErrorDialog from "./ExecutionErrorDialog.vue";

  import clean_model_json from "../helper/clean_model_json";

  import { useModelStore } from "../state/model";
  import { useUserStore } from "../state/user";

  import { doRunModel, type ExecutionError } from "../backend/models";

  const { getEvpi = false, evpiSet = false } = defineProps<{ getEvpi?: boolean; evpiSet?: boolean }>();

  const modelStore = useModelStore();
  const userStore = useUserStore();

  const loading = ref<boolean>(false);
  const show_network_error = ref<boolean>(false);
  const show_unknown_error = ref<boolean>(false);
  const executionErrorDialog = ref<ExecutionErrorDialog>();
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
      getEvpi,
      onSuccess: result => {
        loading.value = false;
        success.value = true;
        modelStore.setDecisionSupportResult(result);
      },
      onNetworkError: () => {
        loading.value = false;
        show_network_error.value = true;
      },
      onUnknownError: () => {
        loading.value = false;
        show_unknown_error.value = true;
      },
      onExecutionError: (error: ExecutionError) => {
        loading.value = false;
        executionErrorDialog.value.showDialog(error);
      }
    });
  };
</script>

<template>
  <v-tooltip location="top">
    <template #activator="{ props }">
      <v-btn
        class="runButton ma-2 hoverable"
        size="large"
        color="primary"
        v-bind="props"
        :loading="loading"
        @click="callBackend"
      >
        <span v-if="getEvpi" class="button_text"> Calculate EVPI</span>
        <v-icon v-if="!getEvpi" class="onhover"> mdi-rocket-launch-outline </v-icon>
        <v-icon v-if="!getEvpi" class="onnohover"> mdi-rocket-outline </v-icon>
        <div v-else>
          <v-icon v-if="!evpiSet"> mdi-table-question </v-icon>
          <v-icon v-else> mdi-table-refresh </v-icon>
        </div>
      </v-btn>
    </template>
    <span>Run</span>
  </v-tooltip>

  <v-snackbar v-model="show_network_error" :timeout="2000" color="error">
    No connection to server!
    <template #actions>
      <v-btn color="white" variant="text" @click="show_network_error = false"> Close </v-btn>
    </template>
  </v-snackbar>

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
    position: absolute;
    bottom: 8px;
    z-index: 5;
    right: 8px;
  }

  .runButton.hoverable .onhover,
  .runButton.hoverable:hover .onnohover {
    display: none;
  }

  .runButton.hoverable .onnohover,
  .runButton.hoverable:hover .onhover {
    display: inherit;
  }

  .notAuthorizedCard {
    padding: 0.5em;
  }
</style>
