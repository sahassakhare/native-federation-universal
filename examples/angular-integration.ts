// Example: Complete Angular Integration
// esbuild.config.js for Angular 16+
import { NativeFederationPlugin, createFederationConfig, shareAll } from '@native-federation/core';

const federationConfig = createFederationConfig()
  .name('host-app')
  .remotes({
    'product-catalog': 'http://localhost:4201',
    'user-management': 'http://localhost:4202',
    'analytics': 'http://localhost:4203'
  })
  .shared(shareAll({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto'
  }))
  .skip([
    'rxjs/ajax',
    'rxjs/testing',
    '@angular/platform-server'
  ])
  .dev(true)
  .verbose(true)
  .build();

export default {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2022',
  sourcemap: true,
  plugins: [
    new NativeFederationPlugin(federationConfig)
  ]
};

// main.ts - Application bootstrap
import { initFederation } from '@native-federation/core/runtime';

async function bootstrap() {
  // Initialize federation before Angular
  await initFederation('./federation.manifest.json');
  
  // Import and bootstrap Angular app
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { AppComponent } = await import('./app/app.component');
  const { appConfig } = await import('./app/app.config');
  
  bootstrapApplication(AppComponent, appConfig).catch(err => 
    console.error(err)
  );
}

bootstrap();

// app.routes.ts - Dynamic route loading
import { Routes } from '@angular/router';
import { loadRemoteModule } from '@native-federation/core/runtime';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'products',
    loadChildren: async () => {
      const { ProductModule } = await loadRemoteModule('product-catalog', './Module');
      return ProductModule;
    }
  },
  {
    path: 'users',
    loadChildren: async () => {
      const { UserModule } = await loadRemoteModule('user-management', './Module'); 
      return UserModule;
    }
  },
  {
    path: 'analytics',
    loadComponent: async () => {
      const { AnalyticsComponent } = await loadRemoteModule('analytics', './Component');
      return AnalyticsComponent;
    }
  }
];

// shared.service.ts - Service with federated dependencies
import { Injectable } from '@angular/core';
import { loadSharedModule } from '@native-federation/core/runtime';

@Injectable({
  providedIn: 'root'
})
export class FederatedService {
  private httpClient: any;
  
  async initialize() {
    // Load shared HTTP client
    const { HttpClient } = await loadSharedModule('@angular/common/http');
    this.httpClient = HttpClient;
  }
  
  async loadExternalLibrary() {
    // Dynamically load a shared library
    const lodash = await loadSharedModule('lodash');
    return lodash;
  }
}

// federation.guard.ts - Route guard for federation
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isInitialized } from '@native-federation/core/runtime';

@Injectable({
  providedIn: 'root'
})
export class FederationGuard implements CanActivate {
  constructor(private router: Router) {}
  
  canActivate(): boolean {
    if (!isInitialized()) {
      console.warn('Federation not initialized, redirecting to home');
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}