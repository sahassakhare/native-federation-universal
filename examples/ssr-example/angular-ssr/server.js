import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 4300;
const DIST_CLIENT_DIR = join(__dirname, 'dist', 'client');
const DIST_SERVER_DIR = join(__dirname, 'dist', 'server');

// Serve static files from client dist
app.use(express.static(DIST_CLIENT_DIR));

// SSR Route Handler
app.get('*', async (req, res) => {
 try {
 console.log(` SSR request: ${req.url}`);

 // Load the server-side rendered application
 let serverAppPath = join(DIST_SERVER_DIR, 'main.server.js');

 if (!existsSync(serverAppPath)) {
 // Fallback to client-side rendering if server bundle doesn't exist
 console.log(' Server bundle not found, falling back to CSR');
 return serveFallbackHTML(req, res);
 }

 try {
 // Dynamic import of the server bundle
 const { renderApplication } = await import(serverAppPath);

 // Load the base HTML template
 const indexPath = join(DIST_CLIENT_DIR, 'index.html');
 let template = readFileSync(indexPath, 'utf-8');

 // Simulate SSR rendering with placeholder content
 const ssrContent = await renderSSRContent(req.url);

 // Inject SSR content into template
 const html = template.replace(
 '<app-root></app-root>',
 `<app-root>${ssrContent}</app-root>`
 );

 // Add SSR metadata
 const finalHtml = html.replace(
 '<head>',
 `<head>
 <meta name="ssr-rendered" content="true">
 <meta name="ssr-timestamp" content="${new Date().toISOString()}">
 <meta name="ssr-url" content="${req.url}">`
 );

 res.send(finalHtml);
 console.log(' SSR response sent');

 } catch (serverError) {
 console.error(' Server rendering failed:', serverError);
 return serveFallbackHTML(req, res);
 }

 } catch (error) {
 console.error(' SSR error:', error);
 res.status(500).send('Internal Server Error');
 }
});

// Fallback to client-side rendering
function serveFallbackHTML(req, res) {
 const indexPath = join(DIST_CLIENT_DIR, 'index.html');
 if (existsSync(indexPath)) {
 let html = readFileSync(indexPath, 'utf-8');
 html = html.replace(
 '<head>',
 `<head>
 <meta name="ssr-fallback" content="true">
 <meta name="render-mode" content="csr">`
 );
 res.send(html);
 console.log(' CSR fallback sent');
 } else {
 res.status(404).send('Application not found');
 }
}

