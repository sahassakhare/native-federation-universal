import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { SetupBuildSchema } from './schema';

export function setupBuild(options: SetupBuildSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🏗️  Setting up Native Federation build configuration...');
    
    // Create federation.config.js
    const federationConfig = generateFederationConfig(options);
    tree.create('federation.config.js', federationConfig);
    
    // Update build scripts in package.json
    updatePackageJson(tree, context);
    
    // Create esbuild configuration if requested
    if (options.bundler === 'esbuild') {
      const esbuildConfig = generateEsbuildConfig(options);
      tree.create('esbuild.config.js', esbuildConfig);
    }
    
    context.logger.info('✅ Build configuration created successfully!');
    context.logger.info('📝 Next steps:');
    context.logger.info('   1. Review federation.config.js');
    context.logger.info('   2. Run "npm run build:federation" to build your application');
    
    return tree;
  };
}

function generateFederationConfig(options: SetupBuildSchema): string {
  return `import { defineConfig } from '@native-federation/core';

export default defineConfig({
  name: '${options.name || 'app'}',
  exposes: {
    // Add your exposed modules here
    // './Component': './src/components/MyComponent.js'
  },
  remotes: {
    // Add your remote applications here
    // remoteName: 'http://localhost:3001/remoteEntry.js'
  },
  shared: {
    // Add shared dependencies
    ${options.framework ? `'${options.framework}': { singleton: true },` : ''}
    // Add more shared dependencies as needed
  }
});
`;
}

function generateEsbuildConfig(options: SetupBuildSchema): string {
  return `import esbuild from 'esbuild';
import { nativeFederationPlugin } from '@native-federation/core';
import federationConfig from './federation.config.js';

esbuild.build({
  entryPoints: ['./src/index.js'],
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  plugins: [
    nativeFederationPlugin(federationConfig)
  ],
  splitting: true,
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production'
}).catch(() => process.exit(1));
`;
}

function updatePackageJson(tree: Tree, context: SchematicContext): void {
  const packageJsonPath = '/package.json';
  
  if (!tree.exists(packageJsonPath)) {
    context.logger.warn('package.json not found');
    return;
  }
  
  const content = tree.read(packageJsonPath);
  if (!content) return;
  
  const packageJson = JSON.parse(content.toString());
  
  // Add build scripts
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['build:federation'] = 'node esbuild.config.js';
  packageJson.scripts['serve:federation'] = 'npx serve dist -p 3000';
  
  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
}