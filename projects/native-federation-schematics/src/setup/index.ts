import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { SetupSchema } from './schema';

export function setup(options: SetupSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Setting up Native Federation for Angular project...');

    // Check if this is an Angular project
    const isAngularProject = tree.exists('angular.json');
    
    if (isAngularProject) {
      setupAngularProject(tree, context, options);
    } else {
      setupVanillaProject(tree, context, options);
    }

    return tree;
  };
}

function setupAngularProject(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  // Create federation.config.js
  const federationConfig = createFederationConfig(options);
  tree.create('federation.config.js', federationConfig);
  context.logger.info(' Created federation.config.js');

  // Detect Angular's build system and setup accordingly
  const buildSystem = detectAngularBuildSystem(tree);
  context.logger.info(` Detected build system: ${buildSystem}`);

  switch (buildSystem) {
    case 'esbuild':
      setupAngularEsbuild(tree, context, options);
      break;
    case 'webpack':
      setupAngularWebpack(tree, context, options);
      break;
    case 'vite':
      setupAngularVite(tree, context, options);
      break;
    default:
      // Fallback to esbuild (Angular 17+ default)
      setupAngularEsbuild(tree, context, options);
      context.logger.warn(' Unknown build system, using esbuild setup');
  }

  // Update package.json for Angular project
  updateAngularPackageJson(tree, context, options, buildSystem);

  // Create Angular-specific sample files if requested
  if (options.createSamples) {
    createAngularSampleFiles(tree, context, options);
  }

  context.logger.info('\\n Native Federation setup complete for Angular!');
  context.logger.info('\\nNext steps:');
  context.logger.info('1. Install dependencies: npm install');
  context.logger.info('2. Build your project: ng build');
  context.logger.info('3. Serve your project: ng serve');
}

function setupVanillaProject(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  // Create federation.config.js
  const federationConfig = createFederationConfig(options);
  tree.create('federation.config.js', federationConfig);
  context.logger.info(' Created federation.config.js');

  // Create esbuild configuration for vanilla projects
  const esbuildConfig = createEsbuildConfig(options);
  tree.create('build.js', esbuildConfig);
  context.logger.info(' Created build.js');

  // Create simple server
  const serverConfig = createServerConfig(options);
  tree.create('server.js', serverConfig);
  context.logger.info(' Created server.js');

  // Update package.json for vanilla project
  if (!options.skipPackageJson) {
    updatePackageJson(tree, context, options);
  }

  // Create vanilla sample files if requested
  if (options.createSamples) {
    createSampleFiles(tree, context, options);
  }

  context.logger.info('\\n Native Federation setup complete!');
  context.logger.info('\\nNext steps:');
  context.logger.info('1. Install dependencies: npm install');
  context.logger.info('2. Build your project: npm run build');
  context.logger.info('3. Serve your project: npm run serve');
}

function createFederationConfig(options: SetupSchema): string {
  const config = {
    name: options.name,
    ...(options.type === 'host' && {
      remotes: {
        // Add your remotes here
      }
    }),
    ...(options.type === 'remote' && {
      exposes: {
        './Module': './src/bootstrap.js'
      }
    }),
    shared: {
      // Add shared dependencies here
    }
  };

  return `// Native Federation Configuration
const config = ${JSON.stringify(config, null, 2)};

export default config;
`;
}

