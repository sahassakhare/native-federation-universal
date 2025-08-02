import * as fs from 'fs/promises';
import * as path from 'path';
import { NativeFederationOptions, SharedConfig, SharedPackageConfig, PreparedPackage } from '../types/federation';
import { PackagePreparator } from './package-preparator';

export class SharedDependencyResolver {
  private config: NativeFederationOptions;
  private packagePreparator: PackagePreparator;
  private resolvedShared = new Map<string, SharedPackageConfig>();

  constructor(config: NativeFederationOptions) {
    this.config = config;
    this.packagePreparator = new PackagePreparator(config);
  }

  async resolveSharedDependency(packageName: string): Promise<{ path: string; config: SharedPackageConfig } | null> {
    if (!this.config.shared) {
      return null;
    }

    const sharedConfig = this.config.shared[packageName];
    if (!sharedConfig) {
      return null;
    }

    if (this.resolvedShared.has(packageName)) {
      const config = this.resolvedShared.get(packageName)!;
      return { path: this.getSharedModulePath(packageName, config), config };
    }

    const resolvedConfig = await this.resolveSharedConfig(packageName, sharedConfig);
    this.resolvedShared.set(packageName, resolvedConfig);

    return {
      path: this.getSharedModulePath(packageName, resolvedConfig),
      config: resolvedConfig
    };
  }

  async resolveAllSharedDependencies(): Promise<Map<string, SharedPackageConfig>> {
    if (!this.config.shared) {
      return new Map();
    }

    const resolvedMap = new Map<string, SharedPackageConfig>();

    for (const [packageName, sharedConfig] of Object.entries(this.config.shared)) {
      if (typeof sharedConfig === 'boolean' && !sharedConfig) {
        continue;
      }

      try {
        const resolved = await this.resolveSharedConfig(packageName, sharedConfig);
        resolvedMap.set(packageName, resolved);
        this.resolvedShared.set(packageName, resolved);
      } catch (error: any) {
        if (this.config.verbose) {
          console.warn(`[Native Federation] Failed to resolve shared dependency ${packageName}:`, error.message);
        }
      }
    }

    return resolvedMap;
  }

  private async resolveSharedConfig(packageName: string, config: SharedPackageConfig | boolean): Promise<SharedPackageConfig> {
    const baseConfig: SharedPackageConfig = {
      singleton: false,
      strictVersion: false,
      requiredVersion: 'auto',
      packageName,
      shareKey: packageName,
      shareScope: 'default',
      import: packageName,
      eager: false
    };

    if (typeof config === 'boolean') {
      return baseConfig;
    }

    const resolvedConfig = { ...baseConfig, ...config };

    if (resolvedConfig.requiredVersion === 'auto') {
      resolvedConfig.requiredVersion = await this.detectRequiredVersion(packageName);
    }

    if (!resolvedConfig.version) {
      resolvedConfig.version = await this.detectInstalledVersion(packageName);
    }

    await this.packagePreparator.preparePackage(packageName);

    return resolvedConfig;
  }

  private async detectRequiredVersion(packageName: string): Promise<string> {
    try {
      const packageJsonPath = path.join(this.config.workspaceRoot!, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      const version = packageJson.dependencies?.[packageName] || 
                     packageJson.devDependencies?.[packageName] ||
                     packageJson.peerDependencies?.[packageName];

      if (version) {
        return version.replace(/[\^~]/, '');
      }

      return await this.detectInstalledVersion(packageName);
    } catch {
      return '*';
    }
  }

  private async detectInstalledVersion(packageName: string): Promise<string> {
    try {
      const packagePath = path.join(this.config.workspaceRoot!, 'node_modules', packageName, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
      return packageJson.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  private getSharedModulePath(packageName: string, config: SharedPackageConfig): string {
    if (config.import === false) {
      return '';
    }

    const basePath = path.join(this.config.outputPath!, 'shared');
    return path.join(basePath, packageName, 'index.mjs');
  }

  async generateSharedModuleMap(): Promise<Record<string, string>> {
    const sharedMap: Record<string, string> = {};

    for (const [packageName, config] of this.resolvedShared.entries()) {
      if (config.import !== false) {
        const modulePath = this.getSharedModulePath(packageName, config);
        sharedMap[config.shareKey!] = modulePath;
      }
    }

    return sharedMap;
  }

  async validateSharedDependencies(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const [packageName, config] of this.resolvedShared.entries()) {
      try {
        if (config.strictVersion) {
          const installedVersion = await this.detectInstalledVersion(packageName);
          const requiredVersion = config.requiredVersion!;

          if (installedVersion !== requiredVersion.replace(/[\^~]/, '')) {
            errors.push(`Version mismatch for ${packageName}: required ${requiredVersion}, installed ${installedVersion}`);
          }
        }

        if (config.singleton) {
          const existingConfig = Array.from(this.resolvedShared.values())
            .find(c => c.shareKey === config.shareKey && c !== config);
          
          if (existingConfig) {
            errors.push(`Singleton conflict for ${config.shareKey}: multiple packages trying to share the same key`);
          }
        }
      } catch (error: any) {
        errors.push(`Validation failed for ${packageName}: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getResolvedSharedDependencies(): Map<string, SharedPackageConfig> {
    return new Map(this.resolvedShared);
  }

  async createSharedModuleProxy(packageName: string, config: SharedPackageConfig): Promise<string> {
    const template = `
// Shared module proxy for ${packageName}
const sharedModule = await import('${config.import}');

export default sharedModule.default || sharedModule;
export * from '${config.import}';

// Metadata for federation
export const __federation_shared__ = {
  name: '${packageName}',
  version: '${config.version}',
  singleton: ${config.singleton},
  shareKey: '${config.shareKey}',
  shareScope: '${config.shareScope}'
};
`;

    return template.trim();
  }

  clear(): void {
    this.resolvedShared.clear();
  }
}