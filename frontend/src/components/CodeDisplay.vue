<template>
  <v-sheet color="white" elevation="1" class="code-container" rounded>
    <!-- <pre>{{ rCode }}</pre> -->
    <highlightjs language="r" :code="rCode" />
  </v-sheet>
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