function createEsbuildConfig(options: SetupSchema): string {
  return `// Build script for Native Federation
import esbuild from 'esbuild';
import fs from 'fs';
import federationConfig from './federation.config.js';

const isDev = process.argv.includes('--dev');

console.log(\` Building \${federationConfig.name} with Native Federation...\`);

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Copy index.html to dist
if (fs.existsSync('./src/index.html')) {
  fs.copyFileSync('./src/index.html', './dist/index.html');
} else if (fs.existsSync('./index.html')) {
  fs.copyFileSync('./index.html', './dist/index.html');
}

// Build main application
await esbuild.build({
  entryPoints: ['./src/main.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  outdir: './dist',
  sourcemap: isDev,
  minify: !isDev,
  loader: {
    '.html': 'text',
    '.css': 'text'
  }
});

${options.type === 'remote' ? `
// Build exposed modules
const exposedModules = {};
if (federationConfig.exposes) {
  for (const [exposedName, modulePath] of Object.entries(federationConfig.exposes)) {
    const moduleKey = exposedName.replace('./', '');
    const outfile = \`./dist/exposed/\${moduleKey}.js\`;
    
    // Ensure exposed directory exists
    if (!fs.existsSync('./dist/exposed')) {
      fs.mkdirSync('./dist/exposed', { recursive: true });
    }
    
    await esbuild.build({
      entryPoints: [modulePath],
      bundle: true,
      platform: 'browser',
      target: 'es2020',
      format: 'esm',
      outfile,
      sourcemap: isDev,
      minify: !isDev,
      loader: {
        '.html': 'text',
        '.css': 'text'
      }
    });
    
    exposedModules[exposedName] = \`/exposed/\${moduleKey}.js\`;
  }
}

// Generate Native Federation remote entry
const remoteEntryContent = \`
// Native Federation Remote Entry for \${federationConfig.name}
const manifest = {
  name: '\${federationConfig.name}',
  exposes: \${JSON.stringify(exposedModules, null, 2)}
};

export const init = async () => {
  console.log('[Native Federation] Initialized \${federationConfig.name}');
};

export const get = async (module) => {
  console.log('[Native Federation] Loading module:', module);
  
  if (!manifest.exposes[module]) {
    throw new Error(\\\`Module \\\${module} not exposed by \${federationConfig.name}\\\`);
  }
  
  const moduleUrl = manifest.exposes[module];
  const moduleExports = await import(moduleUrl);
  
  return moduleExports;
};

console.log('[Native Federation] Remote entry loaded for \${federationConfig.name}');
\`;

fs.writeFileSync('./dist/remoteEntry.js', remoteEntryContent);

// Create federation manifest
const manifest = {
  name: federationConfig.name,
  exposes: exposedModules,
  remoteEntry: 'http://localhost:${options.port || 3000}/remoteEntry.js'
};

fs.writeFileSync('./dist/federation-manifest.json', JSON.stringify(manifest, null, 2));
` : ''}

console.log('Build completed successfully!');
${options.type === 'remote' ? "console.log('Exposed modules:', Object.keys(federationConfig.exposes || {}));" : ''}
`;
}

function createServerConfig(options: SetupSchema): string {
  return `// Simple HTTP server for Native Federation
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = ${options.port || 3000};
const DIST_DIR = join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  if (!existsSync(filePath)) {
    filePath = join(DIST_DIR, 'index.html'); // SPA fallback
  }

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const mimeType = mimeTypes[ext] || 'text/plain';
    
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(\` \${process.env.npm_package_name || '${options.name}'} server running at http://127.0.0.1:\${PORT}\`);
  console.log(\`    Serving from: \${DIST_DIR}\`);
  console.log('Press Ctrl+C to stop the server');
});

process.on('SIGINT', () => {
  console.log('\\nStopping server...');
  server.close();
  process.exit(0);
});
`;
}

// Build system detection and setup functions
function detectAngularBuildSystem(tree: Tree): string {
  const angularJsonPath = 'angular.json';
  if (!tree.exists(angularJsonPath)) {
    return 'esbuild'; // Default for new projects
  }

  const angularJsonContent = tree.read(angularJsonPath)?.toString() || '{}';
  const angularJson = JSON.parse(angularJsonContent);
  
  // Find the default project
  const defaultProject = angularJson.defaultProject || Object.keys(angularJson.projects)[0];
  const project = angularJson.projects[defaultProject];
  
  if (project?.architect?.build?.builder) {
    const builder = project.architect.build.builder;
    
    // Check for various builders
    if (builder.includes('webpack') || builder.includes('custom-webpack')) {
      return 'webpack';
    } else if (builder.includes('vite') || builder.includes('@analogjs/vite')) {
      return 'vite';
    } else if (builder.includes('esbuild') || builder === '@angular-devkit/build-angular:browser') {
      // Default builder in Angular 17+ uses esbuild
      return 'esbuild';
    }
  }
  
  return 'esbuild'; // Default fallback
}

function setupAngularEsbuild(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  // Create esbuild plugin for Native Federation
  const esbuildPlugin = createAngularEsbuildPlugin(options);
  tree.create('federation.esbuild.js', esbuildPlugin);
  context.logger.info(' Created esbuild plugin for Native Federation');

  // Create build hooks
  const buildHooks = createAngularBuildHooks(options);
  tree.create('build-hooks.js', buildHooks);
  context.logger.info(' Created build hooks for Angular + esbuild');
}

function setupAngularWebpack(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  // Update angular.json to use custom webpack
  updateAngularJsonForWebpack(tree, context, options);

  // Create webpack.config.js for Native Federation integration
  const webpackConfig = createAngularWebpackConfig(options);
  tree.create('webpack.config.js', webpackConfig);
  context.logger.info(' Created webpack.config.js for Angular integration');
}

function setupAngularVite(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  // Create vite config for Native Federation
  const viteConfig = createAngularViteConfig(options);
  tree.create('vite.config.ts', viteConfig);
  context.logger.info(' Created vite.config.ts for Angular integration');

  // Update angular.json for Vite (if using @analogjs/vite-plugin-angular)
  updateAngularJsonForVite(tree, context, options);
}

// Angular-specific functions
function updateAngularJsonForWebpack(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  const angularJsonPath = 'angular.json';
  if (!tree.exists(angularJsonPath)) {
    context.logger.warn('angular.json not found. Make sure this is an Angular project.');
    return;
  }

  const angularJsonContent = tree.read(angularJsonPath)?.toString() || '{}';
  const angularJson = JSON.parse(angularJsonContent);
  
  // Find the default project
  const defaultProject = angularJson.defaultProject || Object.keys(angularJson.projects)[0];
  const project = angularJson.projects[defaultProject];
  
  if (project && project.architect && project.architect.build) {
    // Add custom webpack configuration to the Angular build
    project.architect.build.builder = '@angular-builders/custom-webpack:browser';
    project.architect.build.options = {
      ...project.architect.build.options,
      customWebpackConfig: {
        path: './webpack.config.js',
        mergeStrategies: {
          externals: 'replace'
        }
      }
    };
    
    // Update serve architect to use custom webpack
    if (project.architect.serve) {
      project.architect.serve.builder = '@angular-builders/custom-webpack:dev-server';
    }
  }
  
  tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  context.logger.info(' Updated angular.json for webpack + Native Federation');
}

function updateAngularJsonForVite(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  const angularJsonPath = 'angular.json';
  if (!tree.exists(angularJsonPath)) {
    return; // Vite projects might not use angular.json
  }

  const angularJsonContent = tree.read(angularJsonPath)?.toString() || '{}';
  const angularJson = JSON.parse(angularJsonContent);
  
  // Find the default project
  const defaultProject = angularJson.defaultProject || Object.keys(angularJson.projects)[0];
  const project = angularJson.projects[defaultProject];
  
  if (project && project.architect && project.architect.build) {
    // Use Vite builder if available
    if (project.architect.build.builder !== '@analogjs/vite-plugin-angular:build') {
      context.logger.info(' Note: Consider using @analogjs/vite-plugin-angular for better Vite integration');
    }
  }
  
  tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  context.logger.info(' Updated angular.json for Vite + Native Federation');
}

function createAngularEsbuildPlugin(options: SetupSchema): string {
  return `// Angular + esbuild + Native Federation Plugin
import { build } from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import federationConfig from './federation.config.js';

export async function buildWithNativeFederation() {
  console.log('Building Angular with Native Federation (esbuild)...');
  
  // Ensure dist directory exists
  if (!existsSync('./dist')) {
    mkdirSync('./dist', { recursive: true });
  }

  // Build main application
  await build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    platform: 'browser',
    target: 'es2022',
    format: 'esm',
    outdir: './dist',
    sourcemap: true,
    minify: process.env['NODE_ENV'] === 'production',
    loader: {
      '.html': 'text',
      '.css': 'css'
    },
    external: ['@angular/*'], // Keep Angular as external for federation
    plugins: [
      {
        name: 'native-federation',
        setup(build) {
          // Custom plugin logic for Native Federation
          build.onEnd(async (result) => {
            if (result.errors.length === 0) {
              await generateFederationAssets();
            }
          });
        }
      }
    ]
  });

  console.log('Angular build completed with Native Federation');
}

async function generateFederationAssets() {
  ${options.type === 'remote' ? `
  // Generate remote entry for federation
  const remoteEntryContent = \`
  // Native Federation Remote Entry for \${federationConfig.name}
  export const init = async () => {
    console.log('[Native Federation] Initialized \${federationConfig.name}');
  };

  export const get = async (module) => {
    console.log('[Native Federation] Loading module:', module);
    
    const moduleMap = {
      './Component': () => import('./main.js').then(m => m.Component)
    };
    
    if (!moduleMap[module]) {
      throw new Error(\\\`Module \\\${module} not exposed by \${federationConfig.name}\\\`);
    }
    
    return moduleMap[module]();
  };
  \`;

  writeFileSync('./dist/remoteEntry.js', remoteEntryContent);
  
  // Create federation manifest
  const manifest = {
    name: federationConfig.name,
    remoteEntry: './remoteEntry.js',
    exposes: federationConfig.exposes || {}
  };
  
  writeFileSync('./dist/federation-manifest.json', JSON.stringify(manifest, null, 2));
  ` : `
  // Host application - create importmap for remotes
  const importMap = {
    imports: {}
  };
  
  if (federationConfig.remotes) {
    for (const [name, url] of Object.entries(federationConfig.remotes)) {
      importMap.imports[name] = url;
    }
  }
  
  writeFileSync('./dist/importmap.json', JSON.stringify(importMap, null, 2));
  `}
}

if (import.meta.url === \`file://\${process.argv[1]}\`) {
  buildWithNativeFederation().catch(console.error);
}
`;
}

function createAngularBuildHooks(options: SetupSchema): string {
  return `// Angular Build Hooks for Native Federation
const { execSync } = require('child_process');

// Pre-build hook
function preBuild() {
  console.log('Pre-build: Preparing Native Federation assets...');
  // Add any pre-build logic here
}

// Post-build hook
function postBuild() {
  console.log('Post-build: Processing Native Federation assets...');
  
  try {
    // Run the Native Federation build process
    execSync('node federation.esbuild.js', { stdio: 'inherit' });
    console.log('Native Federation assets generated successfully');
  } catch (error) {
    console.error('Failed to generate Native Federation assets:', error);
    process.exit(1);
  }
}

module.exports = {
  preBuild,
  postBuild
};
`;
}

function createAngularViteConfig(options: SetupSchema): string {
  return `// Angular + Vite + Native Federation Configuration
import { defineConfig } from 'vite';
import { angular } from '@analogjs/vite-plugin-angular';
import federationConfig from './federation.config.js';

export default defineConfig({
  plugins: [
    angular(),
    {
      name: 'native-federation',
      buildStart() {
        console.log('Building Angular with Native Federation (Vite)...');
      },
      generateBundle() {
        // Generate federation assets
        ${options.type === 'remote' ? `
        // Create remote entry
        this.emitFile({
          type: 'asset',
          fileName: 'remoteEntry.js',
          source: \`
            export const init = async () => {
              console.log('[Native Federation] Initialized \${federationConfig.name}');
            };
            
            export const get = async (module) => {
              const moduleMap = {
                './Component': () => import('./main.js').then(m => m.Component)
              };
              
              if (!moduleMap[module]) {
                throw new Error(\\\`Module \\\${module} not exposed\\\`);
              }
              
              return moduleMap[module]();
            };
          \`
        });
        ` : `
        // Create import map for host
        this.emitFile({
          type: 'asset',
          fileName: 'importmap.json',
          source: JSON.stringify({
            imports: federationConfig.remotes || {}
          }, null, 2)
        });
        `}
      }
    }
  ],
  build: {
    target: 'es2022',
    lib: ${options.type === 'remote' ? 'true' : 'false'},
    rollupOptions: {
      external: ['@angular/core', '@angular/common', '@angular/platform-browser'],
      output: {
        format: 'es'
      }
    }
  },
  server: {
    port: ${options.port || 4200},
    cors: true
  }
});
`;
}

function createAngularWebpackConfig(options: SetupSchema): string {
  return `// Angular + Native Federation Webpack Configuration
