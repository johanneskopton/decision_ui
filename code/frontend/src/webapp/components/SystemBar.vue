<script setup lang="ts">
  import { useModelStore } from "../state/model";
  import { useUserStore } from "../state/user";

  const modelStore = useModelStore();
  const useStore = useUserStore();
</script>

<template>
  <v-system-bar class="systemBar">
    <span class="profile">
      <v-icon v-if="useStore.login.token">mdi-account</v-icon>
      <v-icon v-else>mdi-account-off</v-icon>
      <span class="userName">
        <span v-if="useStore.login.email">{{ useStore.login.email }}</span>
        <span v-else>guest</span>
      </span>
    </span>
    <v-spacer />
    <span v-if="useStore.login.token" :class="{ unsaved: modelStore.unsaved }">
      {{ modelStore.name }}<span v-if="modelStore.unsaved && modelStore.name">* </span>
    </span>
    <span v-else>
      <em>Unsaved model*</em>
    </span>
    <v-spacer />
    <router-link to="/login" class="logoutLink">
      <span v-if="useStore.login.token">Logout</span>
      <span v-else>Login</span>
      <v-icon v-if="useStore.login.token">mdi-logout-variant</v-icon>
      <v-icon v-else>mdi-login-variant</v-icon>
    </router-link>
  </v-system-bar>
</template>

<style scoped lang="scss">
  .systemBar {
    position: relative !important;
    height: auto !important;

    background-color: var(--v-secondary-lighten4) !important;
    border-bottom: solid 1px;
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .profile {
    margin: 0.5em 1em 0.5em 0.5em;
  }

  .userName {
    margin-left: 0.5em;
  }

  .logoutLink {
    text-decoration: none;
    color: var(--text);

    span {
      margin-right: 0.25em;
    }
  }

  .unsaved {
    font-style: italic;
  }
</style>
