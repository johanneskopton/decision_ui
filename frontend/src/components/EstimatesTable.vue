<template>
  <v-sheet color="white" elevation="1" class="table-container" rounded>
    <vue-excel-editor
      v-if="estimatesData.length > 0"
      v-model="estimatesData"
      width="100%"
    >
      <vue-excel-column readonly field="label" label="label" />
      <vue-excel-column readonly field="variable" label="variable" />
      <vue-excel-column readonly field="distribution" label="distribution" />
      <vue-excel-column :change="onLowerChange" field="lower" label="lower" />
      <vue-excel-column readonly field="median" label="median" />
      <vue-excel-column :change="onUpperChange" field="upper" label="upper" />
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
    },
    methods: {
      onLowerChange: function(newVal, oldVal, row) {
        this.$store.state.model.editor.nodes.forEach(node => {
          if (node.type == "Estimate" && node.name == row.variable) {
            node.options.get("lower").value = Number(newVal);
            node.calculate_single();
          }
        });
      },
      onUpperChange: function(newVal, oldVal, row) {
        this.$store.state.model.editor.nodes.forEach(node => {
          if (node.type == "Estimate" && node.name == row.variable) {
            node.options.get("upper").value = Number(newVal);
            node.calculate_single();
          }
        });
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
