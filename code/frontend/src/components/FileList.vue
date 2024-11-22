<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-card class="filelist">
        <v-toolbar color="primary" dark>
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

        <v-list lines="two">
          <v-list-item
            v-for="model in models"
            :key="model.saved"
            link
            @click="open(model)"
          >
            <v-avatar>
              <v-icon class="bg-grey-lighten-1 dark">
                mdi-file
              </v-icon>
            </v-avatar>

            
              <v-list-item-title v-text="model.name" />
              <v-list-item-subtitle v-text="nodeCount(model.content)" />
            
            <v-list-item-action>
              <v-btn icon @click.stop="deleteModel(model)">
                <v-icon color="grey-lighten-1">mdi-close-circle</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item v-if="models.length == 0">
            No models yet! Click on the
            <v-icon light>
              mdi-file-plus
            </v-icon>
            button below to create your first!
          </v-list-item>
        </v-list>
      </v-card>
    </v-row>
    <Confirm ref="confirmDelete" />
  </v-container>
</template>

<script>
  import axios from "axios";
  import Confirm from "./Confirm.vue";

  export default {
    components: { Confirm },
    data() {
      return {
        models: []
      };
    },
    created() {
      this.query_models();
    },
    methods: {
      nodeCount(content) {
        return String(JSON.parse(content).nodes.length) + " nodes";
      },
      query_models() {
        const token = this.$store.state.user.access_token;
        axios
          .get(import.meta.env.VITE_BACKEND_BASE_URL + "/api/v1/decision_models/", {
            headers: {
              [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${token}`
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
        this.$store.dispatch("initModel");
        this.$store.state.model.name = model.name;
        this.$store.state.model.editor.load(JSON.parse(model.content));
        this.$router.push("/user/workspace");
      },
      deleteModel(model) {
        this.$refs.confirmDelete
          .open(
            "Delete",
            "Are you sure you want to delete <code>" + model.name + "</code>?",
            { color: "warning" }
          )
          .then(confirm => {
            if (confirm) {
              const token = this.$store.state.user.access_token;
              axios
                .delete(
                    "/api/v1/decision_models/" +
                    model.id,
                  {
                    headers: {
                      [import.meta.env.VITE_BACKEND_AUTH_HEADER]: `Bearer ${token}`
                    }
                  }
                )
                .then(this.query_models)
                .catch(response => this.receiveResultsError(response));
            }
          });
      }
    }
  };
</script>

<style>
  .v-card.filelist {
    width: 60%;
    min-width: 300px;
  }
</style>
