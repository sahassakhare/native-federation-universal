# Native Federation Complete Angular App Example

This example demonstrates a complete Native Federation setup with actual Angular applications.

## Applications

###  Host Application (Port 4200)
- **Location**: `./host/`
- **URL**: http://localhost:4200
- **Features**:
  - Angular 18 standalone application
  - Native Federation service integration
  - Router-based micro-frontend loading
  - Dynamic component loading with mock components
  - Responsive UI design

###  MFE1 - Product Catalog (Port 4202)
- **Location**: `./mfe1/`  
- **URL**: http://localhost:4202
- **Features**:
  - Angular 18 standalone micro-frontend
  - Exposed components: `DynamicComponent`, `ProductList`
  - Interactive product catalog with filtering
  - Real-time updates and theme switching
  - Beautiful gradient UI

## Architecture

This example uses a **custom build system** rather than standard Angular CLI integration for demonstration purposes. For production applications, see the [bundlers examples](../bundlers/) which show proper Angular CLI integration with different build systems.

### Build System
- Custom esbuild configuration for faster development
- Native Federation integration without Angular CLI modifications
- Direct ES module output for optimal federation performance

### Why Custom Build?
This example predates the standardized Angular CLI integration and serves as a reference for:
- Understanding Native Federation internals
- Custom build system integration
- Direct esbuild usage with Angular

**For new projects**, use the [bundlers examples](../bundlers/) which demonstrate proper Angular CLI integration.

## Quick Start

### Prerequisites
```bash
# Install dependencies for both applications
cd host && npm install
cd ../mfe1 && npm install
```

### Option 1: Build and Serve with Native Federation
```bash
# Terminal 1 - Build and serve Host App  
cd host
npm run build:federation
npm run serve:federation

# Terminal 2 - Build and serve MFE1 App
cd mfe1  
npm run build:federation
npm run serve:federation
```

### Option 2: Standard Angular CLI (Development)
```bash
# Terminal 1 - Start Host App
cd host
npm start

# Terminal 2 - Start MFE1 App  
cd mfe1
npm start -- --port 4201
```

**Note:** For full Native Federation functionality, use Option 1 with the federation build scripts.

## URLs

- **Host Application**: http://localhost:4200
- **MFE1 Product Catalog**: http://localhost:4202

## Features Demonstrated

###  Host Application Features
- **Home Page**: Welcome screen with navigation
- **Products Route**: Mock federation loading from MFE1
- **Users Route**: Mock federation loading from MFE2  
- **Dynamic Component Loading**: On-demand component loading
- **Federation Service**: Angular service for module loading
- **Responsive Design**: Mobile-friendly interface

###  MFE1 Features  
- **Product Catalog**: Interactive product grid
- **Filtering**: Category and stock filtering
- **Dynamic Component**: Real-time data updates
- **Theme Switching**: Multiple color themes
- **Component Communication**: Event emitters
- **Mock Data**: Sample products with details

## Architecture

```
┌─────────────────┐    Federation    ┌─────────────────┐
│                 │    ────────────▶ │                 │
│  Host App       │                  │  MFE1 Products  │
│  (Port 4200)    │                  │  (Port 4201)    │
│                 │                  │                 │
│ • Home Page     │                  │ • Product List  │
│ • Router        │                  │ • Dynamic Comp  │
│ • Fed Service   │                  │ • Filtering     │
│ • Mock Loading  │                  │ • Themes        │
└─────────────────┘                  └─────────────────┘
```

## Federation Configuration

### Host Configuration
```javascript
{
  name: 'host',
  remotes: {
    'mfe1': 'http://localhost:4202/'
  },
  shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    // ... other shared deps
  }
}
```

### MFE1 Configuration
```javascript
{
  name: 'mfe1',
  exposes: {
    './DynamicComponent': './src/app/components/dynamic/dynamic.component.ts',
    './ProductList': './src/app/components/product-list/product-list.component.ts'
  },
  shared: {
    '@angular/core': { singleton: true },
    // ... other shared deps
  }
}
```

## Build System

Both applications use **esbuild** for fast bundling:
- TypeScript compilation
- ES2020 target
- ESM format
- Source maps in development
- Live reloading
- Static file serving

## Navigation Testing

### Host App (http://localhost:4200)
1. **Home Page** - Overview and navigation
2. **Products** - Mock MFE1 product loading
3. **Users** - Mock MFE2 user loading
4. **Dynamic Loading** - Component loading demo

### MFE1 App (http://localhost:4202)  
1. **Product Catalog** - Standalone micro-frontend
2. **Filtering** - Category and stock filters
3. **Interactive Components** - Theme switching

## Current Implementation Status

 **Working**:
- Both Angular applications build and run
- Static serving with proper HTML files
- Component architecture
- Routing and navigation
- Mock federation demonstration
- Responsive UI design

 **In Progress**:
- Actual federation runtime integration
- Real remote component loading
- Build tools package separation

## Troubleshooting

### Port Conflicts
If you get port conflicts:
- Change ports in `build.js` files
- Update federation configs accordingly
- Update any hardcoded URLs

### Build Issues
```bash
# Clear dist folders
rm -rf host/dist mfe1/dist

# Reinstall dependencies
cd host && npm install
cd mfe1 && npm install
```

### Module Resolution
The applications are built with browser-compatible imports and don't require Node.js module resolution in the browser.

## Next Steps

1. **Real Federation**: Integrate actual Native Federation runtime
2. **Build Tools**: Separate Node.js build tools package  
3. **Additional MFEs**: Add MFE2 for users
4. **Shared Components**: Create shared component library
5. **Production Build**: Add production build configurations