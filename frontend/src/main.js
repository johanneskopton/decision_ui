// import 'roboto-fontface/css/roboto/roboto-fontface.css'
// import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vue from "vue";
import VueRouter from "vue-router";
import vuetify from "@/plugins/vuetify"; // path to vuetify export
import App from "./App.vue";
import router from "./router";

import { BaklavaVuePlugin } from "@baklavajs/plugin-renderer-vue";

import hljs from "highlight.js/lib/core";
import r from "highlight.js/lib/languages/r";
import highlightjs from "@highlightjs/vue-plugin";
import "highlight.js/styles/github.css";
import VueExcelEditor from "vue-excel-editor";

import store from "./vuex_store";

Vue.use(VueRouter);
Vue.use(BaklavaVuePlugin);
Vue.use(VueExcelEditor);

hljs.registerLanguage("r", r);
Vue.use(highlightjs);

Vue.config.productionTip = false;
Vue.config.devtools = false;

Vue.prototype.log = console.log;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  vuetify,
  router,
  store,
  render: h => h(App)
});
