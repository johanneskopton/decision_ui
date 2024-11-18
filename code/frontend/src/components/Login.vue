<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                prepend-icon="mdi-email-outline"
                name="email"
                label="Email"
                type="text"
                v-model="email"
                :rules="[rules.required]"
                :error-messages="errorMessages"
                :error="!!errorMessages"
              />
              <v-text-field
                id="password"
                prepend-icon="mdi-lock"
                name="password"
                label="Password"
                :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[rules.required]"
                :type="showPass ? 'text' : 'password'"
                @click:append="showPass = !showPass"
                v-model="password"
                @keyup.enter="login"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <p class="infotext">
              New here? 🤗
              <router-link to="/register">Create a free account!</router-link
              ><br />
              ..or
              <router-link to="/user/workspace">try as a guest.</router-link>
            </p>
            <v-spacer />
            <v-btn color="primary" @click="login">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-snackbar v-model="network_error_msg" :timeout="2000" color="error">
      <!--<v-icon>mdi-server-network-off</v-icon>-->
      No connection to server!
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="network_error_msg = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
      v-model="$store.state.user.register_success_msg"
      color="info"
      :timeout="2000"
    >
      Registration complete! 🎉
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="$store.state.user.register_success_msg = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
  import axios from "axios";
  export default {
    data() {
      return {
        email: "",
        password: "",
        showPass: false,
        rules: {
          required(value) {
            return !!value || "Required.";
          }
        },
        network_error_msg: false,
        errorMessages: ""
      };
    },
    created() {
      this.$store.state.user.email = false;
      this.$store.state.user.access_token = false;
    },
    methods: {
      login: function() {
        const formData = new FormData();
        formData.set("username", this.email);
        formData.set("password", this.password);
        axios
          .post(
            process.env.BACKEND_BASE_URL + "/api/auth/jwt/login",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data"
              }
            }
          )
          .then(this.onResponse)
          .catch(this.onError);
      },
      onResponse: function(response) {
        console.log(response);
        if (response.status === 200) {
          let token = response.data.access_token;
          this.$store.commit("login", { email: this.email, token });
          this.$router.push("/user/files");
        }
      },
      onError: function(error) {
        if (error.code === "ERR_NETWORK") {
          this.network_error_msg = true;
          return;
        } else if (error.code === "ERR_BAD_REQUEST") {
          if (error.response.status === 404) {
            this.errorMessages = "Wrong email or password";
            return;
          }
        }
        console.log(error);
      }
    }
  };
</script>

<style>
  .infotext {
    margin-left: 10px;
    margin-bottom: 5px !important;
  }
</style>
