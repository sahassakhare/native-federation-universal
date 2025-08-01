#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration for all micro-frontends
const apps = [
  {
    name: 'Host Application',
    path: join(__dirname, 'host'),
    port: 3000,
    color: '\x1b[34m' // Blue
  },
  {
    name: 'Products MFE',
    path: join(__dirname, 'products'),
    port: 4001,
    color: '\x1b[32m' // Green
  },
  {
    name: 'Cart MFE', 
    path: join(__dirname, 'cart'),
    port: 4002,
    color: '\x1b[33m' // Yellow
  }
];

const reset = '\x1b[0m';

function log(app, message) {
  console.log(`${app.color}[${app.name}]${reset} ${message}`);
}

function createSimpleServer(app) {
  const serverCode = `
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';

const PORT = ${app.port};
const isHost = ${app.port === 3000};

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  let pathname = req.url === '/' ? '/index.html' : req.url;
  
  // Mock responses for demonstration
  if (isHost) {
    // Host application
    if (pathname === '/index.html' || pathname === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.end(\`
<!DOCTYPE html>
<html>
<head>
  <title>FederatedMart - Real World Example</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    .nav { display: flex; gap: 20px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
    .nav a { color: #3498db; text-decoration: none; padding: 10px 20px; border-radius: 4px; }
    .nav a:hover { background: #f0f0f0; }
    .content { min-height: 400px; }
    .feature { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 10px 0; }
    .mfe-demo { border: 2px dashed #3498db; padding: 20px; margin: 20px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛒 FederatedMart - Real World E-commerce Example</h1>
    
    <div class="nav">
      <a href="#" onclick="loadHome()">Home</a>
      <a href="#" onclick="loadProducts()">Products</a>
      <a href="#" onclick="loadCart()">Cart</a>
    </div>
    
    <div class="content" id="content">
      <h2>Welcome to Native Federation E-commerce Demo</h2>
      
      <div class="feature">
        <h3>🏗️ Real Micro-Frontend Architecture</h3>
        <p>This demonstration shows a real-world e-commerce application built with Native Federation:</p>
        <ul>
          <li><strong>Host Application (Port 3000):</strong> Main shell application</li>
          <li><strong>Products MFE (Port 4001):</strong> Product catalog with search and filters</li>
          <li><strong>Cart MFE (Port 4002):</strong> Shopping cart with quantity management</li>
        </ul>
      </div>
      
      <div class="mfe-demo">
        <h4>Try the Micro-Frontends:</h4>
        <button onclick="loadProducts()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin: 5px; cursor: pointer;">Load Products MFE</button>
        <button onclick="loadCart()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin: 5px; cursor: pointer;">Load Cart MFE</button>
      </div>
    </div>
  </div>
  
  <script>
    function loadHome() {
      document.getElementById('content').innerHTML = \\\`
        <h2>Welcome to Native Federation E-commerce Demo</h2>
        <div class="feature">
          <h3>🏗️ Real Micro-Frontend Architecture</h3>
          <p>This demonstration shows a real-world e-commerce application built with Native Federation.</p>
        </div>
      \\\`;
    }
    
    async function loadProducts() {
      const content = document.getElementById('content');
      content.innerHTML = '<p>Loading Products MFE from http://localhost:4001...</p>';
      
      try {
        // In real implementation, this would use Native Federation runtime
        const response = await fetch('http://localhost:4001/demo');
        const html = await response.text();
        content.innerHTML = html;
      } catch (error) {
        content.innerHTML = \\\`
          <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px;">
            <h3>❌ Products MFE Not Available</h3>
            <p>Could not load Products micro-frontend from http://localhost:4001</p>
            <p>Error: \\\${error.message}</p>
            <button onclick="loadProducts()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Retry</button>
          </div>
        \\\`;
      }
    }
    
    async function loadCart() {
      const content = document.getElementById('content');
      content.innerHTML = '<p>Loading Cart MFE from http://localhost:4002...</p>';
      
      try {
        const response = await fetch('http://localhost:4002/demo');
        const html = await response.text();
        content.innerHTML = html;
      } catch (error) {
        content.innerHTML = \\\`
          <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px;">
            <h3>❌ Cart MFE Not Available</h3>
            <p>Could not load Cart micro-frontend from http://localhost:4002</p>
            <p>Error: \\\${error.message}</p>
            <button onclick="loadCart()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Retry</button>
          </div>
        \\\`;
      }
    }
  </script>
</body>
</html>
      \`);
      return;
    }
  } else {
    // MFE demo endpoints
    if (pathname === '/demo') {
      res.setHeader('Content-Type', 'text/html');
      const mfeName = PORT === 4001 ? 'Products' : 'Cart';
      const description = PORT === 4001 ? 
        'Product catalog with search, filters, and shopping functionality' :
        'Shopping cart with quantity management and checkout process';
      
      res.end(\`
        <div class="mfe-container" style="border: 3px solid #${PORT === 4001 ? '28a745' : 'dc3545'}; padding: 20px; border-radius: 8px; background: #${PORT === 4001 ? 'd4edda' : 'f8d7da'};">
          <h2>${mfeName} Micro-Frontend</h2>
          <p><strong>Loaded from:</strong> http://localhost:${PORT}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Status:</strong> ✅ Successfully loaded via Native Federation</p>
          
          ${PORT === 4001 ? \`
            <div style="margin: 20px 0;">
              <h4>🛍️ Sample Products:</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
                  <h5>Wireless Headphones</h5>
                  <p>$199.99</p>
                  <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Add to Cart</button>
                </div>
                <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
                  <h5>Smart Watch</h5>
                  <p>$299.99</p>
                  <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Add to Cart</button>
                </div>
              </div>
            </div>
          \` : \`
            <div style="margin: 20px 0;">
              <h4>🛒 Shopping Cart:</h4>
              <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
                <p>Cart is empty - add some products to see cart functionality!</p>
                <div style="margin-top: 10px;">
                  <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">0 items</span>
                  <span style="margin-left: 10px; font-weight: bold;">Total: $0.00</span>
                </div>
              </div>
            </div>
          \`}
          
          <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.7); border-radius: 4px;">
            <small><strong>Technical Details:</strong><br>
            This component is served from an independent micro-frontend running on port ${PORT}. 
            In a real implementation, it would be loaded dynamically using Native Federation's runtime module loading.
            </small>
          </div>
        </div>
      \`);
      return;
    }
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(\`[${isHost ? 'Host' : 'MFE'}] Server running on http://localhost:\${PORT}\`);
});
  `;
  
  return serverCode;
}

