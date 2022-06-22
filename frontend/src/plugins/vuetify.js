import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import colors from "vuetify/lib/util/colors";

Vue.use(Vuetify);

const opts = {
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: colors.deepPurple,
        secondary: colors.grey.darken3
      }
    }
  }
};

export default new Vuetify(opts);
