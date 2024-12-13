<script setup lang="ts">
  import Dashboard from "./WorkspaceCards.vue";
  import ResultHistogram from "./ResultHistogram.vue";
  import EvpiChart from "./EvpiChart.vue";
</script>

<template>
  <Dashboard>
    <ResultHistogram />
    <EvpiChart />
  </Dashboard>
</template>
