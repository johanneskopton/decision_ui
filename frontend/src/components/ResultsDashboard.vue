<template>
  <div class="results_dashboard">
    <ResultHistogram />
  </div>
</template>

<script>
  import ResultHistogram from "./ResultHistogram.vue";
  export default {
    components: { ResultHistogram }
  };
</script>

<style lang="scss">
  @import "vuetify/src/styles/main.sass";
  div.results_dashboard {
    background-color: map-get($grey, "lighten-4");
    width: 100%;
    height: 100vh;
  }
</style>
