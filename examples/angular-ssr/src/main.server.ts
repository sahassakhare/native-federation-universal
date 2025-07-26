import { bootstrapApplication } from '@angular/platform-server';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ServerTransferStateModule } from '@angular/platform-server';

import { AppComponent } from './app/app.component';
import { provideNativeFederationSSR } from '@native-federation/core/angular/ssr-integration';

// Server-side bootstrap for Angular Universal
export default function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      // Standard Angular providers
      provideRouter([
        { path: '', component: AppComponent },
        { path: '**', redirectTo: '' }
      ]),
      
      // Transfer state for SSR
      importProvidersFrom(ServerTransferStateModule),
      
      // Native Federation SSR support
      ...provideNativeFederationSSR('./federation.manifest.json')
    ]
  });
}