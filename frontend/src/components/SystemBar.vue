<template>
  <v-system-bar height="30px">
    <v-icon v-if="token">mdi-account</v-icon>
    <v-icon v-else>mdi-account-off</v-icon>
    <span v-if="email">{{ email }}</span>
    <span v-else>guest</span>
    <v-spacer />
    {{ this.$store.state.model.name }}
    <v-spacer />
    <router-link to="/login"><v-icon>mdi-logout-variant</v-icon></router-link>
  </v-system-bar>
</template>
<script>
  export default {
    computed: {
      token() {
        return this.$store.state.user.access_token;
      },
      email() {
        return this.$store.state.user.email;
      }
    }
  };
</script>
<style lang="scss">
  .v-system-bar {
    background-color: var(--v-secondary-lighten4) !important;
  }
  .unsaved {
    font-style: italic;
  }
</style>
