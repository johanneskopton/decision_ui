<template>
  <div class="fileview">
    <FileList />
    <v-btn
      right
      dark
      fab
      color="primary"
      to="/user/workspace"
      class="ma-2"
      large
    >
      <v-icon dark>
        mdi-file-plus
      </v-icon>
    </v-btn>
  </div>
</template>
<script>
  import FileList from "./FileList.vue";
  export default {
    components: { FileList },
    created() {
      this.$store.dispatch("initModel");
    }
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
    margin: max(10px, 1%);
  }
  .v-btn--right {
    position: absolute;
    bottom: 8px;
    z-index: 5;
    right: 8px;
  }
</style>
