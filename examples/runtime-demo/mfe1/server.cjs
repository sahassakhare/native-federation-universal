const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4201;

const server = http.createServer((req, res) => {
  console.log(`[MFE1 Server] ${req.method} ${req.url}`);
  
  // Set CORS headers - IMPORTANT for federation
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Serve remoteEntry.js
  if (req.url === '/remoteEntry.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(`
      // MFE1 Remote Entry
      console.log('[MFE1] Remote entry loaded');
      window.__MFE1_LOADED__ = true;
    `);
    return;
  }
  
  // Map URLs to files
  let filePath;
  if (req.url === '/App.js') {
    filePath = path.join(__dirname, 'App.js');
  } else if (req.url === '/components/Dynamic.js') {
    filePath = path.join(__dirname, 'components', 'Dynamic.js');
  } else {
    filePath = path.join(__dirname, req.url);
  }
  
  // Determine content type
  const extname = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };
  const contentType = contentTypes[extname] || 'text/plain';
  
  // Read and serve file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`[MFE1 Server] Error serving ${req.url}:`, err.message);
      res.statusCode = 404;
      res.end(`File not found: ${req.url}`);
      return;
    }
    
    res.setHeader('Content-Type', contentType);
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          Native Federation MFE1 Server Running             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🚀 URL: http://localhost:${PORT}                              ║
║                                                            ║
║  📦 Exposed Modules:                                       ║
║     - ./App (http://localhost:${PORT}/App.js)                  ║
║     - ./components/Dynamic                                 ║
║       (http://localhost:${PORT}/components/Dynamic.js)         ║
║                                                            ║
║  ✨ CORS enabled for cross-origin loading                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});