#  Native Federation Beginner's Guide

A complete step-by-step guide to set up Native Federation from scratch for absolute beginners.

##  What is Native Federation?

Native Federation is a modern alternative to Webpack Module Federation that:
-  Uses **native ES modules** instead of webpack-specific formats
-  Works with **any bundler** (esbuild, Vite, Rollup, etc.)
-  Provides **better performance** and smaller bundle sizes
-  Supports **import maps** for shared dependencies
-  Uses **standard web technologies**

##  Two Ways to Get Started

### Option 1: Using Schematics (Automated) 
### Option 2: Manual Setup (Step-by-step) 

---

# Option 1: Using Native Federation Schematics 

## Step 1: Install Native Federation

```bash
# From the root of the Native Federation project
npm run pack:all

# Install the schematics
npm install -g ./native-federation-schematics-1.0.0.tgz
```

## Step 2: Setup for Angular Projects

The schematics automatically detect your build system and configure accordingly:

```bash
# For Angular host application
ng generate @native-federation/schematics:setup --name=my-host --type=host

# For Angular micro-frontend
ng generate @native-federation/schematics:setup --name=my-mfe --type=remote
```

**What the schematic creates (depends on your build system):**

### For esbuild (Angular 17+ default):
- `federation.config.js` - Federation configuration
- `native-federation.esbuild.js` - esbuild plugin for Native Federation
- `build-hooks.js` - Post-build processing hooks
- Updates `package.json` with build scripts

### For webpack (Traditional Angular):
- `federation.config.js` - Federation configuration  
- `webpack.config.js` - Webpack plugin configuration
- Updates `angular.json` to use custom webpack builder
- Updates `package.json` with webpack dependencies

### For Vite (Modern alternative):
- `federation.config.js` - Federation configuration
- `vite.config.ts` - Vite plugin configuration
- Updates `angular.json` if applicable
- Updates `package.json` with Vite dependencies

**All setups use standard Angular CLI commands:**
- `ng build` - Build your application
- `ng serve` - Serve your application

---

# Option 2: Manual Setup (Recommended for Learning) 

Let's create a complete Native Federation setup from scratch!

##  What We'll Build

- **Host Application** (port 3000) - Loads remote components
- **MFE1** (port 3001) - Exposes a ProductList component

## Step 1: Create Project Structure

```bash
mkdir native-federation-tutorial
cd native-federation-tutorial

# Create host application
mkdir host
mkdir host/src
mkdir host/src/components

# Create micro-frontend
mkdir mfe1  
mkdir mfe1/src
mkdir mfe1/src/components
```

## Step 2: Set Up MFE1 (Micro-frontend)

### 2.1 Create MFE1 Package Configuration

**File: `mfe1/package.json`**
```json
{
  "name": "mfe1-products",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "node build.js",
    "serve": "node server.js",
    "dev": "npm run build && npm run serve"
  },
  "devDependencies": {
    "esbuild": "^0.20.0"
  }
}
```

### 2.2 Create Federation Configuration

**File: `mfe1/federation.config.js`**
```javascript
export default {
  name: 'mfe1',
  exposes: {
    './ProductList': './src/components/ProductList.js'
  },
  shared: {
    // Add shared dependencies here if needed
  }
};
```

### 2.3 Create the Product Component

**File: `mfe1/src/components/ProductList.js`**
```javascript
// Simple vanilla JS component that can be loaded remotely
export class ProductList {
  constructor() {
    this.products = [
      { id: 1, name: 'Laptop', price: 999.99 },
      { id: 2, name: 'Phone', price: 699.99 },
      { id: 3, name: 'Tablet', price: 499.99 }
    ];
  }

  render(container) {
    container.innerHTML = `
      <div style="padding: 20px; border: 2px solid #007acc; border-radius: 8px; background: #f0f8ff;">
        <h2> Product List (Loaded from MFE1)</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          ${this.products.map(product => `
            <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3>${product.name}</h3>
              <p style="color: #007acc; font-weight: bold;">$${product.price}</p>
            </div>
          `).join('')}
        </div>
        <p style="margin-top: 15px; color: #666; font-style: italic;">
           This component was loaded dynamically from MFE1 using Native Federation!
        </p>
      </div>
    `;
  }
}
```

### 2.4 Create Build Script

