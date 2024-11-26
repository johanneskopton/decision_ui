<script setup lang="ts">
  import Dashboard from "./Dashboard.vue";
  import { useModelStore } from "@/state/model";
  import { storeToRefs } from "pinia";

  const { settings } = storeToRefs(useModelStore());
</script>

<template>
  <Dashboard class="dashboard">
    <v-card color="white" elevation="1" rounded class="card">
      <v-card-title>Settings</v-card-title>
      <v-card-text>
        <div>Frontend</div>

        <v-slider
          v-model="settings.mcRuns"
          class="slider"
          max="100000"
          min="1000"
          step="1000"
          width="100%"
          label="Monte Carlo Runs"
        >
          <template #append>
            <v-text-field
              v-model="settings.mcRuns"
              density="compact"
              width="120px"
              type="number"
              variant="outlined"
              hide-details
            ></v-text-field>
          </template>
        </v-slider>

        <div>Backend</div>
      </v-card-text>
    </v-card>
  </Dashboard>
</template>

<style scoped lang="scss">
  .card {
    width: 100%;
  }

  .slider ::v-deep(.v-label) {
    opacity: 1;
  }
</style>
