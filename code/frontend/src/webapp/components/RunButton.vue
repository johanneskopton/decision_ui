<script setup lang="ts">
  import { ref } from "vue";
  import axios, { AxiosError, type AxiosResponse } from "axios";

  import clean_model_json from "../helper/clean_model_json";

  import { useModelStore, type DecisionSupportResult } from "../state/model";
  import { useUserStore } from "../state/user";

  import { BACKEND_BASE_URL, AUTHORIZATION_HEADER } from "../backend/common";

  const { getEvpi = false, evpiSet = false } = defineProps<{ getEvpi?: boolean; evpiSet?: boolean }>();

  const modelStore = useModelStore();
  const userStore = useUserStore();

  const loading_mc = ref<boolean>(false);
  const network_error = ref<boolean>(false);
  const network_success = ref<boolean>();
  const noPermissionDialog = ref<boolean>(false);

  const receiveResults = (response: AxiosResponse) => {
    loading_mc.value = false;
    console.log(`Run successfull with: ${JSON.stringify(response.data, null, 2)}`);
    if (response.status == 200) {
      network_success.value = true;
    }
    modelStore.setDecisionSupportResult(response.data as DecisionSupportResult);
  };

  const receiveResultsError = (response: AxiosError) => {
    loading_mc.value = false;
    console.error(`Run error with status code ${response.status}: ${JSON.stringify(response.response?.data, null, 2)}`);
    if (response.code === "ERR_NETWORK") {
      network_error.value = true;
    } else if (response.code === "ERR_BAD_REQUEST") {
      noPermissionDialog.value = true;
    }
  };

  const callBackend = () => {
    loading_mc.value = true;
    let model = modelStore.baklava.editor.save();
    model = clean_model_json(model);
    const route = getEvpi ? "/api/v1/evpi" : "/api/v1/monte_carlo";
    axios
      .post(BACKEND_BASE_URL + route, model, {
        headers: {
          [AUTHORIZATION_HEADER]: `Bearer ${userStore.login.token}`
        }
      })
      .then(response => receiveResults(response))
      .catch(response => receiveResultsError(response));
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
        :loading="loading_mc"
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
    <!--<v-icon>mdi-server-network-off</v-icon>-->
    No connection to server!
    <template #actions>
      <v-btn color="white" variant="text" @click="network_error = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-snackbar v-model="network_success" :timeout="2000" color="secondary">
    Model successfully executed!
    <template #actions>
      <v-btn color="white" variant="text" @click="network_success = false"> Close </v-btn>
    </template>
  </v-snackbar>

  <v-dialog v-model="noPermissionDialog" max-width="400">
    <v-card class="notAuthorizedCard">
      <v-card-title class="text-h5"> Not authorized </v-card-title>

      <v-card-text>
        In order to make backend calls (i. e. run the heavy calculations on our servers), you need to be logged in.
      </v-card-text>

      <v-card-actions>
        <v-btn color="grey" variant="text" @click="noPermissionDialog = false"> Cancel </v-btn>
        <v-btn color="primary" variant="text" to="/login" @click="noPermissionDialog = false"> Login </v-btn>
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
