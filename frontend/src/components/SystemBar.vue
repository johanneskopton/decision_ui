<template>
  <v-system-bar height="30px">
    <v-spacer />
    <v-icon v-if="token">mdi-account</v-icon>
    <v-icon v-else>mdi-account-off</v-icon>
    <span v-if="email">{{ email }}</span>
    <span v-else>guest</span>
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
