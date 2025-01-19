import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

import childProcess from "child_process";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import legacy from "@vitejs/plugin-legacy";
import vuetify from "vite-plugin-vuetify";
import svgLoader from "vite-svg-loader";

import { defineConfig, normalizePath } from "vite";
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
          src: normalizePath(resolve(__dirname, "../../documentation")),
          dest: "static"
        }
      ],
      watch: {
        reloadPageOnChange: true
      }
    }),
    vue(),
    svgLoader(),
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
