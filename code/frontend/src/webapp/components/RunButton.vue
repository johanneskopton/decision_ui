<script setup lang="ts">
  import { ref } from "vue";

  import clean_model_json from "../helper/clean_model_json";

  import { useModelStore } from "../state/model";
  import { useUserStore } from "../state/user";

  import { doRunModel } from "../backend/models";

  const { getEvpi = false, evpiSet = false } = defineProps<{ getEvpi?: boolean; evpiSet?: boolean }>();

  const modelStore = useModelStore();
  const userStore = useUserStore();

  const loading = ref<boolean>(false);
  const network_error = ref<boolean>(false);
  const unknown_error = ref<boolean>(false);
  const execution_error = ref<boolean>(false);
  const execution_error_msg = ref<string>("");
  const success = ref<boolean>();
  const unauthorized = ref<boolean>(false);

  const callBackend = () => {
    if (!userStore.isLoggedIn) {
      unauthorized.value = true;
      return;
    }

    loading.value = true;
    const model = clean_model_json(modelStore.baklava.editor.save());

    doRunModel({
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
        network_error.value = true;
      },
      onUnknownError: () => {
        loading.value = false;
        unknown_error.value = true;
      },
      onExecutionError: msg => {
        loading.value = false;
        execution_error_msg.value = msg;
        execution_error.value = true;
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

  <v-snackbar v-model="network_error" :timeout="2000" color="error">
    No connection to server!
    <template #actions>
      <v-btn color="white" variant="text" @click="network_error = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-snackbar v-model="success" :timeout="2000" color="secondary">
    Model successfully executed!
    <template #actions>
      <v-btn color="white" variant="text" @click="success = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-snackbar v-model="execution_error" :timeout="2000" color="error">
    Error while executing model: <br />
    {{ execution_error_msg }}
    <template #actions>
      <v-btn color="white" variant="text" @click="execution_error = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-snackbar v-model="unknown_error" :timeout="2000" color="error">
    Unknown server error!
    <template #actions>
      <v-btn color="white" variant="text" @click="unknown_error = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-dialog v-model="unauthorized" max-width="400">
    <v-card class="notAuthorizedCard">
      <v-card-title class="text-h5"> Not authorized </v-card-title>

      <v-card-text>
        In order to make backend calls (i. e. run the heavy calculations on our servers), you need to be logged in.
      </v-card-text>

      <v-card-actions>
        <v-btn color="grey" variant="text" @click="unauthorized = false"> Cancel </v-btn>
        <v-btn color="primary" variant="text" to="/login" @click="unauthorized = false"> Login </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
