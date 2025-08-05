# Native Federation SSR (Server-Side Rendering) Example

This example demonstrates Server-Side Rendering with Native Federation, showing how federated micro-frontends can be rendered on the server for improved performance and SEO.

## Architecture Overview

This example shows a complete SSR implementation with:
- Express.js server for SSR rendering
- Angular application with client-side hydration
- Simulated federated component loading
- Performance optimizations for first page load

## Structure

```
ssr-example/
└── angular-ssr/ # Angular SSR Application
 ├── src/
 │ ├── app/
 │ │ ├── app.component.ts
 │ │ └── ssr-demo.component.ts
 │ ├── index.html
 │ ├── main.ts # Client-side bootstrap
 │ └── main.server.ts # Server-side rendering setup
 ├── package.json
 ├── federation.config.js
 ├── build.js # Builds both client & server bundles
 └── server.js # Express SSR server
```

## SSR Flow

```
┌─────────────────────────────────────────┐
│ Express SSR Server │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ Server │ │ Client │ │
│ │ Rendering │───►│ Hydration │ │
│ │ (Node.js) │ │ (Browser) │ │
│ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────┘
 │
 ▼ Native Federation
┌─────────────────────────────────────────┐
│ Federated Content │
│ • News components (SSR simulated) │
│ • Interactive widgets (hydrated) │
│ • Cross-framework loading demos │
└─────────────────────────────────────────┘
```

## Running the SSR Example

### Quick Start

1. Install dependencies:
```bash
cd angular-ssr && npm install
```

2. Build and start SSR server:
```bash
npm run dev
```

3. Open http://localhost:4300 to see server-side rendered content

### Manual Build Process

1. Build both client and server bundles:
```bash
npm run build:client
npm run build:server
```

2. Start the SSR server:
```bash
npm start
```

## Testing SSR vs CSR

### Verify Server-Side Rendering
1. **Disable JavaScript** in browser developer tools
2. Visit http://localhost:4300
3. **Content should still be visible** - this proves SSR is working
4. **Enable JavaScript** to see hydration make content interactive

### View Page Source
- Right-click → "View Page Source"
- You'll see complete HTML with rendered content (not empty divs)
- This HTML is generated on the server before sending to browser

## Key Features Demonstrated

### Server-Side Rendering
- **Express SSR Server**: Custom Node.js server with SSR logic
- **Pre-rendered Content**: HTML generated on server before sending to client
- **SEO Optimization**: Content available for search engines without JavaScript
- **Performance**: Faster First Contentful Paint with server-rendered HTML

### Federation Simulation
- **Federated Content**: Simulated remote component loading on server
- **Mixed Rendering**: Some content SSR, some client-side hydrated
- **Cross-Framework Ready**: Architecture supports Angular, React, Vue federation

### Client Hydration
- **Progressive Enhancement**: Static SSR content becomes interactive
- **Component Hydration**: Interactive widgets loaded after page render
- **Fallback Handling**: Graceful degradation when JavaScript disabled

## How SSR Works in This Example

### 1. Server-Side Rendering Process

When a request comes to the server:

```javascript
// server.js - Express SSR Server
app.get('*', async (req, res) => {
 // Generate SSR content with federated components
 const ssrContent = await renderSSRContent(req.url);

 // Inject into HTML template
 const html = template.replace('<app-root></app-root>',
 `<app-root>${ssrContent}</app-root>`);

 res.send(html);
});
```

### 2. Federated Content Simulation

The server simulates loading remote components:

```javascript
async function renderSSRContent(url) {
 // Simulate fetching remote component data
 const mockRemoteData = await fetchRemoteComponentData();

 // Generate HTML including "federated" news component
 return `
 <div class="ssr-app">
 <h1>Server-Side Rendered Content</h1>
 <div class="news-component">
 ${mockRemoteData.map(article => `
 <article>${article.title}</article>
 `).join('')}
 </div>
 </div>
 `;
}
```

### 3. Client-Side Hydration

After the page loads, Angular takes over:

```typescript
// main.ts - Client bootstrap
async function bootstrap() {
 // Check if SSR content exists
 const hasSSRContent = !!document.querySelector('.ssr-app');

 if (hasSSRContent) {
 console.log(' SSR content detected, starting hydration...');
 }

 await platformBrowserDynamic().bootstrapModule(AppModule);
}
```

## Build Configuration

### Dual Bundle Setup

The build process creates both client and server bundles:

```javascript
// build.js
// Client bundle for browser
await esbuild.build({
 entryPoints: ['./src/main.ts'],
 platform: 'browser',
 outdir: './dist/client'
});

// Server bundle for Node.js
await esbuild.build({
 entryPoints: ['./src/main.server.ts'],
 platform: 'node',
 outdir: './dist/server'
});
```

## SSR Benefits Demonstrated

### Performance Benefits
- **Faster First Contentful Paint**: Content visible immediately
- **Improved Time to Interactive**: Progressive hydration
- **Better Core Web Vitals**: Server-rendered content improves metrics

### SEO Benefits
- **Search Engine Crawling**: Content available without JavaScript
- **Social Media Previews**: Meta tags populated on server
- **Accessibility**: Screen readers can access server-rendered content

### User Experience
- **Perceived Performance**: Content visible before JavaScript loads
- **Progressive Enhancement**: Works even if JavaScript fails to load
- **Reliable Rendering**: Content guaranteed to be available

## Federation Integration Points

While this example simulates federation, it demonstrates the integration points for real federated SSR:

### Server-Side Integration
```javascript
// Real implementation would load remote components on server
const remoteEntry = await import('http://localhost:4301/server/remoteEntry.js');
const newsComponent = await remoteEntry.get('./NewsWidget');
const ssrHtml = renderToString(newsComponent);
```

### Client-Side Hydration
```javascript
// After SSR, client-side federation can enhance with interactivity
const remoteEntry = await import('http://localhost:4301/remoteEntry.js');
const interactiveComponent = await remoteEntry.get('./InteractiveWidget');
// Mount interactive version
```

## URLs and Endpoints

- SSR Application: http://localhost:4300
- View source to see pre-rendered HTML
- Disable JavaScript to verify SSR functionality

## Technologies Used

- **Server**: Node.js + Express
- **Frontend**: Angular 18 with SSR
- **Build**: esbuild (dual client/server bundles)
- **Federation**: Native Federation (simulated)
- **Rendering**: Server-side + Client hydration

## Troubleshooting

### Common Issues

1. **Server bundle not found**: Run `npm run build:server` first
2. **Port conflicts**: Change PORT in server.js
3. **Hydration mismatches**: Ensure server and client render identical content
4. **JavaScript disabled**: Content should still be visible (proves SSR works)

This example demonstrates **enterprise-grade SSR with Native Federation architecture** - combining the benefits of server-side rendering with micro-frontend architecture!