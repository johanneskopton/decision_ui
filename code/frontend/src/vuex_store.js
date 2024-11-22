import { createStore } from "vuex";

import ModelStore from "./model_store";
import UserStore from "./user_store";

export default createStore({
  modules: {
    model: ModelStore,
    user: UserStore
  }
});
