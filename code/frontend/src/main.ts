// vue
import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// code highlighting
import hljsVuePlugin from "@highlightjs/vue-plugin";

// excel editor
import VueExcelEditor from 'vue3-excel-editor';

// local 
import App from "./App.vue";
import router from "./router";
import store from "./vuex_store";

const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light'
    }
  })

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.use(VueExcelEditor)
app.use(hljsVuePlugin)
app.use(store)

app.mount("#app");
