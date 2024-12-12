<script setup lang="ts">
  import { onMounted, ref, useTemplateRef } from "vue";
  import { useRouter } from "vue-router";

  import Confirm from "./ConfirmDialog.vue";

  import { useModelStore } from "../state/model";
  import { useUserStore } from "../state/user";
  import { doDeleteModel, doQueryModels, type ModelData } from "../backend/models";

  const userStore = useUserStore();
  const modelStore = useModelStore();
  const router = useRouter();

  const confirmDelete = useTemplateRef<typeof Confirm>("confirmDelete");

  const models = ref<ModelData[] | null>(null);

  const nodeCount = (content: string) => {
    return String(JSON.parse(content).graph.nodes.length) + " nodes";
  };

  const getModelLocalDate = (model: ModelData) => {
    return new Intl.DateTimeFormat("default", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(model.saved));
  };

  const queryModels = async () => {
    await doQueryModels({
      token: userStore.login.token,
      onSuccess: (m: ModelData[]) => {
        models.value = m;
      },
      onError: () => {
        // todo
      }
    });
  };

  const open = (model: ModelData) => {
    modelStore.name = model.name;
    modelStore.baklava.editor.load(JSON.parse(model.content));
    modelStore.unsaved = false;
    router.push("/user/workspace");
  };

  const deleteModel = (model: ModelData) => {
    confirmDelete.value
      ?.open("Delete Model", "Are you sure you want to delete model '" + model.name + "'?", { color: "warning" })
      .then(async (confirm: boolean) => {
        if (confirm) {
          await doDeleteModel({
            token: userStore.login.token,
            modelId: model.id,
            onSuccess: () => {
              queryModels();
            },
            onError: () => {
              // todo
            }
          });
        }
      });
  };

  onMounted(() => {
    queryModels();
    modelStore.reset();
  });
</script>

<template>
  <div class="container">
    <v-card class="card">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>My Models</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn to="/user/workspace" class="newModelButton">
          <template #prepend>
            <v-icon>mdi-file-plus</v-icon>
          </template>
          New Model
        </v-btn>
      </v-toolbar>

      <v-list class="list" lines="two">
        <v-list-item v-for="model in models" :key="model.saved" :title="model.name" @click="open(model)">
          <template #prepend>
            <v-avatar>
              <v-icon class="grey-lighten-1"> mdi-file </v-icon>
            </v-avatar>
          </template>
          <template #subtitle> {{ nodeCount(model.content) }} </template>
          <template #append>
            <span class="date">{{ getModelLocalDate(model) }}</span>
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
  </div>
  <Confirm ref="confirmDelete" />
</template>

<style scoped lang="scss">
  .container {
    padding: max(10px, 1%);
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .card {
    display: flex;
    flex-direction: column;
    width: max(600px, 60%);
    min-width: 300px;
    height: 100%;
    position: relative;
  }

  .list {
    height: 100%;
    overflow-y: scroll;
  }

  .date {
    margin-right: 1.5em;
    font-size: 0.875rem;
    opacity: var(--v-list-item-subtitle-opacity, var(--v-medium-emphasis-opacity));

    @media (max-width: 600px) {
      display: none;
    }
  }

  .newModelButton {
    margin-inline-end: 1em !important;
  }
</style>
