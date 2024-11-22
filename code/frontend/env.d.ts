/// <reference types="vite/client" />

// vuex.d.ts
import { Store } from 'vuex'

declare module 'vue' {
  // declare your own store states
  interface State {
    count: number
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}
