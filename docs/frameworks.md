# Framework Integration Guide

Native Federation works with any framework or vanilla JavaScript. This guide covers framework-specific integration patterns.

## Angular Integration

### Setup

```bash
# Install Native Federation
npm install @native-federation/core

# Optional: Install schematics for migration
npm install --save-dev @native-federation/schematics
```

### Configuration

```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'angular-app',
      exposes: {
        './AppModule': './src/app/app.module.ts',
        './Component': './src/app/shared/shared.component.ts'
      },
      remotes: {
        'shell': 'http://localhost:4200/remoteEntry.json'
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

### Component Loading

```typescript
// Dynamic component loading
import { Component, ViewContainerRef, ComponentRef } from '@angular/core';
import { loadRemoteModule } from '@native-federation/core/runtime';

@Component({
  template: '<div #container></div>'
})
export class DynamicComponent {
  constructor(private viewContainer: ViewContainerRef) {}

  async loadRemoteComponent() {
    const { RemoteComponent } = await loadRemoteModule('shell', './Component');
    const componentRef: ComponentRef<any> = this.viewContainer.createComponent(RemoteComponent);
  }
}
```

### SSR Support

```typescript
// SSR integration
import { NativeFederationSSRService } from '@native-federation/core/angular/ssr-integration';

@Component({
  providers: [NativeFederationSSRService]
})
export class AppComponent {
  constructor(private federation: NativeFederationSSRService) {}

  async ngOnInit() {
    const module = await this.federation.loadRemoteModule('products', './ProductList');
  }
}
```

## React Integration

### Setup

```bash
npm install @native-federation/core
```

### Configuration

```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'react-app',
      exposes: {
        './App': './src/App.tsx',
        './Button': './src/components/Button.tsx'
      },
      remotes: {
        'shell': 'http://localhost:3000/remoteEntry.json'
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

### Component Loading Hook

```typescript
// useFederatedComponent hook
import { useState, useEffect } from 'react';
import { loadRemoteModule } from '@native-federation/core/runtime';

export function useFederatedComponent<T>(remoteName: string, modulePath: string) {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadRemoteModule<{ default: T }>(remoteName, modulePath)
      .then(module => setComponent(module.default))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [remoteName, modulePath]);

  return { component, loading, error };
}
```

### Usage Example

```tsx
// App.tsx
import React, { Suspense } from 'react';
import { useFederatedComponent } from './hooks/useFederatedComponent';

const RemoteButton = () => {
  const { component: Button, loading, error } = useFederatedComponent<React.ComponentType<any>>('ui-lib', './Button');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!Button) return null;

  return <Button onClick={() => alert('Remote button clicked!')} />;
};

export default function App() {
  return (
    <div>
      <h1>React Host Application</h1>
      <Suspense fallback={<div>Loading remote component...</div>}>
        <RemoteButton />
      </Suspense>
    </div>
  );
}
```

## Vue.js Integration

### Setup

```bash
npm install @native-federation/core
```

### Configuration

```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'vue-app',
      exposes: {
        './App': './src/App.vue',
        './Button': './src/components/Button.vue'
      },
      remotes: {
        'shell': 'http://localhost:8080/remoteEntry.json'
      },
      shared: {
        ...shareAll({ singleton: true }),
        'vue': { singleton: true, strictVersion: true }
      }
    })
  ]
};
```

### Composable for Federation

```typescript
// composables/useFederation.ts
import { ref, onMounted } from 'vue';
import { loadRemoteModule } from '@native-federation/core/runtime';

export function useFederatedComponent<T>(remoteName: string, modulePath: string) {
  const component = ref<T | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);

  onMounted(async () => {
    try {
      const module = await loadRemoteModule<{ default: T }>(remoteName, modulePath);
      component.value = module.default;
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  });

  return { component, loading, error };
}
```

### Usage Example

```vue
<!-- App.vue -->
<template>
  <div>
    <h1>Vue Host Application</h1>
    <div v-if="loading">Loading remote component...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <component v-else-if="remoteButton" :is="remoteButton" @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import { useFederatedComponent } from './composables/useFederation';

const { component: remoteButton, loading, error } = useFederatedComponent('ui-lib', './Button');

const handleClick = () => {
  alert('Remote button clicked!');
};
</script>
```

## Svelte Integration

### Setup

```bash
npm install @native-federation/core
```

### Configuration

```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'svelte-app',
      exposes: {
        './App': './src/App.svelte',
        './Button': './src/Button.svelte'
      },
      remotes: {
        'shell': 'http://localhost:5000/remoteEntry.json'
      },
      shared: shareAll({ singleton: true })
    })
  ]
};
```

### Dynamic Component Loading

```typescript
// federation.ts
import { loadRemoteModule } from '@native-federation/core/runtime';

export async function loadSvelteComponent(remoteName: string, modulePath: string) {
  const module = await loadRemoteModule(remoteName, modulePath);
  return module.default;
}
```

### Usage Example

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { loadSvelteComponent } from './federation';

  let RemoteButton: any = null;
  let loading = true;
  let error: Error | null = null;

  onMount(async () => {
    try {
      RemoteButton = await loadSvelteComponent('ui-lib', './Button');
    } catch (err) {
      error = err as Error;
    } finally {
      loading = false;
    }
  });

  function handleClick() {
    alert('Remote button clicked!');
  }
</script>

<div>
  <h1>Svelte Host Application</h1>
  {#if loading}
    <div>Loading remote component...</div>
  {:else if error}
    <div>Error: {error.message}</div>
  {:else if RemoteButton}
    <svelte:component this={RemoteButton} on:click={handleClick} />
  {/if}
</div>
```

## Vanilla JavaScript

### Setup

```bash
npm install @native-federation/core
```

### Configuration

```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'vanilla-app',
      exposes: {
        './utils': './src/utils.js',
        './Button': './src/Button.js'
      },
      remotes: {
        'shell': 'http://localhost:8000/remoteEntry.json'
      },
      shared: shareAll({ singleton: true })
    })
  ]
};
```

### Component Class

```javascript
// src/Button.js
export class Button {
  constructor(props) {
    this.props = props;
    this.element = document.createElement('button');
    this.element.textContent = props.text;
    this.element.addEventListener('click', props.onClick);
  }

