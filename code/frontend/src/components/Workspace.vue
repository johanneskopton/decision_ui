<script setup lang="ts">
import { useUserStore } from "@/state/user";
import RunButton from "./RunButton.vue";

const userStore = useUserStore();
</script>

<template>
  <div class="workspace-container">
    <v-navigation-drawer rail permanent>
      <v-list density="compact" nav height="100%">
        <v-list-item
          to="/user/workspace/modeling"
          prepend-icon="mdi-graph mdi-rotate-90"
        >
          <v-list-item-title>Model editor</v-list-item-title>
        </v-list-item>
        <v-list-item to="/user/workspace/estimates" prepend-icon="mdi-table">
          <v-list-item-title>Estimates</v-list-item-title>
        </v-list-item>
        <v-list-item
          to="/user/workspace/results"
          prepend-icon="mdi-chart-histogram"
        >
          <v-list-item-title>Results dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item to="/user/workspace/code" prepend-icon="mdi-language-r">
          <v-list-item-title>R-Code</v-list-item-title>
        </v-list-item>
        <v-list-item
          to="/user/files"
          class="mt-auto"
          prepend-icon="mdi-format-list-text"
          v-if="userStore.access_token"
        >
          <v-list-item-title>Files</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <div class="main-window">
      <router-view />
      <RunButton />
    </div>
  </div>
</template>

<style>
  nav.v-navigation-drawer {
    position: relative !important;
    top: 0 !important;
  }

  div.main-window {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
  }

  div.workspace-container {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .theme--light.v-icon {
    color: #9e9e9e;
  }

  .floating_btn_group {
    position: absolute;
    bottom: 16px;
    z-index: 5;
  }

  .floating_btn_group.left {
    left: 16px;
  }

  .workspace-container {
    position: relative;
  }
</style>
