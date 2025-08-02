import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { makeStateKey, StateKey, TransferState } from '@angular/core';
import { SSRModuleLoader, SSRFederationUtils } from '../runtime/ssr-module-loader';
import { HydrationClient, AngularHydrationUtils } from '../runtime/hydration-client';

/**
 * Angular service for Native Federation SSR support
 */
@Injectable({
  providedIn: 'root'
})
export class SSRFederationService {
  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private ssrLoader = inject(SSRModuleLoader);
  private hydrationClient = inject(HydrationClient);
  private clientLoader?: HydrationClient;

  private readonly FEDERATION_STATE_KEY: StateKey<any> = makeStateKey('NF_SSR_STATE');

  constructor() {
    if (isPlatformServer(this.platformId)) {
      this.initializeSSR();
    } else {
      this.initializeClient();
    }
  }

  /**
   * Load remote module with SSR/hydration support
   */
  async loadRemoteModule<T = any>(
    remoteName: string, 
    modulePath: string
  ): Promise<T> {
    if (isPlatformServer(this.platformId)) {
      return this.loadRemoteModuleSSR(remoteName, modulePath);
    } else {
      return this.loadRemoteModuleClient(remoteName, modulePath);
    }
  }

  /**
   * Load shared module with SSR/hydration support
   */
  async loadSharedModule<T = any>(packageName: string): Promise<T> {
    if (isPlatformServer(this.platformId)) {
      return this.ssrLoader!.loadSharedModule(packageName);
    } else {
      return this.clientLoader!.loadSharedModule(packageName);
    }
  }

  /**
   * Check if module was server-rendered
   */
  wasServerRendered(remoteName: string, modulePath: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.clientLoader?.wasServerRendered(remoteName, modulePath) || false;
    }
    return false;
  }

  /**
   * Get SSR content for a remote module (server-side only)
   */
  async getSSRContent(remoteName: string, modulePath: string): Promise<string | null> {
    if (isPlatformServer(this.platformId)) {
      try {
        const result = await this.ssrLoader!.loadRemoteModule(remoteName, modulePath);
        return result.ssrContent || null;
      } catch (error) {
        console.warn(`[SSR] Failed to get SSR content for ${remoteName}${modulePath}:`, error);
        return null;
      }
    }
    return null;
  }

  private async initializeSSR(): Promise<void> {
    // SSRModuleLoader is injected via DI
    await this.ssrLoader.initialize();
  }

  private async initializeClient(): Promise<void> {
    // HydrationClient is injected via DI
    this.clientLoader = await AngularHydrationUtils.initializeForAngularSSR(this.hydrationClient, './federation.manifest.json');
    
    // Restore SSR state from TransferState
    const ssrState = this.transferState.get(this.FEDERATION_STATE_KEY, null);
    if (ssrState) {
      // Process any SSR state if needed
      console.log('[NF] Restored SSR state:', ssrState);
    }
  }

  private async loadRemoteModuleSSR<T = any>(
    remoteName: string, 
    modulePath: string
  ): Promise<T> {
    const result = await this.ssrLoader!.loadRemoteModule(remoteName, modulePath);
    
    // Store hydration data in TransferState for client
    if (result.hydrationData) {
      const currentState = this.transferState.get(this.FEDERATION_STATE_KEY, {});
      currentState[`${remoteName}${modulePath}`] = result.hydrationData;
      this.transferState.set(this.FEDERATION_STATE_KEY, currentState);
    }
    
    return result.module;
  }

  private async loadRemoteModuleClient<T = any>(
    remoteName: string, 
    modulePath: string
  ): Promise<T> {
    return this.clientLoader!.loadRemoteModule(remoteName, modulePath);
  }
}

/**
 * Angular directive for loading federated components with SSR support
 */
import { Directive, Input, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[nfLoadComponent]',
  standalone: true
})
export class LoadFederatedComponentDirective implements OnInit, OnDestroy {
  @Input() nfLoadComponent!: string; // Format: "remoteName/modulePath"
  @Input() nfFallback?: string;

  private federationService = inject(SSRFederationService);
  private viewContainer = inject(ViewContainerRef);

  async ngOnInit() {
    if (!this.nfLoadComponent) {
      return;
    }

    const [remoteName, ...modulePathParts] = this.nfLoadComponent.split('/');
    const modulePath = './' + modulePathParts.join('/');

    try {
      // Check if component was server-rendered
      if ((this.federationService as any).wasServerRendered?.(remoteName, modulePath)) {
        console.log(`[NF] Component ${this.nfLoadComponent} was server-rendered, hydrating...`);
      }

      const module = await (this.federationService as any).loadRemoteModule(remoteName, modulePath);
      
      // Assume the module exports a component as default
      const component = module.default || module;
      
      if (component) {
        this.viewContainer.createComponent(component);
      } else {
        this.renderFallback();
      }
    } catch (error) {
      console.error(`[NF] Failed to load component ${this.nfLoadComponent}:`, error);
      this.renderFallback();
    }
  }

  ngOnDestroy() {
    this.viewContainer.clear();
  }

  private renderFallback() {
    if (this.nfFallback) {
      // Render fallback template
      this.viewContainer.clear();
      // You would implement fallback rendering logic here
      console.log(`[NF] Rendering fallback for ${this.nfLoadComponent}: ${this.nfFallback}`);
    }
  }
}

/**
 * Angular helper functions for SSR setup
 */
export class AngularSSRHelpers {
  /**
   * Setup SSR module loader in Angular Universal
   */
  static setupSSRLoader(versionManager: any, manifestPath?: string): SSRModuleLoader {
    const loader = new SSRModuleLoader(versionManager, {
      manifestPath
    });
    return loader;
  }

  /**
   * Generate hydration script for Angular Universal
   */
  static generateHydrationScript(ssrLoader: SSRModuleLoader): string {
    const hydrationManifest = ssrLoader.generateHydrationManifest();
    return SSRFederationUtils.injectHydrationScript('', hydrationManifest);
  }

  /**
   * Create Angular Universal render function with federation support
   */
  static createUniversalRenderFunction(
    originalRenderFn: Function,
    manifestPath?: string
  ) {
    return async function renderWithFederation(options: any) {
      // Initialize SSR loader
      // TODO: versionManager should be provided via DI
      const ssrLoader = AngularSSRHelpers.setupSSRLoader(null as any, manifestPath);
      
      // Add to options so components can access it
      options.ssrLoader = ssrLoader;
      
      // Call original render function
      const result = await originalRenderFn(options);
      
      // Inject hydration script
      if (typeof result === 'string') {
        const hydrationScript = AngularSSRHelpers.generateHydrationScript(ssrLoader);
        return SSRFederationUtils.injectHydrationScript(result, 
          ssrLoader.generateHydrationManifest());
      }
      
      return result;
    };
  }
}

/**
 * Provider for Angular app configuration
 */
export function createSSRFederationProviders(manifestPath?: string) {
  return [
    SSRFederationService,
    {
      provide: 'NF_MANIFEST_PATH',
      useValue: manifestPath || './federation.manifest.json'
    }
  ];
}

/**
 * Angular Universal Federation Provider
 */
export const AngularUniversalFederationProvider = {
  provide: SSRFederationService,
  useClass: SSRFederationService
};