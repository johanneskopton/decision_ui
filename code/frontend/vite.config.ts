import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import childProcess from "child_process";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import legacy from "@vitejs/plugin-legacy";
import vuetify from "vite-plugin-vuetify";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// import vueDevTools from "vite-plugin-vue-devtools";

const commitHash = childProcess.execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  root: "src/webapp/",
  envDir: "../../config",
  publicDir: "../../public",
  build: {
    outDir: "../../dist/webapp",
    emptyOutDir: true,
    chunkSizeWarningLimit: 4096
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
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: fileURLToPath(new URL("../../documentation", import.meta.url)),
          dest: "static"
        }
      ],
      watch: {
        reloadPageOnChange: true
      }
    }),
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
