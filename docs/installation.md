# Installation Guide

Complete guide to installing and setting up Native Federation in your project.

## Prerequisites

### System Requirements
- **Node.js** 16+ (18+ recommended)
- **npm** 7+ or **yarn** 1.22+ or **pnpm** 7+
- **TypeScript** 4.7+ (optional but recommended)

### Build Tool Compatibility
Native Federation works with any build tool that supports plugins:
- **esbuild** (recommended for best performance)
- **Vite** 
- **Rollup**
- **Parcel**
- **webpack** (for gradual migration)

## Basic Installation

### 1. Install Core Package

```bash
# npm
npm install @native-federation/core

# yarn
yarn add @native-federation/core

# pnpm
pnpm add @native-federation/core
```

### 2. Install Development Dependencies

```bash
# For esbuild integration (recommended)
npm install --save-dev esbuild

# For TypeScript support
npm install --save-dev typescript @types/node
```

## Framework-Specific Setup

### Angular Projects

#### New Angular Project
```bash
# Create new Angular project
ng new my-federated-app
cd my-federated-app

# Install Native Federation
npm install @native-federation/core

# Install esbuild for optimal performance
npm install --save-dev esbuild
```

#### Existing Angular Project
```bash
# In your Angular project directory
npm install @native-federation/core

# Optional: Install migration schematics
npm install --save-dev @native-federation/schematics
```

### React Projects

#### New React Project
```bash
# Create React app with Vite (recommended)
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app

# Install Native Federation
npm install @native-federation/core
```

#### Existing React Project
```bash
# In your React project directory
npm install @native-federation/core

# Ensure you have a compatible build tool
npm install --save-dev vite # or your preferred build tool
```

### Vue.js Projects

#### New Vue Project
```bash
# Create Vue app with Vite
npm create vue@latest my-vue-app
cd my-vue-app

# Install Native Federation
npm install @native-federation/core
```

#### Existing Vue Project
```bash
# In your Vue project directory
npm install @native-federation/core
```

### Vanilla JavaScript

```bash
# Create new directory
mkdir my-federated-app
cd my-federated-app

# Initialize package.json
npm init -y

# Install Native Federation
npm install @native-federation/core

# Install build tool
npm install --save-dev esbuild
```

## Configuration Setup

### 1. Create Federation Configuration

Create `federation.config.ts` in your project root:

```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'my-app', // Required for remote applications
      
      // Expose modules (for remote applications)
      exposes: {
        './Component': './src/components/MyComponent.ts',
        './Service': './src/services/MyService.ts'
      },
      
      // Consume remote modules (for host applications)
      remotes: {
        'remote-app': 'http://localhost:4201/remoteEntry.json'
      },
      
      // Share dependencies
      shared: shareAll({
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto'
      })
    })
  ]
};
```

### 2. Build Tool Integration

#### esbuild Integration
```typescript
// build.js
import { build } from 'esbuild';
import federationConfig from './federation.config.js';

await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2020',
  ...federationConfig
});
```

#### Vite Integration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import federationConfig from './federation.config';

export default defineConfig({
  ...federationConfig,
  build: {
    target: 'es2020',
    rollupOptions: {
      external: ['@native-federation/core']
    }
  }
});
```

### 3. Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "esbuild src/main.ts --bundle --outdir=dist --watch --servedir=dist",
    "build": "esbuild src/main.ts --bundle --outdir=dist --minify",
    "serve": "http-server dist -p 4200 --cors"
  }
}
```

## Runtime Setup

### 1. Initialize Federation

Update your main entry file (e.g., `src/main.ts`):

```typescript
// src/main.ts
import { initFederation } from '@native-federation/core/runtime';

async function bootstrap() {
  // Initialize federation system
  await initFederation('./federation.manifest.json');
  
  // Import your application
  const { bootstrap: appBootstrap } = await import('./app');
  appBootstrap();
}

bootstrap().catch(err => console.error(err));
```

### 2. Load Remote Modules

```typescript
// src/app.ts
import { loadRemoteModule } from '@native-federation/core/runtime';

export async function bootstrap() {
  // Load remote component
  const { RemoteComponent } = await loadRemoteModule('remote-app', './Component');
  
  // Use the component
  const element = document.createElement('div');
  element.innerHTML = '<remote-component></remote-component>';
  document.body.appendChild(element);
}
```

## Development Workflow

### 1. Start Development Server

```bash
# Start your application in development mode
npm run dev

# In another terminal, start remote applications
cd ../remote-app
npm run dev
```

### 2. Build for Production

```bash
# Build your application
npm run build

# Serve production build
npm run serve
```

### 3. Test Federation

```bash
# Run tests
npm test

# Test federation integration
npm run test:integration
```

## Verification

### Check Installation
```bash
# Verify Native Federation is installed
npm list @native-federation/core

# Check build output
ls dist/
# Should contain: remoteEntry.json, importmap.json, and your application files
```

### Test Federation Loading
```typescript
// test-federation.ts
import { initFederation, loadRemoteModule } from '@native-federation/core/runtime';

async function testFederation() {
  try {
    await initFederation('./federation.manifest.json');
    console.log('✓ Federation initialized successfully');
    
    // Test loading a remote module (if available)
    const module = await loadRemoteModule('remote-app', './Component');
    console.log('✓ Remote module loaded successfully');
  } catch (error) {
    console.error('✗ Federation test failed:', error);
  }
}

testFederation();
```

## Troubleshooting

### Common Issues

#### 1. Module Not Found
```
Error: Module not found: @native-federation/core
```
**Solution:** Ensure the package is installed:
```bash
npm install @native-federation/core
```

#### 2. Build Tool Plugin Error
```
Error: Plugin not recognized
```
**Solution:** Check your build tool configuration and ensure federation config is properly imported.

#### 3. Runtime Federation Error
```
Error: Failed to load federation manifest
```
**Solution:** Ensure your development server is running and the manifest file is accessible.

#### 4. CORS Issues
```
Error: Cross-origin request blocked
```
**Solution:** Enable CORS in your development server:
```bash
http-server dist -p 4200 --cors
```

### Getting Help

- **Documentation**: [docs.native-federation.com](https://docs.native-federation.com)
- **GitHub Issues**: [github.com/native-federation/core/issues](https://github.com/native-federation/core/issues)
- **Discord Community**: [discord.gg/native-federation](https://discord.gg/native-federation)
- **Stack Overflow**: Tag questions with `native-federation`

## Next Steps

1. **[Quick Start Tutorial](quick-start.md)** - Build your first federated application
2. **[Framework Integration](frameworks.md)** - Framework-specific guidance
3. **[Configuration Reference](configuration.md)** - Complete configuration options
4. **[Migration Guide](migration.md)** - Migrate from webpack Module Federation

---

**Installation complete!** You're ready to build your first Native Federation application.