// Example: Host Application Configuration
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      // Host configuration
      remotes: {
        'mfe1': 'http://localhost:4201/remoteEntry.json',
        'mfe2': 'http://localhost:4202/remoteEntry.json',
        'shared-components': 'http://localhost:4203/remoteEntry.json'
      },
      
      // Shared dependencies
      shared: {
        ...shareAll({
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        })
      },
      
      // Packages to exclude from sharing
      skip: [
        'rxjs/ajax',
        'rxjs/testing',
        '@angular/platform-server'
      ],
      
      // Development mode settings
      dev: true,
      verbose: true,
      
      // Build notifications for hot reload
      buildNotifications: {
        endpoint: 'http://localhost:4200/build-events',
        events: ['build-complete', 'build-error']
      }
    })
  ]
};