// Simulate server-side rendering with federated content
async function renderSSRContent(url) {
 console.log(' Rendering SSR content...');

 // Simulate fetching remote component data
 const mockRemoteData = await fetchRemoteComponentData();

 // Generate SSR HTML content
 const ssrHtml = `
 <div class="ssr-app">
 <header class="ssr-header">
 <h1> Server-Side Rendered Application</h1>
 <p>This content was rendered on the server at ${new Date().toLocaleString()}</p>
 <div class="ssr-info">
 <span class="ssr-badge">SSR</span>
 <span>URL: ${url}</span>
 </div>
 </header>

 <main class="ssr-main">
 <section class="local-content">
 <h2> Local SSR Content</h2>
 <p>This content is rendered directly by the Angular SSR host.</p>
 <div class="server-info">
 <strong>Server Time:</strong> ${new Date().toLocaleString()}<br>
 <strong>Environment:</strong> Node.js Server<br>
 <strong>Request URL:</strong> ${url}
 </div>
 </section>

 <section class="federated-content">
 <h2> Federated SSR Content</h2>
 <p>The content below simulates server-side rendered federated components:</p>

 <div class="news-component ssr-federated">
 <h3> Latest News (SSR Federated)</h3>
 ${mockRemoteData.map(article => `
 <article class="news-article">
 <h4>${article.title}</h4>
 <p class="news-summary">${article.summary}</p>
 <div class="news-meta">
 <span class="news-date">${article.date}</span>
 <span class="news-source">Source: ${article.source}</span>
 </div>
 </article>
 `).join('')}
 <div class="federation-info">
 <small>
 This content simulates an SSR federated component from news-mfe<br>
 In production, this would be loaded from: http://localhost:4301<br>
 Rendered on server, hydrated on client
 </small>
 </div>
 </div>
 </section>

 <section class="hydration-demo">
 <h2> Client Hydration Demo</h2>
 <p>The components below will be hydrated when JavaScript loads:</p>
 <div class="hydration-placeholder" data-component="interactive-counter">
 <p> Interactive Counter (will be hydrated)</p>
 <div class="counter-display">Count: 0</div>
 <p><em>This will become interactive after hydration</em></p>
 </div>
 </section>
 </main>

 <style>
 .ssr-app {
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
 max-width: 1200px;
 margin: 0 auto;
 padding: 20px;
 }

 .ssr-header {
 background: linear-gradient(135deg, #1976d2, #42a5f5);
 color: white;
 padding: 30px;
 border-radius: 8px;
 text-align: center;
 margin-bottom: 30px;
 }

 .ssr-header h1 {
 margin: 0 0 10px 0;
 font-size: 2.5em;
 }

 .ssr-info {
 display: flex;
 justify-content: center;
 align-items: center;
 gap: 15px;
 margin-top: 15px;
 }

 .ssr-badge {
 background: rgba(255,255,255,0.2);
 padding: 4px 12px;
 border-radius: 20px;
 font-weight: bold;
 font-size: 0.8em;
 }

 .ssr-main {
 display: flex;
 flex-direction: column;
 gap: 30px;
 }

 section {
 background: white;
 padding: 30px;
 border-radius: 8px;
 box-shadow: 0 2px 4px rgba(0,0,0,0.1);
 }

 section h2 {
 margin: 0 0 20px 0;
 color: #1976d2;
 border-bottom: 2px solid #e3f2fd;
 padding-bottom: 10px;
 }

 .server-info {
 background: #f8f9fa;
 padding: 15px;
 border-radius: 4px;
 border-left: 4px solid #1976d2;
 font-family: monospace;
 font-size: 14px;
 margin-top: 15px;
 }

 .news-component {
 background: #f8f9ff;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #4caf50;
 }

 .news-article {
 background: white;
 padding: 15px;
 margin: 10px 0;
 border-radius: 4px;
 border: 1px solid #e0e0e0;
 }

 .news-article h4 {
 margin: 0 0 10px 0;
 color: #333;
 }

 .news-summary {
 color: #666;
 margin: 0 0 10px 0;
 }

 .news-meta {
 font-size: 0.9em;
 color: #888;
 }

 .news-date {
 margin-right: 15px;
 }

 .federation-info {
 background: rgba(76, 175, 80, 0.1);
 padding: 10px;
 border-radius: 4px;
 margin-top: 15px;
 font-family: monospace;
 font-size: 12px;
 line-height: 1.4;
 }

 .hydration-placeholder {
 background: #fff3e0;
 padding: 20px;
 border-radius: 4px;
 border-left: 4px solid #ff9800;
 text-align: center;
 }

 .counter-display {
 font-size: 1.5em;
 font-weight: bold;
 color: #ff9800;
 margin: 10px 0;
 }
 </style>
 </div>
 `;

 return ssrHtml;
}

// Simulate fetching data for federated components
async function fetchRemoteComponentData() {
 // Simulate network delay
 await new Promise(resolve => setTimeout(resolve, 100));

 return [
 {
 title: 'Native Federation 2.0 Released',
 summary: 'Major improvements to server-side rendering and cross-framework support.',
 date: new Date().toLocaleDateString(),
 source: 'Tech News MFE'
 },
 {
 title: 'Micro-Frontends in Production',
 summary: 'Best practices for deploying federated applications at scale.',
 date: new Date(Date.now() - 86400000).toLocaleDateString(),
 source: 'Architecture Daily'
 },
 {
 title: 'SSR Performance Benefits',
 summary: 'How server-side rendering improves user experience and SEO.',
 date: new Date(Date.now() - 172800000).toLocaleDateString(),
 source: 'Performance Weekly'
 }
 ];
}

app.listen(PORT, '127.0.0.1', () => {
 console.log(` SSR Server running at http://127.0.0.1:${PORT}`);
 console.log(` Client files: ${DIST_CLIENT_DIR}`);
 console.log(`  Server bundle: ${DIST_SERVER_DIR}`);
 console.log(' Server-Side Rendering enabled');
 console.log('Press Ctrl+C to stop the server');
});

process.on('SIGINT', () => {
 console.log('\n Stopping SSR server...');
 process.exit(0);
});