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
}

const models = ref<ModelData[] | null>(null);

const nodeCount = (content: string) => {
  return String(JSON.parse(content).nodes.length) + " nodes";
};

const receiveResults = (response: AxiosResponse) => {
  models.value = response.data as ModelData[];
};
const receiveResultsError = (response: AxiosResponse) => {
  console.log(response);
};

const query_models = () => {
  const token = userStore.access_token;
  axios.get(import.meta.env.VITE_BACKEND_BASE_URL + "/api/v1/decision_models/", {
    headers: {
      [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${token}`
    }
  })
    .then(response => receiveResults(response))
    .catch(response => receiveResultsError(response));
};

const open = (model: ModelData) => {
  modelStore.name = model.name;
  modelStore.baklava.editor.load(JSON.parse(model.content));
  router.push("/user/workspace");
};


const deleteModel = (model: ModelData) => {
  confirmDelete.value.open(
    "Delete",
    "Are you sure you want to delete <code>" + model.name + "</code>?",
    { color: "warning" }
  )
    .then((confirm: boolean) => {
      if (confirm) {
        const token = userStore.access_token;
        axios.delete(
          "/api/v1/decision_models/" +
          model.id,
          {
            headers: {
              [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${token}`
            }
          }
        )
          .then(query_models)
          .catch(response => receiveResultsError(response));
      }
    });
}

onMounted(() => {
  query_models();
})


</script>

<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-card class="filelist">
        <v-toolbar color="primary" dark>
          <!--
          <v-app-bar-nav-icon />
          -->

          <v-toolbar-title>My files</v-toolbar-title>
          <!--
          <v-spacer />

          <v-btn disabled icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>

          <v-btn disabled icon>
            <v-icon>mdi-view-module</v-icon>
          </v-btn> -->
        </v-toolbar>

        <v-list lines="two">
          <v-list-item v-for="model in models" :key="model.saved" link @click="open(model)">
            <v-avatar>
              <v-icon class="bg-grey-lighten-1 dark">
                mdi-file
              </v-icon>
            </v-avatar>


            <v-list-item-title v-text="model.name" />
            <v-list-item-subtitle v-text="nodeCount(model.content)" />

            <v-list-item-action>
              <v-btn icon @click.stop="deleteModel(model)">
                <v-icon color="grey-lighten-1">mdi-close-circle</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item v-if="models?.length == 0">
            No models yet! Click on the
            <v-icon>
              mdi-file-plus
            </v-icon>
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
