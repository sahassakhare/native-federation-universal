const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html');
  
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>FederatedMart - Native Federation Demo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .nav { display: flex; gap: 20px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
    .nav button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .nav button:hover { background: #0056b3; }
    .content { min-height: 400px; }
    .error { color: #dc3545; padding: 20px; border: 2px solid #dc3545; border-radius: 8px; background: #f8d7da; }
    .success { color: #155724; padding: 20px; border: 2px solid #28a745; border-radius: 8px; background: #d4edda; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛒 FederatedMart - Native Federation Demo</h1>
    
    <div class="nav">
      <button onclick="loadProducts()">Load Products MFE</button>
      <button onclick="loadCart()">Load Cart MFE</button>
    </div>
    
    <div class="content" id="content">
      <h2>Welcome to Native Federation E-commerce Demo</h2>
      <p>Click the buttons above to load micro-frontends dynamically.</p>
      
      <div style="margin: 20px 0; padding: 20px; background: #e8f4f8; border-radius: 8px;">
        <h3>🏗️ Architecture:</h3>
        <ul>
          <li><strong>Host (Port 3000):</strong> This application</li>
          <li><strong>Products MFE (Port 4001):</strong> Product catalog</li>
          <li><strong>Cart MFE (Port 4002):</strong> Shopping cart</li>
        </ul>
      </div>
    </div>
  </div>
  
  <script>
    async function loadProducts() {
      const content = document.getElementById('content');
      try {
        content.innerHTML = '<p>Loading Products MFE...</p>';
        const response = await fetch('http://localhost:4001/api/component');
        const data = await response.text();
        content.innerHTML = '<div class="success"><h3>✅ Products MFE Loaded!</h3>' + data + '</div>';
      } catch (error) {
        content.innerHTML = '<div class="error"><h3>❌ Failed to load Products MFE</h3><p>Make sure the Products server is running on port 4001</p><p>Error: ' + error.message + '</p></div>';
      }
    }
    
    async function loadCart() {
      const content = document.getElementById('content');
      try {
        content.innerHTML = '<p>Loading Cart MFE...</p>';
        const response = await fetch('http://localhost:4002/api/component');
        const data = await response.text();
        content.innerHTML = '<div class="success"><h3>✅ Cart MFE Loaded!</h3>' + data + '</div>';
      } catch (error) {
        content.innerHTML = '<div class="error"><h3>❌ Failed to load Cart MFE</h3><p>Make sure the Cart server is running on port 4002</p><p>Error: ' + error.message + '</p></div>';
      }
    }
  </script>
</body>
</html>
  `);
});

server.listen(PORT, () => {
  console.log('🏠 Host Application running at http://localhost:' + PORT);
});