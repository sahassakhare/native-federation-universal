/*
 * Public API Surface of @native-federation/core
 */

// Runtime (Browser-compatible)
export * from './lib/runtime/federation-runtime';
export * from './lib/runtime/module-loader';
export * from './lib/runtime/ssr-module-loader';
export * from './lib/runtime/hydration-client';
export * from './lib/runtime/version-manager';

// Angular Integration
export * from './lib/angular/native-federation.module';
export * from './lib/angular/native-federation.service';
export * from './lib/angular/directives/load-federated-component.directive';
export { 
  SSRFederationService,
  AngularUniversalFederationProvider,
  createSSRFederationProviders
} from './lib/angular/ssr-integration';

// Types
export * from './lib/types/federation';