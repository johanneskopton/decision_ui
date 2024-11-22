<template>
    <SystemBar />
    <router-view />
</template>
<script>
  import SystemBar from "./SystemBar.vue";
  export default {
    components: { SystemBar }
  };
</script>
