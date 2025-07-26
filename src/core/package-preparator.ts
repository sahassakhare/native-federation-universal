import * as fs from 'fs/promises';
import * as path from 'path';
import { NativeFederationOptions, PreparedPackage } from '../types/federation.js';

export class PackagePreparator {
  private config: NativeFederationOptions;
  private cacheDir: string;
  private preparedPackages = new Map<string, PreparedPackage>();

  constructor(config: NativeFederationOptions) {
    this.config = config;
    this.cacheDir = path.resolve(config.workspaceRoot!, config.cacheDir!);
  }

  async preparePackage(packageName: string): Promise<PreparedPackage> {
    if (this.preparedPackages.has(packageName)) {
      return this.preparedPackages.get(packageName)!;
    }

    const packagePath = await this.resolvePackagePath(packageName);
    const packageJson = await this.readPackageJson(packagePath);
    
    const prepared: PreparedPackage = {
      name: packageName,
      version: packageJson.version || '0.0.0',
      path: packagePath,
      entryPoint: await this.findEntryPoint(packagePath, packageJson),
      isEsm: await this.isESMPackage(packagePath, packageJson),
      dependencies: Object.keys(packageJson.dependencies || {})
    };

    if (!prepared.isEsm) {
      await this.convertToESM(prepared);
    }

    await this.cachePackage(prepared);
    this.preparedPackages.set(packageName, prepared);

    return prepared;
  }

  private async resolvePackagePath(packageName: string): Promise<string> {
    try {
      const nodeModulesPath = path.join(this.config.workspaceRoot!, 'node_modules', packageName);
      await fs.access(nodeModulesPath);
      return nodeModulesPath;
    } catch {
      throw new Error(`Package ${packageName} not found in node_modules`);
    }
  }

  private async readPackageJson(packagePath: string): Promise<any> {
    try {
      const packageJsonPath = path.join(packagePath, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      throw new Error(`Invalid package.json in ${packagePath}`);
    }
  }

  private async findEntryPoint(packagePath: string, packageJson: any): Promise<string> {
    const possibleEntries = [
      packageJson.module,
      packageJson.main,
      packageJson.exports?.['.']?.import,
      packageJson.exports?.['.']?.default,
      'index.js',
      'index.mjs',
      'index.ts'
    ].filter(Boolean);

    for (const entry of possibleEntries) {
      const entryPath = path.join(packagePath, entry);
      try {
        await fs.access(entryPath);
        return entry;
      } catch {
        continue;
      }
    }

    throw new Error(`No valid entry point found for package at ${packagePath}`);
  }

  private async isESMPackage(packagePath: string, packageJson: any): Promise<boolean> {
    if (packageJson.type === 'module') {
      return true;
    }

    if (packageJson.module) {
      return true;
    }

    if (packageJson.exports?.['.']?.import) {
      return true;
    }

    const entryPoint = await this.findEntryPoint(packagePath, packageJson);
    return entryPoint.endsWith('.mjs') || entryPoint.endsWith('.esm.js');
  }

  private async convertToESM(prepared: PreparedPackage): Promise<void> {
    const cachedPath = path.join(this.cacheDir, 'esm-packages', prepared.name);
    
    try {
      await fs.mkdir(path.dirname(cachedPath), { recursive: true });
      
      const originalPath = path.join(prepared.path, prepared.entryPoint);
      const content = await fs.readFile(originalPath, 'utf-8');
      
      const esmContent = this.transformToESM(content, prepared.name);
      const esmPath = path.join(cachedPath, 'index.mjs');
      
      await fs.writeFile(esmPath, esmContent);
      
      prepared.path = cachedPath;
      prepared.entryPoint = 'index.mjs';
      prepared.isEsm = true;

      if (this.config.verbose) {
        console.log(`[Native Federation] Converted ${prepared.name} to ESM`);
      }
    } catch (error: any) {
      throw new Error(`Failed to convert ${prepared.name} to ESM: ${error.message}`);
    }
  }

  private transformToESM(content: string, _packageName: string): string {
    let transformed = content;

    transformed = transformed.replace(/module\.exports\s*=\s*(.+)/g, 'export default $1');
    
    transformed = transformed.replace(/exports\.(\w+)\s*=\s*(.+)/g, 'export const $1 = $2');
    
    transformed = transformed.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g, 'import $1 from \'$2\'');
    transformed = transformed.replace(/const\s*{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\)/g, 'import { $1 } from \'$2\'');
    
    transformed = transformed.replace(/require\(['"]([^'"]+)['"]\)/g, 'await import(\'$1\')');

    if (!transformed.includes('export')) {
      transformed += '\nexport default {};';
    }

    return transformed;
  }

  private async cachePackage(prepared: PreparedPackage): Promise<void> {
    const cacheKey = `${prepared.name}@${prepared.version}`;
    const cachePath = path.join(this.cacheDir, 'metadata', `${cacheKey}.json`);
    
    try {
      await fs.mkdir(path.dirname(cachePath), { recursive: true });
      await fs.writeFile(cachePath, JSON.stringify(prepared, null, 2));
    } catch (error: any) {
      if (this.config.verbose) {
        console.warn(`[Native Federation] Failed to cache package ${prepared.name}:`, error.message);
      }
    }
  }

  async getCachedPackage(packageName: string, version: string): Promise<PreparedPackage | null> {
    const cacheKey = `${packageName}@${version}`;
    const cachePath = path.join(this.cacheDir, 'metadata', `${cacheKey}.json`);
    
    try {
      const content = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(content) as PreparedPackage;
    } catch {
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      this.preparedPackages.clear();
    } catch (error: any) {
      if (this.config.verbose) {
        console.warn('[Native Federation] Failed to clear cache:', error.message);
      }
    }
  }
}