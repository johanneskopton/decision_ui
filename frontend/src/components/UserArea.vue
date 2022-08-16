<template>
  <div>
    <SystemBar />
    <router-view />
  </div>
</template>
<script>
  import SystemBar from "./SystemBar.vue";
  export default {
    components: { SystemBar }
  };
</script>
