import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateRuntimeSchema } from './schema';
import { RuntimeTransformer } from '../utils/runtime-transformer';
import * as path from 'path';

export function updateRuntime(options: UpdateRuntimeSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(' Updating runtime to Native Federation...');
    
    const transformer = new RuntimeTransformer(tree, context.logger);
    
    // Find entry file
    const entryFile = options.entry || findEntryFile(tree);
    if (entryFile) {
      transformer.addRuntimeInitialization(entryFile);
    }
    
    // Transform runtime calls in source files
    const sourcePattern = options.sourcePattern || 'src/**/*.{js,jsx,ts,tsx}';
    const files = findFiles(tree, sourcePattern);
    
    let transformedCount = 0;
    files.forEach(file => {
      if (transformer.transformRuntimeCalls(file)) {
        transformedCount++;
      }
    });
    
    context.logger.info(` Transformed ${transformedCount} files`);
    
    // Add federation manifest
    if (!tree.exists('public/federation.manifest.json')) {
      tree.create('public/federation.manifest.json', JSON.stringify({
        remotes: {}
      }, null, 2));
      context.logger.info(' Created federation.manifest.json');
    }
    
    context.logger.info(' Runtime update completed!');
    
    return tree;
  };
}

function findEntryFile(tree: Tree): string | null {
  const possibleEntries = [
    'src/index.js',
    'src/index.ts',
    'src/main.js',
    'src/main.ts',
    'src/index.jsx',
    'src/index.tsx'
  ];
  
  for (const entry of possibleEntries) {
    if (tree.exists(entry)) {
      return entry;
    }
  }
  
  return null;
}

function findFiles(tree: Tree, pattern: string): string[] {
  const files: string[] = [];
  
  tree.visit(filePath => {
    if (matchesPattern(filePath, pattern)) {
      files.push(filePath);
    }
  });
  
  return files;
}

function matchesPattern(filePath: string, pattern: string): boolean {
  // Simple pattern matching (could be enhanced with proper glob support)
  const ext = path.extname(filePath);
  const dir = path.dirname(filePath);
  
  if (pattern.includes('**')) {
    const basePattern = pattern.replace('**/', '');
    const extensions = basePattern.match(/\{([^}]+)\}/)?.[1].split(',') || [];
    
    return extensions.some(e => filePath.endsWith(e.trim()));
  }
  
  return false;
}