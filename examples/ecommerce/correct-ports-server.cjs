const http = require('http');

console.log('Starting Native Federation Demo on CORRECT ports...');

// Host server on port 3000
const hostServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html');
  
  res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Native Federation Demo - Correct Ports</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .btn { padding: 12px 24px; margin: 10px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; }
        .btn:hover { background: #0056b3; }
        .content { margin-top: 20px; padding: 20px; border: 1px solid #ddd; min-height: 200px; border-radius: 8px; }
        .success { border-color: #28a745; background: #d4edda; }
        .error { border-color: #dc3545; background: #f8d7da; color: #721c24; }
        .loading { text-align: center; padding: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛒 Native Federation E-commerce Demo</h1>
        <p><strong>Host Application</strong> - Port 3000</p>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>🏗️ Micro-Frontend Architecture:</h3>
            <ul>
                <li><strong>Host (Port 3000):</strong> This application - orchestrates MFEs</li>
                <li><strong>Products MFE (Port 4001):</strong> Independent product catalog</li>
                <li><strong>Cart MFE (Port 4002):</strong> Independent shopping cart</li>
            </ul>
        </div>
        
        <button class="btn" onclick="loadMFE(4001, 'Products')">📦 Load Products MFE (Port 4001)</button>
        <button class="btn" onclick="loadMFE(4002, 'Cart')">🛒 Load Cart MFE (Port 4002)</button>
        
        <div id="content" class="content">
            <h3>Welcome to Native Federation Demo</h3>
            <p>This demonstrates real micro-frontend architecture where components are loaded dynamically from independent applications.</p>
            <p><strong>Click the buttons above to load micro-frontends from ports 4001 and 4002.</strong></p>
        </div>
    </div>
    
    <script>
        async function loadMFE(port, name) {
            const content = document.getElementById('content');
            try {
                content.innerHTML = '<div class="loading">🔄 Loading ' + name + ' MFE from port ' + port + '...</div>';
                
                const response = await fetch('http://localhost:' + port + '/api/component');
                const html = await response.text();
                
                content.className = 'content success';
                content.innerHTML = '<h3>✅ ' + name + ' MFE Loaded Successfully!</h3><p><strong>Source:</strong> http://localhost:' + port + '</p>' + html;
                
            } catch (error) {
                content.className = 'content error';
                content.innerHTML = '<h3>❌ Failed to load ' + name + ' MFE</h3><p><strong>Port:</strong> ' + port + '</p><p><strong>Error:</strong> ' + error.message + '</p><p>Make sure the ' + name + ' server is running on port ' + port + '</p><button class="btn" onclick="loadMFE(' + port + ', \\''+name+'\\')">🔄 Retry</button>';
            }
        }
    </script>
</body>
</html>
  `);
});

// Products server on port 4001
const productsServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  
  if (req.url === '/api/component') {
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <div style="border: 3px solid #28a745; padding: 25px; border-radius: 8px; background: #d4edda; margin: 15px 0;">
        <h2>📦 Products Micro-Frontend</h2>
        <p><strong>Loaded from:</strong> http://localhost:4001 (Independent Application)</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
          <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <h4>🎧 Wireless Headphones</h4>
            <p style="color: #666; margin: 8px 0;">Premium noise cancellation</p>
            <p style="font-weight: bold; color: #28a745; font-size: 18px;">$199.99</p>
            <button style="background: #007bff; color: white; border: none; padding: 10px 16px; border-radius: 4px; width: 100%; cursor: pointer;" onclick="addToCart('Headphones', 199.99)">Add to Cart</button>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <h4>⌚ Smart Watch</h4>
            <p style="color: #666; margin: 8px 0;">Fitness tracking & health monitoring</p>
            <p style="font-weight: bold; color: #28a745; font-size: 18px;">$299.99</p>
            <button style="background: #007bff; color: white; border: none; padding: 10px 16px; border-radius: 4px; width: 100%; cursor: pointer;" onclick="addToCart('Smart Watch', 299.99)">Add to Cart</button>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <h4>📱 Smartphone</h4>
            <p style="color: #666; margin: 8px 0;">Latest 5G technology</p>
            <p style="font-weight: bold; color: #28a745; font-size: 18px;">$699.99</p>
            <button style="background: #007bff; color: white; border: none; padding: 10px 16px; border-radius: 4px; width: 100%; cursor: pointer;" onclick="addToCart('Smartphone', 699.99)">Add to Cart</button>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <h4>💻 Laptop</h4>
            <p style="color: #666; margin: 8px 0;">High-performance computing</p>
            <p style="font-weight: bold; color: #28a745; font-size: 18px;">$1299.99</p>
            <button style="background: #007bff; color: white; border: none; padding: 10px 16px; border-radius: 4px; width: 100%; cursor: pointer;" onclick="addToCart('Laptop', 1299.99)">Add to Cart</button>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 6px; margin-top: 20px;">
          <strong>🔧 Native Federation Features:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Independent deployment from other micro-frontends</li>
            <li>Dynamic loading at runtime (no build-time coupling)</li>
            <li>Shared state management across applications</li>
            <li>Cross-origin resource loading with CORS</li>
          </ul>
        </div>
        
        <script>
          function addToCart(product, price) {
            alert('Added ' + product + ' ($' + price + ') to cart!\\n\\nThis would normally sync with the Cart MFE via shared state.');
          }
        </script>
      </div>
    `);
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Products MFE running on port 4001');
  }
});

// Cart server on port 4002
const cartServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  
  if (req.url === '/api/component') {
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <div style="border: 3px solid #dc3545; padding: 25px; border-radius: 8px; background: #f8d7da; margin: 15px 0;">
        <h2>🛒 Shopping Cart Micro-Frontend</h2>
        <p><strong>Loaded from:</strong> http://localhost:4002 (Independent Application)</p>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3>Your Shopping Cart (3 items)</h3>
          
          <div style="border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0; color: #333;">🎧 Wireless Headphones</h4>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Quantity: 1</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; margin: 0; font-size: 18px;">$199.99</p>
              <button style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 5px;">Remove</button>
            </div>
          </div>
          
          <div style="border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0; color: #333;">⌚ Smart Watch</h4>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Quantity: 1</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; margin: 0; font-size: 18px;">$299.99</p>
              <button style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 5px;">Remove</button>
            </div>
          </div>
          
          <div style="border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0; color: #333;">📱 Smartphone</h4>
              <p style="color: #666; margin: 5px 0; font-size: 14px;">Quantity: 2</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; margin: 0; font-size: 18px;">$1,399.98</p>
              <button style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 5px;">Remove</button>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px;">
              <span>Subtotal:</span>
              <span>$1,899.96</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px;">
              <span>Tax (8%):</span>
              <span>$152.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px;">
              <span>Shipping:</span>
              <span style="color: #28a745;">FREE</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 20px; border-top: 2px solid #ddd; padding-top: 15px;">
              <span>Total:</span>
              <span style="color: #dc3545;">$2,051.96</span>
            </div>
          </div>
          
          <button style="background: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 6px; width: 100%; margin-top: 20px; cursor: pointer; font-size: 18px; font-weight: bold;" onclick="checkout()">
            Proceed to Checkout 💳
          </button>
        </div>
        
        <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 6px; margin-top: 20px;">
          <strong>🔧 Native Federation Features:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Independent cart state management</li>
            <li>Real-time price calculations and updates</li>
            <li>Integration with payment processing systems</li>
            <li>Seamless communication with Products MFE</li>
          </ul>
        </div>
        
        <script>
          function checkout() {
            alert('Proceeding to checkout!\\n\\nTotal: $2,051.96\\n\\nThis would redirect to payment processing...');
          }
        </script>
      </div>
    `);
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Cart MFE running on port 4002');
  }
});

// Start all servers
hostServer.listen(3000, () => {
  console.log('✅ Host Application running at http://localhost:3000');
});

productsServer.listen(4001, () => {
  console.log('✅ Products MFE running at http://localhost:4001');
});

cartServer.listen(4002, () => {
  console.log('✅ Cart MFE running at http://localhost:4002');
});

console.log('');
console.log('🚀 Native Federation Demo - All servers started!');
console.log('');
console.log('📱 Open http://localhost:3000 to see the demo');
console.log('📦 Products MFE available at http://localhost:4001');
console.log('🛒 Cart MFE available at http://localhost:4002');
console.log('');
console.log('Press Ctrl+C to stop all servers');
console.log('');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down all servers...');
  process.exit(0);
});