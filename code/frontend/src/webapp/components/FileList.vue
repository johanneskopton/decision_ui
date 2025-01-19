<script setup lang="ts">
  import { onMounted, ref, useTemplateRef } from "vue";
  import { useRoute, useRouter } from "vue-router";

  import Confirm from "./ConfirmDialog.vue";

  import { useModelStore } from "../state/model";
  import { useUserStore } from "../state/user";
  import { doDeleteModel, doQueryModels, type ModelData } from "../backend/models";
  import { getExampleModels, type ExampleModel } from "../editor/examples";

  const userStore = useUserStore();
  const modelStore = useModelStore();
  const router = useRouter();
  const route = useRoute();

  const tab = ref<string>(!!route.query.examples ? "examples" : "my-models");
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

  const openModel = (model: ModelData) => {
    modelStore.name = model.name;
    modelStore.baklava.editor.load(JSON.parse(model.content));
    modelStore.unsaved = false;
    router.push("/user/workspace");
  };

  const openExample = (example: ExampleModel) => {
    modelStore.baklava.editor.load(example.stateGenerator());
    modelStore.unsaved = true;
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
    if (userStore.isLoggedIn) {
      queryModels();
    }
    modelStore.reset();
  });
</script>

<template>
  <div class="container">
    <v-card class="card">
      <v-toolbar color="primary">
        <template #title>
          <v-tabs v-model="tab" class="tabs" bg-color="primary" slider-color="#aad5ff">
            <v-tab value="my-models">My Models</v-tab>
            <v-tab value="examples">Examples</v-tab>
          </v-tabs>
        </template>
        <template #append>
          <v-btn-group>
            <v-btn to="/user/workspace" color="primary" class="newModelButton">
              <template #prepend>
                <v-icon>mdi-file-plus</v-icon>
              </template>
              New Model
            </v-btn>
            <v-tooltip location="bottom" text="go to help section" open-delay="500">
              <template #activator="{ props }">
                <v-btn v-bind="props" to="/user/workspace/help/user-interface/model-list/" color="primary">
                  <template #prepend>
                    <v-icon size="large"> mdi-help-circle-outline </v-icon>
                  </template>
                  Help
                </v-btn>
              </template>
            </v-tooltip>
          </v-btn-group>
        </template>
      </v-toolbar>

      <v-tabs-window v-model="tab" class="window">
        <v-tabs-window-item value="my-models">
          <v-list v-if="!userStore.isLoggedIn">
            <v-list-item>
              <v-alert color="gray" icon="mdi-information-outline" elevation="2">
                You need to <router-link to="/login">Login</router-link> to load and save custom models.
              </v-alert>
            </v-list-item>
          </v-list>
          <v-list v-else class="list" lines="two">
            <v-list-item v-for="model in models" :key="model.saved" :title="model.name" @click="openModel(model)">
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
        </v-tabs-window-item>
        <v-tabs-window-item value="examples">
          <v-list class="list" lines="two">
            <v-list-item
              v-for="model in getExampleModels()"
              :key="model.name"
              :title="model.name"
              :subtitle="model.description"
              @click="openExample(model)"
            >
              <template #prepend>
                <v-avatar>
                  <v-icon class="grey-lighten-1"> mdi-file </v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </v-tabs-window-item>
      </v-tabs-window>
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

  .window {
    height: 100%;
    overflow-y: auto;
  }

  .date {
    margin-right: 1.5em;
    font-size: 0.875rem;
    opacity: var(--v-list-item-subtitle-opacity, var(--v-medium-emphasis-opacity));

    @media (max-width: 600px) {
      display: none;
    }
  }

  .tabs {
    flex-grow: 0;
    flex-shrink: 0;

    ::v-deep(.v-btn) {
      padding: 0 1.5em;
    }

    ::v-deep(.v-tab__slider) {
      height: 3px;
    }
  }

  .newModelButton {
    margin-inline-end: 1em !important;
  }
</style>
