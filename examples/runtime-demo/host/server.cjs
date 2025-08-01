const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  console.log(`[Host Server] ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Serve runtime.js (mock)
  if (req.url === '/runtime.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.end(`
      // Mock Native Federation Runtime
      export class FederationRuntime {
        constructor() {
          console.log('[Native Federation Runtime] Initialized');
        }
      }
    `);
    return;
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
      res.statusCode = 404;
      res.end('File not found');
      return;
    }
    
    res.setHeader('Content-Type', contentType);
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Native Federation Host Server Running              ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🚀 URL: http://localhost:${PORT}                              ║
║                                                            ║
║  📁 Serving: Host Application                              ║
║  🔧 Features: Runtime-based Module Federation              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});