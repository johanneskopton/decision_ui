<script setup lang="ts">
  import { ref } from "vue";

  const show_dialog = ref<boolean>(false);

  defineExpose({
    showDialog: () => {
      show_dialog.value = true;
    }
  });
</script>

<template>
  <v-dialog v-model="show_dialog" class="dialog">
    <v-card max-width="70%">
      <v-card-title class="text-h5"> Model Validation </v-card-title>
      <v-card-text> ... </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="text" @click="show_dialog = false"> Got It </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .dialog {
    .v-card {
      padding: 0.5em;
      margin: 0 auto;
    }
  }
</style>
