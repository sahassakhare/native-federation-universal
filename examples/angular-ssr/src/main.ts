import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideNativeFederationSSR } from '@native-federation/core/angular/ssr-integration';
import { AngularHydrationUtils } from '@native-federation/core/runtime/hydration-client';

// Initialize Native Federation with hydration support
async function bootstrap() {
  // Initialize federation client with hydration
  await AngularHydrationUtils.initializeForAngularSSR('./federation.manifest.json');

  // Bootstrap Angular application
  bootstrapApplication(AppComponent, {
    providers: [
      // Standard Angular providers
      provideRouter([
        { path: '', component: AppComponent },
        { path: '**', redirectTo: '' }
      ]),
      
      // Enable client hydration
      provideClientHydration(),
      
      // Transfer state for SSR
      importProvidersFrom(BrowserTransferStateModule),
      
      // Native Federation SSR support
      ...provideNativeFederationSSR('./federation.manifest.json')
    ]
  }).catch(err => console.error(err));
}

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  bootstrap();
}