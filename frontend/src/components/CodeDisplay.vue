<template>
  <div class="r_code_dashboard">
    <v-sheet color="white" elevation="1" class="code-container" rounded>
      <!-- <pre>{{ rCode }}</pre> -->
      <highlightjs language="r" :code="rCode" />
    </v-sheet>
  </div>
</template>
<script>
  export default {
    computed: {
      rCode: function() {
        return this.$store.state.model.decisionSupportResult.r_script;
      }
    }
  };
</script>
<style lang="scss">
  @import "vuetify/src/styles/main.sass";
  .code-container {
    padding: max(10px, 1%);
    margin: max(10px, 1%);
  }
  .hljs.r {
    background-color: white !important;
  }
  div.r_code_dashboard {
    background-color: map-get($grey, "lighten-4");
    width: 100%;
    height: 100vh;
  }
  pre code.hljs.r {
    font-family: Roboto Mono, monospace !important;
  }
</style>
