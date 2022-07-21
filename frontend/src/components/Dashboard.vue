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
    height: 100vh;
  }
</style>
