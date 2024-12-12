<script setup lang="ts">
  import LoginRefresh from "./components/LoginRefresh.vue";
</script>

<template>
  <v-app>
    <LoginRefresh />
    <router-view />
  </v-app>
</template>

<style language="scss">
  @import url("https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900");
  @import url("https://fonts.googleapis.com/css?family=Roboto+Mono:400");
  @import url("https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css");

  body {
    margin: 0;
    font-family: Roboto !important;
  }

  html,
  body,
  #app {
    height: 100%;
  }
</style>
