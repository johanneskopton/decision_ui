<template>
  <v-dialog v-model="nameDialog" scrollable max-width="300px" v-if="token">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        class="ma-2"
        text
        dark
        color="secondary"
        v-bind="attrs"
        v-on="on"
        @click="openDialog"
      >
        <v-icon dark>
          mdi-content-save-outline
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Model name:</v-card-title>
      <v-divider />
      <v-card-text>
        <v-text-field
          v-model="modelName"
          autofocus
          @keyup.enter="saveGraphUser()"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="grey darken-1" text @click="nameDialog = false">
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn color="primary darken-1" text @click="saveGraphUser()">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
  import axios from "axios";
  import clean_model_json from "../helper/clean_model_json";
  export default {
    data() {
      return {
        nameDialog: false,
        modelName: undefined
      };
    },
    computed: {
      token() {
        return this.$store.state.user.access_token;
      }
    },
    methods: {
      saveGraphUser() {
        if (!this.modelName) return;
        this.nameDialog = false;
        var model = this.$store.state.model.editor.save();
        model = clean_model_json(model);
        let bodyContent = {
          content: JSON.stringify(model),
          name: this.modelName,
          saved: Date.now()
        };
        axios
          .post(
            process.env.BACKEND_BASE_URL + "/api/v1/decision_model/",
            bodyContent,
            {
              headers: {
                Authorization: `Bearer ${this.token}`
              }
            }
          )
          .then(response => this.receiveResults(response))
          .catch(response => this.receiveResultsError(response));
      },
      receiveResults(response) {
        console.log(response);
        if (response.statusText === "OK") {
          this.$store.state.model.lastSaved = Date.now();
          this.$store.state.model.unsaved = false;
          this.$store.state.model.name = this.modelName;
        }
      },
      receiveResultsError(response) {
        console.log(response);
      },
      openDialog() {
        this.modelName = this.$store.state.model.name;
      }
    }
  };
</script>
