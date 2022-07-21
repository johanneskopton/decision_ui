<template>
  <Dashboard>
    <CodeDisplay />
    <EstimatesTable />
  </Dashboard>
</template>

<script>
  import Dashboard from "./Dashboard.vue";
  import CodeDisplay from "./CodeDisplay.vue";
  import EstimatesTable from "./EstimatesTable.vue";
  export default {
    components: { Dashboard, CodeDisplay, EstimatesTable }
  };
</script>
