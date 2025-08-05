import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log(' Initializing Mixed React MFE Application...');

const container = document.getElementById('root');
const root = createRoot(container);

try {
 root.render(<App />);
 console.log(' React MFE application started successfully');
 console.log(' ShoppingCart component is available for federation at: ./ShoppingCart');
 console.log(' This component can be loaded in Angular, Vue, or other frameworks!');
} catch (error) {
 console.error(' Failed to start React MFE application:', error);

 // Show error in DOM
 container.innerHTML = `
 <div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px;">
 <h3> Failed to load React MFE</h3>
 <p>Error: ${error.message}</p>
 <details>
 <summary>Error Details</summary>
 <pre>${error.stack}</pre>
 </details>
 </div>
 `;
}