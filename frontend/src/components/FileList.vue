<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-card>
        <v-toolbar color="secondary" dark>
          <!--
          <v-app-bar-nav-icon />
          -->

          <v-toolbar-title>My files</v-toolbar-title>
          <!--
          <v-spacer />

          <v-btn disabled icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>

          <v-btn disabled icon>
            <v-icon>mdi-view-module</v-icon>
          </v-btn> -->
        </v-toolbar>

        <v-list subheader two-line>
          <v-list-item
            v-for="model in models"
            :key="model.content"
            link
            @click="open(model)"
          >
            <v-list-item-avatar>
              <v-icon class="grey lighten-1" dark>
                mdi-file
              </v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title v-text="model.content" />
              <v-list-item-subtitle v-text="model.id" />
            </v-list-item-content>

            <v-list-item-action>
              <v-btn icon>
                <v-icon color="grey lighten-1">mdi-information</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
  import axios from "axios";
  export default {
    data() {
      return {
        models: []
      };
    },
    created() {
      this.query_models();
    },
    methods: {
      query_models() {
        var token = this.$store.state.user.access_token;
        axios
          .get(process.env.BACKEND_BASE_URL + "/api/v1/decision_models/", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => this.receiveResults(response))
          .catch(response => this.receiveResultsError(response));
      },
      receiveResults(response) {
        this.models = response.data;
        console.log(response);
      },
      receiveResultsError(response) {
        console.log(response);
      },
      open(model) {
        this.$store.state.model.name = model.name;
        this.$store.dispatch("initModel");
        this.$store.state.model.editor.load(JSON.parse(model.content));
        this.$router.push("/user/workspace");
      }
    }
  };
</script>

<style>
  .v-card {
    width: 60%;
    min-width: 300px;
  }
</style>
