import * as ts from 'typescript';

export interface TransformationResult {
  content: string;
  changes: Change[];
  hasChanges: boolean;
}

export interface Change {
  type: 'import-update' | 'function-call' | 'bootstrap-update';
  line: number;
  original: string;
  updated: string;
  description: string;
}

export class RuntimeCodeTransformer {
  private changes: Change[] = [];

  transformFile(content: string, filePath: string): TransformationResult {
    this.changes = [];
    
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const transformer = this.createTransformer();
    const result = ts.transform(sourceFile, [transformer]);
    const transformedFile = result.transformed[0] as ts.SourceFile;
    
    const printer = ts.createPrinter();
    const transformedContent = printer.printFile(transformedFile);

    result.dispose();

    return {
      content: transformedContent,
      changes: this.changes,
      hasChanges: this.changes.length > 0
    };
  }

  private createTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
      return (sourceFile: ts.SourceFile) => {
        const visitor = (node: ts.Node): ts.Node => {
          // Transform import statements
          if (ts.isImportDeclaration(node)) {
            return this.transformImportDeclaration(node);
          }

          // Transform dynamic imports (webpack style)
          if (ts.isCallExpression(node)) {
            return this.transformCallExpression(node);
          }

          // Transform bootstrap patterns
          if (ts.isImportKeyword(node.parent) && ts.isCallExpression(node.parent.parent)) {
            return this.transformBootstrapPattern(node);
          }

          return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
      };
    };
  }

  private transformImportDeclaration(node: ts.ImportDeclaration): ts.ImportDeclaration {
    const moduleSpecifier = node.moduleSpecifier;
    
    if (ts.isStringLiteral(moduleSpecifier)) {
      const moduleName = moduleSpecifier.text;
      
      // Handle webpack module federation runtime imports
      if (moduleName.includes('@module-federation') || moduleName.includes('module-federation')) {
        this.addChange({
          type: 'import-update',
          line: this.getLineNumber(node),
          original: node.getFullText(),
          updated: "import { initFederation, loadRemoteModule } from '@native-federation/core/runtime';",
          description: 'Updated Module Federation import to Native Federation'
        });

        return ts.factory.createImportDeclaration(
          node.decorators,
          node.modifiers,
          ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports([
              ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('initFederation')),
              ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('loadRemoteModule'))
            ])
          ),
          ts.factory.createStringLiteral('@native-federation/core/runtime')
        );
      }
    }

    return node;
  }

  private transformCallExpression(node: ts.CallExpression): ts.Expression {
    // Transform webpack-style dynamic imports: import('remoteName/module')
    if (node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length === 1) {
      const argument = node.arguments[0];
      
      if (ts.isStringLiteral(argument)) {
        const importPath = argument.text;
        
        // Check if it's a remote module import (contains remote name)
        if (importPath.includes('/') && !importPath.startsWith('./') && !importPath.startsWith('../')) {
          const parts = importPath.split('/');
          if (parts.length >= 2) {
            const remoteName = parts[0];
            const modulePath = './' + parts.slice(1).join('/');
            
            this.addChange({
              type: 'function-call',
              line: this.getLineNumber(node),
              original: node.getFullText(),
              updated: `loadRemoteModule('${remoteName}', '${modulePath}')`,
              description: `Converted webpack import to loadRemoteModule call`
            });

            return ts.factory.createCallExpression(
              ts.factory.createIdentifier('loadRemoteModule'),
              undefined,
              [
                ts.factory.createStringLiteral(remoteName),
                ts.factory.createStringLiteral(modulePath)
              ]
            );
          }
        }
      }
    }

    // Transform loadRemoteModule calls that might already exist
    if (ts.isIdentifier(node.expression) && node.expression.text === 'loadRemoteModule') {
      // Already using Native Federation - check format
      if (node.arguments.length === 2) {
        return node; // Already correct format
      }
    }

    return node;
  }

  private transformBootstrapPattern(node: ts.Node): ts.Node {
    // Look for bootstrap patterns like import('./bootstrap')
    const parent = node.parent;
    if (ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const grandParent = parent.parent;
      
      // This might be in main.ts - suggest federation initialization
      this.addChange({
        type: 'bootstrap-update',
        line: this.getLineNumber(parent),
        original: parent.getFullText(),
        updated: 'Add initFederation() before bootstrap',
        description: 'Consider adding federation initialization before app bootstrap'
      });
    }

    return node;
  }

  private addChange(change: Change): void {
    this.changes.push(change);
  }

  private getLineNumber(node: ts.Node): number {
    const sourceFile = node.getSourceFile();
    if (sourceFile) {
      const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      return lineAndChar.line + 1;
    }
    return 0;
  }

  // Helper method to generate federation initialization code
  generateInitializationCode(): string {
    return `import { initFederation } from '@native-federation/core/runtime';

async function bootstrap() {
  // Initialize Native Federation
  await initFederation('./federation.manifest.json');
  
  // Bootstrap your application
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { AppComponent } = await import('./app/app.component');
  
  bootstrapApplication(AppComponent);
}

bootstrap().catch(err => console.error(err));
`;
  }

  // Helper to update main.ts files specifically
  updateMainTsForFederation(content: string): string {
    // Look for existing bootstrap patterns
    const hasBootstrap = content.includes('import(') && content.includes('bootstrap');
    const hasInit = content.includes('initFederation');
    
    if (hasInit) {
      return content; // Already updated
    }

    if (hasBootstrap) {
      // Replace existing bootstrap pattern
      const updated = content
        .replace(/import\(['"]\.\/bootstrap['"]\);?/, '')
        .replace(/platformBrowserDynamic\(\)\.bootstrapModule\([^)]+\);?/, '');
      
      return this.generateInitializationCode();
    }

    // Add to existing main.ts
    const initImport = "import { initFederation } from '@native-federation/core/runtime';\n";
    const asyncWrapper = `
async function bootstrap() {
  await initFederation('./federation.manifest.json');
  ${content.replace(/^import.*?;$/gm, '').trim()}
}

bootstrap().catch(err => console.error(err));
`;

    return initImport + asyncWrapper;
  }

  // Helper to create migration report for a file
  createFileReport(filePath: string, result: TransformationResult): string {
    if (!result.hasChanges) {
      return `## ${filePath}\n\n✅ No changes needed\n\n`;
    }

    let report = `## ${filePath}\n\n`;
    report += `📝 ${result.changes.length} changes made:\n\n`;

    result.changes.forEach((change, index) => {
      report += `### Change ${index + 1} (Line ${change.line})\n`;
      report += `**Type**: ${change.type}\n`;
      report += `**Description**: ${change.description}\n`;
      report += `**Before**:\n\`\`\`typescript\n${change.original}\n\`\`\`\n`;
      report += `**After**:\n\`\`\`typescript\n${change.updated}\n\`\`\`\n\n`;
    });

    return report;
  }
}