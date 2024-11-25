<script setup lang="ts">
  import { ref, watch } from "vue";
  import { useRouter } from "vue-router";
  import axios, { AxiosError, type AxiosResponse } from "axios";

  import { useUserStore } from "../state/user";

  const userStore = useUserStore();
  const router = useRouter();

  const email = ref<string>("");
  const password = ref<string>("");
  const errorMessages = ref<string>("");
  const network_error_msg = ref<boolean>(false);
  const showPass = ref<boolean>(false);

  watch(
    () => email,
    () => {
      errorMessages.value = "";
    }
  );

  const onResponse = (response: AxiosResponse) => {
    if (response.status === 201) {
      userStore.register_success_msg = true;
      router.push("/login");
    }
  };
  const onError = (error: AxiosError) => {
    if (error.code === "ERR_NETWORK") {
      network_error_msg.value = true;
      return;
    } else if (error.code === "ERR_BAD_REQUEST") {
      if (error.response && error.response.data && error.response.data.detail === "REGISTER_USER_ALREADY_EXISTS") {
        errorMessages.value = "A user with this address already exists.";
        return;
      }
    }
    console.log(error);
  };

  const register = () => {
    axios
      .post(import.meta.env.VITE_BACKEND_BASE_URL + "/api/auth/register", {
        email: email.value,
        password: password.value
      })
      .then(onResponse)
      .catch(onError);
  };

  const required = (value: string) => {
    return !!value || "required";
  };
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col class="mainColumn">
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Register</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="email"
                prepend-icon="mdi-email-outline"
                name="email"
                label="Email"
                type="text"
                :rules="[required]"
                :error-messages="errorMessages"
                :error="!!errorMessages"
              />
              <v-text-field
                id="password"
                v-model="password"
                prepend-icon="mdi-lock"
                name="password"
                label="Password"
                :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[required]"
                :type="showPass ? 'text' : 'password'"
                @click:append="showPass = !showPass"
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
      </v-col>
    </v-row>
    <v-snackbar v-model="network_error_msg" :timeout="2000" color="error">
      <!--<v-icon>mdi-server-network-off</v-icon>-->
      No connection to server!
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="network_error_msg = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style>
  div.mainColumn {
    width: 35em;
  }

  .infotext {
    margin-left: 10px;
    margin-bottom: 5px !important;
  }
</style>
