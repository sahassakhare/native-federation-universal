const http = require('http');
const { spawn } = require('child_process');

console.log('Starting Native Federation Demo Servers...');

// Kill any existing processes on these ports first
const killExisting = () => {
  return new Promise((resolve) => {
    const kill = spawn('lsof', ['-ti:5000,5001,5002'], { stdio: 'pipe' });
    let pids = '';
    
    kill.stdout.on('data', (data) => {
      pids += data.toString();
    });
    
    kill.on('close', () => {
      if (pids.trim()) {
        const pidList = pids.trim().split('\n');
        pidList.forEach(pid => {
          try {
            process.kill(parseInt(pid), 'SIGKILL');
            console.log('Killed process', pid);
          } catch (e) {
            // Process might already be dead
          }
        });
      }
      setTimeout(resolve, 1000); // Wait a bit for cleanup
    });
    
    kill.on('error', () => {
      resolve(); // lsof might not find anything
    });
  });
};

// Start servers after cleanup
killExisting().then(() => {
  
  // Host server
  const hostServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html');
    
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Native Federation Demo</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .btn { padding: 10px 20px; margin: 10px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; }
        .content { margin-top: 20px; padding: 20px; border: 1px solid #ccc; min-height: 200px; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>🛒 Native Federation E-commerce Demo</h1>
    <p>Host Application running on port 5000</p>
    
    <button class="btn" onclick="loadMFE(5001, 'Products')">Load Products MFE</button>
    <button class="btn" onclick="loadMFE(5002, 'Cart')">Load Cart MFE</button>
    
    <div id="content" class="content">
        <h3>Welcome to Native Federation Demo</h3>
        <p>Click the buttons above to load micro-frontends dynamically.</p>
    </div>
    
    <script>
        async function loadMFE(port, name) {
            const content = document.getElementById('content');
            try {
                content.innerHTML = '<p>Loading ' + name + ' MFE from port ' + port + '...</p>';
                const response = await fetch('http://localhost:' + port + '/component');
                const html = await response.text();
                content.innerHTML = '<div class="success"><h3>✅ ' + name + ' MFE Loaded Successfully!</h3>' + html + '</div>';
            } catch (error) {
                content.innerHTML = '<div class="error"><h3>❌ Failed to load ' + name + ' MFE</h3><p>Error: ' + error.message + '</p><p>Make sure server is running on port ' + port + '</p></div>';
            }
        }
    </script>
</body>
</html>
    `);
  });

  // Products server
  const productsServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/component') {
      res.setHeader('Content-Type', 'text/html');
      res.end(`
        <div style="border: 3px solid #28a745; padding: 20px; border-radius: 8px; background: #d4edda;">
          <h2>📦 Products Micro-Frontend</h2>
          <p><strong>Served from:</strong> http://localhost:5001</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin: 20px 0;">
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
              <h4>🎧 Headphones</h4>
              <p style="color: #666;">$199.99</p>
              <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%;">Add to Cart</button>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
              <h4>⌚ Smart Watch</h4>
              <p style="color: #666;">$299.99</p>
              <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%;">Add to Cart</button>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
              <h4>📱 Phone</h4>
              <p style="color: #666;">$699.99</p>
              <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%;">Add to Cart</button>
            </div>
          </div>
          
          <p style="background: white; padding: 10px; border-radius: 4px; margin-top: 15px;">
            <strong>Native Federation:</strong> This component is served from an independent micro-frontend application.
          </p>
        </div>
      `);
    } else {
      res.end('Products MFE running');
    }
  });

  // Cart server
  const cartServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/component') {
      res.setHeader('Content-Type', 'text/html');
      res.end(`
        <div style="border: 3px solid #dc3545; padding: 20px; border-radius: 8px; background: #f8d7da;">
          <h2>🛒 Shopping Cart Micro-Frontend</h2>
          <p><strong>Served from:</strong> http://localhost:5002</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>Your Shopping Cart</h3>
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <div style="display: flex; justify-content: space-between;">
                <span>🎧 Wireless Headphones</span>
                <span>$199.99</span>
              </div>
            </div>
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <div style="display: flex; justify-content: space-between;">
                <span>⌚ Smart Watch</span>
                <span>$299.99</span>
              </div>
            </div>
            <div style="padding: 15px 0; font-weight: bold; font-size: 18px; border-top: 2px solid #ddd;">
              <div style="display: flex; justify-content: space-between;">
                <span>Total:</span>
                <span>$499.98</span>
              </div>
            </div>
            <button style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 4px; width: 100%; font-size: 16px;">
              Proceed to Checkout
            </button>
          </div>
          
          <p style="background: white; padding: 10px; border-radius: 4px;">
            <strong>Native Federation:</strong> This cart is served from an independent micro-frontend application.
          </p>
        </div>
      `);
    } else {
      res.end('Cart MFE running');
    }
  });

  // Start all servers
  hostServer.listen(5000, () => {
    console.log('✅ Host Application running at http://localhost:5000');
  });

  productsServer.listen(5001, () => {
    console.log('✅ Products MFE running at http://localhost:5001');
  });

  cartServer.listen(5002, () => {
    console.log('✅ Cart MFE running at http://localhost:5002');
  });

  console.log('\n🚀 All servers started successfully!');
  console.log('📱 Open http://localhost:5000 to see the demo');
  console.log('\nPress Ctrl+C to stop all servers\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    process.exit(0);
  });
});