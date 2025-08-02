import { Injectable } from '@angular/core';
import { FederationManifest, ModuleInfo, VersionStrategy } from '../types/federation';
import { VersionManager } from './version-manager';

@Injectable({
  providedIn: 'root'
})
export class ModuleLoader {
  private loadedModules = new Map<string, ModuleInfo>();
  private manifest: FederationManifest = {};
  private importMapElement?: HTMLScriptElement;

  constructor(private versionManager: VersionManager) {}

  async initialize(manifestPath?: string): Promise<void> {
    if (manifestPath) {
      this.manifest = await this.loadManifest(manifestPath);
    }
    
    await this.setupImportMaps();
  }

  async loadRemoteModule<T = any>(remoteName: string, modulePath: string): Promise<T> {
    const moduleId = `${remoteName}${modulePath}`;
    
    if (this.loadedModules.has(moduleId)) {
      const moduleInfo = this.loadedModules.get(moduleId)!;
      if (moduleInfo.loaded) {
        return import(moduleInfo.url);
      }
    }

    const remoteUrl = await this.resolveRemoteUrl(remoteName);
    const moduleUrl = await this.resolveModuleUrl(remoteUrl, modulePath);
    
    try {
      const module = await this.loadModule(moduleUrl);
      
      this.loadedModules.set(moduleId, {
        id: moduleId,
        name: remoteName,
        version: '1.0.0',
        url: moduleUrl,
        deps: [],
        loaded: true,
        singleton: false
      });

      return module;
    } catch (error: any) {
      throw new Error(`Failed to load remote module ${remoteName}${modulePath}: ${error.message}`);
    }
  }

  async loadSharedModule<T = any>(packageName: string, versionStrategy?: VersionStrategy): Promise<T> {
    const moduleInfo = this.loadedModules.get(packageName);
    
    if (moduleInfo?.singleton && moduleInfo.loaded) {
      return import(moduleInfo.url);
    }

    const resolvedVersion = await this.versionManager.resolveVersion(packageName, versionStrategy);
    const moduleUrl = await this.resolveSharedModuleUrl(packageName, resolvedVersion);
    
    try {
      const module = await this.loadModule(moduleUrl);
      
      this.loadedModules.set(packageName, {
        id: packageName,
        name: packageName,
        version: resolvedVersion,
        url: moduleUrl,
        deps: [],
        loaded: true,
        singleton: true
      });

      return module;
    } catch (error: any) {
      if (versionStrategy?.type === 'fallback' && versionStrategy.fallbackVersion) {
        return this.loadSharedModule(packageName, {
          type: 'exact',
        });
      }
      
      throw new Error(`Failed to load shared module ${packageName}: ${error.message}`);
    }
  }

  private async loadManifest(manifestPath: string): Promise<FederationManifest> {
    try {
      const response = await fetch(manifestPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error: any) {
      console.warn(`[Native Federation] Failed to load manifest from ${manifestPath}:`, error.message);
      return {};
    }
  }

  private async setupImportMaps(): Promise<void> {
    try {
      const importMapResponse = await fetch('./importmap.json');
      if (importMapResponse.ok) {
        const importMap = await importMapResponse.json();
        this.injectImportMap(importMap);
      }
    } catch (error: any) {
      console.warn('[Native Federation] Failed to load import map:', error.message);
    }
  }

  private injectImportMap(importMap: any): void {
    if (this.importMapElement) {
      this.importMapElement.remove();
    }

    this.importMapElement = document.createElement('script');
    this.importMapElement.type = 'importmap';
    this.importMapElement.textContent = JSON.stringify(importMap);
    
    document.head.appendChild(this.importMapElement);
  }

  private async resolveRemoteUrl(remoteName: string): Promise<string> {
    if (this.manifest[remoteName]) {
      return this.manifest[remoteName];
    }

    throw new Error(`Remote ${remoteName} not found in manifest`);
  }

  private async resolveModuleUrl(remoteUrl: string, modulePath: string): Promise<string> {
    try {
      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch remote entry: HTTP ${response.status}`);
      }
      
      const remoteEntry = await response.json();
      
      if (!remoteEntry.metadata?.exposes?.[modulePath]) {
        throw new Error(`Module ${modulePath} not exposed by remote`);
      }

      const baseUrl = new URL(remoteUrl).origin;
      const exposedPath = remoteEntry.metadata.exposes[modulePath];
      
      return new URL(exposedPath, baseUrl).href;
    } catch (error: any) {
      throw new Error(`Failed to resolve module URL: ${error.message}`);
    }
  }

  private async resolveSharedModuleUrl(packageName: string, version: string): Promise<string> {
    const baseUrl = window.location.origin;
    return `${baseUrl}/node_modules/.cache/native-federation/esm-packages/${packageName}/index.mjs`;
  }

  private async loadModule(url: string): Promise<any> {
    try {
      return await import(url);
    } catch (error: any) {
      throw new Error(`Module import failed: ${error.message}`);
    }
  }

  getLoadedModules(): Map<string, ModuleInfo> {
    return new Map(this.loadedModules);
  }

  async preloadModule(remoteName: string, modulePath: string): Promise<void> {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = await this.resolveModuleUrl(
      await this.resolveRemoteUrl(remoteName),
      modulePath
    );
    document.head.appendChild(link);
  }

  clearCache(): void {
    this.loadedModules.clear();
    if (this.importMapElement) {
      this.importMapElement.remove();
      this.importMapElement = undefined;
    }
  }
}