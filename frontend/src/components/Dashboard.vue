<template>
  <div class="dashboard">
    <slot />
  </div>
</template>

<style lang="scss">
  @import "vuetify/src/styles/main.sass";
  div.dashboard {
    background-color: map-get($grey, "lighten-4");
    width: 100%;
    height: calc(100vh - 30px);
  }
  div.dashboard .v-card {
    padding: max(10px, 1%);
    margin: max(10px, 1%);
    float: left;
  }
</style>
