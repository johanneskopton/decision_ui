<!-- eslint-disable vue/html-indent -->
<template>
  <v-system-bar height="30px">
    <v-icon v-if="token">mdi-account</v-icon>
    <v-icon v-else>mdi-account-off</v-icon>
    <span v-if="email">{{ email }}</span>
    <span v-else>guest</span>
    <v-spacer />
    <span v-if="token" :class="{ unsaved: $store.state.model.unsaved }">
      {{ this.$store.state.model.name
      }}<span v-if="$store.state.model.unsaved && $store.state.model.name"
        >*
      </span>
    </span>
    <span v-else>
      <em>Unsaved model*</em>
    </span>
    <v-spacer />
    <router-link to="/login">
      <v-icon v-if="token">mdi-logout-variant</v-icon>
      <v-icon v-else>mdi-login-variant</v-icon>
    </router-link>
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
