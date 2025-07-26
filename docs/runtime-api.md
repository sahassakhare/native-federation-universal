# Runtime API Reference

Complete API reference for Native Federation runtime functions.

## Core Runtime Functions

### initFederation()

Initialize the federation system and load the federation manifest.

```typescript
function initFederation(manifestPath?: string): Promise<void>
```

**Parameters:**
- `manifestPath` (optional): Path to federation manifest file. Defaults to `'./federation.manifest.json'`

**Example:**
```typescript
import { initFederation } from '@native-federation/core/runtime';

// Initialize with default manifest
await initFederation();

// Initialize with custom manifest
await initFederation('./custom-manifest.json');
```

**Error Handling:**
```typescript
try {
  await initFederation();
  console.log('Federation initialized successfully');
} catch (error) {
  console.error('Failed to initialize federation:', error);
}
```

### loadRemoteModule()

Dynamically load a module from a remote application.

```typescript
function loadRemoteModule<T = any>(
  remoteName: string, 
  modulePath: string
): Promise<T>
```

**Parameters:**
- `remoteName`: Name of the remote application
- `modulePath`: Path to the module within the remote application

**Returns:** Promise that resolves to the loaded module

**Example:**
```typescript
import { loadRemoteModule } from '@native-federation/core/runtime';

// Load a React component
const { Button } = await loadRemoteModule('ui-components', './Button');

// Load an Angular component
const { ProductList } = await loadRemoteModule('products', './ProductList');

// Load a service
const userService = await loadRemoteModule('users', './UserService');
```

**Type Safety:**
```typescript
interface ButtonProps {
  text: string;
  onClick: () => void;
}

interface ButtonComponent {
  new (props: ButtonProps): any;
}

const { Button } = await loadRemoteModule<{ Button: ButtonComponent }>(
  'ui-components', 
  './Button'
);
```

### loadSharedModule()

Load a shared dependency with version management.

```typescript
function loadSharedModule<T = any>(
  packageName: string,
  versionStrategy?: VersionStrategy
): Promise<T>
```

**Parameters:**
- `packageName`: Name of the shared package
- `versionStrategy` (optional): Version loading strategy

**Example:**
```typescript
import { loadSharedModule } from '@native-federation/core/runtime';

// Load with default strategy
const React = await loadSharedModule('react');

// Load with specific version strategy
const lodash = await loadSharedModule('lodash', {
  type: 'compatible',
  fallbackVersion: '4.17.21'
});
```

### preloadModule()

Preload a remote module for better performance.

```typescript
function preloadModule(
  remoteName: string, 
  modulePath: string
): Promise<void>
```

**Example:**
```typescript
import { preloadModule } from '@native-federation/core/runtime';

// Preload critical modules
await Promise.all([
  preloadModule('products', './ProductList'),
  preloadModule('users', './UserProfile'),
  preloadModule('cart', './ShoppingCart')
]);
```

## Version Management

### VersionStrategy

```typescript
interface VersionStrategy {
  type: 'exact' | 'compatible' | 'latest' | 'fallback';
  fallbackVersion?: string;
}
```

**Strategy Types:**

#### exact
Load exact version match:
```typescript
const module = await loadSharedModule('react', {
  type: 'exact'
});
```

#### compatible
Load compatible version within range:
```typescript
const module = await loadSharedModule('lodash', {
  type: 'compatible',
  fallbackVersion: '4.17.0'
});
```

#### latest
Load latest available version:
```typescript
const module = await loadSharedModule('rxjs', {
  type: 'latest'
});
```

#### fallback
Use fallback if primary version fails:
```typescript
const module = await loadSharedModule('moment', {
  type: 'fallback',
  fallbackVersion: '2.29.0'
});
```

## Error Handling

### Common Error Types

```typescript
// Federation not initialized
try {
  const module = await loadRemoteModule('app', './Component');
} catch (error) {
  if (error.message.includes('not initialized')) {
    await initFederation();
    // Retry loading
  }
}

// Remote not found
try {
  const module = await loadRemoteModule('nonexistent', './Component');
} catch (error) {
  console.error('Remote application not found:', error);
  // Load fallback component
}

// Module not exposed
try {
  const module = await loadRemoteModule('app', './PrivateComponent');
} catch (error) {
  console.error('Module not exposed:', error);
  // Use alternative component
}
```

### Error Recovery Patterns

```typescript
async function loadWithFallback<T>(
  remoteName: string,
  modulePath: string,
  fallbackModule: T
): Promise<T> {
  try {
    return await loadRemoteModule(remoteName, modulePath);
  } catch (error) {
    console.warn(`Failed to load ${remoteName}${modulePath}, using fallback`);
    return fallbackModule;
  }
}

// Usage
const Component = await loadWithFallback(
  'ui-lib',
  './Button',
  DefaultButton
);
```

