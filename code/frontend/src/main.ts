// vue
import { createApp } from 'vue'

// state management
import { createPinia } from 'pinia'

// vuetify ui components
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

const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light'
    }
  })

const pinia = createPinia();

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.use(VueExcelEditor)
app.use(hljsVuePlugin)
app.use(pinia)

app.mount("#app");
