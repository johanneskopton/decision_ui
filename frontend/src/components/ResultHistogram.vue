<template>
  <v-sheet color="white" elevation="1" class="hist-container" rounded>
    <canvas id="hist" ref="hist" width="200" />
  </v-sheet>
</template>
<script>
  import histogram from "../histogram";
  export default {
    data() {
      return {
        graph: undefined
      };
    },
    computed: {
      histData: function() {
        return this.$store.state.model.decisionSupportResult.hist;
      }
    },
    watch: {
      histData: function() {
        this.drawHist();
      }
    },
    mounted() {
      this.drawHist();
    },
    methods: {
      drawHist: function() {
        var ctx = this.$refs.hist.getContext("2d");
        var bins = this.histData.bins;
        var density = this.histData.density;
        this.graph = histogram(this.graph, ctx, bins, density);
      }
    }
  };
</script>
<style scoped>
  .hist-container {
    padding: max(10px, 1%);
    margin: max(10px, 1%);
    width: 50%;
  }
</style>
