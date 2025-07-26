// Example: Runtime Usage in Angular Application
import { Component, ViewContainerRef, ViewChild, OnInit } from '@angular/core';
import { 
  initFederation, 
  loadRemoteModule, 
  watchFederationBuildCompletion 
} from '@native-federation/core/runtime';

@Component({
  selector: 'app-host',
  template: `
    <div class="host-container">
      <h1>Host Application</h1>
      
      <div class="remote-sections">
        <section>
          <h2>MFE 1 - Feature Component</h2>
          <ng-container #mfe1Container></ng-container>
        </section>
        
        <section>
          <h2>MFE 2 - Dashboard</h2>
          <ng-container #mfe2Container></ng-container>
        </section>
      </div>
    </div>
  `
})
export class HostComponent implements OnInit {
  @ViewChild('mfe1Container', { read: ViewContainerRef }) 
  mfe1Container!: ViewContainerRef;
  
  @ViewChild('mfe2Container', { read: ViewContainerRef }) 
  mfe2Container!: ViewContainerRef;

  async ngOnInit() {
    // Initialize federation system
    await initFederation('./federation.manifest.json');
    
    // Setup hot reload for development
    watchFederationBuildCompletion('http://localhost:4201/build-events');
    
    // Load remote components
    await this.loadMfe1Component();
    await this.loadMfe2Component();
  }

  private async loadMfe1Component() {
    try {
      // Load remote component
      const { FeatureComponent } = await loadRemoteModule('mfe1', './Component');
      
      // Create component instance
      const componentRef = this.mfe1Container.createComponent(FeatureComponent);
      
      // Pass data to remote component
      componentRef.instance.title = 'Data from Host';
      componentRef.instance.config = { theme: 'dark' };
      
      // Listen to outputs
      componentRef.instance.dataChange.subscribe((data: any) => {
        console.log('Received data from MFE1:', data);
      });
      
    } catch (error) {
      console.error('Failed to load MFE1:', error);
    }
  }

  private async loadMfe2Component() {
    try {
      // Load remote module with lazy loading
      const mfe2Module = await loadRemoteModule('mfe2', './Module');
      
      // You can also load services
      const { SharedService } = await loadRemoteModule('mfe2', './Service');
      const service = new SharedService();
      
      console.log('MFE2 loaded successfully', { mfe2Module, service });
      
    } catch (error) {
      console.error('Failed to load MFE2:', error);
    }
  }
}

// Alternative: Load remote routes dynamically
export const remoteRoutes = [
  {
    path: 'mfe1',
    loadChildren: async () => {
      const { FeatureModule } = await loadRemoteModule('mfe1', './Module');
      return FeatureModule;
    }
  },
  {
    path: 'mfe2', 
    loadChildren: async () => {
      const { DashboardModule } = await loadRemoteModule('mfe2', './Module');
      return DashboardModule;
    }
  }
];

// Example: Bootstrap function for main.ts
export async function bootstrapApplication() {
  // Initialize federation before bootstrapping Angular
  await initFederation();
  
  // Now bootstrap your Angular application
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { AppComponent } = await import('./app/app.component');
  
  return bootstrapApplication(AppComponent, {
    providers: [
      // Your providers here
    ]
  });
}