  render(container) {
    container.appendChild(this.element);
  }

  destroy() {
    this.element.remove();
  }
}
```

### Usage Example

```javascript
// main.js
import { initFederation, loadRemoteModule } from '@native-federation/core/runtime';

async function bootstrap() {
  // Initialize federation
  await initFederation();

  // Load remote component
  const { Button } = await loadRemoteModule('ui-lib', './Button');

  // Create and render component
  const app = document.getElementById('app');
  const button = new Button({
    text: 'Click me!',
    onClick: () => alert('Remote button clicked!')
  });

  button.render(app);
}

bootstrap().catch(console.error);
```

## Framework-Agnostic Patterns

### Universal Component Interface

```typescript
// Define common interface for all frameworks
interface UniversalComponent {
  render(container: HTMLElement): void;
  destroy(): void;
  update?(props: any): void;
}

// Wrapper for different frameworks
export function createUniversalComponent(
  framework: 'react' | 'vue' | 'angular' | 'svelte',
  component: any,
  props: any
): UniversalComponent {
  switch (framework) {
    case 'react':
      return new ReactWrapper(component, props);
    case 'vue':
      return new VueWrapper(component, props);
    case 'angular':
      return new AngularWrapper(component, props);
    case 'svelte':
      return new SvelteWrapper(component, props);
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}
```

### Cross-Framework Communication

```typescript
// Event bus for cross-framework communication
export class FederationEventBus {
  private events = new Map<string, Set<Function>>();

  emit(event: string, data: any) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
}

// Global event bus
export const federationEventBus = new FederationEventBus();
```

## Best Practices

### 1. Framework-Specific Shared Dependencies

```typescript
// Angular
shared: {
  '@angular/core': { singleton: true, strictVersion: true },
  '@angular/common': { singleton: true, strictVersion: true },
  'rxjs': { singleton: true, strictVersion: true }
}

// React  
shared: {
  'react': { singleton: true, strictVersion: true },
  'react-dom': { singleton: true, strictVersion: true }
}

// Vue
shared: {
  'vue': { singleton: true, strictVersion: true }
}
```

### 2. Error Boundaries

```typescript
// Implement error boundaries for graceful failures
async function loadComponentWithFallback(remoteName: string, modulePath: string, fallback: any) {
  try {
    return await loadRemoteModule(remoteName, modulePath);
  } catch (error) {
    console.warn(`Failed to load ${remoteName}${modulePath}, using fallback`);
    return fallback;
  }
}
```

### 3. Loading States

```typescript
// Always provide loading states for better UX
const [component, setComponent] = useState(null);
const [loading, setLoading] = useState(true);

// Show loading indicator while fetching remote component
if (loading) return <LoadingSpinner />;
```

### 4. Type Safety

```typescript
// Define interfaces for remote modules
interface RemoteButton {
  text: string;
  onClick: () => void;
}

// Use with loadRemoteModule
const { Button } = await loadRemoteModule<{ Button: RemoteButton }>('ui-lib', './Button');
```

## Next Steps

- [Configuration Reference](configuration.md) - Configure federation for your framework
- [Runtime API](runtime-api.md) - Learn the runtime APIs
- [Quick Start](quick-start.md) - Build your first federated app