const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Mock SSR rendering function
function renderSSRContent(route) {
  const timestamp = new Date().toISOString();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Native Federation SSR Demo</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
    }
    h1 { margin: 0 0 10px 0; }
    .section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .status-item {
      padding: 15px;
      background: white;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .remote-module {
      padding: 20px;
      margin: 10px 0;
      background: #e3f2fd;
      border: 2px dashed #2196f3;
      border-radius: 4px;
    }
    .success { color: #4caf50; }
    .loading { color: #ff9800; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Native Federation SSR Demo</h1>
      <p>Server-Side Rendering with Module Federation</p>
    </header>

    <div class="section">
      <h2>Server-Rendered Content</h2>
      <p>This content was rendered on the server at: <strong>${timestamp}</strong></p>
      <p>Request path: <strong>${route}</strong></p>
    </div>

    <div class="section">
      <h2>Federated Modules (SSR)</h2>
      
      <div class="remote-module">
        <h3>📦 Products Module</h3>
        <p>This would be loaded from <code>products/ProductList</code></p>
        <div id="products-content">
          <!-- Server-rendered product list -->
          <ul>
            <li>Product 1 - Server Rendered</li>
            <li>Product 2 - Server Rendered</li>
            <li>Product 3 - Server Rendered</li>
          </ul>
        </div>
      </div>

      <div class="remote-module">
        <h3>👤 User Profile Module</h3>
        <p>This would be loaded from <code>users/UserProfile</code></p>
        <div id="user-content">
          <!-- Server-rendered user profile -->
          <div>
            <p><strong>User:</strong> John Doe</p>
            <p><strong>Email:</strong> john@example.com</p>
            <p><strong>Status:</strong> Active (SSR)</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Hydration Status</h2>
      <div class="status-grid">
        <div class="status-item">
          <strong>SSR Status:</strong>
          <span class="success">✅ Server Rendered</span>
        </div>
        <div class="status-item">
          <strong>Federation Manifest:</strong>
          <span class="success">✅ Loaded</span>
        </div>
        <div class="status-item">
          <strong>Hydration:</strong>
          <span class="loading">⏳ Ready for Client</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Native Federation Features</h2>
      <ul>
        <li>✅ ESM Modules with Import Maps</li>
        <li>✅ Server-Side Module Loading</li>
        <li>✅ Automatic Hydration Support</li>
        <li>✅ Zero Bundle Size Overhead</li>
        <li>✅ Framework Agnostic</li>
      </ul>
    </div>
  </div>

  <!-- Hydration script -->
  <script type="module">
    // Simulate hydration
    console.log('[Native Federation] Starting hydration...');
    
    // In real implementation, this would:
    // 1. Load federation manifest
    // 2. Initialize hydration client
    // 3. Connect to server-rendered components
    
    window.__NF_HYDRATION__ = {
      modules: {
        'products/ProductList': { rendered: true, hydrated: false },
        'users/UserProfile': { rendered: true, hydrated: false }
      },
      timestamp: '${timestamp}'
    };

    // Simulate hydration completion
    setTimeout(() => {
      console.log('[Native Federation] Hydration complete!');
      document.querySelectorAll('.loading').forEach(el => {
        el.textContent = '✅ Hydrated';
        el.className = 'success';
      });
    }, 1000);
  </script>
</body>
</html>
  `;
}

// Routes
app.get('/', (req, res) => {
  res.send(renderSSRContent(req.path));
});

app.get('/products', (req, res) => {
  res.send(renderSSRContent(req.path));
});

app.get('/profile', (req, res) => {
  res.send(renderSSRContent(req.path));
});

// Mock federation manifest endpoint
app.get('/federation.manifest.json', (req, res) => {
  res.json({
    name: 'host',
    remotes: {
      products: {
        entry: 'http://localhost:4001/remoteEntry.js',
        modules: ['./ProductList']
      },
      users: {
        entry: 'http://localhost:4002/remoteEntry.js', 
        modules: ['./UserProfile']
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          Native Federation SSR Server Running              ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🚀 Server: http://localhost:${PORT}                           ║
║  📄 Routes:                                                ║
║     - / (Home)                                             ║
║     - /products (Products Page)                            ║
║     - /profile (User Profile)                              ║
║     - /federation.manifest.json (Federation Config)        ║
║                                                            ║
║  ✨ Features:                                              ║
║     - Server-Side Rendering                                ║
║     - Module Federation Support                            ║
║     - Hydration Ready                                      ║
║     - ESM + Import Maps                                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});