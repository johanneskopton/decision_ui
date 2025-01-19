<script setup lang="ts">
  import Dashboard from "./WorkspaceCards.vue";
  import { useModelStore } from "../state/model";
  import { storeToRefs } from "pinia";

  const { settings } = storeToRefs(useModelStore());
</script>

<template>
  <Dashboard class="dashboard">
    <v-card color="white" elevation="1" rounded class="card">
      <v-card-item>
        <template #title>Settings</template>
        <template #subtitle
          >Choose from various options that influence both the frontend and backend calculations:</template
        >
        <template #append>
          <v-btn-group>
            <v-tooltip location="bottom" text="go to help section" open-delay="500">
              <template #activator="{ props }">
                <v-btn v-bind="props" to="/user/workspace/help/user-interface/settings/">
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
      <v-card-text>
        <v-table class="settingsTable" density="compact">
          <tbody>
            <tr>
              <th><div>Frontend</div></th>
              <td></td>
            </tr>
            <tr>
              <td>Histogram Bins</td>
              <td>
                <v-slider v-model="settings.frontend.bins" class="slider" max="200" min="10" step="10" width="100%">
                  <template #append>
                    <v-text-field
                      v-model="settings.frontend.bins"
                      density="compact"
                      width="120px"
                      type="number"
                      variant="outlined"
                      hide-details
                    ></v-text-field>
                  </template>
                </v-slider>
              </td>
            </tr>
            <tr>
              <td>Monte Carlo Runs</td>
              <td class="sliderCell">
                <v-slider
                  v-model="settings.frontend.mcRuns"
                  class="slider"
                  max="100000"
                  min="1000"
                  step="1000"
                  width="100%"
                >
                  <template #append>
                    <v-text-field
                      v-model="settings.frontend.mcRuns"
                      density="compact"
                      width="120px"
                      type="number"
                      variant="outlined"
                      hide-details
                    ></v-text-field>
                  </template>
                </v-slider>
              </td>
            </tr>
            <tr>
              <th><div class="backendSection">Backend</div></th>
              <td></td>
            </tr>
            <tr>
              <td>Histogram Bins</td>
              <td>
                <v-slider v-model="settings.backend.bins" class="slider" max="200" min="10" step="10" width="100%">
                  <template #append>
                    <v-text-field
                      v-model="settings.backend.bins"
                      density="compact"
                      width="120px"
                      type="number"
                      variant="outlined"
                      hide-details
                    ></v-text-field>
                  </template>
                </v-slider>
              </td>
            </tr>
            <tr>
              <td>Monte Carlo Runs</td>
              <td>
                <v-slider
                  v-model="settings.backend.mcRuns"
                  class="slider"
                  max="100000"
                  min="1000"
                  step="1000"
                  width="100%"
                >
                  <template #append>
                    <v-text-field
                      v-model="settings.backend.mcRuns"
                      density="compact"
                      width="120px"
                      type="number"
                      variant="outlined"
                      hide-details
                    ></v-text-field>
                  </template>
                </v-slider>
              </td>
            </tr>
            <tr>
              <td>EVPI Monte Carlo Runs</td>
              <td>
                <v-slider
                  v-model="settings.backend.evpiMcRuns"
                  class="slider"
                  max="10000"
                  min="1000"
                  step="100"
                  width="100%"
                >
                  <template #append>
                    <v-text-field
                      v-model="settings.backend.evpiMcRuns"
                      density="compact"
                      width="120px"
                      type="number"
                      variant="outlined"
                      hide-details
                    ></v-text-field>
                  </template>
                </v-slider>
              </td>
            </tr>
            <tr>
              <td>Maximum R-Script Runtime (in seconds)</td>
              <td>
                <v-slider v-model="settings.backend.timeout" class="slider" max="30" min="1" step="1" width="100%">
                  <template #append>
                    <v-text-field
                      v-model="settings.backend.timeout"
                      density="compact"
                      width="120px"
                      type="number"
                      variant="outlined"
                      hide-details
                    ></v-text-field>
                  </template>
                </v-slider>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </Dashboard>
</template>

<style scoped lang="scss">
  .card {
    width: 100%;
  }

  .settingsTable {
    margin-top: 1em;

    th {
      width: 15em;
      border: 0 !important;
    }
    td {
      border: 0 !important;
    }
    .v-slider {
      margin: 0.5em 0;
    }
  }

  .backendSection {
    margin: 2em 0 1em 0;
  }

  .settingsTable ::v-deep(.v-input__details) {
    display: none;
  }

  .slider ::v-deep(.v-label) {
    opacity: 1;
  }
</style>
