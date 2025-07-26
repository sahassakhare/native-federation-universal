import { ModuleLoader } from './module-loader.js';
import { FederationManifest } from '../types/federation.js';

/**
 * Client-side hydration support for SSR
 * Resumes federation state from server-rendered content
 */
export class HydrationClient extends ModuleLoader {
  private hydrationData?: any;
  private ssrModuleCache = new Map<string, any>();

  async initializeWithHydration(manifestPath?: string): Promise<void> {
    // Extract hydration data from SSR
    this.extractHydrationData();
    
    // Initialize base module loader
    await this.initialize(manifestPath);
    
    // Restore SSR module cache
    await this.restoreSSRModules();
  }

  /**
   * Load remote module with hydration support
   * Checks SSR cache first, then falls back to normal loading
   */
  async loadRemoteModule<T = any>(remoteName: string, modulePath: string): Promise<T> {
    const moduleId = `${remoteName}${modulePath}`;
    
    // Check if module was loaded during SSR
    if (this.ssrModuleCache.has(moduleId)) {
      const cached = this.ssrModuleCache.get(moduleId);
      
      // If it's a fallback, try to load the real module
      if (cached.__fallback) {
        try {
          return await super.loadRemoteModule(remoteName, modulePath);
        } catch (error) {
          console.warn(`[Hydration] Failed to load real module, using fallback:`, error);
          return cached;
        }
      }
      
      return cached;
    }
    
    // Fall back to normal loading
    return super.loadRemoteModule(remoteName, modulePath);
  }

  /**
   * Check if module was server-rendered
   */
  wasServerRendered(remoteName: string, modulePath: string): boolean {
    const moduleId = `${remoteName}${modulePath}`;
    return this.ssrModuleCache.has(moduleId);
  }

  /**
   * Get hydration data for a specific module
   */
  getModuleHydrationData(remoteName: string, modulePath: string): any {
    const moduleId = `${remoteName}${modulePath}`;
    const cached = this.ssrModuleCache.get(moduleId);
    return cached?.hydrationData;
  }

  private extractHydrationData(): void {
    // Extract hydration data injected by SSR
    const hydrationData = (window as any).__NF_HYDRATION__;
    const loadedModules = (window as any).__NF_LOADED_MODULES__;
    
    if (hydrationData) {
      this.hydrationData = hydrationData;
      
      // Restore import map if available
      if (hydrationData.importMap) {
        this.injectImportMap({ imports: hydrationData.importMap });
      }
    }
    
    if (loadedModules) {
      loadedModules.forEach((moduleInfo: any, moduleId: string) => {
        this.ssrModuleCache.set(moduleId, {
          ...moduleInfo,
          __fromSSR: true
        });
      });
    }
  }

  private async restoreSSRModules(): Promise<void> {
    if (!this.hydrationData?.loadedModules) {
      return;
    }

    // Process each module that was loaded during SSR
    for (const moduleInfo of this.hydrationData.loadedModules) {
      try {
        // For non-fallback modules, try to establish client-side reference
        if (!moduleInfo.hydrationData?.fallback) {
          const module = await import(moduleInfo.url);
          this.ssrModuleCache.set(moduleInfo.id, module);
        }
      } catch (error) {
        console.warn(`[Hydration] Could not restore module ${moduleInfo.id}:`, error);
      }
    }
  }

  private injectImportMap(importMap: any): void {
    const existingScript = document.querySelector('script[type="importmap"]');
    if (existingScript) {
      // Merge with existing import map
      const existing = JSON.parse(existingScript.textContent || '{}');
      const merged = {
        imports: {
          ...existing.imports,
          ...importMap.imports
        }
      };
      existingScript.textContent = JSON.stringify(merged);
    } else {
      // Create new import map
      const script = document.createElement('script');
      script.type = 'importmap';
      script.textContent = JSON.stringify(importMap);
      document.head.appendChild(script);
    }
  }
}

/**
 * Angular-specific hydration utilities
 */
export class AngularHydrationUtils {
  /**
   * Initialize Native Federation with Angular Universal hydration
   */
  static async initializeForAngularSSR(
    manifestPath?: string
  ): Promise<HydrationClient> {
    const client = new HydrationClient();
    await client.initializeWithHydration(manifestPath);
    
    // Wait for Angular hydration to complete before loading remote modules
    if ((window as any).ng && (window as any).ng.getInjector) {
      await this.waitForAngularHydration();
    }
    
    return client;
  }

  /**
   * Wait for Angular hydration to complete
   */
  private static async waitForAngularHydration(): Promise<void> {
    return new Promise((resolve) => {
      const checkHydration = () => {
        const appRef = (window as any).ng?.getInjector?.()?.get?.('ApplicationRef');
        if (appRef && appRef.isStable) {
          appRef.isStable.subscribe((stable: boolean) => {
            if (stable) {
              resolve();
            }
          });
        } else {
          // Fallback: wait a bit and try again
          setTimeout(checkHydration, 100);
        }
      };
      
      checkHydration();
    });
  }

  /**
   * Create Angular component wrapper that handles SSR/hydration
   */
  static createSSRComponent<T>(
    loader: () => Promise<{ default: T }>,
    fallbackTemplate: string = '<div>Loading...</div>'
  ) {
    return {
      template: fallbackTemplate,
      async ngOnInit() {
        try {
          const { default: Component } = await loader();
          // Dynamic component loading logic would go here
          // This would integrate with Angular's ViewContainerRef
        } catch (error) {
          console.error('Failed to load federated component:', error);
        }
      }
    };
  }
}

/**
 * Universal federation runtime that works in both SSR and client
 */
export class UniversalFederationRuntime {
  private loader: ModuleLoader | HydrationClient;
  private isSSR: boolean;

  constructor() {
    this.isSSR = typeof window === 'undefined';
    
    if (this.isSSR) {
      // Will be set by SSR setup
      this.loader = null as any;
    } else {
      this.loader = new HydrationClient();
    }
  }

  async initialize(manifestPath?: string): Promise<void> {
    if (this.isSSR) {
      // SSR initialization will be handled separately
      return;
    }
    
    await (this.loader as HydrationClient).initializeWithHydration(manifestPath);
  }

  async loadRemoteModule<T = any>(remoteName: string, modulePath: string): Promise<T> {
    if (this.isSSR) {
      throw new Error('SSR module loading should use SSRModuleLoader directly');
    }
    
    return this.loader.loadRemoteModule(remoteName, modulePath);
  }

  async loadSharedModule<T = any>(packageName: string): Promise<T> {
    return this.loader.loadSharedModule(packageName);
  }

  wasServerRendered(remoteName: string, modulePath: string): boolean {
    if (this.isSSR) {
      return false;
    }
    
    return (this.loader as HydrationClient).wasServerRendered(remoteName, modulePath);
  }
}

// Global runtime instance
export const federationRuntime = new UniversalFederationRuntime();