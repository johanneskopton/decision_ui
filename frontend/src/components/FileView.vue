<template>
  <div class="fileview">
    <FileList />
  </div>
</template>
<script>
  import FileList from "./FileList.vue";
  export default {
    components: { FileList }
  };
</script>

<style lang="scss">
  @import "vuetify/src/styles/main.sass";
  .fileview {
    background-color: map-get($grey, "lighten-4");
    width: 100%;
    height: calc(100vh - 30px);
    top: 30px;
    position: relative;
  }
  div.fileview .v-card {
    padding: max(10px, 1%);
    margin: max(10px, 1%);
    float: left;
  }
</style>
