<script setup lang="ts">
  import { ref, watch, useTemplateRef, onUpdated } from "vue";
  import type { Chart } from "chart.js";

  import get_bins from "../../common/get_bins";
  import histogram from "../../common/histogram";

  const { modelValue = [] } = defineProps<{ modelValue: number[] | null }>();

  const isProbabilistic = ref(true);
  const canvas = useTemplateRef<HTMLCanvasElement | null>("canvas");
  const graph = ref<Chart | null>(null);

  const numberToPrettyString = (value: number | null | undefined) => {
    if (value === undefined || value === null) {
      return "undefined";
    }
    const approximatelyEqual = (v1: number, v2: number, epsilon = 0.001) => Math.abs(v1 - v2) < epsilon;
    return approximatelyEqual(value, 0) ? 0 : value.toFixed(Math.max(0, 3 - Math.floor(Math.log10(value))));
  };

  const drawHistogram = () => {
    if (!canvas.value) {
      // canvas not mounted yet
      return;
    }

    if (!Array.isArray(modelValue)) {
      // data is not array (of numbers)
      console.error(`histogram data is not an array: ${JSON.stringify(modelValue)}`);
      return;
    }

    const ctx = canvas.value.getContext("2d");
    if (!ctx) {
      // context is null
      console.error(`context is null`);
      return;
    }

    const data = modelValue;
    const hist_data = get_bins(data);
    const bins = hist_data.bins;
    const bin_counts = hist_data.bin_counts;

    graph.value = histogram(graph.value, ctx, bins, bin_counts, true);
  };

  const update = (value: number[] | null) => {
    isProbabilistic.value = new Set(value).size > 1;
  };

  watch(
    () => modelValue,
    newValue => {
      update(newValue);
    }
  );

  onUpdated(() => {
    if (isProbabilistic.value) {
      drawHistogram();
    }
  });
</script>

<template>
  <div class="histogram">
    <canvas v-if="isProbabilistic" ref="canvas" />
    <p v-if="!isProbabilistic">
      {{ numberToPrettyString(new Set(modelValue).values().next().value) }}
    </p>
  </div>
</template>

<script lang="ts"></script>

<style scoped lang="scss">
  .histogram {
    position: relative;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
</style>
