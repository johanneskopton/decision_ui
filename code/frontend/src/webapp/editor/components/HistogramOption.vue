<script setup lang="ts">
  import { ref, useTemplateRef, onUpdated, computed, toRaw } from "vue";
  import type { Chart } from "chart.js";
  import nj from "@d4c/numjs";

  import get_bins from "../../common/get_bins";
  import series_diagram from "../../common/series_diagram";
  import { useModelStore } from "../../state/model";
  import { makeArray } from "../common/math";
  import { isDeterministic, isSeries } from "../common/nodes";
  import {
    DETERMINISTIC_TYPE,
    PROBABILISTIC_SERIES_TYPE,
    PROBABILISTIC_TYPE,
    type InterfaceTypeSet,
    type FlexibleNumber
  } from "../common/types";
  import { drawNodeHistogram } from "@/charts/histogram/node";

  const { modelValue = null } = defineProps<{ modelValue: FlexibleNumber | null }>();

  const modelStore = useModelStore();
  const canvas = useTemplateRef<HTMLCanvasElement | null>("canvas");
  const graph = ref<Chart<"bar"> | Chart<any> | null>(null);

  const numberToPrettyString = (value: FlexibleNumber | null) => {
    if (value == null) return "undefined";
    value = value as number;
    const approximatelyEqual = (v1: number, v2: number, epsilon = 0.001) => Math.abs(v1 - v2) < epsilon;
    return approximatelyEqual(value, 0) ? 0 : value.toFixed(Math.max(0, 3 - Math.floor(Math.log10(value))));
  };

  const getMean = (value: FlexibleNumber | null) => {
    if (value == null) return;
    return numberToPrettyString(nj.array(value).mean());
  };

  const getStdDev = (value: FlexibleNumber | null) => {
    if (value == null) return;
    return numberToPrettyString(nj.array(value).std());
  };

  const displayType = computed((): InterfaceTypeSet => {
    const value = toRaw(modelValue);
    if (!value) {
      return DETERMINISTIC_TYPE;
    }
    if (isDeterministic(value)) {
      return DETERMINISTIC_TYPE;
    }
    if (isSeries(value)) {
      return PROBABILISTIC_SERIES_TYPE;
    }
    return PROBABILISTIC_TYPE;
  });

  const getCanvasContext = () => {
    if (!canvas.value) {
      // canvas not mounted yet
      return null;
    }

    const ctx = canvas.value.getContext("2d");
    if (!ctx) {
      // canvas not ready or not supported
      return null;
    }

    return ctx;
  };

  const drawProbabilisticChart = (value: FlexibleNumber, ctx: CanvasRenderingContext2D) => {
    const hist_data = get_bins(
      makeArray(value, modelStore.settings.frontend.mcRuns),
      modelStore.settings.frontend.bins
    );
    const bins = hist_data.bins;
    const bin_counts = hist_data.bin_counts;

    graph.value = drawNodeHistogram(graph.value, ctx, bins, bin_counts);
  };

  const drawSeriesChart = (value: FlexibleNumber, ctx: CanvasRenderingContext2D) => {
    value = value as number[][];
    graph.value = series_diagram(graph.value, ctx, value[0]);
  };

  onUpdated(() => {
    if (modelValue == null) {
      return;
    }

    const ctx = getCanvasContext();
    if (ctx == null) {
      // no canvas context
      return;
    }

    if (displayType.value == PROBABILISTIC_TYPE || displayType.value == DETERMINISTIC_TYPE) {
      drawProbabilisticChart(modelValue, ctx);
    }

    if (displayType.value == PROBABILISTIC_SERIES_TYPE) {
      drawSeriesChart(modelValue, ctx);
    }
  });
</script>

<template>
  <div class="histogram">
    <div v-if="displayType == DETERMINISTIC_TYPE">Value: {{ numberToPrettyString(modelValue) }}</div>
    <div v-if="displayType == PROBABILISTIC_SERIES_TYPE" class="header">Series</div>
    <div v-if="displayType == PROBABILISTIC_TYPE" class="header">
      <span class="mean">Mean: {{ getMean(modelValue) }}</span>
      <span class="std">StdDev: {{ getStdDev(modelValue) }}</span>
    </div>
    <div class="canvasContainer">
      <canvas ref="canvas" />
    </div>
  </div>
</template>

<script lang="ts"></script>

<style scoped lang="scss">
  .histogram {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  .canvasContainer {
    aspect-ratio: 1.41;
    flex-grow: 1;
    overflow: hidden;

    width: 100%;
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    margin-top: -0.5em;
    margin-bottom: 1em;
  }
</style>