**File: `mfe1/build.js`**
```javascript
import esbuild from 'esbuild';
import fs from 'fs';
import federationConfig from './federation.config.js';

console.log(' Building MFE1 with Native Federation...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Build main application
await esbuild.build({
  entryPoints: ['./src/index.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  outfile: './dist/main.js'
});

// Build exposed modules
const exposedModules = {};
for (const [exposedName, modulePath] of Object.entries(federationConfig.exposes)) {
  const moduleKey = exposedName.replace('./', '');
  const outfile = `./dist/exposed/${moduleKey}.js`;
  
  // Ensure exposed directory exists
  if (!fs.existsSync('./dist/exposed')) {
    fs.mkdirSync('./dist/exposed', { recursive: true });
  }
  
  await esbuild.build({
    entryPoints: [modulePath],
    bundle: true,
    platform: 'browser',
    target: 'es2020',
    format: 'esm',
    outfile
  });
  
  exposedModules[exposedName] = `/exposed/${moduleKey}.js`;
}

// Generate Native Federation remote entry
const remoteEntryContent = `
// Native Federation Remote Entry for ${federationConfig.name}
const manifest = {
  name: '${federationConfig.name}',
  exposes: ${JSON.stringify(exposedModules, null, 2)}
};

export const init = async () => {
  console.log('[Native Federation] Initialized ${federationConfig.name}');
};

export const get = async (module) => {
  console.log('[Native Federation] Loading module:', module);
  
  if (!manifest.exposes[module]) {
    throw new Error(\`Module \${module} not exposed by ${federationConfig.name}\`);
  }
  
  const moduleUrl = manifest.exposes[module];
  const moduleExports = await import(moduleUrl);
  
  return moduleExports;
};

console.log('[Native Federation] Remote entry loaded for ${federationConfig.name}');
`;

fs.writeFileSync('./dist/remoteEntry.js', remoteEntryContent);

// Create federation manifest
const manifest = {
  name: federationConfig.name,
  exposes: exposedModules,
  remoteEntry: 'http://localhost:3001/remoteEntry.js'
};

fs.writeFileSync('./dist/federation-manifest.json', JSON.stringify(manifest, null, 2));

console.log(' MFE1 build complete!');
console.log(' Exposed modules:', Object.keys(federationConfig.exposes));
```

### 2.5 Create MFE1 Main Entry

**File: `mfe1/src/index.js`**
```javascript
import { ProductList } from './components/ProductList.js';

console.log(' MFE1 Application Started');

// If running standalone, render the component
if (document.getElementById('app')) {
  const productList = new ProductList();
  productList.render(document.getElementById('app'));
}
```

### 2.6 Create Simple Server

**File: `mfe1/server.js`**
```javascript
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3001;
const DIST_DIR = join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

const server = createServer((req, res) => {
  let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  if (!existsSync(filePath)) {
    filePath = join(DIST_DIR, 'index.html');
  }

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const mimeType = mimeTypes[ext] || 'text/plain';
    
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(` MFE1 running at http://127.0.0.1:${PORT}`);
});
```

### 2.7 Create MFE1 HTML

**File: `mfe1/dist/index.html`**
```html
<!DOCTYPE html>
<html>
<head>
    <title>MFE1 - Product Catalog</title>
</head>
<body>
    <div id="app"></div>
    <script type="module" src="./main.js"></script>
</body>
</html>
```

## Step 3: Set Up Host Application

### 3.1 Create Host Package Configuration

**File: `host/package.json`**
```json
{
  "name": "federation-host",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "node build.js",
    "serve": "node server.js",
    "dev": "npm run build && npm run serve"
  },
  "devDependencies": {
    "esbuild": "^0.20.0"
  }
}
```

### 3.2 Create Host Main Application

**File: `host/src/index.js`**
```javascript
console.log(' Host Application Started');

// Native Federation Loader
class NativeFederationLoader {
  async loadRemoteComponent(remoteUrl, moduleName, containerId) {
    try {
      console.log(` Loading remote entry from: ${remoteUrl}`);
      
      // Load remote entry
      const remoteEntry = await import(remoteUrl);
      
      // Initialize remote
      await remoteEntry.init();
      
      // Load module
      console.log(` Loading module: ${moduleName}`);
      const module = await remoteEntry.get(moduleName);
      
      // Render component
      if (module.ProductList) {
        const container = document.getElementById(containerId);
        const component = new module.ProductList();
        component.render(container);
        
        console.log(' Remote component loaded successfully!');
        return true;
      } else {
        throw new Error('ProductList not found in module');
      }
      
    } catch (error) {
      console.error(' Failed to load remote component:', error);
      document.getElementById(containerId).innerHTML = `
        <div style="color: red; padding: 20px; border: 2px solid red; border-radius: 8px;">
          <h3>Failed to load remote component</h3>
          <p>${error.message}</p>
          <p><strong>Make sure MFE1 is running on port 3001</strong></p>
        </div>
      `;
      return false;
    }
  }
}

// Initialize the loader
const federationLoader = new NativeFederationLoader();

// Set up UI
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('load-products').addEventListener('click', () => {
    document.getElementById('status').textContent = 'Loading...';
    
    federationLoader.loadRemoteComponent(
      'http://localhost:3001/remoteEntry.js',
      './ProductList',
      'remote-container'
    ).then(success => {
      document.getElementById('status').textContent = success ? 
        ' Loaded successfully!' : 
        ' Failed to load';
    });
  });
  
  document.getElementById('clear').addEventListener('click', () => {
    document.getElementById('remote-container').innerHTML = '';
    document.getElementById('status').textContent = 'Ready';
  });
});
```

### 3.3 Create Host Build Script

**File: `host/build.js`**
```javascript
import esbuild from 'esbuild';
import fs from 'fs';

