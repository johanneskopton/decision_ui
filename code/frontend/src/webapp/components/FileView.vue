<script setup lang="ts">
  import FileList from "./FileList.vue";
</script>

<template>
  <div class="fileview">
    <FileList />
    <v-tooltip location="left">
      <template #activator="{ props }">
        <v-btn color="primary" to="/user/workspace" v-bind="props" class="addButton ma-2" size="large">
          <v-icon> mdi-file-plus </v-icon>
        </v-btn>
      </template>
      <span>Add new model</span>
    </v-tooltip>
  </div>
</template>

<style scoped lang="scss">
  @use "sass:map";
  @use "vuetify/lib/styles/main.sass" as v;

  .fileview {
    background-color: map.get(v.$grey, "lighten-4");
    width: 100%;
    height: 100%;
    position: relative;
  }

  .addButton {
    position: absolute;
    bottom: 8px;
    z-index: 5;
    right: 8px;
  }
</style>
