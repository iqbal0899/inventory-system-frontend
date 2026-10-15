import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const renameTerminalPlugin = () => ({
  name: 'rename-terminal',
  configResolved() {
    process.title = 'inventory management system'; // Ganti nama sesuai keinginan Anda
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), renameTerminalPlugin()],

  server: {
    port: 4000,
    strictPort: true,
  }
})
