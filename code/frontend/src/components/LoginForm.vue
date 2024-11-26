<script setup lang="ts">
  import { onMounted, ref, watch } from "vue";
  import { useRouter, useRoute } from "vue-router";

  import { useUserStore } from "../state/user";
  import { useModelStore } from "@/state/model";
  import { doLoginRequest } from "@/backend/authentication";

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

  const login = () => {
    doLoginRequest({
      email: email.value,
      password: password.value,
      onSuccess: (token: string) => {
        userStore.doLogin(email.value, token);
        router.push("/user/files");
      },
      onNetworkError: () => {
        snackbarNetworkErrorVisible.value = true;
      },
      onWrongCredentials: () => {
        snackbarLoginFailedVisible.value = true;
        formErrorMessage.value = "Wrong email or password";
      }
    });
  };

  const required = (value: string) => {
    return !!value || "required";
  };

  onMounted(() => userStore.doLogout());
  onMounted(() => modelStore.reset());

  const mode = import.meta.env.MODE;
  const version = import.meta.env.VITE_APP_VERSION;
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
    <div class="footer">
      {{ mode }} mode - version {{ version }}
    </div>
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

<style scoped lang="scss">
  .mainColumn {
    max-width: 35em;
  }

  .infotext {
    margin-left: 10px;
    margin-bottom: 5px !important;
  }

  .footer {
    position: absolute;
    right: 10px;
    bottom: 10px;
    font-size: 10pt;
  }
</style>
