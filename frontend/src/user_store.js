export default {
  state() {
    return {
      email: false,
      access_token: false,
      register_success_msg: false
    };
  },
  mutations: {
    login(state, p) {
      state.email = p.email;
      state.access_token = p.token;
    }
  }
};