## Advanced Usage

### Module Caching

```typescript
// Modules are automatically cached after first load
const module1 = await loadRemoteModule('app', './Component'); // Network request
const module2 = await loadRemoteModule('app', './Component'); // From cache

// Clear cache if needed (advanced usage)
import { clearModuleCache } from '@native-federation/core/runtime';
clearModuleCache();
```

### Hot Reload Support

```typescript
import { watchFederationBuildCompletion } from '@native-federation/core/runtime';

// Watch for remote application updates
watchFederationBuildCompletion('http://localhost:4201/build-events', {
  onUpdate: (remoteName) => {
    console.log(`Remote ${remoteName} updated, clearing cache`);
    clearModuleCache();
  }
});
```

### Federation State

```typescript
import { getFederationState } from '@native-federation/core/runtime';

// Get current federation state
const state = getFederationState();
console.log('Loaded remotes:', state.remotes);
console.log('Shared modules:', state.shared);
console.log('Module cache:', state.cache);
```

## Framework Integration

### Angular Integration

```typescript
// Angular service
import { Injectable } from '@angular/core';
import { loadRemoteModule } from '@native-federation/core/runtime';

@Injectable({ providedIn: 'root' })
export class FederationService {
  async loadComponent(remoteName: string, componentPath: string) {
    const { component } = await loadRemoteModule(remoteName, componentPath);
    return component;
  }
}
```

### React Integration

```typescript
// React hook
import { useState, useEffect } from 'react';
import { loadRemoteModule } from '@native-federation/core/runtime';

export function useFederatedComponent<T>(remoteName: string, modulePath: string) {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadRemoteModule<T>(remoteName, modulePath)
      .then(setComponent)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [remoteName, modulePath]);

  return { component, loading, error };
}
```

### Vue Integration

```typescript
// Vue composable
import { ref, onMounted } from 'vue';
import { loadRemoteModule } from '@native-federation/core/runtime';

export function useFederatedModule<T>(remoteName: string, modulePath: string) {
  const module = ref<T | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  onMounted(async () => {
    try {
      module.value = await loadRemoteModule<T>(remoteName, modulePath);
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  });

  return { module, loading, error };
}
```

## Performance Optimization

### Parallel Loading

```typescript
// Load multiple modules in parallel
const [userModule, productModule, cartModule] = await Promise.all([
  loadRemoteModule('users', './UserService'),
  loadRemoteModule('products', './ProductService'),
  loadRemoteModule('cart', './CartService')
]);
```

### Lazy Loading

```typescript
// Load modules only when needed
const loadUserComponent = () => loadRemoteModule('users', './UserProfile');
const loadProductComponent = () => loadRemoteModule('products', './ProductList');

// Use with routing or conditional rendering
```

### Preloading Critical Modules

```typescript
// Preload during application initialization
async function initializeApp() {
  // Initialize federation
  await initFederation();
  
  // Preload critical modules
  await Promise.all([
    preloadModule('shell', './Navigation'),
    preloadModule('shell', './Footer'),
    preloadModule('users', './UserMenu')
  ]);
  
  // Start application
  startApp();
}
```

## TypeScript Support

### Module Type Definitions

```typescript
// Define module interfaces
interface RemoteModule {
  Component: React.ComponentType<any>;
  Service: any;
  utils: {
    formatDate: (date: Date) => string;
    validateEmail: (email: string) => boolean;
  };
}

// Use with loadRemoteModule
const remote = await loadRemoteModule<RemoteModule>('utils', './exports');
const formattedDate = remote.utils.formatDate(new Date());
```

### Federation Manifest Types

```typescript
interface FederationManifest {
  [remoteName: string]: string; // Remote entry URLs
}

interface RemoteEntry {
  name: string;
  metadata: {
    exposes: Record<string, string>;
    shared: Record<string, string>;
  };
}
```

## Debugging

### Enable Debug Logging

```typescript
// Enable verbose logging
await initFederation('./federation.manifest.json', {
  debug: true
});
```

### Runtime Inspection

```typescript
// Inspect loaded modules
const state = getFederationState();
console.table(state.loadedModules);

// Check federation health
const health = await checkFederationHealth();
console.log('Federation health:', health);
```

## Best Practices

1. **Always initialize federation first**
2. **Use type definitions for better development experience**
3. **Implement error boundaries for graceful failure handling**
4. **Preload critical modules for better performance**
5. **Use caching effectively - modules are cached automatically**
6. **Implement proper loading states in UI**

## Next Steps

- [Configuration Reference](configuration.md) - Configure federation setup
- [SSR + Hydration](SSR_HYDRATION_GUIDE.md) - Server-side rendering
- [Migration Guide](MIGRATION.md) - Migrate from webpack Module Federation