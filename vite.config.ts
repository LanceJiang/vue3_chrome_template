import { fileURLToPath, URL } from 'node:url'
// import {resolve} from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        // '@': resolve(__dirname, './src')
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      sourcemap: mode === 'dev',
      outDir: 'vue3_chrome_template',
      rollupOptions: {
        input: {
          /*popup: resolve(__dirname, './popup.html'),
          options: resolve(__dirname, './options.html'),
          background: resolve(__dirname, './background.html'),*/
          popup: fileURLToPath(new URL('./popup.html', import.meta.url)),
          options: fileURLToPath(new URL('./options.html', import.meta.url)),
          background: fileURLToPath(new URL('./background.html', import.meta.url)),
        },
        output: {
          // preserveEntrySignatures: false,
          // dir: 'vue3_chrome_template',
          // preserveModules: true,
          // preserveModulesRoot: 'src',
          chunkFileNames: "js/[name].js",
          entryFileNames: "js/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
      }
    },
  }
})
