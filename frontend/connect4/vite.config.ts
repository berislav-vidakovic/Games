import { defineConfig } from 'vite'
import path from 'path';

export default defineConfig({
  publicDir: path.resolve(__dirname, '../public'),
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, '../common'),     
    },
  },
  server: { 
    port: 5176, // frontend
    proxy: { // backend
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/websocket': {
        target: 'ws://localhost:8082',
        ws: true,
      }, 
      '/graphql': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },      
    },
  },
  base: '/connect4/'
});