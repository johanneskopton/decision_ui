export default {
  state() {
    return {
      email: false,
      access_token: false
    };
  },
  mutations: {
    login(state, p) {
      state.email = p.email;
      state.access_token = p.token;
    }
  }
};