console.log(' Building Host Application...');

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Build main application
await esbuild.build({
  entryPoints: ['./src/index.js'],
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  outfile: './dist/main.js'
});

console.log(' Host build complete!');
```

### 3.4 Create Host Server

**File: `host/server.js`**
```javascript
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const DIST_DIR = join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

const server = createServer((req, res) => {
  let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  if (!existsSync(filePath)) {
    filePath = join(DIST_DIR, 'index.html');
  }

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const mimeType = mimeTypes[ext] || 'text/plain';
    
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(` Host running at http://127.0.0.1:${PORT}`);
});
```

### 3.5 Create Host HTML

**File: `host/dist/index.html`**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Native Federation Host</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .controls { 
            margin: 20px 0; 
        }
        button { 
            margin-right: 10px; 
            padding: 10px 20px; 
            cursor: pointer; 
        }
        #status { 
            margin: 10px 0; 
            font-weight: bold; 
        }
        #remote-container { 
            margin-top: 20px; 
            min-height: 200px; 
            border: 2px dashed #ccc; 
            padding: 20px; 
        }
    </style>
</head>
<body>
    <h1> Native Federation Demo</h1>
    <p>This demonstrates loading remote components using Native Federation</p>
    
    <div class="controls">
        <button id="load-products">Load Product List from MFE1</button>
        <button id="clear">Clear</button>
    </div>
    
    <div id="status">Ready</div>
    
    <div id="remote-container">
        <p style="color: #666; text-align: center; margin-top: 80px;">
            Remote components will be loaded here
        </p>
    </div>
    
    <script type="module" src="./main.js"></script>
</body>
</html>
```

## Step 4: Run the Demo

### 4.1 Install Dependencies

```bash
# Install MFE1 dependencies
cd mfe1
npm install

# Install Host dependencies  
cd ../host
npm install
```

### 4.2 Start MFE1 (Terminal 1)

```bash
cd mfe1
npm run dev
```

### 4.3 Start Host (Terminal 2)

```bash
cd host  
npm run dev
```

### 4.4 Test the Federation

1. Open http://127.0.0.1:3000 in your browser
2. Click "Load Product List from MFE1"
3. Watch the ProductList component load dynamically from MFE1!

##  Congratulations!

You've successfully created a Native Federation setup from scratch! 

##  What Just Happened?

1. **MFE1** exposed its `ProductList` component via `remoteEntry.js`
2. **Host** dynamically imported the remote entry at runtime
3. **Native Federation** used standard ES module imports (no webpack!)
4. **Component** was loaded and rendered in the host application

##  Next Steps

- Add more micro-frontends
- Implement shared dependencies  
- Add Angular/React components
- Set up automatic builds
- Deploy to different domains

##  Key Concepts Learned

-  **Remote Entry**: ES module that exposes federation API
-  **Dynamic Imports**: Runtime loading of remote modules
-  **Federation Manifest**: JSON describing exposed modules  
-  **Native ES Modules**: Standard web technology, no webpack
-  **Cross-Origin Loading**: CORS headers for remote loading

You now understand the core concepts of Native Federation! 