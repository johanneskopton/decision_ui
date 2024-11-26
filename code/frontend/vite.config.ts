import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import childProcess from "child_process";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vuetify from "vite-plugin-vuetify";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// import vueDevTools from "vite-plugin-vue-devtools";

const commitHash = childProcess.execSync('git rev-parse --short HEAD').toString().trim();

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        secure: false,
        changeOrigin: true
      }
    }
  },
  envDir: "config",
  plugins: [vue(), vueJsx(), nodePolyfills(), vuetify()], // vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(commitHash),
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
    }
})
