import { customRef } from "vue";

/**
 * Return a reactive object that does not accept any new values and always returns null.
 *
 * This can be used for example for v-model attributes in case the component is not supposed to be reactive at all.
 * An example is the vuetify v-btn-toggle, in case it is only used for display purposes but is not supposed to remember
 * any selection.
 *
 * @returns the ref
 */
export const getAlwaysNullRef = () =>
  customRef<any>((track, trigger) => {
    return {
      get: () => {
        track();
        return null;
      },
      set: () => {
        trigger();
        return;
      }
    };
  });
