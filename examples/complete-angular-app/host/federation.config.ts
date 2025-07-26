// Host Application - federation.config.ts
import { NativeFederationPlugin, shareAll, createFederationConfig } from '@native-federation/core';

const isDev = process.env['NODE_ENV'] === 'development';

export const federationConfig = createFederationConfig()
  .remotes({
    // Product catalog micro-frontend
    'mfe1': isDev 
      ? 'http://localhost:4201/remoteEntry.json'
      : 'https://mfe1.example.com/remoteEntry.json',
    
    // User management micro-frontend  
    'mfe2': isDev
      ? 'http://localhost:4202/remoteEntry.json'
      : 'https://mfe2.example.com/remoteEntry.json',
    
    // Shared components library
    'shared-components': isDev
      ? 'http://localhost:4203/remoteEntry.json'
      : 'https://shared-components.example.com/remoteEntry.json'
  })
  .shared(shareAll({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    eager: false
  }))
  .skip([
    // Development-only packages
    'rxjs/ajax',
    'rxjs/testing',
    '@angular/platform-server',
    '@angular/service-worker',
    
    // Build tools
    'typescript',
    'esbuild',
    '@angular/compiler',
    
    // Testing frameworks
    'jest',
    'jasmine',
    'karma',
    
    // Linting tools
    'eslint',
    '@typescript-eslint/parser',
    '@typescript-eslint/eslint-plugin'
  ])
  .dev(isDev)
  .verbose(isDev)
  .build();

// Add build notifications for development
if (isDev) {
  federationConfig.buildNotifications = {
    endpoint: 'http://localhost:4200/build-events',
    events: ['build-complete', 'build-error', 'build-start']
  };
}

export default federationConfig;