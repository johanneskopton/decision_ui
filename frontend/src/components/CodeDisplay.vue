<template>
  <v-card color="white" elevation="1" class="code-container" rounded>
    <v-card-title>Generated R code</v-card-title>
    <highlightjs v-if="rCode" language="r" :code="rCode" />
    <v-alert v-else type="info" elevation="2">
      No R code to see.. Run the model first!
    </v-alert>
  </v-card>
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
    width: 50%;
    min-width: 700px;
  }
  .hljs.r {
    background-color: white !important;
  }
  pre code.hljs.r {
    font-family: Roboto Mono, monospace !important;
  }
</style>
