import {
  Rule,
  Tree,
  SchematicContext
} from '@angular-devkit/schematics';
import { WebpackConfigAnalyzer } from '../utils/webpack-analyzer';

export interface Schema {
  project: string;
  webpackConfig?: string;
  outputPath?: string;
  verbose?: boolean;
}

export function convertConfig(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔄 Converting webpack configuration to Native Federation...');
    
    const webpackConfigPath = options.webpackConfig || 'webpack.config.js';
    const outputPath = options.outputPath || 'federation.config.ts';
    
    if (!tree.exists(webpackConfigPath)) {
      context.logger.error(`Webpack config not found at ${webpackConfigPath}`);
      return;
    }

    const configContent = tree.read(webpackConfigPath)?.toString();
    if (!configContent) {
      context.logger.error('Failed to read webpack configuration');
      return;
    }

    const analyzer = new WebpackConfigAnalyzer();
    const analysis = analyzer.analyze(configContent);
    
    if (analysis.errors.length > 0) {
      context.logger.error('Errors during webpack config analysis:');
      analysis.errors.forEach(error => context.logger.error(`  - ${error}`));
      return;
    }

    if (analysis.warnings.length > 0 && options.verbose) {
      context.logger.warn('Warnings during webpack config analysis:');
      analysis.warnings.forEach(warning => context.logger.warn(`  - ${warning}`));
    }

    const converted = analyzer.convertToNativeFederation(analysis);
    const nativeConfig = generateNativeFederationConfig(converted.federationConfig, analysis);
    
    // Create federation.config.ts
    tree.create(outputPath, nativeConfig);
    
    // Create esbuild.config.js
    const esbuildConfig = generateEsbuildConfig(converted.buildConfig);
    tree.create('esbuild.config.js', esbuildConfig);
    
    // Update package.json scripts
    updatePackageJsonScripts(tree, context);
    
    context.logger.info(`✅ Configuration converted successfully:`);
    context.logger.info(`  - Created ${outputPath}`);
    context.logger.info(`  - Created esbuild.config.js`);
    context.logger.info(`  - Updated package.json scripts`);
    
    if (options.verbose) {
      context.logger.info(`Analysis summary: ${analysis.type} with ${analysis.remotes?.length || 0} remotes`);
    }
  };
}

function generateNativeFederationConfig(config: any, analysis: any): string {
  const imports = [
    "import { NativeFederationPlugin, shareAll, singleton } from '@native-federation/core';"
  ];

  const configObject = {
    ...config
  };

  // Generate shared configuration
  if (config.shared) {
    const hasSharedConfig = Object.keys(config.shared).length > 0;
    if (hasSharedConfig) {
      // Use shareAll for comprehensive sharing
      configObject.shared = 'SHAREALL_PLACEHOLDER';
    }
  } else if (analysis.type === 'host' || analysis.type === 'remote') {
    // Add default sharing for common dependencies
    configObject.shared = 'SHAREALL_PLACEHOLDER';
  }

  let configString = JSON.stringify(configObject, null, 2);
  
  // Replace placeholder with actual shareAll call
  configString = configString.replace(
    '"SHAREALL_PLACEHOLDER"',
    `{
      ...shareAll({
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto'
      })
    }`
  );

  return `${imports.join('\n')}

const isDev = process.env['NODE_ENV'] === 'development';

export const federationConfig = {
  plugins: [
    new NativeFederationPlugin(${configString})
  ]
};

export default federationConfig;
`;
}

function generateEsbuildConfig(buildConfig: any): string {
  return `import { federationConfig } from './federation.config.js';

export default {
  entryPoints: ${JSON.stringify(buildConfig.entryPoints)},
  bundle: ${buildConfig.bundle},
  outdir: '${buildConfig.outdir}',
  format: '${buildConfig.format}',
  target: '${buildConfig.target}',
  sourcemap: ${buildConfig.sourcemap},
  ...federationConfig
};
`;
}

function updatePackageJsonScripts(tree: Tree, context: SchematicContext): void {
  const packageJsonPath = 'package.json';
  if (!tree.exists(packageJsonPath)) {
    context.logger.warn('package.json not found, skipping script updates');
    return;
  }

  const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
  
  // Update build scripts
  const scripts = packageJson.scripts || {};
  
  // Backup existing webpack scripts
  if (scripts.build && scripts.build.includes('webpack')) {
    scripts['build:webpack'] = scripts.build;
  }
  if (scripts.serve && scripts.serve.includes('webpack')) {
    scripts['serve:webpack'] = scripts.serve;
  }
  
  // Add new esbuild scripts
  scripts.build = 'esbuild --config=esbuild.config.js';
  scripts['build:watch'] = 'esbuild --config=esbuild.config.js --watch';
  scripts.serve = 'http-server dist -p 4200 --cors';
  scripts.dev = 'concurrently "npm run build:watch" "npm run serve"';
  
  packageJson.scripts = scripts;
  
  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
}