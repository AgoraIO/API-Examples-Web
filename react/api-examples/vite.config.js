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
      return "build/test"
    case "test:sso":
      return "build/test-sso"
    case "prod":
      return "build/prod"
    case "prod:sso":
      return "build/prod-sso"
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

