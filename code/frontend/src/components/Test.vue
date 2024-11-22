<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-spacer></v-spacer>
      <v-col>
        Test
        <v-tooltip location="top" text="Download">
          <template v-slot:activator="{ props }">
            <v-btn variant="text" color="secondary" @click="saveGraph" v-bind="props">
              <v-icon>
                mdi-tray-arrow-down
              </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        Test
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script>

</script>

<style></style>
