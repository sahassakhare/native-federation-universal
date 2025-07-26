# Quick Start Tutorial

Build your first Native Federation micro-frontend application in 10 minutes.

## What We'll Build

We'll create a simple micro-frontend setup with:
- **Host Application** - Main application that consumes remote modules
- **Remote Application** - Micro-frontend that exposes components

## Prerequisites

- Node.js 16+ installed
- Basic knowledge of JavaScript/TypeScript
- Familiarity with your chosen framework (Angular, React, Vue, etc.)

## Step 1: Create the Remote Application

### 1.1 Setup Project
```bash
# Create remote application directory
mkdir mfe-remote
cd mfe-remote

# Initialize package.json
npm init -y

# Install dependencies
npm install @native-federation/core
npm install --save-dev esbuild typescript
```

### 1.2 Create Federation Configuration
```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: 'mfe-remote',
      exposes: {
        './Button': './src/Button.ts',
        './utils': './src/utils.ts'
      },
      shared: shareAll({
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto'
      })
    })
  ]
};
```

### 1.3 Create Components
```typescript
// src/Button.ts
export interface ButtonProps {
  text: string;
  onClick: () => void;
}

export class Button {
  private element: HTMLButtonElement;

  constructor(props: ButtonProps) {
    this.element = document.createElement('button');
    this.element.textContent = props.text;
    this.element.addEventListener('click', props.onClick);
    this.element.style.cssText = `
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    `;
  }

  render(container: HTMLElement): void {
    container.appendChild(this.element);
  }

  destroy(): void {
    this.element.remove();
  }
}

export default Button;
```

```typescript
// src/utils.ts
export function formatMessage(message: string): string {
  return `[Remote MFE]: ${message}`;
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString();
}
```

### 1.4 Create Entry Point
```typescript
// src/index.ts
export { default as Button } from './Button';
export * from './utils';

console.log('Remote MFE loaded successfully!');
```

### 1.5 Setup Build Configuration
```typescript
// build.js
import { build } from 'esbuild';
import federationConfig from './federation.config.js';

const isDev = process.argv.includes('--dev');

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2020',
  sourcemap: isDev,
  watch: isDev,
  ...federationConfig,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
  }
});

if (!isDev) {
  console.log('✓ Remote application built successfully');
}
```

### 1.6 Update Package.json
```json
{
  "name": "mfe-remote",
  "type": "module",
  "scripts": {
    "dev": "node build.js --dev",
    "build": "node build.js",
    "serve": "http-server dist -p 4201 --cors"
  },
  "devDependencies": {
    "esbuild": "^0.19.0",
    "typescript": "^5.0.0",
    "http-server": "^14.0.0"
  },
  "dependencies": {
    "@native-federation/core": "^1.0.0"
  }
}
```

### 1.7 Start Remote Application
```bash
# Build and serve the remote application
npm run build
npm run serve

# Application will be available at http://localhost:4201
```

## Step 2: Create the Host Application

### 2.1 Setup Project
```bash
# Create host application directory (in a new terminal)
mkdir mfe-host
cd mfe-host

# Initialize package.json
npm init -y

# Install dependencies
npm install @native-federation/core
npm install --save-dev esbuild typescript
```

### 2.2 Create Federation Configuration
```typescript
// federation.config.ts
import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      remotes: {
        'mfe-remote': 'http://localhost:4201/remoteEntry.json'
      },
      shared: shareAll({
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto'
      })
    })
  ]
};
```

### 2.3 Create Main Application
```typescript
// src/main.ts
import { initFederation, loadRemoteModule } from '@native-federation/core/runtime';

async function bootstrap() {
  try {
    // Initialize federation
    await initFederation('./federation.manifest.json');
    console.log('✓ Federation initialized');

    // Load remote modules
    const { Button, formatMessage, getCurrentTime } = await loadRemoteModule('mfe-remote', './Button');
    console.log('✓ Remote modules loaded');

    // Create application
    const app = document.getElementById('app')!;
    
    // Add title
    const title = document.createElement('h1');
    title.textContent = 'Native Federation Host Application';
    app.appendChild(title);

    // Add description
    const description = document.createElement('p');
    description.textContent = formatMessage('This button is loaded from a remote micro-frontend');
    app.appendChild(description);

    // Add remote button
    const buttonContainer = document.createElement('div');
    const button = new Button({
      text: 'Click me! (From Remote MFE)',
      onClick: () => {
        alert(formatMessage(`Button clicked at ${getCurrentTime()}`));
      }
    });
    
    button.render(buttonContainer);
    app.appendChild(buttonContainer);

    // Add status
    const status = document.createElement('p');
    status.textContent = '✓ Host application loaded successfully with remote components';
    status.style.color = 'green';
    app.appendChild(status);

  } catch (error) {
    console.error('✗ Failed to initialize application:', error);
    document.getElementById('app')!.innerHTML = `
      <h1>Error</h1>
      <p>Failed to load the application: ${error.message}</p>
      <p>Make sure the remote application is running on http://localhost:4201</p>
    `;
  }
}

bootstrap();
```

