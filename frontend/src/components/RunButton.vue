<template>
  <div>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="ma-2 hoverable"
          :fab="!getEvpi"
          dark
          large
          :bottom="!getEvpi"
          :right="!getEvpi"
          color="primary"
          @click="callBackend"
          v-bind="attrs"
          v-on="on"
          :loading="loading_mc"
        >
          <span v-if="getEvpi" class="button_text"> Calculate EVPI</span>
          <v-icon v-if="!getEvpi" dark class="onhover">
            mdi-rocket-launch-outline
          </v-icon>
          <v-icon v-if="!getEvpi" dark class="onnohover">
            mdi-rocket-outline
          </v-icon>
          <div v-else>
            <v-icon v-if="!evpiSet" dark>
              mdi-table-question
            </v-icon>
            <v-icon v-else dark>
              mdi-table-refresh
            </v-icon>
          </div>
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
    props: {
      getEvpi: {
        type: Boolean,
        default: false
      },
      evpiSet: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        loading_mc: false,
        network_error_msg: false,
        network_success_msg: false
      };
    },
    methods: {
      callBackend() {
        this.loading_mc = true;
        var model = this.$store.state.model.editor.save();
        var route = this.getEvpi ? "/v1/evpi" : "/v1/monte_carlo";
        axios
          .post("http://localhost:8000/api" + route, model)
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

  .button_text {
    margin-right: 1em;
  }
</style>
