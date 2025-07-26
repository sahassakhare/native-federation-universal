import * as ts from 'typescript';

export interface WebpackAnalysis {
  type: 'host' | 'remote' | 'unknown';
  name?: string;
  remotes?: RemoteConfig[];
  exposes?: Record<string, string>;
  shared?: Record<string, any>;
  filename?: string;
  publicPath?: string;
  errors: string[];
  warnings: string[];
}

export interface RemoteConfig {
  name: string;
  url: string;
  originalEntry: string;
}

export class WebpackConfigAnalyzer {
  private analysis: WebpackAnalysis = {
    type: 'unknown',
    errors: [],
    warnings: []
  };

  analyze(configContent: string): WebpackAnalysis {
    this.analysis = {
      type: 'unknown',
      errors: [],
      warnings: []
    };

    try {
      // Try to parse as JavaScript/TypeScript
      const parsed = this.parseConfigFile(configContent);
      this.extractFederationConfig(parsed);
    } catch (error) {
      this.analysis.errors.push(`Failed to parse webpack config: ${error.message}`);
    }

    return this.analysis;
  }

  private parseConfigFile(content: string): any {
    // Handle common webpack config patterns
    let cleanContent = content;

    // Remove require statements and replace with placeholders
    cleanContent = cleanContent.replace(/require\(['"]([^'"]+)['"]\)/g, '"$1"');
    
    // Handle ModuleFederationPlugin imports
    cleanContent = cleanContent.replace(
      /const\s+\{\s*ModuleFederationPlugin\s*\}\s*=\s*require\(['"]@module-federation\/enhanced['"]\)/g,
      'const ModuleFederationPlugin = "ModuleFederationPlugin"'
    );
    
    cleanContent = cleanContent.replace(
      /const\s+ModuleFederationPlugin\s*=\s*require\(['"][^'"]+['"]\)/g,
      'const ModuleFederationPlugin = "ModuleFederationPlugin"'
    );

    // Try to extract the config object
    const configMatch = cleanContent.match(/module\.exports\s*=\s*({[\s\S]*})/);
    if (configMatch) {
      try {
        // Create a safe evaluation context
        const configString = configMatch[1];
        const parsed = this.parseConfigObject(configString);
        return parsed;
      } catch (error) {
        throw new Error(`Failed to parse config object: ${error.message}`);
      }
    }

    throw new Error('Could not find module.exports in webpack config');
  }

  private parseConfigObject(configString: string): any {
    // Use TypeScript AST to safely parse the configuration
    const sourceFile = ts.createSourceFile(
      'config.js',
      `const config = ${configString}`,
      ts.ScriptTarget.Latest,
      true
    );

    const visitor = (node: ts.Node): any => {
      if (ts.isObjectLiteralExpression(node)) {
        const obj: any = {};
        for (const prop of node.properties) {
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            const key = prop.name.text;
            obj[key] = this.extractValue(prop.initializer);
          }
        }
        return obj;
      }
      return ts.forEachChild(node, visitor);
    };

    return ts.forEachChild(sourceFile, visitor);
  }

  private extractValue(node: ts.Expression): any {
    if (ts.isStringLiteral(node)) {
      return node.text;
    }
    if (ts.isNumericLiteral(node)) {
      return Number(node.text);
    }
    if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    }
    if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    }
    if (ts.isArrayLiteralExpression(node)) {
      return node.elements.map(elem => this.extractValue(elem));
    }
    if (ts.isObjectLiteralExpression(node)) {
      const obj: any = {};
      for (const prop of node.properties) {
        if (ts.isPropertyAssignment(prop)) {
          const key = ts.isIdentifier(prop.name) ? prop.name.text : 
                     ts.isStringLiteral(prop.name) ? prop.name.text : 'unknown';
          obj[key] = this.extractValue(prop.initializer);
        }
      }
      return obj;
    }
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) {
      // Handle new ModuleFederationPlugin(config)
      if (node.expression.text === 'ModuleFederationPlugin' && node.arguments?.length) {
        return {
          __plugin: 'ModuleFederationPlugin',
          config: this.extractValue(node.arguments[0])
        };
      }
    }
    
    return undefined;
  }

  private extractFederationConfig(config: any): void {
    if (!config || !config.plugins) {
      this.analysis.warnings.push('No plugins found in webpack config');
      return;
    }

    // Find ModuleFederationPlugin
    const federationPlugin = config.plugins.find((plugin: any) => 
      plugin && plugin.__plugin === 'ModuleFederationPlugin'
    );

    if (!federationPlugin) {
      this.analysis.warnings.push('No ModuleFederationPlugin found');
      return;
    }

    const federationConfig = federationPlugin.config;
    if (!federationConfig) {
      this.analysis.errors.push('ModuleFederationPlugin found but no configuration');
      return;
    }

    // Extract configuration
    this.analysis.name = federationConfig.name;
    this.analysis.filename = federationConfig.filename;
    this.analysis.shared = federationConfig.shared;
    this.analysis.exposes = federationConfig.exposes;

    // Determine type
    if (federationConfig.exposes && Object.keys(federationConfig.exposes).length > 0) {
      this.analysis.type = 'remote';
    } else if (federationConfig.remotes && Object.keys(federationConfig.remotes).length > 0) {
      this.analysis.type = 'host';
    }

    // Parse remotes
    if (federationConfig.remotes) {
      this.analysis.remotes = this.parseRemotes(federationConfig.remotes);
    }
  }

  private parseRemotes(remotes: Record<string, string>): RemoteConfig[] {
    const parsed: RemoteConfig[] = [];

    for (const [name, entry] of Object.entries(remotes)) {
      try {
        // Parse different remote entry formats
        // Format: "remoteName@http://localhost:4201/remoteEntry.js"
        // Format: "http://localhost:4201/remoteEntry.js"
        
        let url: string;
        let remoteName = name;

        if (entry.includes('@')) {
          const parts = entry.split('@');
          remoteName = parts[0];
          url = parts[1];
        } else {
          url = entry;
        }

        // Convert to Native Federation format
        const nativeUrl = url.replace(/remoteEntry\.js$/, 'remoteEntry.json');

        parsed.push({
          name: remoteName,
          url: nativeUrl,
          originalEntry: entry
        });
      } catch (error) {
        this.analysis.warnings.push(`Failed to parse remote ${name}: ${error.message}`);
      }
    }

    return parsed;
  }

  convertToNativeFederation(analysis: WebpackAnalysis): any {
    const config: any = {
      plugins: []
    };

    const federationConfig: any = {};

    // Add name for remotes
    if (analysis.name) {
      federationConfig.name = analysis.name;
    }

    // Convert exposes
    if (analysis.exposes) {
      federationConfig.exposes = { ...analysis.exposes };
    }

    // Convert remotes
    if (analysis.remotes && analysis.remotes.length > 0) {
      federationConfig.remotes = {};
      for (const remote of analysis.remotes) {
        federationConfig.remotes[remote.name] = remote.url;
      }
    }

    // Convert shared dependencies
    if (analysis.shared) {
      federationConfig.shared = this.convertSharedConfig(analysis.shared);
    }

    return {
      federationConfig,
      buildConfig: {
        entryPoints: ['src/main.ts'],
        bundle: true,
        outdir: 'dist',
        format: 'esm',
        target: 'es2022',
        sourcemap: true
      }
    };
  }

  private convertSharedConfig(shared: Record<string, any>): any {
    const converted: any = {};

    for (const [packageName, config] of Object.entries(shared)) {
      if (typeof config === 'boolean') {
        converted[packageName] = config;
      } else if (typeof config === 'object') {
        converted[packageName] = {
          singleton: config.singleton || false,
          strictVersion: config.strictVersion || false,
          requiredVersion: config.requiredVersion || 'auto',
          eager: config.eager || false
        };
      }
    }

    return converted;
  }
}