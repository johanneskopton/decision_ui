import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import childProcess from "child_process";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import legacy from "@vitejs/plugin-legacy";
import vuetify from "vite-plugin-vuetify";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// import vueDevTools from "vite-plugin-vue-devtools";

const commitHash = childProcess.execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  root: "src/webapp/",
  build: {
    outDir: "../../dist/webapp",
    emptyOutDir: true,
    rollupOptions: {
      input: "./src/webapp/index.html"
    },
  },
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
  plugins: [
    vue(),
    vueJsx(),
    nodePolyfills(),
    vuetify(),
    legacy({
      targets: ["defaults", "not IE 11"]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/webapp", import.meta.url))
    }
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(commitHash)
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  }
});
