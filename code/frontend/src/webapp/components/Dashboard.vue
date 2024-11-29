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
    height: 100%;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    gap: max(10px, 1%);
    padding: max(10px, 1%);
  }
  div.dashboard .v-card {
    padding: max(10px, 1%);
  }
</style>
