<script setup lang="ts">
  import SystemBar from "./SystemBar.vue";
</script>

<template>
  <div class="container">
    <div class="system-bar">
      <SystemBar />
    </div>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .content {
    height: 100%;
    overflow: auto;
  }
</style>
