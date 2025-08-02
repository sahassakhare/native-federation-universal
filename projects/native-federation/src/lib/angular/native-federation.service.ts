import { Injectable } from '@angular/core';
import { FederationRuntime } from '../runtime/federation-runtime';
import { ModuleLoader } from '../runtime/module-loader';

@Injectable({
  providedIn: 'root'
})
export class NativeFederationService {
  constructor(
    private runtime: FederationRuntime,
    private moduleLoader: ModuleLoader
  ) {}

  /**
   * Initialize the federation runtime with a manifest
   */
  async initialize(manifestUrl: string): Promise<void> {
    await this.runtime.initialize(manifestUrl);
  }

  /**
   * Load a remote module dynamically
   */
  async loadRemoteModule<T = any>(remoteName: string, modulePath: string): Promise<T> {
    return this.moduleLoader.loadRemoteModule<T>(remoteName, modulePath);
  }

  /**
   * Check if a module is loaded
   */
  isModuleLoaded(remoteName: string, modulePath: string): boolean {
    const moduleId = `${remoteName}${modulePath}`;
    return this.moduleLoader.getLoadedModules().has(moduleId);
  }

  /**
   * Preload a remote module
   */
  async preloadModule(remoteName: string, modulePath: string): Promise<void> {
    await this.moduleLoader.preloadModule(remoteName, modulePath);
  }

  /**
   * Get the runtime instance for advanced usage
   */
  getRuntime(): FederationRuntime {
    return this.runtime;
  }

  /**
   * Get the module loader instance for advanced usage
   */
  getModuleLoader(): ModuleLoader {
    return this.moduleLoader;
  }
}