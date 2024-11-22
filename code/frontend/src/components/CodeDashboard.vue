<template>
  <Dashboard>
    <CodeDisplay />
    <EstimatesTable />

    <v-sheet
      class="floating_btn_group float-left"
      color="white"
      elevation="4"
      rounded
      v-if="isCalculated"
      @click="saveZip"
    >
      <v-tooltip location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            class="ma-2"
            variant="text"
            dark
            color="secondary"
           
            v-bind="props"
          >
            <v-icon dark>
              mdi-folder-download-outline
            </v-icon>
          </v-btn>
        </template>
        <span>Download ZIP</span>
      </v-tooltip>
    </v-sheet>
  </Dashboard>
</template>

<script>
  import JSZip from "jszip";
  import FileSaver from "file-saver";

  import Dashboard from "./Dashboard.vue";
  import CodeDisplay from "./CodeDisplay.vue";
  import EstimatesTable from "./EstimatesTable.vue";

  export default {
    components: { Dashboard, CodeDisplay, EstimatesTable },
    computed: {
      isCalculated: function() {
        return (
          typeof this.$store.state.model.decisionSupportResult.r_script !==
            "undefined" &&
          typeof this.$store.state.model.decisionSupportResult.estimates !==
            "undefined"
        );
      }
    },
    methods: {
      saveZip: function() {
        const zip = new JSZip();
        let r_script = this.$store.state.model.decisionSupportResult.r_script;
        r_script = r_script.replace(
          /\"\/tmp\/decision_ui_estimate_[a-z0-9].*\.csv\"/,
          '"estimates.csv"'
        );
        zip.file("script.R", r_script);
        zip.file(
          "estimates.csv",
          this.$store.state.model.decisionSupportResult.estimates
        );
        zip.generateAsync({ type: "blob" }).then(function(content) {
          FileSaver.saveAs(content, "model.zip");
        });
      }
    }
  };
</script>
