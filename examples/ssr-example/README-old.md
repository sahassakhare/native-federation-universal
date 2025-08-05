# Native Federation SSR (Server-Side Rendering) Example

This example demonstrates Server-Side Rendering with Native Federation, showing how federated micro-frontends can be rendered on the server for improved performance and SEO.

## Structure

- **angular-ssr**: Angular SSR host application with federated content rendering

```
angular-ssr/
├── src/
│ ├── app/
│ │ ├── app.component.ts
│ │ └── ssr-demo.component.ts
│ ├── index.html
│ ├── main.ts # Client-side bootstrap
│ └── main.server.ts # Server-side rendering
├── package.json
├── federation.config.js
├── build.js # Builds both client & server bundles
└── server.js # Express SSR server
```

## SSR Architecture

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
 ▼ Simulated Federation
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

## Angular Universal + Native Federation

### Host Setup

```bash
cd angular-ssr-host

# Create Angular Universal app
ng new angular-ssr-host --routing=true --style=css --ssr=true

# Add Native Federation
ng add @native-federation/schematics

# Configure SSR federation
```

### Key Files

```typescript
// server.ts - Angular Universal server
import { SSRFederationService } from '@native-federation/core';

const federationService = new SSRFederationService({
 remotes: {
 'mfe1': 'http://localhost:4201/server/remoteEntry.js'
 }
});

// Pre-render remote components on server
app.get('*', async (req, res) => {
 const remoteComponents = await federationService.loadSSRComponents(req.url);

 const html = await renderApplication(bootstrap, {
 document: template,
 url: req.url,
 platformProviders: [
 provideServerRendering(),
 // Provide pre-rendered remote components
 { provide: 'REMOTE_COMPONENTS', useValue: remoteComponents }
 ]
 });

 res.send(html);
});
```

### MFE SSR Configuration

```typescript
// Angular MFE with SSR support
@Component({
 selector: 'mfe-product-list',
 template: `
 <div class="product-list">
 <h2>Products (SSR Rendered)</h2>
 <div *ngFor="let product of products" class="product-card">
 <h3>{{ product.name }}</h3>
 <p>{{ product.price | currency }}</p>
 </div>
 </div>
 `
})
export class ProductListComponent implements OnInit {
 products: Product[] = [];

 ngOnInit() {
 // Load products on server and browser
 this.loadProducts();
 }

 private loadProducts() {
 // This runs on both server and client
 this.products = [
 { id: 1, name: 'SSR Product 1', price: 99.99 },
 { id: 2, name: 'SSR Product 2', price: 149.99 }
 ];
 }
}
```

## React SSR + Native Federation

### Next.js Setup

```bash
cd react-ssr-host

# Create Next.js app
npx create-next-app@latest react-ssr-host --typescript --app-router

# Add Native Federation support
npm install @native-federation/core
```

### SSR Component Loading

```tsx
// pages/index.tsx - Next.js with Native Federation
import { GetServerSideProps } from 'next';
import { SSRFederationLoader } from '@native-federation/core';

interface Props {
 ssrComponents: any[];
}

export default function HomePage({ ssrComponents }: Props) {
 return (
 <div>
 <h1>React SSR Host</h1>

 {/* Render SSR components */}
 {ssrComponents.map((component, index) => (
 <div key={index} dangerouslySetInnerHTML={{ __html: component.html }} />
 ))}

 {/* Client-side federation */}
 <FederationLoader remoteName="react-mfe" module="./ProductGrid" />
 </div>
 );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
 // Load remote components on server
 const federationLoader = new SSRFederationLoader({
 remotes: {
 'react-mfe': 'http://localhost:3001/server/remoteEntry.js'
 }
 });

 const ssrComponents = await federationLoader.loadSSRComponents([
 { remote: 'react-mfe', module: './ProductGrid' }
 ]);

 return {
 props: {
 ssrComponents
 }
 };
};
```

## SSR Benefits

### Performance
- **Faster First Contentful Paint**: Content rendered on server
- **Improved Time to Interactive**: Progressive hydration
- **Reduced Bundle Size**: Server-rendered content doesn't need client JS

### SEO
- **Search Engine Crawling**: Content available without JavaScript
- **Social Media Previews**: Meta tags and content for sharing
- **Core Web Vitals**: Better performance metrics

### User Experience
- **Perceived Performance**: Content visible immediately
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility**: Screen readers can access server-rendered content

## Running SSR Example

### Start SSR Services

```bash
# Terminal 1: Angular SSR MFE
cd angular-ssr-mfe
npm run build:ssr
npm run serve:ssr

# Terminal 2: Angular SSR Host
cd angular-ssr-host
npm run build:ssr
npm run serve:ssr

# Terminal 3: React SSR MFE
cd react-ssr-mfe
npm run build
npm run start

# Terminal 4: React SSR Host
cd react-ssr-host
npm run build
npm run start
```

### Test SSR

1. **Disable JavaScript** in browser developer tools
2. Visit http://localhost:4200 (Angular SSR Host)
3. Visit http://localhost:3000 (React SSR Host)
4. **Verify content is visible** without JavaScript
5. **Enable JavaScript** and see hydration in action

## Advanced SSR Patterns

### Streaming SSR
```typescript
// Stream federated components as they load
const stream = renderToSSRStream(App, {
 federatedComponents: [
 { remote: 'mfe1', module: './ProductList' },
 { remote: 'mfe2', module: './UserProfile' }
 ]
});
```

### Selective Hydration
```tsx
// Only hydrate interactive components
<FederatedComponent
 remote="mfe1"
 module="./ProductList"
 hydrate={false} // Static SSR only
/>

<FederatedComponent
 remote="mfe2"
 module="./ShoppingCart"
 hydrate={true} // Full hydration
/>
```

### Progressive Loading
```typescript
// Load non-critical components after hydration
useEffect(() => {
 import('http://localhost:4201/remoteEntry.js')
 .then(remote => remote.get('./RecommendedProducts'))
 .then(component => setRecommendations(component));
}, []);
```

This demonstrates **enterprise-grade SSR with Native Federation** - combining the benefits of server-side rendering with micro-frontend architecture!