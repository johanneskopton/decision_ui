<template>
  <v-sheet color="white" elevation="1" class="table-container" rounded>
    <vue-excel-editor
      v-if="estimatesData.length > 0"
      v-model="estimatesData"
      readonly
      width="100%"
    >
      <vue-excel-column field="label" label="label" />
      <vue-excel-column field="variable" label="variable" />
      <vue-excel-column field="distribution" label="distribution" />
      <vue-excel-column field="lower" label="lower" />
      <vue-excel-column field="median" label="median" />
      <vue-excel-column field="upper" label="upper" />
    </vue-excel-editor>
    <v-alert v-else type="info" elevation="2">
      No estimates yet..
    </v-alert>
  </v-sheet>
</template>
<script>
  export default {
    computed: {
      estimatesData: function() {
        return this.$store.state.model.estimates;
      }
    }
  };
</script>

<style lang="scss">
  @import "vuetify/src/styles/main.sass";
  .table-container {
    width: 675px;
  }
</style>
