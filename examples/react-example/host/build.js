import esbuild from 'esbuild';
import fs from 'fs';
import federationConfig from './federation.config.js';

const isDev = process.argv.includes('--dev');

console.log(` Building ${federationConfig.name} with Native Federation...`);

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
 fs.mkdirSync('./dist', { recursive: true });
}

// Copy index.html to dist
if (fs.existsSync('./src/index.html')) {
 fs.copyFileSync('./src/index.html', './dist/index.html');
}

// Build main application
await esbuild.build({
 entryPoints: ['./src/main.jsx'],
 bundle: true,
 platform: 'browser',
 target: 'es2020',
 format: 'esm',
 outdir: './dist',
 sourcemap: isDev,
 minify: !isDev,
 jsx: 'automatic',
 loader: {
 '.jsx': 'jsx',
 '.js': 'jsx',
 '.css': 'css'
 },
 define: {
 'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
 }
});

// Create federation manifest for host
const manifest = {
 name: federationConfig.name,
 remotes: federationConfig.remotes,
 shared: federationConfig.shared
};

fs.writeFileSync('./dist/federation-manifest.json', JSON.stringify(manifest, null, 2));

console.log(' Build completed successfully!');
console.log(' Remote connections:', Object.keys(federationConfig.remotes || {}));