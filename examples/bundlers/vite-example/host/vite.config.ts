// Angular + Vite + Native Federation Configuration
import { defineConfig } from 'vite';
import { angular } from '@analogjs/vite-plugin-angular';
import federationConfig from './federation.config.js';

export default defineConfig({
  plugins: [
    angular(),
    {
      name: 'native-federation',
      buildStart() {
        console.log('Building Angular with Vite + Native Federation...');
      },
      generateBundle() {
        // Create import map for host
        this.emitFile({
          type: 'asset',
          fileName: 'importmap.json',
          source: JSON.stringify({
            imports: federationConfig.remotes || {}
          }, null, 2)
        });
        
        // Create federation manifest
        this.emitFile({
          type: 'asset',
          fileName: 'federation-manifest.json',
          source: JSON.stringify({
            name: federationConfig.name,
            type: 'host',
            remotes: federationConfig.remotes || {},
            shared: federationConfig.shared || {},
            buildTool: 'vite'
          }, null, 2)
        });
      }
    }
  ],
  build: {
    target: 'es2022',
    lib: false,
    rollupOptions: {
      external: [],
      output: {
        format: 'es',
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]',
        manualChunks: {
          angular: [
            '@angular/core', 
            '@angular/common', 
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic'
          ],
          vendor: ['rxjs'],
          federation: ['@native-federation/core']
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  },
  server: {
    port: 4200,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  optimizeDeps: {
    include: [
      '@angular/core',
      '@angular/common',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      'rxjs'
    ]
  }
});