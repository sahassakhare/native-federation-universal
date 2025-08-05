import {
  Directive,
  Input,
  ViewContainerRef,
  ComponentRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  TemplateRef,
  EmbeddedViewRef,
  Injector,
  Type
} from '@angular/core';
import { NativeFederationService } from '../native-federation.service';

@Directive({
  selector: '[nfLoadComponent]'
})
export class LoadFederatedComponentDirective implements OnInit, OnDestroy {
  @Input('nfLoadComponent') componentInfo!: string;
  @Input('nfFallback') fallbackTemplate?: TemplateRef<any>;
  @Input('nfLoadingTemplate') loadingTemplate?: TemplateRef<any>;
  @Input('nfErrorTemplate') errorTemplate?: TemplateRef<any>;
  @Input('nfInputs') inputs?: { [key: string]: any };

  private componentRef?: ComponentRef<any>;
  private currentView?: EmbeddedViewRef<any>;
  private isLoading = false;

  constructor(
    private viewContainer: ViewContainerRef,
    private federationService: NativeFederationService,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {}

  async ngOnInit() {
    await this.loadComponent();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private async loadComponent() {
    if (!this.componentInfo) {
      console.warn('[LoadFederatedComponentDirective] No component info provided');
      return;
    }

    // Parse component info (format: "remoteName/modulePath")
    const [remoteName, modulePath] = this.componentInfo.split('/');
    if (!remoteName || !modulePath) {
      console.error('[LoadFederatedComponentDirective] Invalid component info format. Use "remoteName/modulePath"');
      this.showErrorView('Invalid component format');
      return;
    }

    try {
      this.isLoading = true;
      this.showLoadingView();

      // Load the remote module
      const module = await this.federationService.loadRemoteModule(remoteName, `./${modulePath}`);
      
      // Get the component from the module
      const ComponentClass = this.getComponentFromModule(module);
      if (!ComponentClass) {
        throw new Error(`Component not found in module ${remoteName}/${modulePath}`);
      }

      // Create and insert the component
      await this.createComponent(ComponentClass);

    } catch (error) {
      console.error('[LoadFederatedComponentDirective] Failed to load component:', error);
      this.showErrorView(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.isLoading = false;
    }
  }

  private getComponentFromModule(module: any): Type<any> | null {
    // Try different common export patterns
    if (module.default && typeof module.default === 'function') {
      return module.default;
    }
    
    if (module.Component && typeof module.Component === 'function') {
      return module.Component;
    }

    // Look for the first function export (likely a component)
    for (const key of Object.keys(module)) {
      if (typeof module[key] === 'function' && key !== 'default') {
        return module[key];
      }
    }

    return null;
  }

  private async createComponent(ComponentClass: Type<any>) {
    this.cleanup();

    try {
      // Create the component
      this.componentRef = this.viewContainer.createComponent(ComponentClass, {
        injector: this.injector
      });

      // Set inputs if provided
      if (this.inputs) {
        Object.keys(this.inputs).forEach(key => {
          if (this.componentRef?.instance[key] !== undefined) {
            this.componentRef.instance[key] = this.inputs![key];
          }
        });
      }

      // Trigger change detection
      this.componentRef.changeDetectorRef.detectChanges();
      this.cdr.detectChanges();

    } catch (error) {
      console.error('[LoadFederatedComponentDirective] Failed to create component:', error);
      throw error;
    }
  }

  private showLoadingView() {
    this.cleanup();
    
    if (this.loadingTemplate) {
      this.currentView = this.viewContainer.createEmbeddedView(this.loadingTemplate);
    } else {
      // Create default loading view
      this.createDefaultLoadingView();
    }
  }

  private showErrorView(error: string) {
    this.cleanup();
    
    if (this.errorTemplate) {
      this.currentView = this.viewContainer.createEmbeddedView(this.errorTemplate, { error });
    } else if (this.fallbackTemplate) {
      this.currentView = this.viewContainer.createEmbeddedView(this.fallbackTemplate);
    } else {
      // Create default error view
      this.createDefaultErrorView(error);
    }
  }

  private createDefaultLoadingView() {
    const div = document.createElement('div');
    div.style.padding = '20px';
    div.style.textAlign = 'center';
    div.style.color = '#666';
    div.innerHTML = '⏳ Loading federated component...';
    
    const elementRef = { nativeElement: div };
    this.currentView = this.viewContainer.createEmbeddedView(
      { createEmbeddedView: () => ({ rootNodes: [div] }) } as any
    );
  }

  private createDefaultErrorView(error: string) {
    const div = document.createElement('div');
    div.style.padding = '20px';
    div.style.border = '1px solid #f5c6cb';
    div.style.backgroundColor = '#f8d7da';
    div.style.color = '#721c24';
    div.style.borderRadius = '4px';
    div.innerHTML = `
      <strong> Failed to load federated component</strong><br>
      <small>${this.componentInfo}</small><br>
      <em>${error}</em>
    `;
    
    this.currentView = this.viewContainer.createEmbeddedView(
      { createEmbeddedView: () => ({ rootNodes: [div] }) } as any
    );
  }

  private cleanup() {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
    
    if (this.currentView) {
      this.currentView.destroy();
      this.currentView = undefined;
    }
    
    this.viewContainer.clear();
  }
}