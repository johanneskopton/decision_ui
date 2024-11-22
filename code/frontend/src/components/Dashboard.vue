<template>
  <div class="dashboard">
    <slot />
  </div>
</template>

<style lang="scss">
  @use "sass:map";
  @use "vuetify/lib/styles/main.sass" as v;

  div.dashboard {
    background-color: map.get(v.$grey, "lighten-4");
    width: 100%;
    height: calc(100vh - 30px);
  }
  div.dashboard .v-card {
    padding: max(10px, 1%);
    margin: max(10px, 1%);
    float: left;
  }
</style>
