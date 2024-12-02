<script setup lang="ts">
  import { ref, watch } from "vue";
  import { useRouter } from "vue-router";
  import axios, { AxiosError, type AxiosResponse } from "axios";
  import { BACKEND_BASE_URL } from "../backend/common";

  const router = useRouter();

  const form = ref<boolean>(false);
  const email = ref<string>("");
  const password = ref<string>("");
  const errorMessage = ref<string>("");
  const snackbarNetworkErrorVisible = ref<boolean>(false);
  const snackbarRegistrationFailedVisible = ref<boolean>(false);
  const showPass = ref<boolean>(false);

  watch(email, () => {
    errorMessage.value = "";
  });

  const onResponse = (response: AxiosResponse) => {
    if (response.status === 201) {
      router.push({ path: "/login", query: { registered: 1 } });
    }
  };

  const onError = (error: AxiosError) => {
    if (error.code === "ERR_NETWORK") {
      snackbarNetworkErrorVisible.value = true;
      return;
    } else {
      snackbarRegistrationFailedVisible.value = true;
      if (error.code === "ERR_BAD_REQUEST" && (error.response?.data as any).detail === "REGISTER_USER_ALREADY_EXISTS") {
        errorMessage.value = "A user with this email already exists.";
      } else {
        console.error(`Unknown registration error ${JSON.stringify(error, null, 2)}`);
      }
    }
  };

  const register = () => {
    console.log(BACKEND_BASE_URL + "/api/auth/register");
    axios
      .post(BACKEND_BASE_URL + "/api/auth/register", {
        email: email.value,
        password: password.value
      })
      .then(onResponse)
      .catch(onError);
  };

  const rules = {
    required: (value: string) => !!value || "required",
    minPasswordLength: (value: string) => value.length >= 3 || "minimum length of 3"
  };
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col class="mainColumn">
        <v-form v-model="form" @submit.prevent>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Register</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-text-field
                v-model="email"
                prepend-icon="mdi-email-outline"
                name="email"
                label="Email"
                type="text"
                :rules="[rules.required]"
                validation-on="blur"
                :error-messages="errorMessage"
                :error="!!errorMessage"
              />
              <v-text-field
                id="password"
                v-model="password"
                prepend-icon="mdi-lock"
                name="password"
                label="Password"
                :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[rules.required, rules.minPasswordLength]"
                :type="showPass ? 'text' : 'password'"
                @click:append="showPass = !showPass"
              />
            </v-card-text>
            <v-card-actions>
              <p class="infotext">
                If you already have an account, just
                <router-link to="/login">login</router-link>.
              </p>
              <v-spacer />
              <v-btn color="primary" type="submit" :disabled="!form" @click="register">Register</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbarNetworkErrorVisible" :timeout="2000" color="error">
      <!--<v-icon>mdi-server-network-off</v-icon>-->
      No connection to server!
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbarNetworkErrorVisible = false"> Close </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbarRegistrationFailedVisible" color="error" :timeout="2000">
      Registration failed.
      <template #actions>
        <v-btn variant="text" @click="snackbarRegistrationFailedVisible = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped lang="scss">
  .mainColumn {
    max-width: 35em;
  }

  .infotext {
    margin-left: 10px;
    margin-bottom: 5px !important;
  }
</style>
