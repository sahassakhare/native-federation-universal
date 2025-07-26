// Example: Remote Application Configuration
import { NativeFederationPlugin, shareAll, singleton } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      // Remote application name
      name: 'mfe1',
      
      // Modules to expose
      exposes: {
        './Component': './src/app/components/feature-component.ts',
        './Module': './src/app/feature/feature.module.ts',
        './Service': './src/app/services/shared-service.ts',
        './Routes': './src/app/feature/feature.routes.ts'
      },
      
      // Shared dependencies
      shared: {
        // Share all dependencies automatically
        ...shareAll({
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        }),
        
        // Override specific packages
        '@angular/core': singleton({
          strictVersion: true,
          requiredVersion: '^16.0.0'
        }),
        
        '@angular/common': singleton({
          strictVersion: true,
          requiredVersion: '^16.0.0'
        }),
        
        'rxjs': singleton({
          strictVersion: false,
          requiredVersion: '^7.0.0'
        })
      },
      
      // Skip packages not needed at runtime
      skip: [
        'rxjs/ajax',
        'rxjs/testing',
        '@angular/platform-server',
        '@angular/compiler',
        'typescript'
      ],
      
      // Development settings
      dev: true,
      verbose: true
    })
  ]
};