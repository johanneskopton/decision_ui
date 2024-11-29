import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import childProcess from "child_process";

import vueJsx from "@vitejs/plugin-vue-jsx";
import vuetify from "vite-plugin-vuetify";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const commitHash = childProcess.execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  main: {
    build: {
      outDir: './dist/electron/vite/main',
      lib: {
        entry: ['src/electron/main/index.ts'],
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      outDir: './dist/electron/vite/preload',
      lib: {
        entry: ['src/electron/preload/index.ts'],
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: "src",
    build: {
      outDir: './dist/electron/vite/renderer',
      emptyOutDir: true,
      rollupOptions: {
        input: "./src/index.html"
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/')
      }
    },
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(commitHash)
    },
    plugins: [vue(), vueJsx(), nodePolyfills(), vuetify()],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    }
  }
})
