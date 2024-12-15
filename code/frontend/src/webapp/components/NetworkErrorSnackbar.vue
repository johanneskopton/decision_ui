<script setup lang="ts">
  import { registerNetworkErrorInterceptor } from "../backend/interceptors";
  import { ref } from "vue";

  const show = ref<boolean>(false);

  registerNetworkErrorInterceptor(() => {
    show.value = true;
  });
</script>

<template>
  <v-snackbar v-model="show" :timeout="2000" color="error">
    No connection to server!
    <template #actions>
      <v-btn color="white" variant="text" @click="show = false"> Close </v-btn>
    </template>
  </v-snackbar>
</template>
