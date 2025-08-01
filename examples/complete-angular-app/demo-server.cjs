const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4200;

// Simulate the host app
function renderHostApp() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Native Federation - Complete Angular App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: #f0f2f5;
    }
    .navbar {
      background: #1976d2;
      color: white;
      padding: 15px 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .navbar h1 {
      margin: 0;
      font-size: 24px;
    }
    .container {
      max-width: 1200px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .mfe-container {
      border: 2px dashed #1976d2;
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      margin: 10px 0;
    }
    .status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 10px;
    }
    .status.loaded { background: #4caf50; color: white; }
    .status.loading { background: #ff9800; color: white; }
    .status.error { background: #f44336; color: white; }
    button {
      background: #1976d2;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background: #1565c0;
    }
    .router-outlet {
      margin-top: 20px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      min-height: 200px;
    }
    .nav-links {
      display: flex;
      gap: 20px;
      margin-top: 10px;
    }
    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .nav-links a:hover {
      background: rgba(255,255,255,0.1);
    }
    .nav-links a.active {
      background: rgba(255,255,255,0.2);
    }
  </style>
</head>
<body>
  <div class="navbar">
    <h1>Native Federation - Complete Angular App</h1>
    <div class="nav-links">
      <a href="#/" class="active">Home</a>
      <a href="#/products">Products (MFE1)</a>
      <a href="#/users">Users (MFE2)</a>
      <a href="#/shared">Shared Components</a>
    </div>
  </div>

  <div class="container">
    <div class="card">
      <h2>Host Application</h2>
      <p>This is the main Angular host application that loads remote micro-frontends dynamically.</p>
      <p><strong>Configuration:</strong> <code>host/federation.config.ts</code></p>
    </div>

    <div class="grid">
      <div class="card">
        <h3>MFE1 - Product Catalog <span class="status loading" id="mfe1-status">Loading</span></h3>
        <div class="mfe-container">
          <p>Remote URL: <code>http://localhost:4201</code></p>
          <p>Exposed Modules:</p>
          <ul>
            <li>./ProductList</li>
            <li>./ProductDetail</li>
            <li>./DynamicComponent</li>
          </ul>
          <button onclick="loadMFE1()">Load Product Module</button>
        </div>
      </div>

      <div class="card">
        <h3>MFE2 - User Management <span class="status loading" id="mfe2-status">Loading</span></h3>
        <div class="mfe-container">
          <p>Remote URL: <code>http://localhost:4202</code></p>
          <p>Exposed Modules:</p>
          <ul>
            <li>./UserList</li>
            <li>./UserProfile</li>
            <li>./UserSettings</li>
          </ul>
          <button onclick="loadMFE2()">Load User Module</button>
        </div>
      </div>

      <div class="card">
        <h3>Shared Components <span class="status loading" id="shared-status">Loading</span></h3>
        <div class="mfe-container">
          <p>Remote URL: <code>http://localhost:4203</code></p>
          <p>Shared Libraries:</p>
          <ul>
            <li>@angular/core</li>
            <li>@angular/common</li>
            <li>@angular/router</li>
            <li>rxjs</li>
          </ul>
          <button onclick="loadShared()">Load Shared Libs</button>
        </div>
      </div>
    </div>

    <div class="router-outlet">
      <h2>Router Outlet</h2>
      <div id="route-content">
        <p>Click on the navigation links above to load different micro-frontends.</p>
        <p>The content will be dynamically loaded here using Native Federation.</p>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h3>Federation Manifest</h3>
      <pre id="manifest-content" style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">
Loading federation manifest...
      </pre>
    </div>
  </div>

  <script type="module">
    // Simulate Native Federation runtime
    window.NativeFederation = {
      loadRemoteModule: async (remoteName, modulePath) => {
        console.log(\`Loading remote module: \${remoteName}\${modulePath}\`);
        // Simulate async loading
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ 
              Component: \`\${remoteName}Component\`,
              loaded: true 
            });
          }, 1000);
        });
      }
    };

    // Load federation manifest
    fetch('/federation.manifest.json')
      .then(res => res.json())
      .then(manifest => {
        document.getElementById('manifest-content').textContent = JSON.stringify(manifest, null, 2);
      })
      .catch(err => {
        document.getElementById('manifest-content').textContent = 'Error loading manifest: ' + err.message;
      });

    // Simulate MFE loading
    window.loadMFE1 = async () => {
      const status = document.getElementById('mfe1-status');
      status.textContent = 'Loading';
      status.className = 'status loading';
      
      try {
        await window.NativeFederation.loadRemoteModule('mfe1', './ProductList');
        status.textContent = 'Loaded';
        status.className = 'status loaded';
        
        document.getElementById('route-content').innerHTML = \`
          <h3>Product List Component (MFE1)</h3>
          <p>Successfully loaded from remote!</p>
          <ul>
            <li>Product 1 - Angular Widget</li>
            <li>Product 2 - React Component</li>
            <li>Product 3 - Vue Module</li>
          </ul>
        \`;
      } catch (err) {
        status.textContent = 'Error';
        status.className = 'status error';
      }
    };

    window.loadMFE2 = async () => {
      const status = document.getElementById('mfe2-status');
      status.textContent = 'Loading';
      status.className = 'status loading';
      
      try {
        await window.NativeFederation.loadRemoteModule('mfe2', './UserList');
        status.textContent = 'Loaded';
        status.className = 'status loaded';
        
        document.getElementById('route-content').innerHTML = \`
          <h3>User List Component (MFE2)</h3>
          <p>Successfully loaded from remote!</p>
          <ul>
            <li>John Doe - Admin</li>
            <li>Jane Smith - User</li>
            <li>Bob Johnson - Guest</li>
          </ul>
        \`;
      } catch (err) {
        status.textContent = 'Error';
        status.className = 'status error';
      }
    };

    window.loadShared = async () => {
      const status = document.getElementById('shared-status');
      status.textContent = 'Loading';
      status.className = 'status loading';
      
      setTimeout(() => {
        status.textContent = 'Loaded';
        status.className = 'status loaded';
      }, 500);
    };

    // Simple router
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === hash);
      });
      
      const routeContent = document.getElementById('route-content');
      switch(hash) {
        case '#/products':
          loadMFE1();
          break;
        case '#/users':
          loadMFE2();
          break;
        case '#/shared':
          routeContent.innerHTML = '<h3>Shared Components</h3><p>This would display shared component library.</p>';
          break;
        default:
          routeContent.innerHTML = '<p>Click on the navigation links above to load different micro-frontends.</p>';
      }
    });

    // Check initial status
    setTimeout(() => {
      document.querySelectorAll('.status').forEach(el => {
        if (el.textContent === 'Loading') {
          el.textContent = 'Ready';
          el.className = 'status loaded';
        }
      });
    }, 2000);
  </script>
</body>
</html>
  `;
}

// Mock federation manifest
const federationManifest = {
  name: 'host',
  remotes: {
    mfe1: {
      entry: 'http://localhost:4201/remoteEntry.js',
      modules: ['./ProductList', './ProductDetail', './DynamicComponent']
    },
    mfe2: {
      entry: 'http://localhost:4202/remoteEntry.js',
      modules: ['./UserList', './UserProfile', './UserSettings']
    },
    'shared-components': {
      entry: 'http://localhost:4203/remoteEntry.js',
      modules: ['./Button', './Card', './Modal']
    }
  },
  shared: {
    '@angular/core': { singleton: true, version: '17.0.0' },
    '@angular/common': { singleton: true, version: '17.0.0' },
    '@angular/router': { singleton: true, version: '17.0.0' },
    'rxjs': { singleton: true, version: '7.8.0' }
  }
};

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/federation.manifest.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(federationManifest, null, 2));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderHostApp());
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       Native Federation - Complete Angular App Demo        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  🚀 Host App: http://localhost:${PORT}                         ║
║                                                            ║
║  📦 Micro-Frontends:                                       ║
║     - MFE1 (Products): http://localhost:4201               ║
║     - MFE2 (Users): http://localhost:4202                  ║
║     - Shared Components: http://localhost:4203             ║
║                                                            ║
║  📄 Federation Manifest:                                   ║
║     http://localhost:${PORT}/federation.manifest.json          ║
║                                                            ║
║  ✨ Features Demonstrated:                                 ║
║     - Dynamic module loading                               ║
║     - Shared dependencies                                  ║
║     - Multiple remotes                                     ║
║     - Routing integration                                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});