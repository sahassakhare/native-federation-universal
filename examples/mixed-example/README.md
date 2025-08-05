# Mixed Framework Native Federation Example

This example demonstrates Native Federation working across different frameworks - Angular host loading React components using cross-framework micro-frontend architecture.

## Architecture

- **Angular Host** (port 4200): Angular application that loads React components
- **React MFE** (port 4201): React micro-frontend that exposes components

```
┌─────────────────┐ ┌─────────────────┐
│ Angular Host │◄──►│ React MFE │
│ (Port 4200) │ │ (Port 4201) │
│ │ │ │
│ • Angular 18 │ │ • React 18 │
│ • React+ReactDOM│ │ • JSX │
│ • Mixed Loading │ │ • ShoppingCart │
└─────────────────┘ └─────────────────┘
 ▲ ▲
 │ │
 Native Federation Native Federation
 Dynamic Loading Component Expose
```

## Structure

```
mixed-example/
├── angular-host/ # Angular Host Application
│ ├── src/
│ │ ├── app/
│ │ │ ├── app.component.ts
│ │ │ └── react-loader.component.ts
│ │ ├── index.html
│ │ └── main.ts
│ ├── package.json
│ ├── federation.config.js
│ ├── build.js
│ └── server.js
└── react-mfe/ # React MFE
 ├── src/
 │ ├── components/
 │ │ └── ShoppingCart.jsx
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
cd angular-host && npm install && cd ../react-mfe && npm install && cd ..
```

2. Start both applications in development mode:
```bash
# Terminal 1 - Start React MFE
cd react-mfe && npm run dev

# Terminal 2 - Start Angular Host
cd angular-host && npm run dev
```

3. Open http://localhost:4200 to see the Angular host loading React components

### Option 2: Manual Build and Start

1. Install dependencies:
```bash
cd angular-host && npm install
cd ../react-mfe && npm install
```

2. Build applications:
```bash
cd react-mfe && npm run build
cd ../angular-host && npm run build
```

3. Start servers:
```bash
# Terminal 1
cd react-mfe && npm start

# Terminal 2
cd angular-host && npm start
```

## How Cross-Framework Loading Works

### Federation Configuration

**Angular Host (federation.config.js):**
```javascript
export default {
 name: 'angular-host',
 remotes: {
 'react-mfe': 'http://localhost:4201/remoteEntry.js'
 },
 shared: {
 '@angular/core': { singleton: true, strictVersion: false },
 'react': { singleton: true, strictVersion: false },
 'react-dom': { singleton: true, strictVersion: false }
 }
};
```

**React MFE (federation.config.js):**
```javascript
export default {
 name: 'react-mfe',
 exposes: {
 './ShoppingCart': './src/components/ShoppingCart.jsx'
 },
 shared: {
 'react': { singleton: true, strictVersion: false },
 'react-dom': { singleton: true, strictVersion: false }
 }
};
```

### Angular Loading React Components

The Angular application loads and renders React components:

```typescript
// Load remote React component
const remoteEntry = await import('http://localhost:4201/remoteEntry.js');
await remoteEntry.init();
const remoteModule = await remoteEntry.get('./ShoppingCart');

// Render React component using React 18's createRoot
const root = window.ReactDOM.createRoot(this.reactContainer.nativeElement);
const reactElement = window.React.createElement(remoteModule.default, {
 title: 'Cross-Framework Shopping Cart'
});
root.render(reactElement);
```

### Shared Dependencies

Both applications share React and ReactDOM:
- Angular host includes React/ReactDOM to render remote React components
- React MFE marks React/ReactDOM as external shared dependencies
- Native Federation ensures singleton instances across applications

## Key Features

### Cross-Framework Architecture
- **Angular React**: Angular host dynamically loads React components
- **Framework Isolation**: Each MFE runs in its own framework context
- **Shared Dependencies**: React/ReactDOM shared between Angular and React
- **Type Safety**: Full TypeScript support across frameworks

### Technical Implementation
- **React 18 Integration**: Uses createRoot API for React component rendering
- **Angular 18 Standalone**: Modern Angular patterns with standalone components
- **Dynamic Loading**: Components loaded on-demand at runtime
- **Error Handling**: Graceful fallbacks when cross-framework loading fails

## URLs and Testing

- Angular Host: http://localhost:4200
- React MFE Standalone: http://localhost:4201
- React MFE Remote Entry: http://localhost:4201/remoteEntry.js

### Testing Steps

1. Start both applications
2. Open the Angular host at http://localhost:4200
3. Click "Load React Component" button
4. See the React ShoppingCart component rendered inside the Angular application
5. Interact with the React component (add items, change quantities)
6. Verify the React component maintains its own state while embedded in Angular

## Technologies Used

- **Frontend Frameworks**: Angular 18, React 18
- **Build Tools**: esbuild, TypeScript
- **Federation**: Native Federation
- **Module System**: ES Modules
- **Cross-Framework**: React rendering in Angular via ReactDOM

## Benefits of Mixed Architecture

1. **Technology Freedom**: Teams can choose the best framework for their domain
2. **Gradual Migration**: Migrate from one framework to another incrementally
3. **Expertise Utilization**: Leverage existing team skills in different frameworks
4. **Component Reuse**: Share React components in Angular applications (and vice versa)
5. **Future Proofing**: Easy to adopt new frameworks as they emerge

## Real-World Use Cases

- **Legacy Migration**: Gradually migrate from Angular to React while reusing components
- **Team Specialization**: Frontend teams specialized in different frameworks
- **Component Libraries**: Share UI components across framework boundaries
- **Micro-Frontend Architecture**: Different teams own different technology stacks
- **Technology Evaluation**: Test new frameworks alongside existing ones

## Troubleshooting

### Common Issues

1. **React not found**: Ensure React/ReactDOM are included in Angular host dependencies
2. **CORS errors**: Ensure CORS headers are set in server responses
3. **Component mounting errors**: Check React 18 createRoot API usage
4. **Framework conflicts**: Verify shared dependency configuration

### Debug Mode

Run with debug logging:
```bash
npm run dev -- --debug
```

This demonstrates the true power of Native Federation - **framework-agnostic micro-frontend architecture**!