// import 'roboto-fontface/css/roboto/roboto-fontface.css'
// import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vue from "vue";
import VueRouter from "vue-router";
import vuetify from "@/plugins/vuetify"; // path to vuetify export
import App from "./App.vue";

import { BaklavaVuePlugin } from "@baklavajs/plugin-renderer-vue";

import hljs from "highlight.js/lib/core";
import r from "highlight.js/lib/languages/r";
import highlightjs from "@highlightjs/vue-plugin";
import "highlight.js/styles/github.css";
import VueExcelEditor from "vue-excel-editor";

import store from "./vuex_store";
import NodeEditor from "./components/NodeEditor.vue";
import ResultsDashboard from "./components/ResultsDashboard.vue";
import EstimatesDashboard from "./components/EstimatesDashboard.vue";
import CodeDashboard from "./components/CodeDashboard.vue";

Vue.use(VueRouter);
Vue.use(BaklavaVuePlugin);
Vue.use(VueExcelEditor);

hljs.registerLanguage("r", r);
Vue.use(highlightjs);

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
  },
  {
    path: "/estimates",
    component: EstimatesDashboard
  },
  {
    path: "/results",
    component: ResultsDashboard
  },
  {
    path: "/code",
    component: CodeDashboard
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
