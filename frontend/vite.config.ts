import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Desktop Offline requires './' relative paths. Cloud web hosts require '/' for nested SPA routing to survive page refreshes.
  base: process.env.BUILD_TARGET === 'electron' ? './' : '/',
})