### 2.4 Create HTML Template
```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Native Federation Host</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    
    h1 {
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }
    
    p {
      margin: 15px 0;
    }
    
    #app {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div id="app">
    <p>Loading...</p>
  </div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

### 2.5 Setup Build Configuration
```typescript
// build.js
import { build } from 'esbuild';
import { copyFileSync } from 'fs';
import federationConfig from './federation.config.js';

const isDev = process.argv.includes('--dev');

await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2020',
  sourcemap: isDev,
  watch: isDev,
  ...federationConfig
});

// Copy HTML file
copyFileSync('public/index.html', 'dist/index.html');

if (!isDev) {
  console.log('✓ Host application built successfully');
}
```

### 2.6 Update Package.json
```json
{
  "name": "mfe-host",
  "type": "module",
  "scripts": {
    "dev": "node build.js --dev",
    "build": "node build.js",
    "serve": "http-server dist -p 4200 --cors"
  },
  "devDependencies": {
    "esbuild": "^0.19.0",
    "typescript": "^5.0.0",
    "http-server": "^14.0.0"
  },
  "dependencies": {
    "@native-federation/core": "^1.0.0"
  }
}
```

### 2.7 Start Host Application
```bash
# Build and serve the host application
npm run build
npm run serve

# Application will be available at http://localhost:4200
```

## Step 3: Test the Federation

### 3.1 Verify Applications are Running
- **Remote Application**: http://localhost:4201/remoteEntry.json
- **Host Application**: http://localhost:4200

### 3.2 Check Browser Console
Open browser developer tools and verify:
- Federation initialized successfully
- Remote modules loaded without errors
- No CORS issues

### 3.3 Test Functionality
- Click the button to verify remote component works
- Check that remote utilities (formatMessage, getCurrentTime) function correctly

## Step 4: Development Workflow

### 4.1 Hot Reload Development
```bash
# Terminal 1: Remote application with hot reload
cd mfe-remote
npm run dev & npm run serve

# Terminal 2: Host application with hot reload  
cd mfe-host
npm run dev & npm run serve
```

### 4.2 Make Changes
Try modifying the remote button component:

```typescript
// mfe-remote/src/Button.ts - Change button style
this.element.style.cssText = `
  background: #28a745;  /* Changed from #007bff */
  color: white;
  border: none;
  padding: 12px 24px;   /* Increased padding */
  border-radius: 6px;   /* Increased border radius */
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;    /* Added bold */
`;
```

Refresh the host application to see changes.

## Step 5: Production Build

### 5.1 Build Both Applications
```bash
# Build remote application
cd mfe-remote
npm run build

# Build host application  
cd mfe-host
npm run build
```

### 5.2 Deploy
Both applications can be deployed independently:
- Deploy `mfe-remote/dist` to your remote application server
- Deploy `mfe-host/dist` to your host application server
- Update remote URLs in host configuration as needed

## Troubleshooting

### Common Issues

**Remote Entry Not Found**
```
Error: Failed to fetch remote entry
```
- Ensure remote application is running on http://localhost:4201
- Check CORS is enabled with `--cors` flag

**Module Loading Failed**
```
Error: Failed to load remote module
```
- Verify the module is properly exposed in remote configuration
- Check browser network tab for 404 errors

**CORS Errors**
```
Error: Cross-origin request blocked
```
- Add `--cors` flag to http-server commands
- Use `http-server dist -p 4201 --cors`

## Next Steps

Congratulations! You've successfully created your first Native Federation micro-frontend application.

**Continue Learning:**
- **[Framework Integration](frameworks.md)** - Angular, React, Vue specific guides
- **[Configuration Reference](configuration.md)** - Advanced configuration options
- **[Migration Guide](migration.md)** - Migrate from webpack Module Federation
- **[SSR + Hydration](ssr-hydration.md)** - Server-side rendering support

**Advanced Topics:**
- Shared state management
- Cross-framework communication
- Performance optimization
- Production deployment strategies

---

You've built a complete micro-frontend setup in just a few minutes! Native Federation makes it easy to create, develop, and deploy federated applications with unprecedented performance and simplicity.