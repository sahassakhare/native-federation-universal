import { Injectable } from '@angular/core';
import { ModuleLoader } from './module-loader';
import { ModuleInfo, FederationManifest } from '../types/federation';

@Injectable({
  providedIn: 'root'
})
export class FederationRuntime {
  private initialized = false;
  private manifest: FederationManifest | null = null;

  constructor(private moduleLoader: ModuleLoader) {}

  async initialize(manifestPath?: string): Promise<void> {
    if (this.initialized) {
      console.warn('[Native Federation] Federation already initialized');
      return;
    }

    try {
      await this.moduleLoader.initialize(manifestPath);
      this.initialized = true;

      if (typeof window !== 'undefined') {
        (window as any).__nativeFederation = {
          loadRemoteModule: this.loadRemoteModule.bind(this),
          loadSharedModule: this.loadSharedModule.bind(this),
          preloadModule: this.preloadModule.bind(this),
          getLoadedModules: this.getLoadedModules.bind(this),
          clearCache: this.clearCache.bind(this)
        };
      }

      console.log('[Native Federation] Federation initialized successfully');
    } catch (error: any) {
      console.error('[Native Federation] Failed to initialize federation:', error);
      throw error;
    }
  }

  async loadRemoteModule<T = any>(remoteName: string, modulePath: string): Promise<T> {
    if (!this.initialized) {
      throw new Error('[Native Federation] Federation not initialized. Call initialize() first.');
    }

    return this.moduleLoader.loadRemoteModule<T>(remoteName, modulePath);
  }

  async loadSharedModule<T = any>(packageName: string): Promise<T> {
    if (!this.initialized) {
      throw new Error('[Native Federation] Federation not initialized. Call initialize() first.');
    }

    return this.moduleLoader.loadSharedModule<T>(packageName);
  }

  async preloadModule(remoteName: string, modulePath: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('[Native Federation] Federation not initialized. Call initialize() first.');
    }

    return this.moduleLoader.preloadModule(remoteName, modulePath);
  }

  getLoadedModules() {
    if (!this.initialized) {
      return new Map();
    }

    return this.moduleLoader.getLoadedModules();
  }

  clearCache(): void {
    this.moduleLoader.clearCache();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async reinitialize(manifestPath?: string): Promise<void> {
    this.moduleLoader.clearCache();
    this.initialized = false;
    await this.initialize(manifestPath);
  }

  getFederationStatus() {
    return {
      initialized: this.initialized,
      loadedModulesCount: this.moduleLoader.getLoadedModules().size,
      hasModuleLoader: true
    };
  }
}

// Export functions for backward compatibility
export async function initFederation(manifestPath?: string): Promise<void> {
  // Deprecated - use FederationRuntime class instead
  console.warn('[Native Federation] initFederation() is deprecated. Use FederationRuntime class instead.');
}

export async function loadRemoteModule<T = any>(remoteName: string, modulePath: string): Promise<T> {
  // Deprecated - use FederationRuntime class instead
  throw new Error('[Native Federation] loadRemoteModule() is deprecated. Use FederationRuntime class instead.');
}