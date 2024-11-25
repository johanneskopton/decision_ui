<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import axios, { AxiosError, type AxiosResponse } from "axios";
  import { useRouter } from "vue-router";

  import { useUserStore } from "../state/user";

  const userStore = useUserStore();
  const router = useRouter();

  const email = ref<string>("");
  const password = ref<string>("");
  const network_error_msg = ref<boolean>(false);
  const errorMessages = ref<string>("");
  const showPass = ref<boolean>(false);

  onMounted(() => {
    userStore.email = "";
    userStore.access_token = "";
  });

  const onResponse = (response: AxiosResponse) => {
    console.log(response);
    if (response.status === 200) {
      const token = response.data.access_token;
      userStore.login(email.value, token);
      router.push("/user/files");
    }
  };

  const onError = (error: AxiosError) => {
    if (error.code === "ERR_NETWORK") {
      network_error_msg.value = true;
      return;
    } else if (error.code === "ERR_BAD_REQUEST") {
      if (error.response?.status === 404) {
        errorMessages.value = "Wrong email or password";
        return;
      }
    }
    console.log(error);
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
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col class="mainColumn">
        <v-card class="elevation-12">
          <v-toolbar dark color="primary">
            <v-toolbar-title>Login</v-toolbar-title>
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
                @keyup.enter="login"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <p class="infotext">
              New here? 🤗
              <router-link to="/register">Create a free account!</router-link><br />
              ..or
              <router-link to="/user/workspace">try as a guest.</router-link>
            </p>
            <v-spacer />
            <v-btn color="primary" @click="login">Login</v-btn>
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
    <v-snackbar v-model="userStore.register_success_msg" color="info" :timeout="2000">
      Registration complete! 🎉
      <template v-slot:actions>
        <v-btn variant="text" @click="userStore.register_success_msg = false"> Close </v-btn>
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
