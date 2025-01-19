import { resolve } from "path";

import vue from "@vitejs/plugin-vue";
import childProcess from "child_process";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vuetify from "vite-plugin-vuetify";
import svgLoader from "vite-svg-loader";

import { normalizePath } from "vite";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const commitHash = childProcess.execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  main: {
    envDir: "config",
    build: {
      outDir: "./dist/electron/vite/main",
      lib: {
        entry: ["src/electron/main/index.ts"]
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    envDir: "config",
    build: {
      outDir: "./dist/electron/vite/preload",
      lib: {
        entry: ["src/electron/preload/index.ts"]
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    envDir: "../../config",
    root: "./src/webapp",
    build: {
      outDir: "./dist/electron/vite/renderer",
      emptyOutDir: true,
      rollupOptions: {
        input: "./src/webapp/index.html"
      }
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/")
      }
    },
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(commitHash)
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
      vuetify()
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    }
  }
});
