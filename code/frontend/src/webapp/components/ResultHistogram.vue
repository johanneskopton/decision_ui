<script setup lang="ts">
  import { ref, useTemplateRef, onMounted, watch } from "vue";
  import { useModelStore } from "../state/model";
  import { type Chart } from "chart.js";

  import { storeToRefs } from "pinia";
  import { drawCombinedResultsHistogram } from "../charts/histogram/combined";
  import { downloadChart } from "../charts/download";

  const modelStore = useModelStore();
  const { decisionSupportResult } = storeToRefs(modelStore);

  const canvas = useTemplateRef<HTMLCanvasElement | null>("canvas");
  const chart = ref<Chart<"bar"> | null>(null);

  const drawHistogram = (device_pixel_ratio: number = 1.0) => {
    if (decisionSupportResult.value == null) {
      return;
    }
    if (canvas.value == null) {
      return;
    }
    const ctx = canvas.value.getContext("2d");
    if (ctx == null) {
      return;
    }
    const bins = decisionSupportResult.value.histogram_data.bins;
    const density = decisionSupportResult.value.histogram_data.values;
    chart.value = drawCombinedResultsHistogram(chart.value, ctx, bins, density, device_pixel_ratio);
  };

  const downloadHistogram = (filetype: string) => {
    downloadChart(
      dpr => {
        drawHistogram(dpr);
        return canvas.value;
      },
      "results",
      filetype,
      2.0
    );
  };

  watch(decisionSupportResult, () => {
    drawHistogram();
  });

  onMounted(() => {
    drawHistogram();
  });
</script>

<template>
  <v-card color="white" elevation="1" class="card" rounded>
    <v-card-item>
      <template #title> Result histogram </template>

      <template #subtitle> The results of the monte carlo simulation: </template>

      <template #append>
        <v-btn-group density="compact">
          <v-tooltip location="bottom" text="download histogram as PNG image" open-delay="500">
            <template #activator="{ props }">
              <v-btn
                v-show="decisionSupportResult != null"
                density="compact"
                v-bind="props"
                @click.prevent="() => downloadHistogram('png')"
              >
                png
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="bottom" text="download histogram as JPG image" open-delay="500">
            <template #activator="{ props }">
              <v-btn
                v-show="decisionSupportResult != null"
                density="compact"
                v-bind="props"
                @click.prevent="() => downloadHistogram('jpg')"
              >
                jpg
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="bottom" text="go to help section" open-delay="500">
            <template #activator="{ props }">
              <v-btn v-bind="props" to="/user/workspace/help/user-interface/result-dashboard/">
                <template #prepend>
                  <v-icon size="large"> mdi-help-circle-outline </v-icon>
                </template>
                Help
              </v-btn>
            </template>
          </v-tooltip>
        </v-btn-group>
      </template>
    </v-card-item>

    <div v-show="decisionSupportResult != null" class="canvasContainer">
      <canvas ref="canvas" />
    </div>

    <v-alert v-show="decisionSupportResult == null" type="info" elevation="2">
      No histogram to see. Run the model first!
    </v-alert>
  </v-card>
</template>

<style scoped language="scss">
  .card {
    flex-basis: 50em;
  }

  .canvasFlex {
    width: 100%;
    display: flex;
  }

  .canvasContainer {
    aspect-ratio: 1.41;
    flex-grow: 1;
    max-height: 40em;
    overflow: hidden;

    position: relative;
    width: 100%;
    height: 100%;

    canvas {
      padding: 16px;
    }
  }
</style>
