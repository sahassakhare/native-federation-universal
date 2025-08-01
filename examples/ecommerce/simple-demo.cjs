const http = require('http');

console.log('\n==================================================');
console.log('    Native Federation E-commerce Demo');
console.log('==================================================\n');

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
    button { padding: 10px 20px; margin: 10px; cursor: pointer; }
    .success { color: green; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Native Federation E-commerce Demo</h1>
  <p>Host Application (Port 3000)</p>
  
  <button onclick="loadMFE(4001)">Load Products MFE</button>
  <button onclick="loadMFE(4002)">Load Cart MFE</button>
  
  <div id="content" style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;"></div>
  
  <script>
    async function loadMFE(port) {
      const content = document.getElementById('content');
      try {
        content.innerHTML = 'Loading MFE from port ' + port + '...';
        const response = await fetch('http://localhost:' + port + '/api/data');
        const data = await response.json();
        content.innerHTML = '<div class="success"><h3>' + data.name + '</h3><p>Data: ' + JSON.stringify(data) + '</p></div>';
      } catch (error) {
        content.innerHTML = '<div class="error">Failed to load MFE from port ' + port + '</div>';
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
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/data') {
    res.end(JSON.stringify({
      name: 'Products MFE',
      port: 4001,
      products: [
        { id: 1, name: 'Laptop', price: 999 },
        { id: 2, name: 'Phone', price: 699 }
      ]
    }));
  } else {
    res.end('{}');
  }
});

// Cart server
const cartServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/data') {
    res.end(JSON.stringify({
      name: 'Cart MFE',
      port: 4002,
      items: 2,
      total: 1698
    }));
  } else {
    res.end('{}');
  }
});

// Start all servers
hostServer.listen(3000, () => {
  console.log('Host running at http://localhost:3000');
});

productsServer.listen(4001, () => {
  console.log('Products MFE running at http://localhost:4001');
});

cartServer.listen(4002, () => {
  console.log('Cart MFE running at http://localhost:4002');
});

console.log('\nAll servers starting...\n');

// Keep process running
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  process.exit();
});