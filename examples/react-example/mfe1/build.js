import esbuild from 'esbuild';
import fs from 'fs';
import federationConfig from './federation.config.js';

const isDev = process.argv.includes('--dev');

console.log(` Building ${federationConfig.name} MFE with Native Federation...`);

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
 fs.mkdirSync('./dist', { recursive: true });
}

// Copy index.html to dist if it exists
if (fs.existsSync('./src/index.html')) {
 fs.copyFileSync('./src/index.html', './dist/index.html');
}

// Build each exposed module separately
const exposedModules = {};
for (const [exposeName, exposePath] of Object.entries(federationConfig.exposes)) {
 const outputPath = `./dist/${exposeName.replace('./', '')}.js`;

 await esbuild.build({
 entryPoints: [exposePath],
 bundle: true,
 platform: 'browser',
 target: 'es2020',
 format: 'esm',
 outfile: outputPath,
 sourcemap: isDev,
 minify: !isDev,
 jsx: 'automatic',
 external: Object.keys(federationConfig.shared || {}),
 loader: {
 '.jsx': 'jsx',
 '.js': 'jsx',
 '.css': 'css'
 },
 define: {
 'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
 }
 });

 exposedModules[exposeName] = `./${exposeName.replace('./', '')}.js`;
 console.log(` Built exposed module: ${exposeName} -> ${outputPath}`);
}

// Build main application if it exists
if (fs.existsSync('./src/main.jsx')) {
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
 external: Object.keys(federationConfig.shared || {}),
 loader: {
 '.jsx': 'jsx',
 '.js': 'jsx',
 '.css': 'css'
 },
 define: {
 'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
 }
 });
 console.log(' Built main application');
}

// Create federation manifest
const manifest = {
 name: federationConfig.name,
 exposes: exposedModules,
 shared: federationConfig.shared
};

fs.writeFileSync('./dist/federation-manifest.json', JSON.stringify(manifest, null, 2));

// Create remoteEntry.js
const remoteEntryContent = `
// Native Federation Remote Entry for ${federationConfig.name}
const manifest = ${JSON.stringify(manifest, null, 2)};

export const init = async () => {
 console.log('[Native Federation] Initialized ${federationConfig.name}');
 return Promise.resolve();
};

export const get = async (module) => {
 console.log('[Native Federation] Loading module:', module);

 if (!manifest.exposes[module]) {
 throw new Error(\`Module "\${module}" is not exposed by ${federationConfig.name}\`);
 }

 const moduleUrl = manifest.exposes[module];
 console.log('[Native Federation] Module URL:', moduleUrl);

 try {
 const moduleExports = await import(moduleUrl);
 console.log('[Native Federation] Module loaded successfully:', moduleExports);
 return moduleExports;
 } catch (error) {
 console.error('[Native Federation] Failed to load module:', error);
 throw error;
 }
};

// Export manifest for debugging
export { manifest };
`;

fs.writeFileSync('./dist/remoteEntry.js', remoteEntryContent);

console.log(' Build completed successfully!');
console.log(' Exposed modules:', Object.keys(federationConfig.exposes));
console.log(' Generated remoteEntry.js');