const { NativeFederationPlugin } = require('@native-federation/core');
const federationConfig = require('./federation.config.js');

module.exports = {
  plugins: [
    new NativeFederationPlugin(federationConfig)
  ],
  optimization: {
    runtimeChunk: false,
    splitChunks: false
  },
  experiments: {
    outputModule: true
  }
};
`;
}

function updateAngularPackageJson(tree: Tree, context: SchematicContext, options: SetupSchema, buildSystem: string): void {
  const packageJsonPath = 'package.json';
  
  if (!tree.exists(packageJsonPath)) {
    context.logger.warn('package.json not found');
    return;
  }

  const packageJsonContent = tree.read(packageJsonPath)?.toString() || '{}';
  const packageJson = JSON.parse(packageJsonContent);
  
  // Add Native Federation dependencies
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies['@native-federation/core'] = '^18.0.0';
  
  // Add build system specific dependencies
  packageJson.devDependencies = packageJson.devDependencies || {};
  
  switch (buildSystem) {
    case 'webpack':
      packageJson.devDependencies['@angular-builders/custom-webpack'] = '^18.0.0';
      break;
    case 'esbuild':
      packageJson.devDependencies['esbuild'] = '^0.20.0';
      // Add build script for esbuild
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['build:federation'] = 'node federation.esbuild.js';
      packageJson.scripts['postbuild'] = 'node build-hooks.js';
      break;
    case 'vite':
      packageJson.devDependencies['vite'] = '^5.0.0';
      packageJson.devDependencies['@analogjs/vite-plugin-angular'] = '^1.0.0';
      break;
  }
  
  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  context.logger.info(` Updated package.json with Native Federation dependencies for ${buildSystem}`);
}

function createAngularSampleFiles(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  if (options.type === 'host') {
    // Create federation loader service
    const loaderService = createAngularFederationService();
    tree.create('src/app/federation-loader.service.ts', loaderService);
    
    // Create sample component that loads federated modules
    const sampleComponent = createAngularHostComponent();
    tree.create('src/app/federated-component/federated-component.component.ts', sampleComponent);
  } else if (options.type === 'remote') {
    // Create standalone component for federation
    const remoteComponent = createAngularRemoteComponent(options);
    tree.create('src/app/remote/remote.component.ts', remoteComponent);
    
    // Update main.ts for remote entry
    const remoteMain = createAngularRemoteMain();
    tree.overwrite('src/main.ts', remoteMain);
  }
  
  context.logger.info(' Created Angular sample files');
}

function createAngularFederationService(): string {
  return `import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FederationLoaderService {

  async loadRemoteModule(remoteName: string, moduleName: string): Promise<any> {
    try {
      // Load remote entry
      const remoteUrl = this.getRemoteUrl(remoteName);
      const remoteEntry = await import(remoteUrl);
      
      // Initialize remote
      await remoteEntry.init();
      
      // Get the module
      const module = await remoteEntry.get(moduleName);
      return module;
    } catch (error) {
      console.error(\`Failed to load remote module \${remoteName}/\${moduleName}:\`, error);
      throw error;
    }
  }

  private getRemoteUrl(remoteName: string): string {
    // Configure your remote URLs here
    const remoteUrls: { [key: string]: string } = {
      'mfe1': 'http://localhost:4201/remoteEntry.js',
      'mfe2': 'http://localhost:4202/remoteEntry.js'
    };
    
    return remoteUrls[remoteName] || '';
  }
}`;
}

function createAngularHostComponent(): string {
  return `import { Component, OnInit, ViewChild, ViewContainerRef, ComponentRef, inject } from '@angular/core';
import { FederationLoaderService } from '../federation-loader.service';

@Component({
  selector: 'app-federated-component',
  standalone: true,
  template: \`
    <div class="federated-container">
      <h2>Federated Component Loader</h2>
      <div #federatedContent></div>
      <button (click)="loadFederatedComponent()">Load Remote Component</button>
    </div>
  \`,
  styles: [\`
    .federated-container {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 10px 0;
    }
  \`]
})
export class FederatedComponentComponent implements OnInit {
  @ViewChild('federatedContent', { read: ViewContainerRef }) 
  federatedContent!: ViewContainerRef;
  
  private federationLoader = inject(FederationLoaderService);
  private componentRef: ComponentRef<any> | null = null;

  ngOnInit() {
    console.log('Federated component initialized');
  }

  async loadFederatedComponent() {
    try {
      // Load remote component
      const remoteModule = await this.federationLoader.loadRemoteModule('mfe1', './Component');
      
      // Clear previous component
      if (this.componentRef) {
        this.componentRef.destroy();
      }
      
      // Create new component
      this.federatedContent.clear();
      this.componentRef = this.federatedContent.createComponent(remoteModule.default);
      
      console.log('Remote component loaded successfully');
    } catch (error) {
      console.error('Failed to load federated component:', error);
    }
  }
}`;
}

function createAngularRemoteComponent(options: SetupSchema): string {
  return `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-remote',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="remote-component">
      <h3>Remote Component: ${options.name}</h3>
      <p>This component is federated from ${options.name}</p>
      <div class="feature-demo">
        <h4>Features:</h4>
        <ul>
          <li>Standalone Angular component</li>
          <li>Native Federation integration</li>
          <li>Hot reloadable</li>
        </ul>
      </div>
    </div>
  \`,
  styles: [\`
    .remote-component {
      padding: 20px;
      background: #f0f8ff;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }
    
    .feature-demo {
      margin-top: 15px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
  \`]
})
export class RemoteComponent {
  constructor() {
    console.log('Remote component from ${options.name} initialized');
  }
}

// Export for federation
export default RemoteComponent;`;
}

function createAngularRemoteMain(): string {
  return `import { bootstrapApplication } from '@angular/platform-browser';
import { RemoteComponent } from './app/remote/remote.component';

// Bootstrap for standalone usage
bootstrapApplication(RemoteComponent)
  .catch(err => console.error(err));

// Export for federation
export { RemoteComponent as Component };`;
}

// Vanilla project functions (keep existing)
function updatePackageJson(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  const packageJsonPath = 'package.json';
  
  if (!tree.exists(packageJsonPath)) {
    // Create new package.json
    const packageJson = {
      name: options.name,
      version: '1.0.0',
      type: 'module',
      scripts: {
        build: 'NODE_ENV=production node build.js',
        'build:dev': 'node build.js',
        serve: 'node server.js',
        dev: 'npm run build && npm run serve',
        start: 'npm run dev'
      },
      devDependencies: {
        'esbuild': '^0.20.0'
      }
    };
    tree.create(packageJsonPath, JSON.stringify(packageJson, null, 2));
    context.logger.info(' Created package.json');
  } else {
    // Update existing package.json
    const packageJsonContent = tree.read(packageJsonPath)?.toString() || '{}';
    const packageJson = JSON.parse(packageJsonContent);
    
    // Add scripts
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.build = 'NODE_ENV=production node build.js';
    packageJson.scripts['build:dev'] = 'node build.js';
    packageJson.scripts.serve = 'node server.js';
    packageJson.scripts.dev = 'npm run build && npm run serve';
    packageJson.scripts.start = 'npm run dev';
    
    // Add dependencies
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies['esbuild'] = '^0.20.0';
    
    // Ensure ES modules
    packageJson.type = 'module';
    
    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    context.logger.info(' Updated package.json');
  }
}

function createSampleFiles(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  // Create src directory
  if (!tree.exists('src')) {
    tree.create('src/.gitkeep', '');
  }

  // Create main.js
  const mainJs = options.type === 'host' ? createHostMainJs() : createRemoteMainJs();
  tree.create('src/main.js', mainJs);
  
  // Create index.html
  const indexHtml = createIndexHtml(options);
  tree.create('index.html', indexHtml);

  if (options.type === 'remote') {
    tree.create('src/bootstrap.js', createBootstrapJs());
  }

  context.logger.info(' Created sample files');
}

function createHostMainJs(): string {
  return `// Host Application Entry Point
import { initFederation, loadRemoteModule } from '@native-federation/core';

async function bootstrap() {
  // Initialize federation
  await initFederation();
  
  // Example: Load a remote module
  // const remoteModule = await loadRemoteModule('remoteName', './Module');
  
  console.log('Host application initialized');
  
  // Your application logic here
}

bootstrap().catch(console.error);
`;
}

function createRemoteMainJs(): string {
  return `// Remote Application Entry Point
import('./bootstrap.js').catch(console.error);
`;
}

function createBootstrapJs(): string {
  return `// Remote Bootstrap
console.log('Remote application initialized');

// Export your module
export default {
  mount: (element) => {
    element.innerHTML = '<h1>Hello from Remote!</h1>';
  },
  unmount: (element) => {
    element.innerHTML = '';
  }
};
`;
}

function createIndexHtml(options: SetupSchema): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.name}</title>
</head>
<body>
    <div id="app">
        <h1>${options.name}</h1>
        <p>Native Federation ${options.type} application</p>
    </div>
    <script type="module" src="./dist/main.js"></script>
</body>
</html>
`;
}