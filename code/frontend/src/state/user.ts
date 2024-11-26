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
  actions: {
    doLogin(email: string, token: string) {
      this.login = { email, token } as LoginState;
    },
    doLogout() {
      this.login = { email: "", token: "" } as LoginState;
    }
  }
});
