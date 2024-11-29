import 'vuetify/styles';

import { createVuetify } from 'vuetify'

import colors from "vuetify/util/colors";

Vue.use(Vuetify);

const opts = {
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: colors.deepPurple,
        secondary: colors.grey.darken2,
        nodes: colors.grey.darken3
      }
    }
  }
};

export default createVuetify(opts);
