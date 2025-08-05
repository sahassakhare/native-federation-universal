import {
  Rule,
  Tree,
  SchematicContext,
  chain,
  externalSchematic,
  schematic,
  apply,
  url,
  template,
  move,
  mergeWith
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Schema as MigrateOptions } from './schema';
import { WebpackAnalyzer } from '../utils/webpack-analyzer';
import { RuntimeTransformer } from '../utils/runtime-transformer';
import { DependencyUpdater } from '../utils/dependency-updater';

export interface Schema {
  project: string;
  webpackConfig?: string;
  skipPackageJson?: boolean;
  skipBuildConfig?: boolean;
  skipRuntimeUpdate?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

export function migrate(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Starting migration from Webpack Module Federation to Native Federation');
    
    if (options.verbose) {
      context.logger.info('Migration options:');
      context.logger.info(JSON.stringify(options, null, 2));
    }

    return chain([
      // 1. Analyze existing webpack configuration
      analyzeWebpackConfig(options),
      
      // 2. Update package.json dependencies
      options.skipPackageJson ? () => {} : updateDependencies(options),
      
      // 3. Convert webpack config to native federation
      convertWebpackConfig(options),
      
      // 4. Setup esbuild configuration
      options.skipBuildConfig ? () => {} : setupEsbuildConfig(options),
      
      // 5. Update runtime imports and calls
      options.skipRuntimeUpdate ? () => {} : updateRuntimeCode(options),
      
      // 6. Generate migration report
      generateMigrationReport(options),
      
      // 7. Install dependencies (unless dry run)
      options.dryRun ? () => {} : installDependencies()
    ])(tree, context);
  };
}

function analyzeWebpackConfig(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Analyzing webpack configuration...');
    
    const webpackConfigPath = options.webpackConfig || 'webpack.config.js';
    
    if (!tree.exists(webpackConfigPath)) {
      context.logger.warn(`Webpack config not found at ${webpackConfigPath}`);
      return;
    }

    const configContent = tree.read(webpackConfigPath)?.toString();
    if (!configContent) {
      context.logger.error('Failed to read webpack configuration');
      return;
    }

    const analyzer = new WebpackAnalyzer();
    const analysis = analyzer.analyze(configContent);
    
    if (options.verbose) {
      context.logger.info('Analysis results:');
      context.logger.info(JSON.stringify(analysis, null, 2));
    }

    // Store analysis results for other steps
    const analysisPath = '.migration-analysis.json';
    tree.create(analysisPath, JSON.stringify(analysis, null, 2));
    
    context.logger.info(` Analysis complete. Found ${analysis.remotes?.length || 0} remotes and ${Object.keys(analysis.shared || {}).length} shared dependencies`);
  };
}

function updateDependencies(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Updating package.json dependencies...');
    
    const packageJsonPath = 'package.json';
    if (!tree.exists(packageJsonPath)) {
      context.logger.error('package.json not found');
      return;
    }

    const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
    const updater = new DependencyUpdater();
    
    const updates = updater.getUpdates(packageJson);
    
    if (options.verbose) {
      context.logger.info('Dependency updates:');
      context.logger.info(JSON.stringify(updates, null, 2));
    }

    // Apply updates
    Object.assign(packageJson.dependencies, updates.dependencies);
    Object.assign(packageJson.devDependencies, updates.devDependencies);
    
    // Remove webpack-specific dependencies
    updates.toRemove.forEach(dep => {
      delete packageJson.dependencies[dep];
      delete packageJson.devDependencies[dep];
    });

    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    context.logger.info(' Dependencies updated successfully');
  };
}

function convertWebpackConfig(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Converting webpack configuration to Native Federation...');
    
    return schematic('convert-config', {
      project: options.project,
      webpackConfig: options.webpackConfig,
      verbose: options.verbose
    });
  };
}

function setupEsbuildConfig(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Setting up esbuild configuration...');
    
    return schematic('setup-build', {
      project: options.project,
      verbose: options.verbose
    });
  };
}

function updateRuntimeCode(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Updating runtime imports and federation calls...');
    
    return schematic('update-runtime', {
      project: options.project,
      verbose: options.verbose
    });
  };
}

function generateMigrationReport(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Generating migration report...');
    
    const analysisPath = '.migration-analysis.json';
    if (!tree.exists(analysisPath)) {
      context.logger.warn('No analysis data found for report generation');
      return;
    }

    const analysis = JSON.parse(tree.read(analysisPath)!.toString());
    
    const report = {
      timestamp: new Date().toISOString(),
      project: options.project,
      summary: {
        remotesFound: analysis.remotes?.length || 0,
        sharedDependencies: Object.keys(analysis.shared || {}).length,
        exposedModules: Object.keys(analysis.exposes || {}).length,
        migrationCompleted: !options.dryRun
      },
      analysis,
      nextSteps: [
        'Run `npm install` to install new dependencies',
        'Update your build scripts to use esbuild',
        'Test all remote module loading functionality',
        'Verify shared dependency resolution',
        'Update CI/CD pipelines if necessary'
      ]
    };

    const reportPath = '.migration-report.json';
    tree.create(reportPath, JSON.stringify(report, null, 2));
    
    // Also create a markdown report
    const markdownReport = generateMarkdownReport(report);
    tree.create('MIGRATION_REPORT.md', markdownReport);
    
    // Clean up temporary files
    tree.delete(analysisPath);
    
    context.logger.info(' Migration report generated: MIGRATION_REPORT.md');
  };
}

function installDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.info(' Dependencies will be installed...');
  };
}

function generateMarkdownReport(report: any): string {
  return `# Migration Report

## Summary
- **Project**: ${report.project}
- **Timestamp**: ${report.timestamp}
- **Remotes Found**: ${report.summary.remotesFound}
- **Shared Dependencies**: ${report.summary.sharedDependencies}
- **Exposed Modules**: ${report.summary.exposedModules}
- **Migration Status**: ${report.summary.migrationCompleted ? ' Completed' : '⏳ Dry Run'}

## Analysis Results

### Remotes
${report.analysis.remotes?.map((remote: any) => `- **${remote.name}**: ${remote.url}`).join('\n') || 'None found'}

### Shared Dependencies
${Object.entries(report.analysis.shared || {}).map(([name, config]: [string, any]) => 
  `- **${name}**: ${config.singleton ? 'Singleton' : 'Normal'}`
).join('\n') || 'None found'}

### Exposed Modules
${Object.entries(report.analysis.exposes || {}).map(([key, path]: [string, any]) => 
  `- **${key}**: ${path}`
).join('\n') || 'None found'}

## Next Steps

${report.nextSteps.map((step: string) => `1. ${step}`).join('\n')}

## Files Modified

-  package.json (dependencies updated)
-  federation.config.ts (created)
-  esbuild.config.js (created)
-  Runtime imports (updated)

## Verification Checklist

- [ ] Run \`npm install\`
- [ ] Update build scripts in package.json
- [ ] Test remote module loading
- [ ] Verify shared dependencies work correctly
- [ ] Check development server functionality
- [ ] Test production builds
- [ ] Update CI/CD pipelines

---
*Generated by @native-federation/schematics*
`;
}