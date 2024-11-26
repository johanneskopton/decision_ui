<script setup lang="ts">
  import { onMounted, ref, watch } from "vue";
  import axios, { AxiosError, type AxiosResponse } from "axios";
  import { useRouter, useRoute } from "vue-router";

  import { useUserStore } from "../state/user";
  import { useModelStore } from "@/state/model";

  const userStore = useUserStore();
  const modelStore = useModelStore();
  const router = useRouter();
  const route = useRoute();

  const form = ref<boolean>(false);
  const email = ref<string>("");
  const password = ref<string>("");
  const snackbarNetworkErrorVisible = ref<boolean>(false);
  const snackbarRegisterSuccessVisible = ref<boolean>(!!route.query.registered);
  const snackbarLoginFailedVisible = ref<boolean>(false);
  const formErrorMessage = ref<string>("");
  const showPass = ref<boolean>(false);

  watch([email, password], () => (formErrorMessage.value = ""));

  const onResponse = (response: AxiosResponse) => {
    console.log(response);
    if (response.status === 200) {
      const token = response.data.access_token;
      userStore.doLogin(email.value, token);
      router.push("/user/files");
    }
  };

  const onError = (error: AxiosError) => {
    if (error.code === "ERR_NETWORK") {
      snackbarNetworkErrorVisible.value = true;
      return;
    } else {
      snackbarLoginFailedVisible.value = true;
      if (error.code === "ERR_BAD_REQUEST" && (error.response?.data as any).detail === "LOGIN_BAD_CREDENTIALS") {
        formErrorMessage.value = "Wrong email or password";
      } else {
        console.error(`Unknown loging error: ${JSON.stringify(error, null, 2)}`);
      }
    }
  };

  const login = () => {
    const formData = new FormData();
    formData.set("username", email.value);
    formData.set("password", password.value);
    axios
      .post(import.meta.env.VITE_BACKEND_BASE_URL + "/api/auth/jwt/login", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(onResponse)
      .catch(onError);
  };

  const required = (value: string) => {
    return !!value || "required";
  };

  onMounted(() => userStore.doLogout());
  onMounted(() => modelStore.reset());
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col class="mainColumn">
        <v-form v-model="form" @submit.prevent>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-text-field
                v-model="email"
                prepend-icon="mdi-email-outline"
                name="email"
                label="Email"
                type="text"
                :rules="[required]"
                :error="!!formErrorMessage"
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
                :error-messages="formErrorMessage"
                :error="!!formErrorMessage"
                @click:append="showPass = !showPass"
                @keyup.enter="login"
              />
            </v-card-text>
            <v-card-actions>
              <p class="infotext">
                New here? 🤗
                <router-link to="/register">Create a free account!</router-link><br />
                ..or
                <router-link to="/user/workspace">try as a guest.</router-link>
              </p>
              <v-spacer />
              <v-btn color="primary" type="submit" :disabled="!form" @click="login">Login</v-btn>
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
    <v-snackbar v-model="snackbarRegisterSuccessVisible" color="info" :timeout="2000">
      Registration complete! 🎉
      <template #actions>
        <v-btn variant="text" @click="snackbarRegisterSuccessVisible = false"> Close </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbarLoginFailedVisible" color="error" :timeout="2000">
      Login failed.
      <template #actions>
        <v-btn variant="text" @click="snackbarLoginFailedVisible = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style>
  div.mainColumn {
    max-width: 35em;
  }

  .infotext {
    margin-left: 10px;
    margin-bottom: 5px !important;
  }
</style>
