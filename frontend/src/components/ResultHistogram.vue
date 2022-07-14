<template>
  <div>
    {{ histData }}
  </div>
</template>
<script>
  export default {
    computed: {
      histData: function() {
        return this.$store.state.model.decisionSupportResult.hist;
      }
    }
  };
</script>
