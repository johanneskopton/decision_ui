<template>
  <Dashboard>
    <EstimatesTable live />
  </Dashboard>
</template>

<script>
  import Dashboard from "./Dashboard.vue";
  import EstimatesTable from "./EstimatesTable.vue";
  export default {
    components: { Dashboard, EstimatesTable }
  };
</script>
