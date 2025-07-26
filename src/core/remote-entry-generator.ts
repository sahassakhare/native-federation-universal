import * as fs from 'fs/promises';
import * as path from 'path';
import { NativeFederationOptions, RemoteEntry } from '../types/federation.js';
import { SharedDependencyResolver } from './shared-dependency-resolver.js';

export class RemoteEntryGenerator {
  private config: NativeFederationOptions;
  private sharedResolver: SharedDependencyResolver;

  constructor(config: NativeFederationOptions) {
    this.config = config;
    this.sharedResolver = new SharedDependencyResolver(config);
  }

  async generate(): Promise<RemoteEntry> {
    if (!this.config.name) {
      throw new Error('Remote name is required for generating remote entry');
    }

    const exposedModules = await this.processExposedModules();
    const sharedDependencies = await this.sharedResolver.resolveAllSharedDependencies();
    const version = await this.getVersion();

    const remoteEntry: RemoteEntry = {
      name: this.config.name,
      type: 'esm',
      url: this.getRemoteEntryUrl(),
      metadata: {
        exposes: exposedModules,
        shared: Object.fromEntries(sharedDependencies),
        version
      }
    };

    return remoteEntry;
  }

  private async processExposedModules(): Promise<Record<string, string>> {
    if (!this.config.exposes) {
      return {};
    }

    const exposedModules: Record<string, string> = {};

    for (const [exposePath, modulePath] of Object.entries(this.config.exposes)) {
      try {
        const resolvedPath = await this.resolveModulePath(modulePath);
        const outputPath = await this.generateExposedModule(exposePath, resolvedPath);
        exposedModules[exposePath] = outputPath;
      } catch (error: any) {
        if (this.config.verbose) {
          console.warn(`[Native Federation] Failed to process exposed module ${exposePath}:`, error.message);
        }
      }
    }

    return exposedModules;
  }

  private async resolveModulePath(modulePath: string): Promise<string> {
    const fullPath = path.resolve(this.config.workspaceRoot!, modulePath);
    
    try {
      await fs.access(fullPath);
      return fullPath;
    } catch {
      const possibleExtensions = ['.ts', '.js', '.mjs', '/index.ts', '/index.js', '/index.mjs'];
      
      for (const ext of possibleExtensions) {
        const pathWithExt = fullPath + ext;
        try {
          await fs.access(pathWithExt);
          return pathWithExt;
        } catch {
          continue;
        }
      }
      
      throw new Error(`Module not found: ${modulePath}`);
    }
  }

  private async generateExposedModule(exposePath: string, resolvedPath: string): Promise<string> {
    const relativePath = path.relative(this.config.workspaceRoot!, resolvedPath);
    const outputFileName = this.sanitizeFileName(exposePath) + '.mjs';
    const outputPath = path.join(this.config.outputPath!, 'exposed', outputFileName);
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    const moduleContent = await this.createModuleWrapper(exposePath, relativePath);
    await fs.writeFile(outputPath, moduleContent);

    return this.getRelativeUrl(outputPath);
  }

  private async createModuleWrapper(exposePath: string, modulePath: string): Promise<string> {
    const template = `
// Federation exposed module: ${exposePath}
// Source: ${modulePath}

export * from './${modulePath}';
export { default } from './${modulePath}';

// Federation metadata
export const __federation_exposed__ = {
  path: '${exposePath}',
  source: '${modulePath}',
  name: '${this.config.name}',
  version: '${await this.getVersion()}'
};
`;

    return template.trim();
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/^\.\//, '')
      .replace(/\//g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
  }

  private getRelativeUrl(outputPath: string): string {
    const relativePath = path.relative(this.config.outputPath!, outputPath);
    return `./${relativePath.replace(/\\/g, '/')}`;
  }

  private getRemoteEntryUrl(): string {
    if (this.config.dev) {
      return `${window?.location?.origin || 'http://localhost:4200'}/${this.config.outputPath}/remoteEntry.json`;
    }
    
    return `${this.config.outputPath}/remoteEntry.json`;
  }

  private async getVersion(): Promise<string> {
    try {
      const packageJsonPath = path.join(this.config.workspaceRoot!, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  async generateManifest(remotes: Record<string, string>): Promise<void> {
    const manifestPath = path.join(this.config.outputPath!, 'federation.manifest.json');
    
    await fs.writeFile(manifestPath, JSON.stringify(remotes, null, 2));
    
    if (this.config.verbose) {
      console.log(`[Native Federation] Federation manifest generated: ${manifestPath}`);
    }
  }

  async validateExposedModules(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!this.config.exposes) {
      return { valid: true, errors: [] };
    }

    for (const [exposePath, modulePath] of Object.entries(this.config.exposes)) {
      try {
        await this.resolveModulePath(modulePath);
      } catch (error: any) {
        errors.push(`Exposed module '${exposePath}' points to invalid path '${modulePath}': ${error.message}`);
      }

      if (!exposePath.startsWith('./')) {
        errors.push(`Exposed path '${exposePath}' must start with './'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async generateTypesDeclaration(): Promise<void> {
    if (!this.config.exposes) {
      return;
    }

    const declarations: string[] = [
      '// Auto-generated federation types',
      'declare module "federation" {'
    ];

    for (const [exposePath] of Object.entries(this.config.exposes)) {
      const moduleName = exposePath.replace('./', '');
      declarations.push(`  export function loadRemoteModule(name: '${this.config.name}', module: '${exposePath}'): Promise<typeof import('${moduleName}')>;`);
    }

    declarations.push('}');

    const typesPath = path.join(this.config.outputPath!, 'federation.d.ts');
    await fs.writeFile(typesPath, declarations.join('\n'));

    if (this.config.verbose) {
      console.log(`[Native Federation] Types declaration generated: ${typesPath}`);
    }
  }
}