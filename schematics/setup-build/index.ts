import {
  Rule,
  Tree,
  SchematicContext
} from '@angular-devkit/schematics';

export interface Schema {
  project: string;
  buildTool?: 'esbuild' | 'angular-cli';
  skipAngularConfig?: boolean;
  verbose?: boolean;
}

export function setupBuild(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('⚙️ Setting up build configuration for Native Federation...');
    
    const buildTool = options.buildTool || 'esbuild';
    
    if (buildTool === 'esbuild') {
      setupEsbuildConfig(tree, context, options);
    } else {
      setupAngularCliConfig(tree, context, options);
    }
    
    // Update tsconfig if needed
    updateTsConfig(tree, context, options);
    
    context.logger.info('✅ Build configuration setup complete');
  };
}

function setupEsbuildConfig(tree: Tree, context: SchematicContext, options: Schema): void {
  const esbuildConfig = `import { federationConfig } from './federation.config.js';

export default {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2022',
  sourcemap: true,
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  metafile: true,
  ...federationConfig
};
`;

  tree.create('esbuild.config.js', esbuildConfig);
  context.logger.info('📄 Created esbuild.config.js');

  // Create build script helper
  const buildScript = `#!/usr/bin/env node

const esbuild = require('esbuild');
const config = require('./esbuild.config.js');

const isWatch = process.argv.includes('--watch');
const isDev = process.env.NODE_ENV === 'development';

async function build() {
  try {
    if (isWatch) {
      console.log('👀 Watching for changes...');
      const ctx = await esbuild.context(config.default);
      await ctx.watch();
    } else {
      console.log('🔨 Building...');
      await esbuild.build(config.default);
      console.log('✅ Build complete');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
`;

  tree.create('scripts/build.js', buildScript);
  context.logger.info('📄 Created build script');
}

function setupAngularCliConfig(tree: Tree, context: SchematicContext, options: Schema): void {
  if (options.skipAngularConfig) {
    context.logger.info('⏭️ Skipping Angular CLI configuration');
    return;
  }

  // Check if angular.json exists
  if (!tree.exists('angular.json')) {
    context.logger.warn('angular.json not found, skipping Angular CLI integration');
    return;
  }

  const angularJson = JSON.parse(tree.read('angular.json')!.toString());
  const projectConfig = angularJson.projects[options.project];
  
  if (!projectConfig) {
    context.logger.error(`Project ${options.project} not found in angular.json`);
    return;
  }

  // Add esbuild builder configuration
  if (projectConfig.architect && projectConfig.architect.build) {
    // Backup original builder
    projectConfig.architect['build-webpack'] = { ...projectConfig.architect.build };
    
    // Update to use custom esbuild builder
    projectConfig.architect.build = {
      "builder": "@native-federation/angular-builder:esbuild",
      "options": {
        "configFile": "esbuild.config.js",
        "outputPath": "dist",
        "sourceMap": true
      },
      "configurations": {
        "production": {
          "sourceMap": false,
          "optimization": true
        },
        "development": {
          "sourceMap": true,
          "optimization": false
        }
      }
    };
  }

  tree.overwrite('angular.json', JSON.stringify(angularJson, null, 2));
  context.logger.info('📄 Updated angular.json with esbuild builder');
}

function updateTsConfig(tree: Tree, context: SchematicContext, options: Schema): void {
  if (!tree.exists('tsconfig.json')) {
    context.logger.warn('tsconfig.json not found');
    return;
  }

  const tsConfig = JSON.parse(tree.read('tsconfig.json')!.toString());
  
  // Ensure ESM compatibility
  if (!tsConfig.compilerOptions) {
    tsConfig.compilerOptions = {};
  }

  // Update for ESM and Native Federation
  const updates = {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  };

  let hasUpdates = false;
  Object.entries(updates).forEach(([key, value]) => {
    if (tsConfig.compilerOptions[key] !== value) {
      tsConfig.compilerOptions[key] = value;
      hasUpdates = true;
    }
  });

  if (hasUpdates) {
    tree.overwrite('tsconfig.json', JSON.stringify(tsConfig, null, 2));
    context.logger.info('📄 Updated tsconfig.json for ESM compatibility');
  } else if (options.verbose) {
    context.logger.info('📄 tsconfig.json already configured correctly');
  }
}