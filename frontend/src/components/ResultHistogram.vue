<template>
  <v-sheet color="white" elevation="1" class="hist-container" rounded>
    <canvas v-if="histData != null" id="hist" ref="hist" width="200" />
    <v-alert v-else type="info" elevation="2">
      No histogram to see.. Run the model first!
    </v-alert>
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
        if (this.$store.state.model.decisionSupportResult) {
          return this.$store.state.model.decisionSupportResult.hist;
        } else {
          return null;
        }
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
        if (this.histData == null) {
          return;
        }
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
    width: 50%;
  }
</style>
