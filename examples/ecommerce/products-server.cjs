const http = require('http');

const PORT = 4001;

const server = http.createServer((req, res) => {
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
      <div style="border: 3px solid #28a745; padding: 20px; border-radius: 8px; background: #d4edda;">
        <h2>📦 Products Micro-Frontend</h2>
        <p><strong>Served from:</strong> http://localhost:4001</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
          <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4>🎧 Wireless Headphones</h4>
            <p style="color: #666;">Premium sound quality</p>
            <p style="font-weight: bold; color: #28a745;">$199.99</p>
            <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%; cursor: pointer;">Add to Cart</button>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4>⌚ Smart Watch</h4>
            <p style="color: #666;">Fitness tracking</p>
            <p style="font-weight: bold; color: #28a745;">$299.99</p>
            <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%; cursor: pointer;">Add to Cart</button>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4>📱 Phone Case</h4>
            <p style="color: #666;">Durable protection</p>
            <p style="font-weight: bold; color: #28a745;">$29.99</p>
            <button style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; width: 100%; cursor: pointer;">Add to Cart</button>
          </div>
        </div>
        
        <p style="background: white; padding: 10px; border-radius: 4px; font-size: 14px;">
          <strong>Native Federation:</strong> This component is dynamically loaded from an independent micro-frontend application.
        </p>
      </div>
    `);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('📦 Products MFE running at http://localhost:' + PORT);
});