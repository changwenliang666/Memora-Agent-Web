import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    proxy: {
      '/langgraph': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData(source: string, filename: string) {
          const normalized = filename.replace(/\\/g, '/')
          if (normalized.endsWith('/styles/variables.scss') || normalized.endsWith('/styles/mixins.scss')) {
            return source
          }
          return `@use "@/styles/variables.scss" as *;\n@use "@/styles/mixins.scss" as *;\n${source}`
        },
      },
    },
  },
})
