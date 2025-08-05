import esbuild from 'esbuild';
import fs from 'fs';
import federationConfig from './federation.config.js';

const isClient = process.argv.includes('--client');
const isServer = process.argv.includes('--server');
const isDev = process.argv.includes('--dev');

// If no specific target, build both
const buildClient = !isServer || isClient;
const buildServer = !isClient || isServer;

console.log(` Building ${federationConfig.name} SSR application...`);
console.log(` Client: ${buildClient ? '' : ''}`);
console.log(` Server: ${buildServer ? '' : ''}`);

// Ensure dist directories exist
if (!fs.existsSync('./dist')) {
 fs.mkdirSync('./dist', { recursive: true });
}
if (!fs.existsSync('./dist/client')) {
 fs.mkdirSync('./dist/client', { recursive: true });
}
if (!fs.existsSync('./dist/server')) {
 fs.mkdirSync('./dist/server', { recursive: true });
}

// Build client bundle
if (buildClient) {
 console.log(' Building client bundle...');

 // Copy index.html to client dist
 if (fs.existsSync('./src/index.html')) {
 fs.copyFileSync('./src/index.html', './dist/client/index.html');
 }

 await esbuild.build({
 entryPoints: ['./src/main.ts'],
 bundle: true,
 platform: 'browser',
 target: 'es2020',
 format: 'esm',
 outdir: './dist/client',
 sourcemap: isDev,
 minify: !isDev,
 loader: {
 '.html': 'text',
 '.css': 'text'
 },
 define: {
 'typeof window': '"object"'
 }
 });

 console.log(' Client bundle completed');
}

// Build server bundle
if (buildServer) {
 console.log(' Building server bundle...');

 await esbuild.build({
 entryPoints: ['./src/main.server.ts'],
 bundle: true,
 platform: 'node',
 target: 'node18',
 format: 'esm',
 outdir: './dist/server',
 sourcemap: isDev,
 minify: !isDev,
 external: ['express'],
 loader: {
 '.html': 'text',
 '.css': 'text'
 },
 define: {
 'typeof window': '"undefined"'
 }
 });

 console.log(' Server bundle completed');
}

// Create federation manifest
const manifest = {
 name: federationConfig.name,
 remotes: federationConfig.remotes,
 shared: federationConfig.shared
};

fs.writeFileSync('./dist/client/federation-manifest.json', JSON.stringify(manifest, null, 2));
fs.writeFileSync('./dist/server/federation-manifest.json', JSON.stringify(manifest, null, 2));

console.log(' SSR build completed successfully!');