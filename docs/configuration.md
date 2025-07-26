# Configuration Reference

Complete configuration options for Native Federation.

## Federation Configuration

### Basic Configuration
```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      // Configuration options
    })
  ]
};
```

### NativeFederationOptions

```typescript
interface NativeFederationOptions {
  name?: string;                    // Remote application name
  exposes?: Record<string, string>; // Exposed modules
  remotes?: Record<string, string>; // Remote applications
  shared?: SharedConfig;            // Shared dependencies
  skip?: string[];                  // Packages to exclude
  dev?: boolean;                    // Development mode
  verbose?: boolean;                // Verbose logging
}
```

## Configuration Options

### name
**Type:** `string`  
**Required:** For remote applications  
**Description:** Unique identifier for the remote application

```typescript
{
  name: 'my-remote-app'
}
```

### exposes
**Type:** `Record<string, string>`  
**Required:** For remote applications  
**Description:** Modules to expose to other applications

```typescript
{
  exposes: {
    './Component': './src/components/MyComponent.ts',
    './Service': './src/services/MyService.ts',
    './utils': './src/utils/index.ts'
  }
}
```

### remotes
**Type:** `Record<string, string>`  
**Required:** For host applications  
**Description:** Remote applications to consume

```typescript
{
  remotes: {
    'products': 'http://localhost:4201/remoteEntry.json',
    'users': 'http://localhost:4202/remoteEntry.json'
  }
}
```

### shared
**Type:** `SharedConfig`  
**Description:** Shared dependency configuration

```typescript
{
  shared: {
    'react': {
      singleton: true,
      strictVersion: true,
      requiredVersion: '^18.0.0'
    },
    '@angular/core': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto'
    }
  }
}
```

## Shared Dependencies

### SharedConfig

```typescript
type SharedConfig = Record<string, SharedPackageConfig>;

interface SharedPackageConfig {
  singleton?: boolean;      // Enforce single instance
  strictVersion?: boolean;  // Strict version matching
  requiredVersion?: string; // Required version or 'auto'
  eager?: boolean;         // Load immediately
  import?: string;         // Custom import path
  packageName?: string;    // Override package name
}
```

### Helper Functions

#### shareAll()
Share all dependencies with default configuration:

```typescript
import { shareAll } from '@native-federation/core';

{
  shared: shareAll({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto'
  })
}
```

#### share()
Share specific packages:

```typescript
import { share } from '@native-federation/core';

{
  shared: share({
    'react': { singleton: true },
    'lodash': { singleton: false }
  })
}
```

#### singleton()
Mark packages as singletons:

```typescript
import { singleton } from '@native-federation/core';

{
  shared: singleton(['react', '@angular/core', 'rxjs'])
}
```

## Advanced Configuration

### Development Mode
```typescript
{
  dev: true,           // Enable development features
  verbose: true        // Enable verbose logging
}
```

### Package Exclusion
```typescript
{
  skip: [
    'node_modules/some-package',
    'src/internal-utils'
  ]
}
```

### Build Integration

#### esbuild
```typescript
// esbuild.config.js
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

#### Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import federationConfig from './federation.config';

export default defineConfig({
  ...federationConfig,
  build: {
    target: 'es2020'
  }
});
```

## Environment-Specific Configuration

### Development
```typescript
// federation.dev.config.ts
export default {
  plugins: [
    new NativeFederationPlugin({
      remotes: {
        'products': 'http://localhost:4201/remoteEntry.json'
      },
      dev: true,
      verbose: true
    })
  ]
};
```

### Production
```typescript
// federation.prod.config.ts
export default {
  plugins: [
    new NativeFederationPlugin({
      remotes: {
        'products': 'https://products.example.com/remoteEntry.json'
      },
      dev: false,
      verbose: false
    })
  ]
};
```

## Framework-Specific Configuration

### Angular
```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'angular-app',
      exposes: {
        './AppModule': './src/app/app.module.ts',
        './Component': './src/app/components/shared.component.ts'
      },
      shared: {
        ...shareAll({ singleton: true }),
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        'rxjs': { singleton: true, strictVersion: true }
      }
    })
  ]
};
```

### React
```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'react-app',
      exposes: {
        './App': './src/App.tsx',
        './Component': './src/components/SharedComponent.tsx'
      },
      shared: {
        ...shareAll({ singleton: true }),
        'react': { singleton: true, strictVersion: true },
        'react-dom': { singleton: true, strictVersion: true }
      }
    })
  ]
};
```

## Configuration Validation

### TypeScript Support
```typescript
import type { NativeFederationOptions } from '@native-federation/core';

const config: NativeFederationOptions = {
  name: 'my-app',
  // TypeScript will validate configuration
};
```

### Runtime Validation
The plugin automatically validates configuration at build time and provides helpful error messages for common issues.

## Best Practices

### 1. Use shareAll() for Simplicity
```typescript
{
  shared: shareAll({ singleton: true })
}
```

### 2. Be Specific with Versions
```typescript
{
  shared: {
    'react': {
      singleton: true,
      strictVersion: true,
      requiredVersion: '^18.0.0'  // Specific version range
    }
  }
}
```

### 3. Environment-Specific Configurations
```typescript
// Use different configs for dev/prod
const config = process.env.NODE_ENV === 'production' 
  ? require('./federation.prod.config.js')
  : require('./federation.dev.config.js');
```

### 4. Organize Exposed Modules
```typescript
{
  exposes: {
    // Components
    './ButtonComponent': './src/components/Button.tsx',
    './ModalComponent': './src/components/Modal.tsx',
    
    // Services
    './UserService': './src/services/UserService.ts',
    './ApiClient': './src/services/ApiClient.ts',
    
    // Utils
    './utils': './src/utils/index.ts'
  }
}
```

## Troubleshooting

### Common Configuration Issues

1. **Missing name for remote**
   ```
   Error: Remote applications must have a name
   ```
   Solution: Add `name` property to configuration

2. **Invalid shared configuration**
   ```
   Error: Invalid shared dependency configuration
   ```
   Solution: Check shared dependency syntax

3. **Circular dependencies**
   ```
   Error: Circular dependency detected
   ```
   Solution: Review exposed/consumed module relationships

## Next Steps

- [Runtime API](runtime-api.md) - Learn about runtime module loading
- [Quick Start](quick-start.md) - Build your first federated app
- [Migration Guide](MIGRATION.md) - Migrate from webpack Module Federation