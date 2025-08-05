# Angular Native Federation Example

This example demonstrates Native Federation between Angular applications using Angular 18 with standalone components.

## Architecture

- **Host Application** (port 4200): Angular host that loads remote components
- **MFE1** (port 4201): Angular micro-frontend exposing ProductComponent

## Structure

```
angular-example/
├── host/ # Angular Host Application
│ ├── src/
│ │ ├── app/
│ │ │ ├── app.component.ts
│ │ │ └── federation-loader.component.ts
│ │ ├── index.html
│ │ └── main.ts
│ ├── package.json
│ ├── federation.config.js
│ ├── build.js
│ └── server.js
└── mfe1/ # Angular MFE1
 ├── src/
 │ ├── product/
 │ │ └── product.component.ts
 │ ├── index.html
 │ └── main.ts
 ├── package.json
 ├── federation.config.js
 ├── build.js
 └── server.js
```

## Running the Example

### Option 1: Quick Start (Recommended)

1. Install dependencies for both applications:
```bash
cd host && npm install && cd ../mfe1 && npm install && cd ..
```

2. Start both applications in development mode:
```bash
# Terminal 1 - Start MFE1
cd mfe1 && npm run dev

# Terminal 2 - Start Host
cd host && npm run dev
```

3. Open http://localhost:4200 to see the host application

### Option 2: Manual Build and Start

1. Install dependencies:
```bash
cd host && npm install
cd ../mfe1 && npm install
```

2. Build applications:
```bash
cd mfe1 && npm run build
cd ../host && npm run build
```

3. Start servers:
```bash
# Terminal 1
cd mfe1 && npm start

# Terminal 2
cd host && npm start
```

## How It Works

### Federation Configuration

**Host (federation.config.js):**
```javascript
export default {
 name: 'angular-host',
 remotes: {
 'mfe1': 'http://localhost:4201/remoteEntry.js'
 },
 shared: {
 '@angular/core': { singleton: true, strictVersion: false },
 // ... other shared dependencies
 }
};
```

**MFE1 (federation.config.js):**
```javascript
export default {
 name: 'mfe1',
 exposes: {
 './ProductComponent': './src/product/product.component.ts'
 },
 shared: {
 '@angular/core': { singleton: true, strictVersion: false },
 // ... other shared dependencies
 }
};
```

### Component Loading

The host application dynamically loads the remote component:

```typescript
// Load remote entry
const remoteEntry = await import('http://localhost:4201/remoteEntry.js');
await remoteEntry.init();

// Get remote component
const remoteModule = await remoteEntry.get('./ProductComponent');
```

### Build Process

Each application uses esbuild to:
1. Bundle the main application
2. Bundle exposed modules separately
3. Generate `remoteEntry.js` for federation
4. Create federation manifest

## Key Features

- **Angular 18 Standalone Components**: Uses modern Angular patterns
- **Runtime Loading**: Components are loaded on-demand
- **Shared Dependencies**: Angular core libraries are shared between apps
- **Fallback Handling**: Graceful fallbacks when remote components fail
- **Development Mode**: Hot reload during development

## URLs

- Host Application: http://localhost:4200
- MFE1 Standalone: http://localhost:4201
- MFE1 Remote Entry: http://localhost:4201/remoteEntry.js

## Technologies Used

- Angular 18
- TypeScript
- esbuild
- Native Federation
- ES Modules
- Standalone Components

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in server.js files
2. **CORS errors**: Ensure CORS headers are set in server responses
3. **Module not found**: Check that MFE1 is running before loading in host
4. **Angular version mismatch**: Ensure both apps use compatible Angular versions

### Debug Mode

Run with debug logging:
```bash
npm run dev -- --debug
```

This will show detailed federation loading information in the browser console.