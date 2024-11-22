<template>
    <v-tooltip location="top">
      <template v-slot:activator="{ props }">
        <v-btn
          class="ma-2 hoverable"
          :fab="!getEvpi"
          dark
          size="large"
          color="primary"
          @click="callBackend"
          v-bind="props"
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
          variant="text"
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
          variant="text"
          v-bind="attrs"
          @click="network_error_msg = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-dialog v-model="noPermissionDialog" max-width="290">
      <v-card>
        <v-card-title class="text-h5">
          Not authorized
        </v-card-title>

        <v-card-text>
          In order to make backend calls (i. e. run the heavy calculations on
          our servers), you need to be logged in.
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn color="grey" variant="text" @click="noPermissionDialog = false">
            cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="text"
            @click="noPermissionDialog = false"
            to="/login"
          >
            Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
<script>
  import axios from "axios";
  import clean_model_json from "../helper/clean_model_json";
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
        network_success_msg: false,
        noPermissionDialog: false
      };
    },
    methods: {
      callBackend() {
        this.loading_mc = true;
        let model = this.$store.state.model.editor.save();
        model = clean_model_json(model);
        const route = this.getEvpi ? "/api/v1/evpi" : "/api/v1/monte_carlo";
        const token = this.$store.state.user.access_token;
        axios
          .post(import.meta.env.VITE_BACKEND_BASE_URL + route, model, {
            headers: {
              [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${token}`
            }
          })
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
        if (response.code === "ERR_NETWORK") {
          this.network_error_msg = true;
        } else if (response.code === "ERR_BAD_REQUEST") {
          this.noPermissionDialog = true;
        }
      }
    }
  };
</script>

<style scoped>
  button.v-btn {
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
