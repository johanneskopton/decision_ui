<template>
  <div>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ma-2 hoverable"
          fab
          dark
          large
          bottom
          right
          color="primary"
          @click="callBackend"
          v-bind="attrs"
          v-on="on"
          :loading="loading_mc"
        >
          <v-icon dark class="onhover">
            mdi-rocket-launch-outline
          </v-icon>
          <v-icon dark class="onnohover">
            mdi-rocket-outline
          </v-icon>
        </v-btn>
      </template>
      <span>Run</span>
    </v-tooltip>
    <v-snackbar v-model="network_error_msg" :timeout="2000" color="error">
      <!--<v-icon>mdi-server-network-off</v-icon>-->
      No connection to server!
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="network_error_msg = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="network_success_msg" :timeout="2000" color="secondary">
      <!--<v-icon>mdi-chart-histogram</v-icon>-->
      decisionSupport successfully executed!
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="network_error_msg = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>
  import axios from "axios";
  export default {
    data() {
      return {
        loading_mc: false,
        network_error_msg: false,
        network_success_msg: false
      };
    },
    methods: {
      callBackend() {
        var model = this.$store.state.model.editor.save();
        this.loading_mc = true;
        axios
          .post("http://localhost:8000/api/v1/decision_support", model)
          .then(response => this.receiveResults(response))
          .catch(response => this.receiveResultsError(response));
      },
      receiveResults(response) {
        this.loading_mc = false;
        console.log(response);
        if (response.status == 200) {
          this.network_success_msg = true;
        }
        this.$store.commit("setDecisionSupportResult", response.data);
      },
      receiveResultsError(response) {
        this.loading_mc = false;
        console.log(response);
        if (response.code == "ERR_NETWORK") {
          this.network_error_msg = true;
        }
      }
    }
  };
</script>

<style>
  button.v-btn--right {
    position: absolute;
    bottom: 8px;
    z-index: 5;
    right: 8px;
  }

  button.hoverable .onhover,
  button.hoverable:hover .onnohover {
    display: none;
  }

  button.hoverable .onnohover,
  button.hoverable:hover .onhover {
    display: inherit;
  }
</style>
