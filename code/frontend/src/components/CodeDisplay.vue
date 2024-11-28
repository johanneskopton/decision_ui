<script setup lang="ts">
  import { useModelStore } from "../state/model";

  import hljs from "highlight.js/lib/core";
  import r from "highlight.js/lib/languages/r";
  import "highlight.js/styles/github.css";

  hljs.registerLanguage("r", r);

  const modelStore = useModelStore();
</script>

<template>
  <v-card color="white" elevation="1" class="code-container" rounded>
    <v-card-title>Generated R code</v-card-title>
    <highlightjs
      v-if="modelStore.decisionSupportResult !== null"
      language="r"
      :code="modelStore.decisionSupportResult.r_script"
    />
    <v-alert v-else type="info" elevation="2"> No R code to see.. Run the model first! </v-alert>
  </v-card>
</template>

<style lang="scss">
  @use "vuetify/lib/styles/main.sass" as v;

  .code-container {
    width: 50%;
    min-width: 700px;
  }

  .hljs.r {
    background-color: white !important;
    padding: 16px;
  }

  pre code.hljs.r {
    font-family:
      Roboto Mono,
      monospace !important;
  }
</style>
