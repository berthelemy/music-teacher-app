import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 still uses Sass @import and global functions.
        quietDeps: true,
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
        ],
      },
    },
  },
  plugins: [netlify(), tanstackStart(), viteReact()],
})

export default config
