<script setup lang="ts">
  import Dashboard from "./WorkspaceCards.vue";
  import CodeDisplay from "./CodeDisplay.vue";
  import EstimatesTable from "./EstimatesTable.vue";
</script>

<template>
  <Dashboard>
    <CodeDisplay />
    <EstimatesTable :live="false" />
  </Dashboard>
</template>
