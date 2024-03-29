<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Register</v-toolbar-title>
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
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <p class="infotext">
              If you already have an account, just
              <router-link to="/login">login</router-link>.
            </p>
            <v-spacer />
            <v-btn color="primary" @click="register">Register</v-btn>
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
    watch: {
      email() {
        this.errorMessages = "";
      }
    },
    methods: {
      register: function() {
        axios
          .post(process.env.BACKEND_BASE_URL + "/api/auth/register", {
            email: this.email,
            password: this.password
          })
          .then(this.onResponse)
          .catch(this.onError);
      },
      onResponse: function(response) {
        if (response.statusText === "Created") {
          this.$store.state.user.register_success_msg = true;
          this.$router.push("/login");
        }
      },
      onError: function(error) {
        if (error.code === "ERR_NETWORK") {
          this.network_error_msg = true;
          return;
        } else if (error.code === "ERR_BAD_REQUEST") {
          if (error.response.data.detail === "REGISTER_USER_ALREADY_EXISTS") {
            this.errorMessages = "A user with this address already exists.";
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
