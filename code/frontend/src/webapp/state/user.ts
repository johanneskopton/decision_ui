import { useSessionStorage, type RemovableRef } from "@vueuse/core";
import { defineStore } from "pinia";

interface LoginState {
  email: string;
  token: string;
}

interface UserState {
  login: RemovableRef<LoginState>;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => {
    const login = useSessionStorage("login", { email: "", token: "" } as LoginState);

    return {
      login: login
    };
  },
  getters: {
    isLoggedIn(state) {
      return state.login.token && state.login.email;
    }
  },
  actions: {
    doLogin(email: string, token: string) {
      this.login = { email, token } as LoginState;
    },
    refreshToken(token: string) {
      this.login = { ...this.login, token };
    },
    doLogout() {
      this.login = { email: "", token: "" } as LoginState;
    }
  }
});