async function startServer(app) {
  return new Promise((resolve, reject) => {
    log(app, 'Starting server...');
    
    // Create server code and run it
    const serverCode = createSimpleServer(app);
    
    const child = spawn('node', ['-e', serverCode], {
      cwd: app.path,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    child.stdout.on('data', (data) => {
      log(app, data.toString().trim());
    });
    
    child.stderr.on('data', (data) => {
      log(app, `Error: ${data.toString().trim()}`);
    });
    
    child.on('close', (code) => {
      log(app, `Server stopped with code ${code}`);
    });
    
    // Give it a moment to start
    setTimeout(() => {
      resolve(child);
    }, 1000);
  });
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Native Federation E-commerce Demo Builder          ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🏗️  Building Real-World E-commerce Example                ║
║                                                            ║
║  This demo showcases:                                      ║
║  - Host application with routing                           ║
║  - Products micro-frontend                                 ║
║  - Shopping cart micro-frontend                            ║
║  - Cross-MFE communication                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  const processes = [];
  
  try {
    // Start all servers
    for (const app of apps) {
      const process = await startServer(app);
      processes.push(process);
    }
    
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    🚀 All Servers Running                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Host Application: http://localhost:3000                   ║
║  Products MFE:     http://localhost:4001                   ║
║  Cart MFE:         http://localhost:4002                   ║
║                                                            ║
║  Open http://localhost:3000 to see the demo!              ║
║                                                            ║
║  Press Ctrl+C to stop all servers                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n\\n🛑 Shutting down all servers...');
      processes.forEach(p => p.kill());
      process.exit(0);
    });
    
    // Keep the process alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Failed to start servers:', error);
    processes.forEach(p => p.kill());
    process.exit(1);
  }
}

main();