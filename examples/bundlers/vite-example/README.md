# Vite + Native Federation Example

This example demonstrates how to use Native Federation with Vite in an Angular application using @analogjs/vite-plugin-angular.

## Structure

```
vite-example/
├── host/                        # Host application (Angular + Vite)
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   └── federation-loader.service.ts
│   │   ├── main.ts
│   │   └── index.html
│   ├── vite.config.ts          # Vite config with Native Federation
│   ├── federation.config.js     # Federation configuration
│   └── package.json
└── remote/                     # Remote micro-frontend
    ├── src/
    │   ├── app/
    │   │   └── remote.component.ts
    │   ├── main.ts
    │   └── index.html
    ├── vite.config.ts
    ├── federation.config.js
    └── package.json
```

## Key Features

### Vite Integration
- Uses `@analogjs/vite-plugin-angular` for Angular support
- Custom Vite plugin for Native Federation
- Lightning-fast development server with HMR
- Rollup-based production builds
- Modern development experience

### Native Federation Benefits
- Perfect ES module integration with Vite
- Instant hot module replacement
- Optimized dependency pre-bundling
- Import maps support
- Tree-shaking optimized builds

## Running the Example

### Terminal 1: Start Remote MFE
```bash
cd remote
npm install
npm run dev -- --port 4201
```

### Terminal 2: Start Host Application
```bash
cd host
npm install
npm run dev -- --port 4200
```

### Access Applications
- Host: http://localhost:4200
- Remote: http://localhost:4201

## Build Process

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

The Vite build process:
1. Vite pre-bundles dependencies
2. Native Federation plugin processes federation config
3. Generates `remoteEntry.js` for remotes
4. Creates import maps for hosts
5. Rollup optimizes production bundles

## Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import { angular } from '@analogjs/vite-plugin-angular';
import federationConfig from './federation.config.js';

export default defineConfig({
  plugins: [
    angular(),
    {
      name: 'native-federation',
      buildStart() {
        console.log('Building with Vite + Native Federation...');
      },
      generateBundle() {
        // Generate federation assets
        this.emitFile({
          type: 'asset',
          fileName: 'remoteEntry.js',
          source: generateRemoteEntry(federationConfig)
        });
      }
    }
  ],
  build: {
    target: 'es2022',
    rollupOptions: {
      external: ['@angular/core', '@angular/common'],
      output: {
        format: 'es'
      }
    }
  },
  server: {
    port: 4200,
    cors: true,
    fs: {
      allow: ['..']
    }
  }
});
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Performance Comparison

### Development Server Start
- **Vite**: ~200ms
- **webpack**: ~5-10s
- **esbuild**: ~300ms

### Hot Module Replacement
- **Vite**: Instant (<50ms)
- **webpack**: 1-3s
- **esbuild**: <100ms

### Build Performance
- **Production build**: Fast (Rollup)
- **Development**: Instant (no bundling)
- **Bundle size**: Optimized

## Vite Advantages

### Development Experience
```javascript
// Hot module replacement
if (import.meta.hot) {
  import.meta.hot.accept('./component', (newModule) => {
    // Component updates instantly
  });
}
```

### Dependency Pre-bundling
```javascript
// Vite automatically pre-bundles dependencies
import { Component } from '@angular/core';
// ↑ Pre-bundled for fast loading
```

### Modern Features
```typescript
// Native TypeScript support
export class MyComponent {
  // Vite handles TS compilation
}

// CSS modules
import styles from './component.module.css';
```

## Why Vite + Native Federation?

1. **Lightning Fast**: Instant dev server start
2. **Modern**: Built for ES modules from the ground up
3. **HMR**: Best-in-class hot module replacement
4. **Ecosystem**: Rich plugin ecosystem
5. **Standards**: Native web standards support

## Advanced Configuration

### Import Maps
```json
{
  "imports": {
    "@angular/core": "/node_modules/@angular/core/esm2022/core.mjs",
    "rxjs": "/node_modules/rxjs/dist/esm/index.js"
  }
}
```

### Dynamic Imports
```typescript
// Vite handles dynamic imports perfectly
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### Environment Variables
```typescript
// Access Vite env vars
const apiUrl = import.meta.env.VITE_API_URL;
```

## Troubleshooting

### Common Issues

1. **Module resolution**: Configure `resolve.alias` in vite.config.ts
2. **CORS**: Enable CORS in dev server config
3. **Build target**: Ensure ES2022+ for federation

### Debug Mode
```bash
# Enable Vite debug logging
DEBUG=vite:* npm run dev
```

### Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          angular: ['@angular/core', '@angular/common'],
          vendor: ['rxjs']
        }
      }
    }
  }
});
```

This example demonstrates Vite's modern development experience combined with Native Federation's standards-based micro-frontend architecture.