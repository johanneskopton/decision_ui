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
      <v-list dense nav>
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
        drawer: false
      };
    }
  };
</script>

<style>
  div.main-window {
    position: absolute;
    left: 56px;
    right: 0px;
  }
</style>
