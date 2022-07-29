<template>
  <v-sheet color="white" elevation="1" class="table-container" rounded>
    <v-subheader>EVPI</v-subheader>
    <vue-excel-editor v-if="evpi.length > 0" v-model="evpi" width="100%">
      <vue-excel-column readonly field="variable" label="variable" />
      <vue-excel-column
        readonly
        v-for="result_var in result_vars"
        :key="result_var"
        :field="result_var"
        :label="result_var"
      />
    </vue-excel-editor>
    <v-alert v-else type="info" elevation="2">
      No EVPI to see.. Run the model first!
    </v-alert>
  </v-sheet>
</template>
<script>
  export default {
    computed: {
      evpi: function() {
        if (this.$store.state.model.decisionSupportResult) {
          return this.$store.state.model.decisionSupportResult.evpi;
        } else {
          return [];
        }
      },
      result_vars: function() {
        var evpi_line = this.evpi[0];
        var res = [];
        Object.keys(evpi_line).forEach(key => {
          if (key != "variable" && key != "$id") {
            res.push(key);
          }
        });
        return res;
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
