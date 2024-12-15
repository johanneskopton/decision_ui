<script setup lang="ts">
  import { useUserStore } from "../state/user";
  import RunButton from "./RunButton.vue";

  const userStore = useUserStore();
</script>

<template>
  <div class="workspace-container">
    <v-navigation-drawer rail permanent class="workspace-navigation">
      <v-list density="compact" nav>
        <v-tooltip location="right" text="Model editor" open-delay="500">
          <template #activator="{ props }">
            <v-list-item to="/user/workspace/modeling" v-bind="props" prepend-icon="mdi-graph mdi-rotate-90" />
          </template>
        </v-tooltip>
        <v-tooltip location="right" text="Estimates" open-delay="500">
          <template #activator="{ props }">
            <v-list-item to="/user/workspace/estimates" v-bind="props" prepend-icon="mdi-table" />
          </template>
        </v-tooltip>
        <v-tooltip location="right" text="Results dashboard" open-delay="500">
          <template #activator="{ props }">
            <v-list-item to="/user/workspace/results" v-bind="props" prepend-icon="mdi-chart-histogram" />
          </template>
        </v-tooltip>
        <v-tooltip location="right" text="R-Code" open-delay="500">
          <template #activator="{ props }">
            <v-list-item to="/user/workspace/code" v-bind="props" prepend-icon="mdi-language-r" />
          </template>
        </v-tooltip>
        <v-tooltip location="right" text="Settings" open-delay="500">
          <template #activator="{ props }">
            <v-list-item to="/user/workspace/settings" v-bind="props" prepend-icon="mdi-tune" />
          </template>
        </v-tooltip>
      </v-list>
      <template #append>
        <v-list density="compact" nav>
          <v-tooltip location="right" text="Files" open-delay="500">
            <template #activator="{ props }">
              <v-list-item
                v-if="userStore.login.token"
                v-bind="props"
                to="/user/files"
                prepend-icon="mdi-format-list-text"
              />
            </template>
          </v-tooltip>
        </v-list>
      </template>
    </v-navigation-drawer>
    <div class="workspace-content">
      <router-view />
    </div>
    <div class="run-button">
      <RunButton />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .workspace-container {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .workspace-navigation {
    position: relative !important;
    top: 0 !important;
    height: 100% !important;
    flex-grow: 0;
  }

  .workspace-content {
    background-color: rgb(245, 245, 245);
    position: relative;
    display: block;
    flex: 1 1;
    overflow: auto;
  }

  .run-button {
    position: absolute;
    bottom: 8px;
    right: 8px;
    z-index: 5;
  }
</style>
