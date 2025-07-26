import { ModuleLoader } from './module-loader.js';

let moduleLoader: ModuleLoader | null = null;
let initialized = false;

export async function initFederation(manifestPath?: string): Promise<void> {
  if (initialized) {
    console.warn('[Native Federation] Federation already initialized');
    return;
  }

  try {
    moduleLoader = new ModuleLoader();
    await moduleLoader.initialize(manifestPath);
    initialized = true;

    if (typeof window !== 'undefined') {
      (window as any).__nativeFederation = {
        loadRemoteModule,
        loadSharedModule,
        preloadModule,
        getLoadedModules,
        clearCache
      };
    }

    console.log('[Native Federation] Federation initialized successfully');
  } catch (error: any) {
    console.error('[Native Federation] Failed to initialize federation:', error);
    throw error;
  }
}

export async function loadRemoteModule<T = any>(remoteName: string, modulePath: string): Promise<T> {
  if (!moduleLoader) {
    throw new Error('[Native Federation] Federation not initialized. Call initFederation() first.');
  }

  return moduleLoader.loadRemoteModule<T>(remoteName, modulePath);
}

export async function loadSharedModule<T = any>(packageName: string): Promise<T> {
  if (!moduleLoader) {
    throw new Error('[Native Federation] Federation not initialized. Call initFederation() first.');
  }

  return moduleLoader.loadSharedModule<T>(packageName);
}

export async function preloadModule(remoteName: string, modulePath: string): Promise<void> {
  if (!moduleLoader) {
    throw new Error('[Native Federation] Federation not initialized. Call initFederation() first.');
  }

  return moduleLoader.preloadModule(remoteName, modulePath);
}

export function getLoadedModules() {
  if (!moduleLoader) {
    return new Map();
  }

  return moduleLoader.getLoadedModules();
}

export function clearCache(): void {
  if (moduleLoader) {
    moduleLoader.clearCache();
  }
}

export function isInitialized(): boolean {
  return initialized;
}

export async function reinitialize(manifestPath?: string): Promise<void> {
  if (moduleLoader) {
    moduleLoader.clearCache();
  }
  
  initialized = false;
  moduleLoader = null;
  
  await initFederation(manifestPath);
}

export function getFederationStatus() {
  return {
    initialized,
    loadedModulesCount: moduleLoader?.getLoadedModules().size || 0,
    hasModuleLoader: !!moduleLoader
  };
}

if (typeof window !== 'undefined') {
  (window as any).__nativeFederation_version = '1.0.0';
  
  window.addEventListener('beforeunload', () => {
    if (moduleLoader) {
      moduleLoader.clearCache();
    }
  });
}