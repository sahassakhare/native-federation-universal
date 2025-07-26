import {
  Rule,
  Tree,
  SchematicContext,
  DirEntry,
  forEach
} from '@angular-devkit/schematics';
import { RuntimeCodeTransformer, TransformationResult } from '../utils/runtime-transformer';

export interface Schema {
  project: string;
  srcPath?: string;
  updateMain?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

export function updateRuntime(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔧 Updating runtime imports and federation calls...');
    
    const srcPath = options.srcPath || 'src';
    const transformer = new RuntimeCodeTransformer();
    const transformationResults: { file: string; result: TransformationResult }[] = [];
    
    if (!tree.exists(srcPath)) {
      context.logger.error(`Source directory not found: ${srcPath}`);
      return;
    }

    // Process TypeScript files
    tree.getDir(srcPath).visit((path, entry) => {
      if (entry && (path.endsWith('.ts') || path.endsWith('.js')) && !path.endsWith('.d.ts')) {
        const content = entry.content.toString();
        const result = transformer.transformFile(content, path);
        
        if (result.hasChanges) {
          transformationResults.push({ file: path, result });
          
          if (!options.dryRun) {
            tree.overwrite(path, result.content);
          }
          
          if (options.verbose) {
            context.logger.info(`📝 Transformed ${path}: ${result.changes.length} changes`);
            result.changes.forEach(change => {
              context.logger.info(`  - ${change.description} (line ${change.line})`);
            });
          }
        }
      }
    });

    // Special handling for main.ts
    if (options.updateMain) {
      updateMainFile(tree, transformer, context, options);
    }

    // Generate transformation report
    if (transformationResults.length > 0) {
      generateTransformationReport(tree, transformationResults, transformer, options.dryRun || false);
    }

    const changedFiles = transformationResults.length;
    const totalChanges = transformationResults.reduce((sum, tr) => sum + tr.result.changes.length, 0);
    
    if (options.dryRun) {
      context.logger.info(`🔍 Dry run complete: would update ${changedFiles} files with ${totalChanges} changes`);
    } else {
      context.logger.info(`✅ Runtime update complete: updated ${changedFiles} files with ${totalChanges} changes`);
    }
    
    if (changedFiles === 0) {
      context.logger.info('ℹ️ No webpack Module Federation patterns found to migrate');
    }
  };
}

function updateMainFile(
  tree: Tree, 
  transformer: RuntimeCodeTransformer, 
  context: SchematicContext, 
  options: Schema
): void {
  const mainTsPath = 'src/main.ts';
  
  if (!tree.exists(mainTsPath)) {
    context.logger.warn('main.ts not found, skipping main file update');
    return;
  }

  const mainContent = tree.read(mainTsPath)!.toString();
  
  // Check if it needs federation initialization
  if (mainContent.includes('initFederation')) {
    if (options.verbose) {
      context.logger.info('main.ts already contains federation initialization');
    }
    return;
  }

  // Check for bootstrap patterns
  const hasBootstrapPattern = mainContent.includes('import(') && 
                              (mainContent.includes('bootstrap') || mainContent.includes('platformBrowserDynamic'));
  
  if (hasBootstrapPattern) {
    const updatedContent = transformer.updateMainTsForFederation(mainContent);
    
    if (!options.dryRun) {
      tree.overwrite(mainTsPath, updatedContent);
    }
    
    context.logger.info('📝 Updated main.ts with federation initialization');
  } else if (options.verbose) {
    context.logger.info('main.ts does not contain bootstrap patterns, manual update may be needed');
  }
}

function generateTransformationReport(
  tree: Tree,
  results: { file: string; result: TransformationResult }[],
  transformer: RuntimeCodeTransformer,
  dryRun: boolean
): void {
  let report = `# Runtime Code Transformation Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Mode: ${dryRun ? 'Dry Run' : 'Applied Changes'}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Files processed**: ${results.length}\n`;
  report += `- **Total changes**: ${results.reduce((sum, r) => sum + r.result.changes.length, 0)}\n\n`;
  
  results.forEach(({ file, result }) => {
    report += transformer.createFileReport(file, result);
  });
  
  if (results.length === 0) {
    report += `## No Changes Needed\n\n`;
    report += `All files are already using Native Federation patterns or no webpack Module Federation patterns were found.\n\n`;
  }
  
  report += `## Next Steps\n\n`;
  report += `1. Review the changes above\n`;
  report += `2. Test remote module loading functionality\n`;
  report += `3. Update any manual bootstrap code if needed\n`;
  report += `4. Verify federation initialization in main.ts\n`;
  report += `5. Test the application thoroughly\n\n`;
  
  report += `---\n*Generated by @native-federation/schematics*\n`;
  
  const reportPath = 'RUNTIME_TRANSFORMATION_REPORT.md';
  tree.create(reportPath, report);
}