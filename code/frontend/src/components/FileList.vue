<script setup lang="ts">
  import axios, { type AxiosResponse } from "axios";
  import { onMounted, ref, useTemplateRef } from "vue";
  import { useRouter } from "vue-router";

  import Confirm from "./Confirm.vue";

  import { useModelStore } from "../state/model";
  import { useUserStore } from "../state/user";

  const userStore = useUserStore();
  const modelStore = useModelStore();
  const router = useRouter();

  const confirmDelete = useTemplateRef<typeof Confirm>("confirmDelete");

  interface ModelData {
    id: string;
    name: string;
    content: string;
    saved: string;
    owner_id: string;
  }

  const models = ref<ModelData[] | null>(null);

  const nodeCount = (content: string) => {
    return String(JSON.parse(content).graph.nodes.length) + " nodes";
  };

  const receiveResults = (response: AxiosResponse) => {
    models.value = response.data as ModelData[];
  };
  const receiveResultsError = (response: AxiosResponse) => {
    console.log(response);
  };

  const query_models = () => {
    axios
      .get(import.meta.env.VITE_BACKEND_BASE_URL + "/api/v1/decision_models/", {
        headers: {
          [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${userStore.login.token}`
        }
      })
      .then(response => receiveResults(response))
      .catch(response => receiveResultsError(response));
  };

  const open = (model: ModelData) => {
    modelStore.name = model.name;
    modelStore.unsaved = false;
    modelStore.baklava.editor.load(JSON.parse(model.content));
    router.push("/user/workspace");
  };

  const deleteModel = (model: ModelData) => {
    confirmDelete.value
      .open("Delete", "Are you sure you want to delete <code>" + model.name + "</code>?", { color: "warning" })
      .then((confirm: boolean) => {
        if (confirm) {
          axios
            .delete("/api/v1/decision_models/" + model.id, {
              headers: {
                [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${userStore.login.token}`
              }
            })
            .then(query_models)
            .catch(response => receiveResultsError(response));
        }
      });
  };

  onMounted(() => {
    query_models();
    modelStore.reset();
  });
</script>

<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-card class="filelist">
        <v-toolbar color="primary" dark>
          <v-toolbar-title>My files</v-toolbar-title>
        </v-toolbar>

        <v-list lines="two">
          <v-list-item
            v-for="model in models"
            :key="model.saved"
            :title="model.name"
            :subtitle="nodeCount(model.content)"
            @click="open(model)"
          >
            <template #prepend>
              <v-avatar>
                <v-icon class="grey-lighten-1"> mdi-file </v-icon>
              </v-avatar>
            </template>
            <template #append>
              <v-btn icon="mdi-trash-can-outline" size="small" @click.stop="deleteModel(model)"> </v-btn>
            </template>
          </v-list-item>
          <v-list-item v-if="models?.length == 0">
            No models yet! Click on the
            <v-icon> mdi-file-plus </v-icon>
            button below to create your first!
          </v-list-item>
        </v-list>
      </v-card>
    </v-row>
    <Confirm ref="confirmDelete" />
  </v-container>
</template>

<style>
  .v-card.filelist {
    width: 60%;
    min-width: 300px;
  }
</style>
