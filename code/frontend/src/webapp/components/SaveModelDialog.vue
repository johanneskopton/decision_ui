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

  defineExpose({
    openDialog() {
      nameDialog.value = true;
      modelName.value = modelStore.name;
    }
  });
</script>

<template>
  <v-dialog v-model="nameDialog" max-width="400px">
    <v-card class="nameCard">
      <v-card-item title="Save Model" subtitle="Choose a name for this model:" />
      <v-card-text>
        <v-text-field
          v-model="modelName"
          placeholder="a name describing the model"
          autofocus
          @keyup.enter="saveGraphUser()"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn color="dark" variant="text" @click="nameDialog = false"> Cancel </v-btn>
        <v-spacer />
        <v-btn color="primary" :disabled="!modelName" variant="text" @click="saveGraphUser()"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .nameCard {
    padding: 0.5em;

    .v-card-actions {
      padding: 0 1em;
    }
  }
</style>
