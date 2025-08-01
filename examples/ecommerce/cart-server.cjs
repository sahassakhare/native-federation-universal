const http = require('http');

const PORT = 4002;

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
      <div style="border: 3px solid #dc3545; padding: 20px; border-radius: 8px; background: #f8d7da;">
        <h2>🛒 Shopping Cart Micro-Frontend</h2>
        <p><strong>Served from:</strong> http://localhost:4002</p>
        
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3>Your Cart (2 items)</h3>
          
          <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="margin: 0;">🎧 Wireless Headphones</h4>
                <p style="color: #666; margin: 5px 0;">Quantity: 1</p>
              </div>
              <div style="text-align: right;">
                <p style="font-weight: bold; margin: 0;">$199.99</p>
                <button style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
              </div>
            </div>
          </div>
          
          <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="margin: 0;">⌚ Smart Watch</h4>
                <p style="color: #666; margin: 5px 0;">Quantity: 1</p>
              </div>
              <div style="text-align: right;">
                <p style="font-weight: bold; margin: 0;">$299.99</p>
                <button style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Remove</button>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>$499.98</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Tax:</span>
              <span>$40.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 1px solid #ddd; padding-top: 10px;">
              <span>Total:</span>
              <span>$539.98</span>
            </div>
          </div>
          
          <button style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 4px; width: 100%; margin-top: 15px; cursor: pointer; font-size: 16px;">
            Proceed to Checkout
          </button>
        </div>
        
        <p style="background: white; padding: 10px; border-radius: 4px; font-size: 14px;">
          <strong>Native Federation:</strong> This cart component is served from an independent micro-frontend.
        </p>
      </div>
    `);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('🛒 Cart MFE running at http://localhost:' + PORT);
});