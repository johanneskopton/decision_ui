// import 'roboto-fontface/css/roboto/roboto-fontface.css'
// import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vue from "vue";
import VueRouter from "vue-router";
import Vuex from "vuex";
import vuetify from "@/plugins/vuetify"; // path to vuetify export
import App from "./App.vue";
import ModelStore from "./model_store";

import { BaklavaVuePlugin } from "@baklavajs/plugin-renderer-vue";

import NodeEditor from "./components/NodeEditor.vue";
import ResultsDashboard from "./components/ResultsDashboard.vue";

Vue.use(VueRouter);
Vue.use(BaklavaVuePlugin);
Vue.use(Vuex);

Vue.config.productionTip = false;
Vue.config.devtools = false;

Vue.prototype.log = console.log;

const store = new Vuex.Store({
  modules: {
    model: ModelStore
  }
});

const routes = [
  {
    path: "/",
    redirect: "/modeling"
  },
  {
    path: "/modeling",
    component: NodeEditor
  },
  {
    path: "/results",
    component: ResultsDashboard
  }
];

const router = new VueRouter({
  routes, // short for `routes: routes`
  mode: "history"
});

/* eslint-disable no-new */
new Vue({
  el: "#app",
  vuetify,
  router,
  store,
  render: h => h(App)
});
