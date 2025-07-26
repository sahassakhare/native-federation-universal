import {
  Rule,
  Tree,
  SchematicContext
} from '@angular-devkit/schematics';
import { WebpackConfigAnalyzer, WebpackAnalysis } from '../utils/webpack-analyzer';
import { DependencyUpdater } from '../utils/dependency-updater';
import { RuntimeCodeTransformer } from '../utils/runtime-transformer';

export interface Schema {
  project: string;
  webpackConfig?: string;
  outputReport?: string;
  detailed?: boolean;
  verbose?: boolean;
}

interface ProjectAnalysis {
  webpackConfig: WebpackAnalysis;
  dependencies: any;
  codePatterns: CodePatternAnalysis;
  migrationComplexity: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  recommendations: string[];
  blockers: string[];
}

interface CodePatternAnalysis {
  filesWithWebpackImports: string[];
  filesWithDynamicImports: string[];
  mainTsPattern: 'standard' | 'bootstrap' | 'custom';
  totalFiles: number;
  filesToUpdate: number;
}

export function analyze(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('📊 Analyzing project for Native Federation migration...');
    
    const analysis = performAnalysis(tree, options, context);
    const report = generateAnalysisReport(analysis, options);
    
    const outputPath = options.outputReport || 'MIGRATION_ANALYSIS.md';
    tree.create(outputPath, report);
    
    // Log summary to console
    logAnalysisSummary(analysis, context);
    
    context.logger.info(`✅ Analysis complete. Report saved to ${outputPath}`);
  };
}

function performAnalysis(tree: Tree, options: Schema, context: SchematicContext): ProjectAnalysis {
  const analysis: ProjectAnalysis = {
    webpackConfig: { type: 'unknown', errors: [], warnings: [] },
    dependencies: {},
    codePatterns: {
      filesWithWebpackImports: [],
      filesWithDynamicImports: [],
      mainTsPattern: 'standard',
      totalFiles: 0,
      filesToUpdate: 0
    },
    migrationComplexity: 'low',
    estimatedEffort: '',
    recommendations: [],
    blockers: []
  };

  // 1. Analyze webpack configuration
  analysis.webpackConfig = analyzeWebpackConfig(tree, options, context);
  
  // 2. Analyze package.json
  analysis.dependencies = analyzePackageJson(tree, context);
  
  // 3. Analyze code patterns
  analysis.codePatterns = analyzeCodePatterns(tree, context, options.verbose || false);
  
  // 4. Determine migration complexity
  analysis.migrationComplexity = calculateMigrationComplexity(analysis);
  
  // 5. Estimate effort
  analysis.estimatedEffort = estimateEffort(analysis);
  
  // 6. Generate recommendations
  analysis.recommendations = generateRecommendations(analysis);
  
  // 7. Identify blockers
  analysis.blockers = identifyBlockers(analysis);

  return analysis;
}

function analyzeWebpackConfig(tree: Tree, options: Schema, context: SchematicContext): WebpackAnalysis {
  const webpackConfigPath = options.webpackConfig || 'webpack.config.js';
  
  if (!tree.exists(webpackConfigPath)) {
    context.logger.warn(`Webpack config not found at ${webpackConfigPath}`);
    return { type: 'unknown', errors: ['Webpack config not found'], warnings: [] };
  }

  const configContent = tree.read(webpackConfigPath)?.toString();
  if (!configContent) {
    return { type: 'unknown', errors: ['Failed to read webpack config'], warnings: [] };
  }

  const analyzer = new WebpackConfigAnalyzer();
  return analyzer.analyze(configContent);
}

function analyzePackageJson(tree: Tree, context: SchematicContext): any {
  if (!tree.exists('package.json')) {
    context.logger.warn('package.json not found');
    return {};
  }

  const packageJson = JSON.parse(tree.read('package.json')!.toString());
  const updater = new DependencyUpdater();
  
  return {
    current: packageJson,
    validation: updater.validateUpdatedPackageJson(packageJson),
    recommendations: updater.generateRecommendations(packageJson)
  };
}

