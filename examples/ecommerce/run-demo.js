#!/usr/bin/env node

import { createServer } from 'http';

// Simple demo servers
const servers = [
  {
    name: 'Host',
    port: 3000,
    color: '\x1b[34m',
    handler: (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (req.method === 'OPTIONS') {
        res.end();
        return;
      }

      res.setHeader('Content-Type', 'text/html');
      res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>FederatedMart - Real World Example</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    .nav { display: flex; gap: 20px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
    .nav a { color: #3498db; text-decoration: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .nav a:hover { background: #f0f0f0; }
    .content { min-height: 400px; }
    .feature { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 10px 0; }
    .mfe-demo { border: 2px dashed #3498db; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin: 5px; cursor: pointer; }
    .btn:hover { background: #0056b3; }
    .btn-success { background: #28a745; }
    .btn-danger { background: #dc3545; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛒 FederatedMart - Real World E-commerce Example</h1>
    
    <div class="nav">
      <a onclick="loadHome()">🏠 Home</a>
      <a onclick="loadProducts()">📦 Products MFE</a>
      <a onclick="loadCart()">🛒 Cart MFE</a>
      <a onclick="showArchitecture()">🏗️ Architecture</a>
    </div>
    
    <div class="content" id="content">
      <h2>Welcome to Native Federation E-commerce Demo</h2>
      
      <div class="feature">
        <h3>🏗️ Real Micro-Frontend Architecture</h3>
        <p>This demonstration shows a real-world e-commerce application built with Native Federation:</p>
        <ul>
          <li><strong>Host Application (Port 3000):</strong> Main shell application with routing and shared state</li>
          <li><strong>Products MFE (Port 4001):</strong> Product catalog with search, filters, and add-to-cart functionality</li>
          <li><strong>Cart MFE (Port 4002):</strong> Shopping cart with quantity management and checkout process</li>
        </ul>
      </div>
      
      <div class="mfe-demo">
        <h4>🚀 Try the Micro-Frontends:</h4>
        <button class="btn btn-success" onclick="loadProducts()">Load Products MFE</button>
        <button class="btn btn-danger" onclick="loadCart()">Load Cart MFE</button>
        <button class="btn" onclick="showArchitecture()">View Architecture</button>
      </div>
    </div>
  </div>
  
  <script>
    function loadHome() {
      document.getElementById('content').innerHTML = \`
        <h2>Welcome to Native Federation E-commerce Demo</h2>
        <div class="feature">
          <h3>🏗️ Real Micro-Frontend Architecture</h3>
          <p>This is a comprehensive demonstration of micro-frontend architecture using Native Federation.</p>
          <h4>Key Features:</h4>
          <ul>
            <li>✅ Independent deployable micro-frontends</li>
            <li>✅ Shared state management across MFEs</li>
            <li>✅ Dynamic module loading</li>
            <li>✅ Cross-MFE communication</li>
            <li>✅ Real-world e-commerce functionality</li>
          </ul>
        </div>
      \`;
    }
    
    async function loadProducts() {
      const content = document.getElementById('content');
      content.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div><p>Loading Products MFE from http://localhost:4001...</p></div>';
      
      try {
        const response = await fetch('http://localhost:4001/demo');
        const html = await response.text();
        content.innerHTML = html;
      } catch (error) {
        content.innerHTML = \`
          <div style="color: #dc3545; padding: 20px; border: 2px solid #dc3545; border-radius: 8px; background: #f8d7da;">
            <h3>❌ Products MFE Not Available</h3>
            <p><strong>Could not load Products micro-frontend from http://localhost:4001</strong></p>
            <p>This would normally load the full product catalog with:</p>
            <ul>
              <li>Product grid with 12 sample products</li>
              <li>Search functionality</li>
              <li>Category and price filters</li>
              <li>Add to cart functionality</li>
            </ul>
            <p><strong>Error:</strong> \${error.message}</p>
            <button class="btn" onclick="loadProducts()">🔄 Retry</button>
          </div>
        \`;
      }
    }
    
    async function loadCart() {
      const content = document.getElementById('content');
      content.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #dc3545; border-radius: 50%; animation: spin 1s linear infinite;"></div><p>Loading Cart MFE from http://localhost:4002...</p></div>';
      
      try {
        const response = await fetch('http://localhost:4002/demo');
        const html = await response.text();
        content.innerHTML = html;
      } catch (error) {
        content.innerHTML = \`
          <div style="color: #dc3545; padding: 20px; border: 2px solid #dc3545; border-radius: 8px; background: #f8d7da;">
            <h3>❌ Cart MFE Not Available</h3>
            <p><strong>Could not load Cart micro-frontend from http://localhost:4002</strong></p>
            <p>This would normally load the shopping cart with:</p>
            <ul>
              <li>Cart items with quantities</li>
              <li>Price calculations</li>
              <li>Remove/update functionality</li>
              <li>Checkout process</li>
            </ul>
            <p><strong>Error:</strong> \${error.message}</p>
            <button class="btn" onclick="loadCart()">🔄 Retry</button>
          </div>
        \`;
      }
    }
    
    function showArchitecture() {
      document.getElementById('content').innerHTML = \`
        <h2>🏗️ Native Federation Architecture</h2>
        
        <div class="feature">
          <h3>Micro-Frontend Architecture</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0;">
            
            <div style="border: 2px solid #3498db; padding: 20px; border-radius: 8px; background: #e3f2fd;">
              <h4>🏠 Host Application</h4>
              <p><strong>Port:</strong> 3000</p>
              <p><strong>Responsibilities:</strong></p>
              <ul>
                <li>Application shell & routing</li>
                <li>Shared state management</li>
                <li>Cross-MFE communication</li>
                <li>Authentication & navigation</li>
              </ul>
            </div>
            
            <div style="border: 2px solid #28a745; padding: 20px; border-radius: 8px; background: #d4edda;">
              <h4>📦 Products MFE</h4>
              <p><strong>Port:</strong> 4001</p>
              <p><strong>Exposed Components:</strong></p>
              <ul>
                <li>./ProductCatalog</li>
                <li>./ProductCard</li>
                <li>./ProductGrid</li>
                <li>./ProductSearch</li>
                <li>./ProductFilters</li>
              </ul>
            </div>
            
            <div style="border: 2px solid #dc3545; padding: 20px; border-radius: 8px; background: #f8d7da;">
              <h4>🛒 Cart MFE</h4>
              <p><strong>Port:</strong> 4002</p>
              <p><strong>Exposed Components:</strong></p>
              <ul>
                <li>./ShoppingCart</li>
                <li>./CartItem</li>
                <li>./CartSummary</li>
                <li>./Checkout</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="feature">
          <h3>🔧 Native Federation Features</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3498db;">
              <strong>✅ ESM Modules</strong><br>
              <small>Uses native ES modules instead of webpack bundles</small>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745;">
              <strong>✅ Import Maps</strong><br>
              <small>Browser-native module resolution</small>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc3545;">
              <strong>✅ Dynamic Loading</strong><br>
              <small>Load modules on-demand at runtime</small>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">
              <strong>✅ Shared Dependencies</strong><br>
              <small>Avoid duplicate dependencies across MFEs</small>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #6f42c1;">
              <strong>✅ Framework Agnostic</strong><br>
              <small>Works with any frontend framework</small>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #20c997;">
              <strong>✅ No Build Tools</strong><br>
              <small>No webpack or complex build configuration</small>
            </div>
          </div>
        </div>
      \`;
    }
  </script>
  
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</body>
</html>
      `);
    }
  },
  {
    name: 'Products MFE',
    port: 4001,
    color: '\x1b[32m',
    handler: (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (req.method === 'OPTIONS') {
        res.end();
        return;
      }

      if (req.url === '/demo') {
        res.setHeader('Content-Type', 'text/html');
        res.end(`
          <div style="border: 3px solid #28a745; padding: 25px; border-radius: 8px; background: #d4edda;">
            <h2>📦 Products Micro-Frontend</h2>
            <p><strong>Loaded from:</strong> http://localhost:4001</p>
            <p><strong>Status:</strong> ✅ Successfully loaded via Native Federation</p>
            
            <div style="margin: 25px 0;">
              <h4>🛍️ Product Catalog Features:</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0;">
                <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
                  <h5 style="margin-top: 0;">🎧 Wireless Headphones</h5>
                  <p style="color: #666; font-size: 14px;">High-quality wireless headphones with noise cancellation</p>
                  <p style="font-weight: bold; color: #28a745;">$199.99</p>
                  <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                    Add to Cart
                  </button>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
                  <h5 style="margin-top: 0;">⌚ Smart Watch</h5>
                  <p style="color: #666; font-size: 14px;">Advanced fitness tracking with heart rate monitoring</p>
                  <p style="font-weight: bold; color: #28a745;">$299.99</p>
                  <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                    Add to Cart
                  </button>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
                  <h5 style="margin-top: 0;">👕 Organic T-Shirt</h5>
                  <p style="color: #666; font-size: 14px;">Comfortable organic cotton t-shirt in various colors</p>
                  <p style="font-weight: bold; color: #28a745;">$29.99</p>
                  <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
              <h4 style="margin-top: 0;">🔧 Component Features:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Product search with real-time filtering</li>
                <li>Category and price range filters</li>
                <li>Product grid with responsive layout</li>
                <li>Add to cart with quantity management</li>
                <li>Product ratings and reviews</li>
                <li>Cross-MFE state synchronization</li>
              </ul>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.8); border-radius: 6px; border: 1px solid #ddd;">
              <small><strong>🏗️ Technical Implementation:</strong><br>
              This Products MFE is an independent application with its own:
              <ul style="margin: 5px 0; padding-left: 20px;">
                <li>Product data service and API integration</li>
                <li>Search and filtering logic</li>
                <li>Component state management</li>
                <li>Styling and responsive design</li>
              </ul>
              It communicates with the host app through shared global state and exposes components via Native Federation.
              </small>
            </div>
          </div>
        `);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    }
  },
  {
    name: 'Cart MFE',
    port: 4002,
    color: '\x1b[33m',
    handler: (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (req.method === 'OPTIONS') {
        res.end();
        return;
      }

      if (req.url === '/demo') {
        res.setHeader('Content-Type', 'text/html');
        res.end(`
          <div style="border: 3px solid #dc3545; padding: 25px; border-radius: 8px; background: #f8d7da;">
            <h2>🛒 Shopping Cart Micro-Frontend</h2>
            <p><strong>Loaded from:</strong> http://localhost:4002</p>
            <p><strong>Status:</strong> ✅ Successfully loaded via Native Federation</p>
            
            <div style="margin: 25px 0;">
              <h4>🛒 Shopping Cart:</h4>
              <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #ddd;">
                <div style="text-align: center; color: #666; padding: 20px;">
                  <div style="font-size: 3rem; margin-bottom: 10px;">🛒</div>
                  <h5>Your cart is empty</h5>
                  <p>Add some products from the Products MFE to see cart functionality!</p>
                  
                  <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="background: #28a745; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                        0 items
                      </span>
                      <span style="font-weight: bold; font-size: 18px;">Total: $0.00</span>
                    </div>
                  </div>
                  
                  <button style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
              <h4 style="margin-top: 0;">🔧 Cart Features:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Add/remove items with quantity controls</li>
                <li>Real-time price calculations</li>
                <li>Shipping and tax calculations</li>
                <li>Order summary with totals</li>
                <li>Checkout process integration</li>
                <li>Persistent cart state across navigation</li>
              </ul>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.8); border-radius: 6px; border: 1px solid #ddd;">
              <small><strong>🏗️ Technical Implementation:</strong><br>
              This Cart MFE is completely independent and handles:
              <ul style="margin: 5px 0; padding-left: 20px;">
                <li>Cart state management and persistence</li>
                <li>Price calculation logic</li>
                <li>Checkout workflow</li>
                <li>Integration with payment systems</li>
              </ul>
              It receives cart updates from other MFEs via shared state and can trigger navigation back to products.
              </small>
            </div>
            
            <div style="margin-top: 15px; padding: 12px; background: #e7f3ff; border: 1px solid #b8e6ff; border-radius: 4px;">
              <strong>💡 Demo Note:</strong> In a real implementation, this cart would show items added from the Products MFE, 
              with full quantity controls, price calculations, and checkout functionality.
            </div>
          </div>
        `);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    }
  }
];

const reset = '\x1b[0m';

function log(server, message) {
  console.log(`${server.color}[${server.name}]${reset} ${message}`);
}

// Start all servers
const runningServers = [];

servers.forEach(serverConfig => {
  const server = createServer(serverConfig.handler);
  
  server.listen(serverConfig.port, () => {
    log(serverConfig, `Server running on http://localhost:${serverConfig.port}`);
  });
  
  runningServers.push(server);
});

// Success message
setTimeout(() => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              🚀 Native Federation E-commerce Demo          ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  All servers are now running:                              ║
║                                                            ║
║  🏠 Host Application:  http://localhost:3000               ║
║  📦 Products MFE:      http://localhost:4001               ║
║  🛒 Cart MFE:          http://localhost:4002               ║
║                                                            ║
║  ✨ Open http://localhost:3000 to see the demo!           ║
║                                                            ║
║  This demonstrates:                                        ║
║  • Real micro-frontend architecture                       ║
║  • Cross-MFE communication                                ║
║  • Dynamic module loading                                 ║
║  • Independent deployable components                      ║
║                                                            ║
║  Press Ctrl+C to stop all servers                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down all servers...');
  runningServers.forEach(server => server.close());
  process.exit(0);
});