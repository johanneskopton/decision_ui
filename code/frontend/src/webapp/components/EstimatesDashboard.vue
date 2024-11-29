<template>
  <Dashboard>
    <EstimatesTable live />
  </Dashboard>
</template>

<script lang="ts">
  import Dashboard from "./Dashboard.vue";
  import EstimatesTable from "./EstimatesTable.vue";
  export default {
    components: { Dashboard, EstimatesTable }
  };
</script>
