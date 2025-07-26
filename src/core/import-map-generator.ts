import * as fs from 'fs/promises';
import * as path from 'path';
import { NativeFederationOptions, ImportMapEntry, SharedPackageConfig } from '../types/federation.js';
import { SharedDependencyResolver } from './shared-dependency-resolver.js';

export class ImportMapGenerator {
  private config: NativeFederationOptions;
  private sharedResolver: SharedDependencyResolver;

  constructor(config: NativeFederationOptions) {
    this.config = config;
    this.sharedResolver = new SharedDependencyResolver(config);
  }

  async generate(): Promise<ImportMapEntry> {
    const importMap: ImportMapEntry = {
      imports: {},
      scopes: {}
    };

    await this.addSharedDependencies(importMap);
    await this.addRemoteDependencies(importMap);
    await this.addScopedMappings(importMap);

    return importMap;
  }

  private async addSharedDependencies(importMap: ImportMapEntry): Promise<void> {
    if (!this.config.shared) {
      return;
    }

    const resolvedShared = await this.sharedResolver.resolveAllSharedDependencies();

    for (const [packageName, config] of resolvedShared.entries()) {
      if (config.import === false) {
        continue;
      }

      const moduleUrl = this.getSharedModuleUrl(packageName, config);
      
      importMap.imports[packageName] = moduleUrl;
      
      if (config.shareKey !== packageName) {
        importMap.imports[config.shareKey!] = moduleUrl;
      }

      await this.addPackageSubpaths(importMap, packageName, config);
    }
  }

  private async addRemoteDependencies(importMap: ImportMapEntry): Promise<void> {
    if (!this.config.remotes) {
      return;
    }

    for (const [remoteName, remoteUrl] of Object.entries(this.config.remotes)) {
      try {
        const remoteEntry = await this.fetchRemoteEntry(remoteUrl);
        
        if (remoteEntry.metadata?.exposes) {
          for (const [exposePath, moduleUrl] of Object.entries(remoteEntry.metadata.exposes)) {
            const fullPath = `${remoteName}${exposePath}`;
            const baseUrl = new URL(remoteUrl).origin;
            importMap.imports[fullPath] = new URL(moduleUrl as string, baseUrl).href;
          }
        }
      } catch (error: any) {
        if (this.config.verbose) {
          console.warn(`[Native Federation] Failed to process remote ${remoteName}:`, error.message);
        }
      }
    }
  }

  private async addScopedMappings(importMap: ImportMapEntry): Promise<void> {
    const outputUrl = this.getOutputBaseUrl();
    
    if (!importMap.scopes) {
      importMap.scopes = {};
    }

    importMap.scopes[outputUrl] = {};

    for (const [packageName] of Object.entries(importMap.imports)) {
      if (this.config.skip?.includes(packageName)) {
        continue;
      }

      const scopedUrl = this.getScopedModuleUrl(packageName);
      if (scopedUrl !== importMap.imports[packageName]) {
        importMap.scopes[outputUrl][packageName] = scopedUrl;
      }
    }
  }

  private async addPackageSubpaths(importMap: ImportMapEntry, packageName: string, config: SharedPackageConfig): Promise<void> {
    try {
      const packagePath = path.join(this.config.workspaceRoot!, 'node_modules', packageName);
      const packageJson = JSON.parse(await fs.readFile(path.join(packagePath, 'package.json'), 'utf-8'));

      if (packageJson.exports) {
        for (const [exportPath, exportValue] of Object.entries(packageJson.exports)) {
          if (exportPath === '.') continue;

          const subpathKey = `${packageName}${exportPath}`;
          const subpathUrl = this.resolveExportValue(packageName, exportValue, config);
          
          if (subpathUrl) {
            importMap.imports[subpathKey] = subpathUrl;
          }
        }
      }
    } catch (error: any) {
      if (this.config.verbose) {
        console.warn(`[Native Federation] Failed to process subpaths for ${packageName}:`, error.message);
      }
    }
  }

  private resolveExportValue(packageName: string, exportValue: any, config: SharedPackageConfig): string | null {
    if (typeof exportValue === 'string') {
      return this.getSharedModuleUrl(packageName, config, exportValue);
    }

    if (typeof exportValue === 'object') {
      const importPath = exportValue.import || exportValue.default || exportValue.module;
      if (importPath) {
        return this.getSharedModuleUrl(packageName, config, importPath);
      }
    }

    return null;
  }

  private getSharedModuleUrl(packageName: string, config: SharedPackageConfig, subpath?: string): string {
    const baseUrl = this.getOutputBaseUrl();
    const modulePath = subpath || 'index.mjs';
    return `${baseUrl}/shared/${packageName}/${modulePath}`;
  }

  private getScopedModuleUrl(packageName: string): string {
    const baseUrl = this.getOutputBaseUrl();
    return `${baseUrl}/node_modules/${packageName}/index.mjs`;
  }

  private getOutputBaseUrl(): string {
    if (this.config.dev) {
      return `${window?.location?.origin || 'http://localhost:4200'}/${this.config.outputPath}`;
    }
    
    return `./${this.config.outputPath}`;
  }

  private async fetchRemoteEntry(remoteUrl: string): Promise<any> {
    try {
      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to fetch remote entry from ${remoteUrl}: ${error.message}`);
    }
  }

  async generateForRemote(remoteConfig: NativeFederationOptions): Promise<ImportMapEntry> {
    const originalConfig = this.config;
    this.config = { ...originalConfig, ...remoteConfig };

    try {
      return await this.generate();
    } finally {
      this.config = originalConfig;
    }
  }

  async validateImportMap(importMap: ImportMapEntry): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const [specifier, url] of Object.entries(importMap.imports)) {
      if (!this.isValidUrl(url)) {
        errors.push(`Invalid URL for specifier '${specifier}': ${url}`);
      }
    }

    if (importMap.scopes) {
      for (const [scope, mappings] of Object.entries(importMap.scopes)) {
        if (!this.isValidUrl(scope)) {
          errors.push(`Invalid scope URL: ${scope}`);
        }

        for (const [specifier, url] of Object.entries(mappings)) {
          if (!this.isValidUrl(url)) {
            errors.push(`Invalid URL for scoped specifier '${specifier}' in scope '${scope}': ${url}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url, 'http://localhost');
      return true;
    } catch {
      return false;
    }
  }

  async optimizeImportMap(importMap: ImportMapEntry): Promise<ImportMapEntry> {
    const optimized: ImportMapEntry = {
      imports: {},
      scopes: importMap.scopes ? {} : undefined
    };

    const sortedImports = Object.entries(importMap.imports).sort(([a], [b]) => a.localeCompare(b));
    for (const [specifier, url] of sortedImports) {
      optimized.imports[specifier] = url;
    }

    if (importMap.scopes && optimized.scopes) {
      const sortedScopes = Object.entries(importMap.scopes).sort(([a], [b]) => a.localeCompare(b));
      for (const [scope, mappings] of sortedScopes) {
        const sortedMappings = Object.entries(mappings).sort(([a], [b]) => a.localeCompare(b));
        optimized.scopes[scope] = Object.fromEntries(sortedMappings);
      }
    }

    return optimized;
  }
}