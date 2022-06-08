// import 'roboto-fontface/css/roboto/roboto-fontface.css'
// import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vue from "vue";
import vuetify from "@/plugins/vuetify"; // path to vuetify export
import App from "./App.vue";

import { BaklavaVuePlugin } from "@baklavajs/plugin-renderer-vue";

Vue.use(BaklavaVuePlugin);

Vue.config.productionTip = false;
Vue.config.devtools = false;

Vue.prototype.log = console.log;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  vuetify,
  render: h => h(App)
});
