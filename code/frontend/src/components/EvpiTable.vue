<template>
  <v-card color="white" elevation="1" class="table-container" rounded>
    <v-card-title>Expected Value Of Perfect Information (EVPI)</v-card-title>
    <vue-excel-editor v-if="evpi.length > 0" v-model="evpi" width="100%">
      <vue-excel-column
        readonly
        field="variable"
        label="variable"
        width="200px"
      />
      <vue-excel-column
        readonly
        v-for="result_var in result_vars"
        :key="result_var"
        :field="result_var"
        :label="result_var"
        width="150px"
        type="number"
      />
    </vue-excel-editor>
    <!--<v-alert v-else type="info" elevation="2">
      No EVPI to see.. Run the model first!
    </v-alert>-->
    <RunButton get-evpi :evpi-set="evpi.length > 0" />
  </v-card>
</template>
<script>
  import RunButton from "./RunButton.vue";
  export default {
    computed: {
      evpi: function() {
        if (
          this.$store.state.model.decisionSupportResult &&
          this.$store.state.model.decisionSupportResult.evpi
        ) {
          return this.$store.state.model.decisionSupportResult.evpi;
        } else {
          return [];
        }
      },
      result_vars: function() {
        const evpi_line = this.evpi[0];
        const res = [];
        Object.keys(evpi_line).forEach(key => {
          if (key != "variable" && key != "$id") {
            res.push(key);
          }
        });
        return res;
      }
    },
    components: { RunButton }
  };
</script>

<style>
  .table-container {
    width: 675px;
  }
  .vue-excel-editor {
    margin: 16px;
  }
</style>
