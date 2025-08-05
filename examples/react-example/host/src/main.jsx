import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log(' Initializing React Native Federation Host...');

const container = document.getElementById('root');
const root = createRoot(container);

try {
 root.render(<App />);
 console.log(' React Host application started successfully');
} catch (error) {
 console.error(' Failed to start React Host application:', error);

 // Show error in DOM
 container.innerHTML = `
 <div style="color: red; padding: 20px; margin: 20px; border: 1px solid red; border-radius: 4px;">
 <h3> Failed to load React Host</h3>
 <p>Error: ${error.message}</p>
 <details>
 <summary>Error Details</summary>
 <pre>${error.stack}</pre>
 </details>
 </div>
 `;
}