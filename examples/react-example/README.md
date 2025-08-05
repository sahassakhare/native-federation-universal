# React Native Federation Example

This example demonstrates Native Federation between React applications using React 18 with hooks and functional components.

## Architecture

- **Host Application** (port 4300): React host that loads remote components
- **MFE1** (port 4301): React micro-frontend exposing ProductList component

## Structure

```
react-example/
├── host/ # React Host Application
│ ├── src/
│ │ ├── App.jsx
│ │ ├── FederationLoader.jsx
│ │ ├── index.html
│ │ └── main.jsx
│ ├── package.json
│ ├── federation.config.js
│ ├── build.js
│ └── server.js
└── mfe1/ # React MFE1
 ├── src/
 │ ├── components/
 │ │ └── ProductList.jsx
 │ ├── App.jsx
 │ ├── index.html
 │ └── main.jsx
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

3. Open http://localhost:4300 to see the host application

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
 name: 'react-host',
 remotes: {
 'mfe1': 'http://localhost:4301/remoteEntry.js'
 },
 shared: {
 'react': { singleton: true, strictVersion: false },
 'react-dom': { singleton: true, strictVersion: false }
 }
};
```

**MFE1 (federation.config.js):**
```javascript
export default {
 name: 'mfe1',
 exposes: {
 './ProductList': './src/components/ProductList.jsx'
 },
 shared: {
 'react': { singleton: true, strictVersion: false },
 'react-dom': { singleton: true, strictVersion: false }
 }
};
```

### Component Loading

The host application dynamically loads the remote component:

```javascript
// Load remote entry
const remoteEntry = await import('http://localhost:4301/remoteEntry.js');
await remoteEntry.init();

// Get remote component
const remoteModule = await remoteEntry.get('./ProductList');
const ProductListComponent = remoteModule.default;
```

### Build Process

Each application uses esbuild to:
1. Bundle the main React application
2. Bundle exposed components separately
3. Generate `remoteEntry.js` for federation
4. Create federation manifest
5. Support JSX transformation

## Key Features

- **React 18**: Uses latest React with functional components
- **React Hooks**: useState, useEffect, useRef for state management
- **JSX Support**: Full JSX transformation with esbuild
- **Runtime Loading**: Components are loaded on-demand
- **Shared Dependencies**: React and ReactDOM are shared between apps
- **Fallback Handling**: Graceful fallbacks when remote components fail
- **Development Mode**: Hot reload during development

## URLs

- Host Application: http://localhost:4300
- MFE1 Standalone: http://localhost:4301
- MFE1 Remote Entry: http://localhost:4301/remoteEntry.js

## Technologies Used

- React 18
- JSX
- esbuild
- Native Federation
- ES Modules
- React Hooks (useState, useEffect, useRef)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in server.js files
2. **CORS errors**: Ensure CORS headers are set in server responses
3. **Module not found**: Check that MFE1 is running before loading in host
4. **React version mismatch**: Ensure both apps use compatible React versions
5. **JSX compilation errors**: Check esbuild JSX configuration

### Debug Mode

Run with debug logging:
```bash
npm run dev -- --debug
```

This will show detailed federation loading information in the browser console.