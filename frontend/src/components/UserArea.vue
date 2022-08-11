<template>
  <div>
    <SystemBar />
    <Workspace />
  </div>
</template>
<script>
  import Workspace from "./Workspace.vue";
  import SystemBar from "./SystemBar.vue";
  export default {
    components: { Workspace, SystemBar }
  };
</script>
