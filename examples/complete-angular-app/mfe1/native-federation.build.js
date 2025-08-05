import { build } from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import federationConfig from './federation.config.js';

const isDev = process.argv.includes('--dev');

console.log(`Building ${federationConfig.name} (Remote) with Native Federation...`);

// Ensure dist directory exists
if (!existsSync('./dist')) {
  mkdirSync('./dist', { recursive: true });
}

// Copy index.html
if (existsSync('./src/index.html')) {
  copyFileSync('./src/index.html', './dist/index.html');
}

// Build the main Angular application
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
  external: Object.keys(federationConfig.shared || {})
});

// Build exposed modules
const exposedModules = {};
if (federationConfig.exposes) {
  for (const [exposedName, modulePath] of Object.entries(federationConfig.exposes)) {
    const moduleKey = exposedName.replace('./', '');
    const outfile = `./dist/exposed/${moduleKey}.js`;
    
    // Ensure exposed directory exists
    if (!existsSync('./dist/exposed')) {
      mkdirSync('./dist/exposed', { recursive: true });
    }
    
    await build({
      entryPoints: [modulePath + '.ts'],
      bundle: false, // Don't bundle to keep component separate
      platform: 'browser',
      target: 'es2022',
      format: 'esm',
      outfile,
      sourcemap: isDev,
      minify: !isDev,
      loader: {
        '.html': 'text',
        '.css': 'css'
      },
      external: Object.keys(federationConfig.shared || {})
    });
    
    exposedModules[exposedName] = `/exposed/${moduleKey}.js`;
  }
}

// Generate Native Federation remote entry
const remoteEntryContent = `
// Native Federation Remote Entry for ${federationConfig.name}
const manifest = {
  name: '${federationConfig.name}',
  exposes: ${JSON.stringify(exposedModules, null, 2)}
};

export const init = async () => {
  console.log('[Native Federation] Initialized ${federationConfig.name}');
  return Promise.resolve();
};

export const get = async (module) => {
  console.log('[Native Federation] Loading module:', module);
  
  if (!manifest.exposes[module]) {
    throw new Error(\`Module \${module} not exposed by ${federationConfig.name}\`);
  }
  
  const moduleUrl = manifest.exposes[module];
  const moduleExports = await import(moduleUrl);
  
  return moduleExports;
};

console.log('[Native Federation] Remote entry loaded for ${federationConfig.name}');
`;

writeFileSync('./dist/remoteEntry.js', remoteEntryContent);

// Create federation manifest
const manifest = {
  name: federationConfig.name,
  type: 'remote',
  exposes: exposedModules,
  shared: federationConfig.shared || {},
  remoteEntry: 'http://localhost:4201/remoteEntry.js'
};

writeFileSync('./dist/federation-manifest.json', JSON.stringify(manifest, null, 2));

console.log('Remote federation assets generated successfully');
console.log('Exposed modules:', Object.keys(federationConfig.exposes || {}));
console.log('Remote build completed!');