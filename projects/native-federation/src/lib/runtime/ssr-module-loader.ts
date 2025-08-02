import { Injectable, Optional } from '@angular/core';
import { FederationManifest, ModuleInfo, VersionStrategy } from '../types/federation';
import { VersionManager } from './version-manager';

/**
 * Server-side module loader for SSR environments
 * Handles module federation during server-side rendering
 */
@Injectable({
  providedIn: 'root'
})
export class SSRModuleLoader {
  private loadedModules = new Map<string, ModuleInfo>();
  private manifest: FederationManifest = {};
  private moduleCache = new Map<string, any>();
  private manifestPath?: string;
  private ssrContext?: {
    manifestPath?: string;
    fetch?: typeof fetch;
    require?: any;
  };
  
  constructor(
    private versionManager: VersionManager,
    @Optional() ssrContext?: {
      manifestPath?: string;
      fetch?: typeof fetch;
      require?: any;
    }
  ) {
    this.manifestPath = ssrContext?.manifestPath;
    this.ssrContext = ssrContext;
  }

  async initialize(): Promise<void> {
    if (this.manifestPath) {
      this.manifest = await this.loadManifest(this.manifestPath);
    }
  }

  /**
   * Load remote module during SSR
   * Returns pre-rendered content and hydration instructions
   */
  async loadRemoteModule<T = any>(
    remoteName: string, 
    modulePath: string
  ): Promise<{
    module: T;
    ssrContent?: string;
    hydrationData?: any;
  }> {
    const moduleId = `${remoteName}${modulePath}`;
    
    // Check cache first
    if (this.moduleCache.has(moduleId)) {
      return { module: this.moduleCache.get(moduleId) };
    }

    try {
      // In SSR, we need to resolve module path differently
      const moduleUrl = await this.resolveSSRModuleUrl(remoteName, modulePath);
      const module = await this.loadSSRModule(moduleUrl);
      
      // Cache the module
      this.moduleCache.set(moduleId, module);
      
      this.loadedModules.set(moduleId, {
        id: moduleId,
        name: remoteName,
        version: '1.0.0',
        url: moduleUrl,
        deps: [],
        loaded: true,
        singleton: false
      });

      // Extract SSR content if available
      let ssrContent: string | undefined;
      let hydrationData: any;

      if (module.renderToString && typeof module.renderToString === 'function') {
        ssrContent = await module.renderToString();
      }

      if (module.getHydrationData && typeof module.getHydrationData === 'function') {
        hydrationData = await module.getHydrationData();
      }

      return { module, ssrContent, hydrationData };
    } catch (error: any) {
      // In SSR, we might want to return fallback content instead of throwing
      console.warn(`[SSR] Failed to load remote module ${remoteName}${modulePath}:`, error.message);
      
      return {
        module: this.createFallbackModule(remoteName, modulePath),
        ssrContent: `<!-- SSR: Failed to load ${remoteName}${modulePath} -->`,
        hydrationData: { fallback: true, remoteName, modulePath }
      };
    }
  }

  /**
   * Load shared module during SSR
   */
  async loadSharedModule<T = any>(
    packageName: string, 
    versionStrategy?: VersionStrategy
  ): Promise<T> {
    const moduleInfo = this.loadedModules.get(packageName);
    
    if (moduleInfo?.singleton && moduleInfo.loaded && this.moduleCache.has(packageName)) {
      return this.moduleCache.get(packageName);
    }

    try {
      // In Node.js environment, we can use require
      const module = this.ssrContext?.require 
        ? this.ssrContext.require(packageName)
        : await import(packageName);
      
      this.moduleCache.set(packageName, module);
      
      this.loadedModules.set(packageName, {
        id: packageName,
        name: packageName,
        version: '1.0.0', // We'd need to resolve this properly
        url: packageName,
        deps: [],
        loaded: true,
        singleton: true
      });

      return module;
    } catch (error: any) {
      throw new Error(`Failed to load shared module ${packageName} in SSR: ${error.message}`);
    }
  }

