<script setup lang="ts">
  import { useRouter } from "vue-router";
  import { doRefreshRequest } from "../backend/authentication";
  import { registerUnauthorizedInterceptor } from "../backend/interceptors";
  import { useUserStore } from "../state/user";

  const JWT_TOKEN_REFRESH_INTERVAL = 60000; // 1 minute
  let refreshTimer: NodeJS.Timeout;

  const router = useRouter();
  const userStore = useUserStore();

  registerUnauthorizedInterceptor(() => {
    userStore.doLogout();
    router.push("/login");
  });

  const refreshLoginToken = async () => {
    const userStore = useUserStore();
    if (userStore.login.token) {
      await doRefreshRequest({
        token: userStore.login.token,
        onSuccess: (token: string) => {
          userStore.refreshToken(token);
        },
        onWrongCredentials: () => {
          userStore.doLogout();
        }
      });
    }
  };

  const createLoginTokenRefreshTimer = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    refreshTimer = setInterval(refreshLoginToken, JWT_TOKEN_REFRESH_INTERVAL);
  };

  refreshLoginToken();
  createLoginTokenRefreshTimer();
</script>

<template><div v-if="false" /></template>
