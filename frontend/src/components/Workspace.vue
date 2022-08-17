<template>
  <div class="workspace-container">
    <v-navigation-drawer
      v-model="drawer"
      app
      class="pt-4"
      color="grey lighten-3"
      mini-variant
      permanent
    >
      <v-list flat dense nav height="100%">
        <v-list-item-group
          v-model="selectedItem"
          color="primary accent-1"
          class="d-flex flex-column"
        >
          <v-list-item to="/user/workspace/modeling" link>
            <v-list-item-icon>
              <v-icon :rotate="90">
                mdi-graph mdi-rotate-90
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              Model editor
            </v-list-item-title>
          </v-list-item>
          <v-list-item to="/user/workspace/estimates" link>
            <v-list-item-icon>
              <v-icon>
                mdi-table
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              Estimates
            </v-list-item-title>
          </v-list-item>
          <v-list-item to="/user/workspace/results" link>
            <v-list-item-icon>
              <v-icon>
                mdi-chart-histogram
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              Results dashboard
            </v-list-item-title>
          </v-list-item>
          <v-list-item to="/user/workspace/code" link>
            <v-list-item-icon>
              <v-icon>
                mdi-language-r
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              R-Code
            </v-list-item-title>
          </v-list-item>
          <v-list-item
            to="/user/files"
            class="mt-auto"
            link
            v-if="$store.state.user.access_token"
          >
            <v-list-item-icon>
              <v-icon>
                mdi-format-list-text
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              Files
            </v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <!--
      <v-avatar
        v-for="n in 6"
        :key="n"
        :color="`grey ${n === 1 ? 'darken' : 'lighten'}-1`"
        :size="n === 1 ? 36 : 20"
        class="d-block text-center mx-auto mb-9"
      />
      -->
    </v-navigation-drawer>
    <div class="main-window">
      <router-view />
      <RunButton />
    </div>
  </div>
</template>

<script>
  import RunButton from "./RunButton.vue";
  export default {
    components: { RunButton },
    created() {
      if (!this.$store.state.model.isInitialized) {
        this.$store.dispatch("initModel");
      }
    },
    data() {
      return {
        drawer: false,
        selectedItem: false
      };
    }
  };
</script>

<style>
  div.main-window {
    position: absolute;
    left: 56px;
    right: 0px;
    display: flex;
  }
  .theme--light.v-icon {
    color: #9e9e9e;
  }

  .floating_btn_group {
    position: absolute;
    bottom: 16px;
    z-index: 5;
  }

  .floating_btn_group.left {
    left: 16px;
  }

  .workspace-container {
    top: 30px;
    position: relative;
  }

  .v-navigation-drawer {
    top: 30px !important;
  }

  .v-list-item {
    flex: 0;
  }

  .v-list-item-group {
    height: calc(100% - 30px);
  }
</style>
