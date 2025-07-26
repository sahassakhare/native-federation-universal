# Getting Started with Native Federation

## Installation

```bash
npm install @native-federation/core
```

## Quick Setup

### 1. Host Application Setup

Create your federation configuration:

```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export const federationConfig = {
  plugins: [
    new NativeFederationPlugin({
      shared: {
        ...shareAll({
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        })
      },
      remotes: {
        'mfe1': 'http://localhost:4201/remoteEntry.json'
      }
    })
  ]
};
```

Add to your build configuration:

```typescript
// esbuild.config.js
import { federationConfig } from './federation.config.js';

export default {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  ...federationConfig
};
```

### 2. Remote Application Setup

```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export const federationConfig = {
  plugins: [
    new NativeFederationPlugin({
      name: 'mfe1',
      exposes: {
        './Component': './src/app/component.ts'
      },
      shared: {
        ...shareAll({
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        })
      }
    })
  ]
};
```

### 3. Runtime Usage

Initialize federation in your main.ts:

```typescript
// main.ts
import { initFederation } from '@native-federation/core/runtime';

async function bootstrap() {
  await initFederation('./federation.manifest.json');
  
  // Now bootstrap your app
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { AppComponent } = await import('./app/app.component');
  
  bootstrapApplication(AppComponent);
}

bootstrap();
```

Load remote modules:

```typescript
// component.ts
import { loadRemoteModule } from '@native-federation/core/runtime';

async loadRemoteComponent() {
  const { RemoteComponent } = await loadRemoteModule('mfe1', './Component');
  // Use the component
}
```

## Development Workflow

### 1. Start Remote Applications
```bash
# Terminal 1 - Remote App
cd mfe1
npm run build:watch
npm run serve # serves on port 4201

# Terminal 2 - Another Remote
cd mfe2  
npm run build:watch
npm run serve # serves on port 4202
```

### 2. Start Host Application
```bash
# Terminal 3 - Host App
cd host-app
npm run start # serves on port 4200
```

### 3. Enable Hot Reload

Add to your host application:

```typescript
import { watchFederationBuildCompletion } from '@native-federation/core/runtime';

// Watch for remote build changes
watchFederationBuildCompletion('http://localhost:4201/build-events');
```

## Common Patterns

### Loading Components Dynamically

```typescript
@Component({
  template: '<ng-container #container></ng-container>'
})
export class DynamicComponent {
  @ViewChild('container', { read: ViewContainerRef }) 
  container!: ViewContainerRef;

  async loadComponent(remoteName: string, componentPath: string) {
    const { Component } = await loadRemoteModule(remoteName, componentPath);
    this.container.createComponent(Component);
  }
}
```

### Routing with Remote Modules

```typescript
export const routes: Routes = [
  {
    path: 'feature',
    loadChildren: async () => {
      const { FeatureModule } = await loadRemoteModule('mfe1', './Module');
      return FeatureModule;
    }
  }
];
```

### Sharing Services

```typescript
// In remote
export { SharedService } from './shared.service';

// In host
const { SharedService } = await loadRemoteModule('mfe1', './SharedService');
const service = new SharedService();
```

## Troubleshooting

### Module Not Found
- Verify the remote is running and accessible
- Check the remote entry URL
- Ensure the module is properly exposed

### Version Conflicts
- Review shared dependency versions
- Use `verbose: true` for detailed logging
- Check the generated import map

### Build Issues
- Ensure all dependencies are properly installed
- Check for circular dependencies
- Verify ESM compatibility

## Next Steps

- [Configuration Guide](./CONFIGURATION.md)
- [Advanced Patterns](./ADVANCED_PATTERNS.md)
- [Migration from Webpack](./MIGRATION.md)
- [Production Deployment](./PRODUCTION.md)