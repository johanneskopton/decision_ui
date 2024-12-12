<template>
  <div class="dashboard">
    <slot />
  </div>
</template>

<style lang="scss">
  div.dashboard {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    gap: max(10px, 1%);
    padding: max(10px, 1%);
  }
  div.dashboard .v-card {
    flex-grow: 1;
    padding: max(10px, 1%);
  }
</style>
