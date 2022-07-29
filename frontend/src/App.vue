<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      class="pt-4"
      color="grey lighten-3"
      mini-variant
      permanent
    >
      <v-list flat dense nav>
        <v-list-item-group v-model="selectedItem" color="primary accent-1">
          <v-list-item to="/modeling" link>
            <v-list-item-icon>
              <v-icon :rotate="90">
                mdi-graph mdi-rotate-90
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              Model editor
            </v-list-item-title>
          </v-list-item>
          <v-list-item to="/estimates" link>
            <v-list-item-icon>
              <v-icon>
                mdi-table
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              Estimates
            </v-list-item-title>
          </v-list-item>
          <v-list-item to="/results" link>
            <v-list-item-icon>
              <v-icon>
                mdi-chart-histogram
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              Results dashboard
            </v-list-item-title>
          </v-list-item>
          <v-list-item to="/code" link>
            <v-list-item-icon>
              <v-icon>
                mdi-language-r
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              R-Code
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
    </div>
  </v-app>
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        drawer: false,
        selectedItem: false
      };
    }
  };
</script>

<style>
  @import url("https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900");
  @import url("https://fonts.googleapis.com/css?family=Roboto+Mono:400");
  @import url("https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css");

  body {
    margin: 0;
    font-family: Roboto !important;
  }

  div.main-window {
    position: absolute;
    left: 56px;
    right: 0px;
    display: flex;
  }
  .theme--light.v-icon {
    color: #9e9e9e;
  }
</style>
