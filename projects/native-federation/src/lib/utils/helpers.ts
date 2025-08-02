import { SharedConfig, ShareOptions, SharedPackageConfig } from '../types/federation.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export function shareAll(options: ShareOptions = {}): SharedConfig {
  const defaultOptions: ShareOptions = {
    singleton: false,
    strictVersion: false,
    requiredVersion: 'auto',
    eager: false
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return new Proxy({} as SharedConfig, {
    get(target, prop: string) {
      if (typeof prop === 'string' && !target[prop]) {
        target[prop] = {
          ...mergedOptions,
          packageName: prop,
          shareKey: prop
        };
      }
      return target[prop];
    },

    has(target, prop: string) {
      return true;
    },

    ownKeys(target) {
      return Object.keys(target);
    },

    getOwnPropertyDescriptor(target, prop) {
      return {
        enumerable: true,
        configurable: true
      };
    }
  });
}

export function share(packages: string[] | Record<string, ShareOptions | boolean>, defaultOptions: ShareOptions = {}): SharedConfig {
  const result: SharedConfig = {};

  if (Array.isArray(packages)) {
    for (const packageName of packages) {
      result[packageName] = {
        ...defaultOptions,
        packageName,
        shareKey: packageName
      };
    }
  } else {
    for (const [packageName, config] of Object.entries(packages)) {
      if (typeof config === 'boolean') {
        if (config) {
          result[packageName] = {
            ...defaultOptions,
            packageName,
            shareKey: packageName
          };
        }
      } else {
        result[packageName] = {
          ...defaultOptions,
          ...config,
          packageName,
          shareKey: packageName
        };
      }
    }
  }

  return result;
}

export function singleton(packages: string[] | Record<string, ShareOptions>): SharedConfig {
  const baseOptions: ShareOptions = {
    singleton: true,
    strictVersion: true
  };

  if (Array.isArray(packages)) {
    return share(packages, baseOptions);
  } else {
    const result: SharedConfig = {};
    for (const [packageName, config] of Object.entries(packages)) {
      result[packageName] = {
        ...baseOptions,
        ...config,
        singleton: true,
        packageName,
        shareKey: packageName
      };
    }
    return result;
  }
}

export async function discoverDependencies(workspaceRoot: string = process.cwd()): Promise<string[]> {
  try {
    const packageJsonPath = path.join(workspaceRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    const dependencies = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {})
    ];

    return dependencies.filter(dep => !dep.startsWith('@types/'));
  } catch {
    return [];
  }
}

export async function shareAllDependencies(options: ShareOptions = {}, workspaceRoot?: string): Promise<SharedConfig> {
  const dependencies = await discoverDependencies(workspaceRoot);
  return share(dependencies, options);
}

export function withFederation(baseConfig: any, federationConfig: any) {
  return {
    ...baseConfig,
    plugins: [
      ...(baseConfig.plugins || []),
      federationConfig
    ]
  };
}

export function createRemoteMap(remotes: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [name, url] of Object.entries(remotes)) {
    if (url.endsWith('/')) {
      result[name] = url + 'remoteEntry.json';
    } else if (url.endsWith('.json')) {
      result[name] = url;
    } else {
      result[name] = url + '/remoteEntry.json';
    }
  }
  
  return result;
}

export function normalizeExposedModules(exposes: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(exposes)) {
    const normalizedKey = key.startsWith('./') ? key : './' + key;
    result[normalizedKey] = value;
  }
  
  return result;
}

export function validateFederationConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.name && typeof config.name !== 'string') {
    errors.push('Federation name must be a string');
  }

  if (config.exposes) {
    if (typeof config.exposes !== 'object') {
      errors.push('Exposes must be an object');
    } else {
      for (const [key, value] of Object.entries(config.exposes)) {
        if (!key.startsWith('./')) {
          errors.push(`Exposed key '${key}' must start with './'`);
        }
        if (typeof value !== 'string') {
          errors.push(`Exposed value for '${key}' must be a string`);
        }
      }
    }
  }

  if (config.remotes) {
    if (typeof config.remotes !== 'object') {
      errors.push('Remotes must be an object');
    } else {
      for (const [key, value] of Object.entries(config.remotes)) {
        if (typeof key !== 'string' || typeof value !== 'string') {
          errors.push(`Remote entry '${key}' must have string key and value`);
        }
      }
    }
  }

  if (config.shared) {
    if (typeof config.shared !== 'object') {
      errors.push('Shared must be an object');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export class FederationConfigBuilder {
  private config: any = {};

  name(name: string): this {
    this.config.name = name;
    return this;
  }

  exposes(exposes: Record<string, string>): this {
    this.config.exposes = normalizeExposedModules(exposes);
    return this;
  }

  remotes(remotes: Record<string, string>): this {
    this.config.remotes = createRemoteMap(remotes);
    return this;
  }

  shared(shared: SharedConfig): this {
    this.config.shared = shared;
    return this;
  }

  skip(packages: string[]): this {
    this.config.skip = packages;
    return this;
  }

  dev(isDev: boolean = true): this {
    this.config.dev = isDev;
    return this;
  }

  verbose(isVerbose: boolean = true): this {
    this.config.verbose = isVerbose;
    return this;
  }

  build() {
    const validation = validateFederationConfig(this.config);
    if (!validation.valid) {
      throw new Error(`Invalid federation config: ${validation.errors.join(', ')}`);
    }
    return { ...this.config };
  }
}

export function createFederationConfig(): FederationConfigBuilder {
  return new FederationConfigBuilder();
}