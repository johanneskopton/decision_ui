<script setup lang="ts">
  import { computed, ref, useTemplateRef, onMounted, watch } from "vue";
  import { useModelStore } from "@/state/model";
  import { type Chart } from "chart.js/auto";

  import histogram from "../common/histogram";

  const modelStore = useModelStore();

  const canvas = useTemplateRef<HTMLCanvasElement | null>("canvas");
  const graph = ref<Chart | null>(null);

  const histData = computed(() => {
    if (modelStore.decisionSupportResult) {
      return modelStore.decisionSupportResult.hist;
    } else {
      return null;
    }
  });

  const drawHist = () => {
    if (histData.value == null) {
      return;
    }
    if (canvas.value == null) {
      return;
    }
    const ctx = canvas.value.getContext("2d");
    const bins = histData.value.bins;
    const density = histData.value.density;
    graph.value = histogram(graph.value, ctx, bins, density);
  };

  watch(
    () => histData,
    () => {
      drawHist();
    }
  );

  onMounted(() => {
    drawHist();
  });
</script>

<template>
  <v-card color="white" elevation="1" class="hist-container" rounded>
    <v-card-title>Result histogram</v-card-title>
    <canvas v-show="histData != null" id="hist" ref="canvas" width="200" />
    <v-alert v-show="histData == null" type="info" elevation="2"> No histogram to see.. Run the model first! </v-alert>
  </v-card>
</template>

<style scoped>
  .hist-container {
    width: 50%;
  }
  canvas {
    padding: 16px;
  }
</style>
