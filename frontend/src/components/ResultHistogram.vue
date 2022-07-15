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
        var data = this.histData[Object.keys(this.histData)[0]];
        var bin_counts = data.values;
        var bins = data.bins;
        this.graph = histogram(this.graph, ctx, bins, bin_counts);
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
