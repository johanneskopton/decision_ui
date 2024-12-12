<script setup lang="ts">
  import { ref } from "vue";
  import axios, { AxiosError, type AxiosResponse } from "axios";

  import clean_model_json from "../helper/clean_model_json";

  import { useUserStore } from "../state/user";
  import { useModelStore } from "../state/model";

  import { getBackendBaseURL, AUTHORIZATION_HEADER } from "../backend/common";

  const nameDialog = ref<boolean>(false);
  const modelName = ref<string>("");

  const userStore = useUserStore();
  const modelStore = useModelStore();

  const receiveResults = (response: AxiosResponse) => {
    if (response.status === 200) {
      modelStore.lastSaved = Date.now();
      modelStore.unsaved = false;
      modelStore.name = modelName.value;
    }
  };
  const receiveResultsError = (response: AxiosError) => {
    console.error(response);
  };

  const saveGraphUser = async () => {
    if (!modelName.value) return;
    nameDialog.value = false;
    let model = modelStore.baklava.editor.save();
    model = clean_model_json(model);
    const bodyContent = {
      content: JSON.stringify(model),
      name: modelName.value,
      saved: Date.now()
    };
    axios
      .post((await getBackendBaseURL()) + "/api/v1/decision_model/", bodyContent, {
        headers: {
          [AUTHORIZATION_HEADER]: `Bearer ${userStore.login.token}`
        }
      })
      .then(response => receiveResults(response))
      .catch(response => receiveResultsError(response));
  };

  const openDialog = () => {
    modelName.value = modelStore.name;
  };
</script>

<template>
  <v-dialog v-if="userStore.login.token" v-model="nameDialog" scrollable max-width="300px">
    <template #activator="{ props }">
      <v-btn class="ma-2" variant="text" color="secondary" v-bind="props" @click="openDialog">
        <v-icon> mdi-content-save-outline </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Model name:</v-card-title>
      <v-divider />
      <v-card-text>
        <v-text-field v-model="modelName" autofocus @keyup.enter="saveGraphUser()" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="grey-darken-1" variant="text" @click="nameDialog = false"> Cancel </v-btn>
        <v-spacer />
        <v-btn color="primary-darken-1" variant="text" @click="saveGraphUser()"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
