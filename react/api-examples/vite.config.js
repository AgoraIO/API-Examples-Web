import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const PREFIX = "/web-api-examples"

const genBaseUrl = (mode) => {
  switch (mode) {
    case "test":
      return `${PREFIX}/test/`
    case "test:sso":
      return `${PREFIX}/test-sso/`
    default:
      return "/"
  }
}

const genOutDir = (mode) => {
  switch (mode) {
    case "test":
      return "test"
    case "test:sso":
      return "test-sso"
    case "prod":
      return "build"
    case "prod:sso":
      return "build-sso"
    default:
      return "dist"
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: genBaseUrl(mode),
    build: {
      outDir: genOutDir(mode),
    },
    plugins: [react()],
    server: {
      host: '0.0.0.0'
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        "assets": resolve(__dirname, './assets'),
      }
    }
  }
})

