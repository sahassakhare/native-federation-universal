// Host application main entry point
import { loadRemoteModule } from '@native-federation/core/runtime';

console.log('[Host] Application starting...');

// Create app container
const app = document.getElementById('app');

// Navigation
const nav = document.createElement('nav');
nav.innerHTML = `
  <button id="load-home">Home</button>
  <button id="load-mfe1">Load MFE1</button>
  <button id="load-dynamic">Load Dynamic Component</button>
`;
app.appendChild(nav);

// Content area
const content = document.createElement('div');
content.id = 'content';
content.innerHTML = '<h2>Welcome to Native Federation Host</h2><p>Click buttons above to load remote modules.</p>';
app.appendChild(content);

// Home content
document.getElementById('load-home').addEventListener('click', () => {
  content.innerHTML = `
    <h2>Host Application</h2>
    <p>This is the host application using Native Federation.</p>
    <ul>
      <li>✅ ESM Modules</li>
      <li>✅ Import Maps</li>
      <li>✅ Dynamic Loading</li>
      <li>✅ No Webpack Required</li>
    </ul>
  `;
});

// Load MFE1
document.getElementById('load-mfe1').addEventListener('click', async () => {
  try {
    content.innerHTML = '<p>Loading MFE1...</p>';
    
    // Load remote module
    const module = await loadRemoteModule({
      remoteName: 'mfe1',
      modulePath: './App'
    });
    
    // Use the module
    if (module.render) {
      content.innerHTML = module.render();
    } else if (module.default) {
      content.innerHTML = `<p>Loaded module: ${module.default}</p>`;
    }
    
    console.log('[Host] MFE1 loaded successfully:', module);
  } catch (error) {
    console.error('[Host] Failed to load MFE1:', error);
    content.innerHTML = `<p style="color: red;">Error loading MFE1: ${error.message}</p>`;
  }
});

// Load dynamic component
document.getElementById('load-dynamic').addEventListener('click', async () => {
  try {
    content.innerHTML = '<p>Loading dynamic component...</p>';
    
    // Load specific component from MFE1
    const { DynamicComponent } = await loadRemoteModule({
      remoteName: 'mfe1',
      modulePath: './components/DynamicComponent'
    });
    
    // Create and mount component
    const component = new DynamicComponent();
    content.innerHTML = '';
    content.appendChild(component.element);
    
    console.log('[Host] Dynamic component loaded');
  } catch (error) {
    console.error('[Host] Failed to load dynamic component:', error);
    content.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
});

// Initialize federation
async function init() {
  try {
    console.log('[Host] Initializing Native Federation...');
    
    // The runtime will automatically load the import map and federation manifest
    const federationRuntime = window.__NATIVE_FEDERATION__;
    if (federationRuntime) {
      console.log('[Host] Federation runtime available:', federationRuntime);
    }
  } catch (error) {
    console.error('[Host] Initialization error:', error);
  }
}

init();