  /**
   * Generate hydration manifest for client-side
   */
  generateHydrationManifest(): {
    loadedModules: Array<{ id: string; name: string; url: string; hydrationData?: any }>;
    importMap: Record<string, string>;
  } {
    const loadedModules: Array<{ id: string; name: string; url: string; hydrationData?: any }> = [];
    
    this.loadedModules.forEach((moduleInfo) => {
      loadedModules.push({
        id: moduleInfo.id,
        name: moduleInfo.name,
        url: moduleInfo.url,
        hydrationData: (moduleInfo as any).hydrationData
      });
    });

    return {
      loadedModules,
      importMap: this.generateImportMap()
    };
  }

  private async loadManifest(manifestPath: string): Promise<FederationManifest> {
    try {
      const fetchFn = this.ssrContext?.fetch || fetch;
      const response = await fetchFn(manifestPath);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.warn(`[SSR] Failed to load manifest from ${manifestPath}:`, error.message);
      return {};
    }
  }

  private async resolveSSRModuleUrl(remoteName: string, modulePath: string): Promise<string> {
    // In SSR, we might need to resolve to local file paths or URLs
    if (this.manifest[remoteName]) {
      const remoteUrl = this.manifest[remoteName];
      
      // Handle local file paths for SSR
      if (remoteUrl.startsWith('/') || remoteUrl.startsWith('./')) {
        return `${remoteUrl}${modulePath}`;
      }
      
      // Handle remote URLs
      return `${remoteUrl}${modulePath}`;
    }

    throw new Error(`Remote ${remoteName} not found in SSR manifest`);
  }

  private async loadSSRModule(url: string): Promise<any> {
    try {
      // In Node.js environment, handle different module loading strategies
      if (url.startsWith('http')) {
        // Remote module - might need special handling
        const fetchFn = this.ssrContext?.fetch || fetch;
        const response = await fetchFn(url);
        const moduleCode = await response.text();
        
        // In production SSR, you'd want to evaluate this safely
        // For now, we'll simulate a module structure
        return { default: null, __ssrModule: true };
      } else {
        // Local module
        return this.ssrContext?.require 
          ? this.ssrContext.require(url)
          : await import(url);
      }
    } catch (error: any) {
      throw new Error(`SSR module import failed: ${error.message}`);
    }
  }

  private createFallbackModule(remoteName: string, modulePath: string): any {
    return {
      default: null,
      __fallback: true,
      __remoteName: remoteName,
      __modulePath: modulePath,
      renderToString: () => `<!-- Fallback for ${remoteName}${modulePath} -->`,
      getHydrationData: () => ({ fallback: true })
    };
  }

  private generateImportMap(): Record<string, string> {
    const importMap: Record<string, string> = {};
    
    this.loadedModules.forEach((moduleInfo) => {
      if (moduleInfo.name.startsWith('@') || !moduleInfo.name.includes('/')) {
        // Shared dependency
        importMap[moduleInfo.name] = moduleInfo.url;
      }
    });

    return importMap;
  }

  getLoadedModules(): Map<string, ModuleInfo> {
    return new Map(this.loadedModules);
  }

  clearCache(): void {
    this.loadedModules.clear();
    this.moduleCache.clear();
  }
}

/**
 * SSR utilities for framework integration
 */
export class SSRFederationUtils {
  static injectHydrationScript(
    html: string, 
    hydrationManifest: ReturnType<SSRModuleLoader['generateHydrationManifest']>
  ): string {
    const script = `
      <script type="module">
        // Hydration data for Native Federation
        window.__NF_HYDRATION__ = ${JSON.stringify(hydrationManifest)};
        
        // Pre-populate module cache
        if (window.__NF_HYDRATION__.loadedModules) {
          window.__NF_LOADED_MODULES__ = new Map();
          window.__NF_HYDRATION__.loadedModules.forEach(mod => {
            window.__NF_LOADED_MODULES__.set(mod.id, mod);
          });
        }
      </script>
    `;

    // Inject before closing head tag
    return html.replace('</head>', `${script}</head>`);
  }

  static generatePreloadLinks(
    loadedModules: Array<{ id: string; name: string; url: string }>
  ): string {
    return loadedModules
      .map(mod => `<link rel="modulepreload" href="${mod.url}">`)
      .join('\n');
  }
}