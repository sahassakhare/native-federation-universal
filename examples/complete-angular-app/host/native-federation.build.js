import { build } from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import federationConfig from './federation.config.js';

const isDev = process.argv.includes('--dev');

console.log(`Building ${federationConfig.name} (Host) with Native Federation...`);

// Ensure dist directory exists
if (!existsSync('./dist')) {
  mkdirSync('./dist', { recursive: true });
}

// Copy index.html
if (existsSync('./src/index.html')) {
  copyFileSync('./src/index.html', './dist/index.html');
}

// Build the Angular application
await build({
  entryPoints: ['./src/main.ts'],
  bundle: true,
  platform: 'browser',
  target: 'es2022',
  format: 'esm',
  outdir: './dist',
  sourcemap: isDev,
  minify: !isDev,
  loader: {
    '.html': 'text',
    '.css': 'css'
  },
  external: Object.keys(federationConfig.shared || {}),
  plugins: [
    {
      name: 'native-federation-host',
      setup(build) {
        build.onEnd(async (result) => {
          if (result.errors.length === 0) {
            await generateHostAssets();
          }
        });
      }
    }
  ]
});

async function generateHostAssets() {
  // Create import map for remotes
  const importMap = {
    imports: {}
  };
  
  // Add shared dependencies to import map
  if (federationConfig.shared) {
    for (const [dep, config] of Object.entries(federationConfig.shared)) {
      importMap.imports[dep] = `/shared/${dep}.js`;
    }
  }
  
  // Add remotes to import map
  if (federationConfig.remotes) {
    for (const [name, url] of Object.entries(federationConfig.remotes)) {
      importMap.imports[name] = url;
    }
  }
  
  writeFileSync('./dist/importmap.json', JSON.stringify(importMap, null, 2));
  
  // Create federation manifest for host
  const manifest = {
    name: federationConfig.name,
    type: 'host',
    remotes: federationConfig.remotes || {},
    shared: federationConfig.shared || {}
  };
  
  writeFileSync('./dist/federation-manifest.json', JSON.stringify(manifest, null, 2));
  
  console.log('Host federation assets generated successfully');
}

console.log('Host build completed!');