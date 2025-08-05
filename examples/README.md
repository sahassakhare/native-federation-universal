# Native Federation Examples

This directory contains comprehensive examples demonstrating Native Federation implementation across different frameworks and use cases.

## Example Categories

### Complete Applications
- **complete-angular-app/**: Full Angular applications with real Native Federation integration
- **angular-example/**: Basic Angular + Native Federation setup
- **react-example/**: React applications with Native Federation
- **mixed-example/**: Angular host with React remotes
- **ssr-example/**: Server-side rendering with federation

### Bundler Integration
- **bundlers/**: Examples for different build systems (webpack, esbuild, Vite, rspack)

## Quick Start Guide

### Prerequisites
Make sure you have Node.js 18+ installed and npm/yarn available.

### Angular Applications

#### Complete Angular App (Fully Functional)
```bash
cd complete-angular-app

# Install dependencies
cd host && npm install
cd ../mfe1 && npm install

# Option 1: Native Federation Build (Recommended)
# Terminal 1 - Host
cd host
npm run build:federation
npm run serve:federation

# Terminal 2 - MFE1  
cd mfe1
npm run build:federation
npm run serve:federation

# Option 2: Standard Angular CLI (Development)
# Terminal 1 - Host
cd host && npm start
# Terminal 2 - MFE1
cd mfe1 && npm start -- --port 4201
```

### React Applications (Fully Functional)
```bash
cd react-example

# Install dependencies
cd host && npm install
cd ../mfe1 && npm install

# Terminal 1 - MFE1 (start remote first)
cd mfe1 && npm run dev

# Terminal 2 - Host
cd host && npm run dev
```

### Mixed Framework (Angular + React)
```bash
cd mixed-example

# Terminal 1 - React MFE
cd react-mfe && npm install && npm run dev

# Terminal 2 - Angular Host
cd angular-host && npm install && npm run dev
```

## Application URLs

| Example | Host | Remote(s) | Status |
|---------|------|-----------|--------|
| Complete Angular | http://localhost:4200 | http://localhost:4201 | Fully Functional |
| React Example | http://localhost:4300 | http://localhost:4301 | Fully Functional |
| Angular Example | http://localhost:4200 | http://localhost:4201 | Fully Functional |
| Mixed Example | http://localhost:4200 | http://localhost:4201 | Well Documented |
| SSR Example | http://localhost:4300 | N/A (SSR simulation) | Well Documented |
| Bundlers Examples | Various ports | Various ports | Well Documented |

## Features Demonstrated

### Complete Angular App Features
- Real Native Federation runtime integration
- Dynamic component loading from remotes
- Shared dependency management
- Error handling and fallbacks
- Federation manifest loading
- Multi-component exposure
- Production-ready build process

### React Example Features  
- React component federation
- Dynamic imports with proper module resolution
- Shopping cart functionality in federated components
- Cross-application state management
- Development and production builds

### Angular Example Features
- Real Native Federation runtime integration
- Angular standalone components (Angular 18)
- Dynamic component creation with createComponent API
- Product catalog with interactive shopping cart
- Full federation manifest and remote entry generation
- Error handling with graceful fallbacks

### Build Systems Supported
- Angular CLI with esbuild (default Angular 17+)
- Angular CLI with webpack
- Custom esbuild configuration
- Vite with Angular support
- Rspack (webpack-compatible)

## Configuration Files

### Federation Configuration
Each application includes:
- `federation.config.js` - Defines remotes, exposes, and shared dependencies
- Native Federation build scripts for production
- Development server configuration with CORS

### Example Federation Config (Host)
```javascript
module.exports = {
  name: 'host',
  remotes: {
    'mfe1': 'http://localhost:4201/remoteEntry.js'
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true }
  }
};
```

### Example Federation Config (Remote)
```javascript
module.exports = {
  name: 'mfe1',
  exposes: {
    './ProductList': './src/app/components/product-list/product-list.component',
    './DynamicComponent': './src/app/components/dynamic/dynamic.component'
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true }
  }
};
```

## Troubleshooting

### Common Issues

#### 1. Remote Entry Loading Errors
```bash
# Make sure remote is running first
cd mfe1 && npm run build:federation && npm run serve:federation
# Then start host
cd host && npm run build:federation && npm run serve:federation
```

#### 2. Port Conflicts
Update ports in:
- `federation.config.js` (remotes URLs)
- `server.js` or `package.json` scripts
- Build scripts PORT constants

#### 3. Module Resolution Errors
- Verify exposed module paths exist
- Check that shared dependencies versions match
- Ensure CORS is properly configured

#### 4. Build Issues
```bash
# Clean and reinstall
rm -rf dist node_modules package-lock.json
npm install
npm run build:federation
```

### Development Tips

1. **Always start remotes before host applications**
2. **Use federation builds for testing actual federation behavior**
3. **Check browser network tab for failed module loads**
4. **Inspect federation manifests at `/federation-manifest.json`**

## Production Deployment

### Build for Production
```bash
# Angular apps
npm run build:federation

# React apps  
npm run build
```

### Serve Production Build
```bash
# Angular apps
npm run serve:federation

# React apps
npm run serve
```

### Additional Examples Features
- **Mixed Example**: Cross-framework federation (Angular + React) with comprehensive documentation
- **SSR Example**: Server-side rendering architecture patterns and best practices
- **Bundlers Examples**: Integration guides for webpack, esbuild, Vite, and Rspack

## Next Steps

1. **Start with complete-angular-app** - fully functional example with real federation
2. **Try react-example** - complete React federation setup with working components
3. **Explore angular-example** - updated with real Native Federation integration
4. **Check bundlers/** for different build system integration patterns
5. **Review mixed-example** for cross-framework federation architecture
6. **Study ssr-example** for server-side rendering with federation

## Documentation

- [Getting Started Guide](../docs/GETTING_STARTED.md)
- [Configuration Reference](../docs/configuration.md)
- [Architecture Overview](../docs/architecture.md)
- [Schematics Guide](../docs/SCHEMATICS.md)