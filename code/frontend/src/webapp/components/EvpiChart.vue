<script setup lang="ts">
  import { storeToRefs } from "pinia";

  import { useModelStore } from "../state/model";
  import { useTemplateRef, ref, watch, onMounted, computed } from "vue";
  import type { Chart } from "chart.js";
  import { drawEvpiBoxChart } from "../charts/histogram/evpi";
  import RunButton from "./RunButton.vue";
  import { downloadChart } from "../charts/download";

  const modelStore = useModelStore();
  const { evpiResult } = storeToRefs(modelStore);

  const canvas = useTemplateRef<HTMLCanvasElement | null>("canvas");
  const chart = ref<Chart<"bar"> | null>(null);

  const drawChart = (device_pixel_ratio: number = 1.0) => {
    if (evpiResult.value == null) {
      return;
    }
    if (canvas.value == null) {
      return;
    }
    const ctx = canvas.value.getContext("2d");
    if (ctx == null) {
      return;
    }

    chart.value = drawEvpiBoxChart(chart.value, ctx, evpiResult.value.evpi, device_pixel_ratio);
  };

  const chartHeight = computed(() => {
    if (evpiResult.value == null) {
      return "0em";
    }
    const evpi = evpiResult.value.evpi;
    const estimates = Object.keys(evpi).length;
    const results = Object.keys(evpi[Object.keys(evpi)[0]]).length;
    return `${5 + estimates * (results + 1) * 1.0}em`;
  });

  const downloadEvpiChart = (filetype: string) => {
    downloadChart(
      dpr => {
        drawChart(dpr);
        return canvas.value;
      },
      "evpi",
      filetype,
      2.0
    );
  };

  watch(evpiResult, () => {
    drawChart();
  });

  onMounted(() => {
    drawChart();
  });
</script>

<template>
  <v-card color="white" elevation="1" class="card" rounded>
    <v-card-item>
      <template #title> Expected Value Of Perfect Information (EVPI) </template>
      <template #subtitle> The results of the value of information analysis: </template>

      <template #append>
        <v-btn-group density="compact">
          <v-tooltip location="bottom" text="download chart as PNG image" open-delay="500">
            <template #activator="{ props }">
              <v-btn
                v-show="evpiResult != null"
                density="compact"
                v-bind="props"
                @click.prevent="() => downloadEvpiChart('png')"
              >
                png
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="bottom" text="download chart as JPG image" open-delay="500">
            <template #activator="{ props }">
              <v-btn
                v-show="evpiResult != null"
                density="compact"
                v-bind="props"
                @click.prevent="() => downloadEvpiChart('jpg')"
              >
                jpg
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="bottom" text="go to help section" open-delay="500">
            <template #activator="{ props }">
              <v-btn v-bind="props" to="/user/workspace/help/advanced-features/evpi/">
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

    <div v-show="evpiResult != null" class="canvasContainer">
      <canvas ref="canvas" />
    </div>

    <RunButton get-evpi />
  </v-card>
</template>

<style scoped lang="scss">
  .card {
    flex-basis: 40em;
  }

  .canvasFlex {
    width: 100%;
    display: flex;
  }

  .canvasContainer {
    height: v-bind(chartHeight);
    min-height: 15em;
    width: 100%;
    flex-grow: 1;
    overflow: hidden;
    position: relative;

    canvas {
      padding: 16px;
    }
  }
</style>
