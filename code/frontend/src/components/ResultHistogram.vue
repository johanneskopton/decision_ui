<template>
  <v-card color="white" elevation="1" class="hist-container" rounded>
    <v-card-title>Result histogram</v-card-title>
    <canvas v-show="histData != null" id="hist" ref="hist" width="200" />
    <v-alert v-show="histData == null" type="info" elevation="2">
      No histogram to see.. Run the model first!
    </v-alert>
  </v-card>
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
        const ctx = this.$refs.hist.getContext("2d");
        const bins = this.histData.bins;
        const density = this.histData.density;
        this.graph = histogram(this.graph, ctx, bins, density);
      }
    }
  };
</script>
<style scoped>
  .hist-container {
    width: 50%;
  }
  canvas {
    padding: 16px;
  }
</style>