function analyzeCodePatterns(tree: Tree, context: SchematicContext, verbose: boolean): CodePatternAnalysis {
  const analysis: CodePatternAnalysis = {
    filesWithWebpackImports: [],
    filesWithDynamicImports: [],
    mainTsPattern: 'standard',
    totalFiles: 0,
    filesToUpdate: 0
  };

  const transformer = new RuntimeCodeTransformer();
  
  // Analyze src directory
  if (tree.exists('src')) {
    tree.getDir('src').visit((path, entry) => {
      if (entry && (path.endsWith('.ts') || path.endsWith('.js')) && !path.endsWith('.d.ts')) {
        analysis.totalFiles++;
        
        const content = entry.content.toString();
        
        // Check for webpack-specific imports
        if (content.includes('@module-federation') || content.includes('module-federation')) {
          analysis.filesWithWebpackImports.push(path);
        }
        
        // Check for dynamic imports that might be federation-related
        const dynamicImportRegex = /import\(['"][^'"]+\/[^'"]+['"]\)/g;
        if (dynamicImportRegex.test(content)) {
          analysis.filesWithDynamicImports.push(path);
        }
        
        // Check if file needs transformation
        const result = transformer.transformFile(content, path);
        if (result.hasChanges) {
          analysis.filesToUpdate++;
          if (verbose) {
            context.logger.info(`📝 ${path} needs ${result.changes.length} changes`);
          }
        }
      }
    });
  }

  // Analyze main.ts specifically
  if (tree.exists('src/main.ts')) {
    const mainContent = tree.read('src/main.ts')!.toString();
    
    if (mainContent.includes('import(') && mainContent.includes('bootstrap')) {
      analysis.mainTsPattern = 'bootstrap';
    } else if (mainContent.includes('platformBrowserDynamic')) {
      analysis.mainTsPattern = 'standard';
    } else {
      analysis.mainTsPattern = 'custom';
    }
  }

  return analysis;
}

function calculateMigrationComplexity(analysis: ProjectAnalysis): 'low' | 'medium' | 'high' {
  let score = 0;

  // Webpack config complexity
  if (analysis.webpackConfig.errors.length > 0) score += 3;
  if (analysis.webpackConfig.remotes && analysis.webpackConfig.remotes.length > 3) score += 2;
  if (analysis.webpackConfig.shared && Object.keys(analysis.webpackConfig.shared).length > 10) score += 1;

  // Code complexity
  if (analysis.codePatterns.filesToUpdate > 10) score += 2;
  if (analysis.codePatterns.filesWithWebpackImports.length > 5) score += 2;
  if (analysis.codePatterns.mainTsPattern === 'custom') score += 1;

  // Dependency complexity
  if (analysis.dependencies.validation && !analysis.dependencies.validation.valid) score += 1;

  if (score >= 5) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function estimateEffort(analysis: ProjectAnalysis): string {
  const complexity = analysis.migrationComplexity;
  const filesToUpdate = analysis.codePatterns.filesToUpdate;
  const remoteCount = analysis.webpackConfig.remotes?.length || 0;

  let baseHours = 2; // Basic setup
  
  if (complexity === 'high') baseHours *= 3;
  else if (complexity === 'medium') baseHours *= 2;
  
  const fileUpdateHours = Math.ceil(filesToUpdate / 5); // 5 files per hour
  const remoteHours = remoteCount * 0.5; // 30 min per remote
  
  const totalHours = baseHours + fileUpdateHours + remoteHours;
  
  if (totalHours <= 4) return '2-4 hours';
  if (totalHours <= 8) return '4-8 hours';
  if (totalHours <= 16) return '1-2 days';
  return '2+ days';
}

function generateRecommendations(analysis: ProjectAnalysis): string[] {
  const recommendations: string[] = [];

  if (analysis.migrationComplexity === 'high') {
    recommendations.push('Consider migrating in phases due to high complexity');
    recommendations.push('Test each remote separately after migration');
  }

  if (analysis.codePatterns.filesToUpdate > 10) {
    recommendations.push('Use the automated migration schematic to update code');
  }

  if (analysis.webpackConfig.remotes && analysis.webpackConfig.remotes.length > 0) {
    recommendations.push('Update remote URLs to use .json instead of .js');
    recommendations.push('Ensure all remote applications are accessible');
  }

  if (analysis.codePatterns.mainTsPattern === 'custom') {
    recommendations.push('Main.ts uses custom bootstrap - manual review needed');
  }

  if (analysis.dependencies.recommendations) {
    recommendations.push(...analysis.dependencies.recommendations);
  }

  return recommendations;
}

function identifyBlockers(analysis: ProjectAnalysis): string[] {
  const blockers: string[] = [];

  if (analysis.webpackConfig.errors.length > 0) {
    blockers.push('Webpack configuration has errors that must be resolved');
  }

  if (!analysis.dependencies.current.dependencies?.['@angular/core']) {
    blockers.push('Not an Angular project - manual migration required');
  }

  const angularVersion = analysis.dependencies.current.dependencies?.['@angular/core'];
  if (angularVersion && angularVersion.includes('15') || angularVersion.includes('14')) {
    blockers.push('Angular version < 16 - upgrade recommended before migration');
  }

  return blockers;
}

function logAnalysisSummary(analysis: ProjectAnalysis, context: SchematicContext): void {
  context.logger.info('\n📋 Migration Analysis Summary:');
  context.logger.info(`   Complexity: ${analysis.migrationComplexity.toUpperCase()}`);
  context.logger.info(`   Estimated Effort: ${analysis.estimatedEffort}`);
  context.logger.info(`   Files to Update: ${analysis.codePatterns.filesToUpdate}`);
  context.logger.info(`   Remotes Found: ${analysis.webpackConfig.remotes?.length || 0}`);
  
  if (analysis.blockers.length > 0) {
    context.logger.warn('\n🚫 Blockers:');
    analysis.blockers.forEach(blocker => context.logger.warn(`   - ${blocker}`));
  }
  
  if (analysis.recommendations.length > 0) {
    context.logger.info('\n💡 Key Recommendations:');
    analysis.recommendations.slice(0, 3).forEach(rec => context.logger.info(`   - ${rec}`));
    if (analysis.recommendations.length > 3) {
      context.logger.info(`   ... and ${analysis.recommendations.length - 3} more (see report)`);
    }
  }
}

function generateAnalysisReport(analysis: ProjectAnalysis, options: Schema): string {
  let report = `# Native Federation Migration Analysis\n\n`;
  report += `**Project**: ${options.project}\n`;
  report += `**Generated**: ${new Date().toISOString()}\n`;
  report += `**Analysis Type**: ${options.detailed ? 'Detailed' : 'Standard'}\n\n`;

  // Executive Summary
  report += `## Executive Summary\n\n`;
  report += `- **Migration Complexity**: ${analysis.migrationComplexity.toUpperCase()}\n`;
  report += `- **Estimated Effort**: ${analysis.estimatedEffort}\n`;
  report += `- **Files Requiring Updates**: ${analysis.codePatterns.filesToUpdate}\n`;
  report += `- **Remote Applications**: ${analysis.webpackConfig.remotes?.length || 0}\n`;
  report += `- **Shared Dependencies**: ${Object.keys(analysis.webpackConfig.shared || {}).length}\n\n`;

  // Blockers
  if (analysis.blockers.length > 0) {
    report += `## 🚫 Migration Blockers\n\n`;
    analysis.blockers.forEach(blocker => {
      report += `- ❌ ${blocker}\n`;
    });
    report += `\n`;
  }

  // Webpack Configuration Analysis
  report += `## Webpack Configuration Analysis\n\n`;
  report += `- **Type**: ${analysis.webpackConfig.type}\n`;
  if (analysis.webpackConfig.name) {
    report += `- **Name**: ${analysis.webpackConfig.name}\n`;
  }
  if (analysis.webpackConfig.errors.length > 0) {
    report += `- **Errors**: ${analysis.webpackConfig.errors.length}\n`;
    analysis.webpackConfig.errors.forEach(error => report += `  - ${error}\n`);
  }
  if (analysis.webpackConfig.warnings.length > 0) {
    report += `- **Warnings**: ${analysis.webpackConfig.warnings.length}\n`;
    analysis.webpackConfig.warnings.forEach(warning => report += `  - ${warning}\n`);
  }
  report += `\n`;

  // Remote Applications
  if (analysis.webpackConfig.remotes && analysis.webpackConfig.remotes.length > 0) {
    report += `### Remote Applications\n\n`;
    analysis.webpackConfig.remotes.forEach(remote => {
      report += `- **${remote.name}**: ${remote.url}\n`;
      report += `  - Original: ${remote.originalEntry}\n`;
    });
    report += `\n`;
  }

  // Exposed Modules
  if (analysis.webpackConfig.exposes && Object.keys(analysis.webpackConfig.exposes).length > 0) {
    report += `### Exposed Modules\n\n`;
    Object.entries(analysis.webpackConfig.exposes).forEach(([key, path]) => {
      report += `- **${key}**: ${path}\n`;
    });
    report += `\n`;
  }

  // Code Pattern Analysis
  report += `## Code Pattern Analysis\n\n`;
  report += `- **Total TypeScript Files**: ${analysis.codePatterns.totalFiles}\n`;
  report += `- **Files with Webpack Imports**: ${analysis.codePatterns.filesWithWebpackImports.length}\n`;
  report += `- **Files with Dynamic Imports**: ${analysis.codePatterns.filesWithDynamicImports.length}\n`;
  report += `- **Main.ts Pattern**: ${analysis.codePatterns.mainTsPattern}\n`;
  report += `- **Files Requiring Updates**: ${analysis.codePatterns.filesToUpdate}\n\n`;

  if (analysis.codePatterns.filesWithWebpackImports.length > 0) {
    report += `### Files with Webpack Module Federation Imports\n\n`;
    analysis.codePatterns.filesWithWebpackImports.forEach(file => {
      report += `- ${file}\n`;
    });
    report += `\n`;
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    report += `## 💡 Recommendations\n\n`;
    analysis.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += `\n`;
  }

  // Migration Steps
  report += `## 📋 Suggested Migration Steps\n\n`;
  report += `1. **Backup your project**\n`;
  report += `   \`\`\`bash\n   git commit -am "Pre-migration backup"\n   \`\`\`\n\n`;
  
  if (analysis.blockers.length > 0) {
    report += `2. **Resolve blockers first**\n`;
    analysis.blockers.forEach(blocker => report += `   - ${blocker}\n`);
    report += `\n`;
  }
  
  report += `3. **Run the automated migration**\n`;
  report += `   \`\`\`bash\n   ng generate @native-federation/schematics:migrate --project=${options.project}\n   \`\`\`\n\n`;
  
  report += `4. **Install dependencies**\n`;
  report += `   \`\`\`bash\n   npm install\n   \`\`\`\n\n`;
  
  report += `5. **Test the migration**\n`;
  report += `   - Build the application: \`npm run build\`\n`;
  report += `   - Start development server: \`npm run dev\`\n`;
  report += `   - Test all remote module loading\n`;
  report += `   - Verify shared dependencies work correctly\n\n`;
  
  report += `6. **Update CI/CD pipelines**\n`;
  report += `   - Replace webpack commands with esbuild\n`;
  report += `   - Update deployment scripts\n\n`;

  report += `---\n*Generated by @native-federation/schematics*\n`;

  return report;
}