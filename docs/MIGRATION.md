# Migration from Webpack Module Federation

This guide helps you migrate from webpack Module Federation to Native Federation.

## Key Differences

| Webpack Module Federation | Native Federation |
|---------------------------|-------------------|
| `ModuleFederationPlugin` | `NativeFederationPlugin` |
| `remoteEntry.js` | `remoteEntry.json` |
| Webpack runtime | Browser-native ESM |
| Build-time resolution | Runtime resolution |
| webpack-specific | Build-tool agnostic |

## Step-by-Step Migration

### 1. Update Dependencies

Remove webpack-specific dependencies:
```bash
npm uninstall @angular-architects/module-federation
npm uninstall webpack webpack-cli
```

Install Native Federation:
```bash
npm install @native-federation/core
```

### 2. Convert Configuration

**Before (webpack.config.js):**
```javascript
const ModuleFederationPlugin = require('@module-federation/enhanced');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        mfe1: 'mfe1@http://localhost:4201/remoteEntry.js'
      },
      shared: {
        '@angular/core': { singleton: true },
        '@angular/common': { singleton: true }
      }
    })
  ]
};
```

**After (federation.config.ts):**
```typescript
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      remotes: {
        mfe1: 'http://localhost:4201/remoteEntry.json'
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

### 3. Update Remote Configuration

**Before:**
```javascript
new ModuleFederationPlugin({
  name: 'mfe1',
  filename: 'remoteEntry.js',
  exposes: {
    './Component': './src/app/component.ts'
  }
})
```

**After:**
```typescript
new NativeFederationPlugin({
  name: 'mfe1',
  exposes: {
    './Component': './src/app/component.ts'
  },
  shared: shareAll({ singleton: true })
})
```

### 4. Update Runtime Loading

**Before:**
```typescript
const mfe1 = await import('mfe1/Component');
```

**After:**
```typescript
import { loadRemoteModule } from '@native-federation/core/runtime';
const { Component } = await loadRemoteModule('mfe1', './Component');
```

### 5. Update Bootstrap

**Before:**
```typescript
// main.ts
import('./bootstrap');

// bootstrap.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
```

**After:**
```typescript
// main.ts
import { initFederation } from '@native-federation/core/runtime';

async function bootstrap() {
  await initFederation();
  
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { AppComponent } = await import('./app/app.component');
  
  bootstrapApplication(AppComponent);
}

bootstrap();
```

## Configuration Migration Map

### Shared Dependencies

**Before:**
```javascript
shared: {
  '@angular/core': { 
    singleton: true, 
    strictVersion: true,
    requiredVersion: '^16.0.0'
  }
}
```

**After:**
```typescript
shared: {
  '@angular/core': singleton({
    strictVersion: true,
    requiredVersion: '^16.0.0'
  })
}
```

### Expose Modules

**Before:**
```javascript
exposes: {
  './Component': './src/app/component.ts'
}
```

**After:**
```typescript
exposes: {
  './Component': './src/app/component.ts'
}
// No change needed!
```

### Remote Loading

**Before:**
```typescript
loadRemoteModule('mfe1', './Component')
  .then(m => m.Component)
```

**After:**
```typescript
const { Component } = await loadRemoteModule('mfe1', './Component');
```

## Common Migration Issues

### 1. Import Syntax

**Issue:** Using webpack-style imports
```typescript
// Webpack style
import('mfe1/Component')

// Native Federation
loadRemoteModule('mfe1', './Component')
```

### 2. Remote Entry URLs

**Issue:** Wrong file extension
```typescript
// Webpack
remotes: { mfe1: 'http://localhost:4201/remoteEntry.js' }

// Native Federation  
remotes: { mfe1: 'http://localhost:4201/remoteEntry.json' }
```

### 3. Build Configuration

**Issue:** Still using webpack
```javascript
// webpack.config.js
module.exports = { /* webpack config */ };

// esbuild.config.js
export default { /* esbuild config */ };
```

### 4. Shared Library Access

**Issue:** Direct imports of shared libraries
```typescript
// Direct import (may cause duplicates)
import { HttpClient } from '@angular/common/http';

// Load shared module
const { HttpClient } = await loadSharedModule('@angular/common/http');
```

## Benefits After Migration

**Faster Builds**: esbuild is significantly faster than webpack  
**Smaller Bundles**: No webpack runtime overhead  
**Future Proof**: Uses web standards (ESM, Import Maps)  
**Better Tree Shaking**: Native ESM enables better optimization  
**Simplified Config**: Less complex configuration  
**Build Tool Freedom**: Not locked to webpack  

## Compatibility Layer

For gradual migration, you can run both systems in parallel:

```typescript
// Load from either system
async function loadComponent(source: 'webpack' | 'native', remote: string, module: string) {
  if (source === 'webpack') {
    return import(`${remote}/${module}`);
  } else {
    return loadRemoteModule(remote, module);
  }
}
```

## Verification Checklist

- [ ] All remotes load correctly
- [ ] Shared dependencies work as expected
- [ ] Build performance improved
- [ ] Bundle size reduced
- [ ] Development hot reload works
- [ ] Production builds succeed
- [ ] No runtime errors in browser console

## Getting Help

If you encounter issues during migration:

1. Enable verbose logging: `verbose: true`
2. Check the browser network tab for failed requests
3. Verify remote entry JSON format
4. Test shared dependency resolution
5. Compare generated import maps

## Advanced Migration

For complex scenarios:

- **Micro-frontend Routing**: Use dynamic route loading
- **Cross-Framework**: Native Federation works with any framework
- **Gradual Migration**: Migrate one remote at a time
- **Development vs Production**: Different configs for each environment