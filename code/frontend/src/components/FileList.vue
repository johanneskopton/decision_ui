<script setup lang="ts">
  import { onMounted, ref, useTemplateRef } from "vue";
  import { useRouter } from "vue-router";

  import Confirm from "./Confirm.vue";

  import { useModelStore } from "../state/model";
  import { useUserStore } from "../state/user";
  import { doDeleteModel, doQueryModels, type ModelData } from "@/backend/models";

  const userStore = useUserStore();
  const modelStore = useModelStore();
  const router = useRouter();

  const confirmDelete = useTemplateRef<typeof Confirm>("confirmDelete");

  const models = ref<ModelData[] | null>(null);

  const nodeCount = (content: string) => {
    return String(JSON.parse(content).graph.nodes.length) + " nodes";
  };

  const queryModels = () => {
    doQueryModels({
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
      .open("Delete", "Are you sure you want to delete <code>" + model.name + "</code>?", { color: "warning" })
      .then((confirm: boolean) => {
        if (confirm) {
          doDeleteModel({
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
    width: 60%;
    min-width: 300px;
  }
</style>
