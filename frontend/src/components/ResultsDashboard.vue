<template>
  <Dashboard>
    <ResultHistogram />
    <EvpiTable />
  </Dashboard>
</template>

<script>
  import Dashboard from "./Dashboard.vue";
  import ResultHistogram from "./ResultHistogram.vue";
  import EvpiTable from "./EvpiTable.vue";
  export default {
    components: { ResultHistogram, Dashboard, EvpiTable }
  };
</script>
