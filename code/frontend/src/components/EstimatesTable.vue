<template>
  <v-card
    color="white"
    elevation="1"
    class="table-container"
    :class="[live ? 'fullwidth' : 'narrow']"
    rounded
  >
    <v-card-title>{{ title }}</v-card-title>
    <vue-excel-editor v-if="estimatesData.length > 0" v-model="estimatesData">
      <vue-excel-column readonly field="label" label="label" width="150px" />
      <vue-excel-column
        readonly
        field="variable"
        label="variable"
        width="150px"
      />
      <vue-excel-column readonly field="distribution" label="distribution" />
      <vue-excel-column
        :readonly="!live"
        :change="onLowerChange"
        field="lower"
        label="lower"
        type="number"
      />
      <!--<vue-excel-column readonly field="median" label="median" />-->
      <vue-excel-column
        :readonly="!live"
        :change="onUpperChange"
        field="upper"
        label="upper"
        type="number"
      />
    </vue-excel-editor>
    <v-alert v-else type="info" elevation="2">
      <span v-if="live">
        No estimates yet..
      </span>
      <span v-else>
        No estimates from backend yet.. Run the model first!
      </span>
    </v-alert>
  </v-card>
</template>

<script lang="ts">
  import csv_parser from "../helper/csv_parser";
  export default {
    props: {
      live: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    computed: {
      estimatesData: function() {
        if (this.live) {
          return this.$store.state.model.estimates;
        } else {
          if (
            this.$store.state.model.decisionSupportResult &&
            this.$store.state.model.decisionSupportResult.estimates
          ) {
            return csv_parser(
              this.$store.state.model.decisionSupportResult.estimates
            );
          } else {
            return [];
          }
        }
      },
      title: function() {
        return this.live ? "Estimate editor" : "Generated estimates";
      }
    },
    mounted: function() {
      // this.$store.state.model.engine.calculate();
      return;
      const estimate_names = [];
      this.$store.state.model.editor.nodes.forEach(node => {
        if (node.type == "Estimate") {
          estimate_names.push(node.name);
        }
      });
      this.$store.state.model.estimates = this.$store.state.model.estimates.filter(
        function(value) {
          return estimate_names.includes(value["variable"]);
        }
      );
    },
    methods: {
      onLowerChange: function(newVal, oldVal, row) {
        this.$store.state.model.editor.nodes.forEach(node => {
          if (node.type == "Estimate" && node.name == row.variable) {
            const distribution = node.getOptionValue("Probability distribution");
            if (distribution == "deterministic") {
              node.options.get("value").value = Number(newVal);
            } else {
              node.options.get("lower").value = Number(newVal);
            }
            node.calculate();
          }
        });
      },
      onUpperChange: function(newVal, oldVal, row) {
        this.$store.state.model.editor.nodes.forEach(node => {
          if (node.type == "Estimate" && node.name == row.variable) {
            const distribution = node.getOptionValue("Probability distribution");
            if (distribution == "deterministic") {
              node.options.get("value").value = Number(newVal);
            } else {
              node.options.get("upper").value = Number(newVal);
            }
            node.calculate();
          }
        });
      }
    }
  };
</script>

<style lang="scss">
  @use "vuetify/lib/styles/main.sass" as v;
  .table-container.narrow {
    width: 45%;
  }
  .table-container.fullwidth {
    width: 80%;
  }
  .vue-excel-editor {
    margin: 16px;
  }
</style>
