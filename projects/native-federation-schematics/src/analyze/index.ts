import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { AnalyzeSchema } from './schema';
import { WebpackAnalyzer } from '../utils/webpack-analyzer';

export function analyze(options: AnalyzeSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const analyzer = new WebpackAnalyzer();
    
    context.logger.info('🔍 Analyzing Webpack Module Federation configuration...');
    
    // Read the webpack config file
    const configPath = options.configPath || 'webpack.config.js';
    if (!tree.exists(configPath)) {
      context.logger.error(`Webpack config not found at: ${configPath}`);
      return tree;
    }
    
    const configContent = tree.read(configPath)?.toString() || '';
    const result = analyzer.analyze(configContent);
    
    // Output analysis results
    context.logger.info('\n📊 Analysis Results:');
    context.logger.info(`- Configuration Type: ${result.type}`);
    
    if (result.type !== 'unknown') {
      context.logger.info(`- Application Name: ${result.name || 'Not specified'}`);
      if (result.exposes) {
        context.logger.info(`- Exposed Modules: ${Object.keys(result.exposes).length}`);
      }
      if (result.remotes) {
        context.logger.info(`- Remote Modules: ${result.remotes.length}`);
      }
      if (result.shared) {
        context.logger.info(`- Shared Dependencies: ${Object.keys(result.shared).length}`);
      }
    }
    
    // Save analysis report if requested
    if (options.output) {
      const reportPath = options.output;
      const report = JSON.stringify(result, null, 2);
      tree.create(reportPath, report);
      context.logger.info(`\n💾 Analysis report saved to: ${reportPath}`);
    }
    
    return tree;
  };
}