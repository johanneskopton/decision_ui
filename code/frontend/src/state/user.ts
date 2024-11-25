import { defineStore } from "pinia";

interface UserState {
  email: string;
  access_token: string;
  register_success_msg: boolean;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    email: "",
    access_token: "",
    register_success_msg: false
  }),
  actions: {
    login(email: string, token: string) {
      this.email = email;
      this.access_token = token;
    }
  }
});
