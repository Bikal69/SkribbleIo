import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {fileURLToPath,URL} from "url";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use '@components' as an alias for the 'src/components' directory
      '@components': fileURLToPath(new URL("./src/components",import.meta.url)),
      // You can add more aliases as needed:
      '@features': fileURLToPath(new URL("./src/features",import.meta.url)),
      '@utils': fileURLToPath(new URL("./src/utils",import.meta.url)),
    },
  },
})
