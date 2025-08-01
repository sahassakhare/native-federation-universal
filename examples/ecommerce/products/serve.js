import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4001;
const DIST_DIR = join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

async function serveFile(req, res, filePath) {
  try {
    await stat(filePath);
    const content = await readFile(filePath);
    const ext = extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'text/plain';
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': ext === '.js' || ext === '.mjs' ? 'no-cache' : 'max-age=3600'
    });
    
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;
  
  console.log(`[Products MFE] ${req.method} ${pathname}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  // Serve remoteEntry.js
  if (pathname === '/remoteEntry.js') {
    const remoteEntryPath = join(DIST_DIR, 'remoteEntry.js');
    await serveFile(req, res, remoteEntryPath);
    return;
  }
  
  // Serve federation manifest
  if (pathname === '/federation.manifest.json') {
    const manifestPath = join(DIST_DIR, 'federation.manifest.json');
    await serveFile(req, res, manifestPath);
    return;
  }
  
  // Serve exposed modules
  const exposedRoutes = {
    '/ProductCatalog.js': 'ProductCatalog.js',
    '/ProductCard.js': 'components/ProductCard.js',
    '/ProductGrid.js': 'components/ProductGrid.js',
    '/ProductSearch.js': 'components/ProductSearch.js',
    '/ProductFilters.js': 'components/ProductFilters.js'
  };
  
  if (exposedRoutes[pathname]) {
    const filePath = join(DIST_DIR, exposedRoutes[pathname]);
    await serveFile(req, res, filePath);
    return;
  }
  
  // Default to serve from dist directory
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = join(DIST_DIR, pathname);
  await serveFile(req, res, filePath);
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Products Micro-Frontend Server Running             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🚀 URL: http://localhost:${PORT}                              ║
║                                                            ║
║  📦 Exposed Modules:                                       ║
║     - ./ProductCatalog                                     ║
║     - ./ProductCard                                        ║
║     - ./ProductGrid                                        ║
║     - ./ProductSearch                                      ║
║     - ./ProductFilters                                     ║
║                                                            ║
║  🔗 Remote Entry: /remoteEntry.js                          ║
║  📄 Manifest: /federation.manifest.json                    ║
║                                                            ║
║  ✨ CORS enabled for cross-origin loading                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});