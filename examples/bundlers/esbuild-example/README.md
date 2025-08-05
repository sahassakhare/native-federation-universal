# esbuild + Native Federation Example

This example demonstrates how to use Native Federation with esbuild in an Angular application (Angular 17+ default).

## Structure

```
esbuild-example/
├── host/                          # Host application (Angular + esbuild)
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   └── federation-loader.service.ts
│   │   ├── main.ts
│   │   └── index.html
│   ├── federation.config.js         # Federation configuration
│   ├── angular.json                 # Standard Angular configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.app.json           # App-specific TypeScript settings
│   └── package.json
└── remote/                        # Remote micro-frontend
    ├── src/
    │   ├── app/
    │   │   └── remote.component.ts
    │   ├── main.ts
    │   └── index.html
    ├── federation.config.js
    ├── angular.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    └── package.json
```

## Key Features

### esbuild Integration
- Uses Angular CLI's default esbuild builder (Angular 17+)
- Native Federation integrates directly with Angular CLI
- Standard `ng build` and `ng serve` commands (no custom scripts needed)
- Extremely fast builds (10x faster than webpack)
- Zero configuration required

### Native Federation Benefits
- Perfect match for esbuild's ES module focus
- Ultra-fast development builds
- Minimal bundle sizes
- Tree-shaking optimized
- Native browser module loading

## Running the Example

### Terminal 1: Start Remote MFE
```bash
cd remote
npm install
ng serve --port 4201
```

### Terminal 2: Start Host Application
```bash
cd host
npm install
ng serve --port 4200
```

### Access Applications
- Host: http://localhost:4200
- Remote: http://localhost:4201

## Build Process

### Development Build
```bash
ng build --configuration development
```

### Production Build
```bash
ng build --configuration production
```

The build process:
1. Angular CLI builds with esbuild (built-in support in Angular 17+)
2. Native Federation integrates via Angular CLI hooks
3. Generates `remoteEntry.js` for remotes automatically
4. Creates import maps for hosts automatically
5. Optimizes for production with tree-shaking

## Configuration Files

### federation.config.js
```javascript
module.exports = {
  name: 'host',
  remotes: {
    'remote': 'http://localhost:4201/remoteEntry.js'
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true },
    '@angular/platform-browser': { singleton: true, strictVersion: true }
  }
};
```

### angular.json Integration
Native Federation integrates directly with Angular CLI builders - no custom scripts needed.

## Performance Comparison

### Build Speed (typical Angular app)
- **esbuild**: ~500ms
- **webpack**: ~5-10s
- **Vite**: ~1-2s

### Bundle Size
- **esbuild + Native Federation**: Smallest
- **webpack + Module Federation**: Largest
- **Vite + Federation**: Medium

### Development Experience
- **Hot reload**: Instant with esbuild
- **Error reporting**: Fast and precise
- **Memory usage**: Minimal

## esbuild Optimizations

### Tree Shaking
```javascript
// esbuild automatically tree-shakes ES modules
export default {
  // Only used exports are included
  usedFunction,
  // Unused exports are eliminated
  unusedFunction
};
```

### Code Splitting
```javascript
// Dynamic imports create separate chunks
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### Production Optimizations
Angular CLI with esbuild automatically handles:
- Minification and tree-shaking
- Source map generation (configurable)
- ES2022 target compilation
- Code splitting for lazy-loaded modules
- Optimized chunk naming with hashes

## Why esbuild + Native Federation?

1. **Speed**: Fastest build times in the ecosystem
2. **Simplicity**: Minimal configuration needed
3. **Standards**: Pure ES modules, no bundler-specific code
4. **Future-proof**: Aligned with web standards
5. **Angular 17+**: Default bundler for new Angular projects

## Troubleshooting

### Common Issues

1. **Module not found**: Ensure external dependencies are marked correctly
2. **CORS errors**: Configure dev server headers
3. **Import resolution**: Check import paths and aliases

### Debug Mode
```bash
# Enable esbuild debug logging
DEBUG=1 ng build
```

This example showcases the perfect synergy between esbuild's speed and Native Federation's standards-based approach for modern Angular micro-frontend architectures.