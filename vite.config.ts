import path from "path"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig} from "vite"

export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd())

  return {
    root: path.resolve(__dirname, "src/frontend"),
    base: "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/frontend"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist/frontend"),
      emptyOutDir: true,
    },
  }
})