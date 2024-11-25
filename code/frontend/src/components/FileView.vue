<script setup lang="ts">
  import FileList from "./FileList.vue";
</script>

<template>
  <div class="fileview">
    <FileList />
    <v-btn
      location="right"
      color="primary"
      to="/user/workspace"
      class="ma-2"
      size="large"
    >
      <v-icon>
        mdi-file-plus
      </v-icon>
    </v-btn>
  </div>
</template>



<style lang="scss">
  @use "sass:map";
  @use "vuetify/lib/styles/main.sass" as v;

  .fileview {
    background-color: map.get(v.$grey, "lighten-4");
    width: 100%;
    height: calc(100vh - 30px);
    position: relative;
  }
  div.fileview .v-card {
    margin: max(10px, 1%);
  }
  .v-btn--right {
    position: absolute;
    bottom: 8px;
    z-index: 5;
    right: 8px;
  }
</style>
