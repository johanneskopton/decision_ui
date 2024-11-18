import Vue from "vue";
import Vuex from "vuex";
import ModelStore from "./model_store";
import UserStore from "./user_store";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    model: ModelStore,
    user: UserStore
  }
});
