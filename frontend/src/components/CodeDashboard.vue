<template>
  <Dashboard>
    <CodeDisplay />
  </Dashboard>
</template>

<script>
  import Dashboard from "./Dashboard.vue";
  import CodeDisplay from "./CodeDisplay.vue";
  export default {
    components: { Dashboard, CodeDisplay }
  };
</script>
