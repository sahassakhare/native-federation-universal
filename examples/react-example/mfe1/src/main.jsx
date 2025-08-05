import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log(' Initializing React MFE1 Application...');

const container = document.getElementById('root');
const root = createRoot(container);

try {
 root.render(<App />);
 console.log(' React MFE1 application started successfully');
 console.log(' ProductList component is available for federation at: ./ProductList');
} catch (error) {
 console.error(' Failed to start React MFE1 application:', error);

 // Show error in DOM
 container.innerHTML = `
 <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px;">
 <h3> Failed to load React MFE1</h3>
 <p>Error: ${error.message}</p>
 <details>
 <summary>Error Details</summary>
 <pre>${error.stack}</pre>
 </details>
 </div>
 `;
}