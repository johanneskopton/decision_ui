<script setup lang="ts">
import { useModelStore } from '@/state/model';
import { useUserStore } from '@/state/user';

const modelStore = useModelStore();
const useStore = useUserStore();

</script>

<template>
  <v-system-bar>
    <v-icon v-if="useStore.access_token">mdi-account</v-icon>
    <v-icon v-else>mdi-account-off</v-icon>
    <span v-if="useStore.email">{{ useStore.email }}</span>
    <span v-else>guest</span>
    <v-spacer />
    <span v-if="useStore.access_token" :class="{ unsaved: modelStore.unsaved }">
      {{ modelStore.name }}<span v-if="modelStore.unsaved && modelStore.name">*
    </span>
    </span>
    <span v-else>
      <em>Unsaved model*</em>
    </span>
    <v-spacer />
    <router-link to="/login">
      <v-icon v-if="useStore.access_token">mdi-logout-variant</v-icon>
      <v-icon v-else>mdi-login-variant</v-icon>
    </router-link>
  </v-system-bar>
</template>

<style lang="scss">
  div.v-system-bar {
    background-color: var(--v-secondary-lighten4) !important;
    position: relative !important;
    border-bottom: solid 1px;
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    height: auto !important;
    padding: 0.5em 1.0em !important;
  }
  .unsaved {
    font-style: italic;
  }
</style>
