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

    gap: 0.75em;
    padding: 0.75em;
  }

  div.dashboard .v-card {
    flex-grow: 1;
    padding: 1em;
  }
</style>
