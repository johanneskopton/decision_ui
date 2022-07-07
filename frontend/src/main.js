// import 'roboto-fontface/css/roboto/roboto-fontface.css'
// import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vue from "vue";
import VueRouter from "vue-router";
import vuetify from "@/plugins/vuetify"; // path to vuetify export
import App from "./App.vue";

import { BaklavaVuePlugin } from "@baklavajs/plugin-renderer-vue";

import NodeEditor from "./NodeEditor.vue";

Vue.use(VueRouter);
Vue.use(BaklavaVuePlugin);

Vue.config.productionTip = false;
Vue.config.devtools = false;

Vue.prototype.log = console.log;

const routes = [
  {
    path: "/",
    redirect: "/modeling"
  },
  {
    path: "/modeling",
    component: NodeEditor
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
  render: h => h(App)
});
