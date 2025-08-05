import React, { useState, useRef, useEffect } from 'react';

const FederationLoader = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [errorDetails, setErrorDetails] = useState(null);
 const [remoteLoaded, setRemoteLoaded] = useState(false);
 const remoteContainerRef = useRef(null);
 const remoteComponentRef = useRef(null);

 useEffect(() => {
 console.log(' Federation Loader initialized');
 }, []);

 const loadRemoteComponent = async () => {
 if (loading) return;

 setLoading(true);
 setError(null);
 setErrorDetails(null);
 setRemoteLoaded(false);

 try {
 console.log(' Loading remote component from MFE1...');

 // Clear any existing remote component
 if (remoteComponentRef.current) {
 // In a real implementation, you'd properly unmount the React component
 remoteContainerRef.current.innerHTML = '';
 remoteComponentRef.current = null;
 }

 // Load the remote entry
 const remoteEntryUrl = 'http://localhost:3001/remoteEntry.js';
 console.log(' Loading remote entry:', remoteEntryUrl);

 const remoteEntry = await import(remoteEntryUrl);
 console.log(' Remote entry loaded successfully');

 // Initialize the remote
 if (typeof remoteEntry.init === 'function') {
 await remoteEntry.init();
 console.log(' Remote initialized');
 }

 // Get the remote component
 if (typeof remoteEntry.get === 'function') {
 const remoteModule = await remoteEntry.get('./ProductList');
 console.log(' Remote module loaded:', remoteModule);

 if (remoteModule && remoteModule.default) {
 // This is a simplified approach - in a real scenario you'd use proper React dynamic loading
 const componentHtml = `
 <div class="remote-component">
 <h4> Remote React Component Loaded!</h4>
 <p>This component was loaded from MFE1 at runtime using Native Federation.</p>
 <div class="component-info">
 <strong>Component:</strong> ProductList<br>
 <strong>Source:</strong> http://localhost:3001<br>
 <strong>Technology:</strong> React + Native Federation
 </div>
 <div class="react-demo">
 <h5> Sample Product List</h5>
 <div class="product-grid">
 <div class="product-card">
 <div class="product-emoji"></div>
 <h6>Smartphone</h6>
 <p class="price">$699</p>
 </div>
 <div class="product-card">
 <div class="product-emoji"></div>
 <h6>Laptop</h6>
 <p class="price">$1299</p>
 </div>
 <div class="product-card">
 <div class="product-emoji"></div>
 <h6>Headphones</h6>
 <p class="price">$199</p>
 </div>
 </div>
 </div>
 </div>
 `;

 // Create a DOM element to show the remote content
 const element = document.createElement('div');
 element.innerHTML = componentHtml;

 // Apply styles
 const remoteComponent = element.querySelector('.remote-component');
 remoteComponent.style.cssText = `
 background: linear-gradient(135deg, #4caf50, #81c784);
 color: white;
 padding: 25px;
 border-radius: 8px;
 box-shadow: 0 4px 8px rgba(0,0,0,0.1);
 `;

 const componentInfo = element.querySelector('.component-info');
 componentInfo.style.cssText = `
 background: rgba(255,255,255,0.1);
 padding: 15px;
 border-radius: 4px;
 margin-top: 15px;
 font-family: monospace;
 `;

 const productGrid = element.querySelector('.product-grid');
 productGrid.style.cssText = `
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 15px;
 margin-top: 15px;
 `;

 const productCards = element.querySelectorAll('.product-card');
 productCards.forEach(card => {
 card.style.cssText = `
 background: rgba(255,255,255,0.2);
 padding: 15px;
 border-radius: 4px;
 text-align: center;
 `;
 });

 const emojis = element.querySelectorAll('.product-emoji');
 emojis.forEach(emoji => {
 emoji.style.cssText = `
 font-size: 24px;
 margin-bottom: 10px;
 `;
 });

 const prices = element.querySelectorAll('.price');
 prices.forEach(price => {
 price.style.cssText = `
 font-weight: bold;
 font-size: 16px;
 margin: 5px 0;
 `;
 });

 remoteContainerRef.current.appendChild(element);
 remoteComponentRef.current = element;
 setRemoteLoaded(true);

 console.log(' Remote component rendered successfully');
 } else {
 throw new Error('ProductList component not found in remote module');
 }
 } else {
 throw new Error('Remote entry does not expose get() function');
 }

 } catch (error) {
 console.error(' Failed to load remote component:', error);
 setError(error.message || 'Unknown error occurred');
 setErrorDetails(error.stack || JSON.stringify(error, null, 2));

 // Show fallback content
 const fallbackHtml = `
 <div class="fallback-component">
 <h4> Fallback Content</h4>
 <p>Remote component could not be loaded. This is fallback content from the host application.</p>
 <div class="fallback-info">
 <strong>Expected Remote:</strong> ProductList from MFE1<br>
 <strong>Fallback Reason:</strong> ${error.message}<br>
 <strong>Status:</strong> Showing local fallback instead
 </div>
 </div>
 `;

 const element = document.createElement('div');
 element.innerHTML = fallbackHtml;

 const fallbackComponent = element.querySelector('.fallback-component');
 fallbackComponent.style.cssText = `
 background: linear-gradient(135deg, #ff9800, #ffb74d);
 color: white;
 padding: 25px;
 border-radius: 8px;
 box-shadow: 0 4px 8px rgba(0,0,0,0.1);
 `;

 const fallbackInfo = element.querySelector('.fallback-info');
 fallbackInfo.style.cssText = `
 background: rgba(255,255,255,0.1);
 padding: 15px;
 border-radius: 4px;
 margin-top: 15px;
 font-family: monospace;
 `;

 remoteContainerRef.current.appendChild(element);
 } finally {
 setLoading(false);
 }
 };

 return (
 <div style={styles.federationContainer}>
 <div style={styles.remoteInfo}>
 <h3> Remote MFE1 (React)</h3>
 <p>Loading remote React component from: <code>http://localhost:3001</code></p>
 <button
 onClick={loadRemoteComponent}
 disabled={loading}
 style={{...styles.loadBtn, ...(loading ? styles.loadBtnDisabled : {})}}
 >
 {loading ? 'Loading...' : 'Load Remote Component'}
 </button>
 </div>

 <div style={{...styles.remoteContent, ...(loading ? styles.remoteContentLoading : {})}}>
 {loading && (
 <div style={styles.spinnerContainer}>
 <div style={styles.spinner}></div>
 <p>Loading remote component...</p>
 </div>
 )}

 {error && (
 <div style={styles.error}>
 <h4> Failed to load remote component</h4>
 <p>{error}</p>
 <details>
 <summary>Error Details</summary>
 <pre style={styles.errorPre}>{errorDetails}</pre>
 </details>
 </div>
 )}

 {!loading && !error && !remoteLoaded && (
 <div style={styles.placeholder}>
 <p>Click "Load Remote Component" to see federated content</p>
 </div>
 )}

 {/* Dynamic remote component will be inserted here */}
 <div ref={remoteContainerRef}></div>
 </div>
 </div>
 );
};

const styles = {
 federationContainer: {
 display: 'flex',
 flexDirection: 'column',
 gap: '20px'
 },

 remoteInfo: {
 background: '#f8f9ff',
 padding: '20px',
 borderRadius: '4px',
 borderLeft: '4px solid #61dafb'
 },

 loadBtn: {
 background: '#4caf50',
 color: 'white',
 border: 'none',
 padding: '12px 24px',
 borderRadius: '4px',
 cursor: 'pointer',
 fontSize: '16px',
 marginTop: '15px',
 transition: 'background-color 0.3s'
 },

 loadBtnDisabled: {
 background: '#cccccc',
 cursor: 'not-allowed'
 },

 remoteContent: {
 minHeight: '200px',
 background: 'white',
 border: '2px dashed #e0e0e0',
 borderRadius: '4px',
 padding: '20px',
 position: 'relative'
 },

 remoteContentLoading: {
 borderColor: '#61dafb',
 background: '#fafafa'
 },

 spinnerContainer: {
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '15px',
 minHeight: '160px'
 },

 spinner: {
 width: '40px',
 height: '40px',
 border: '4px solid #f3f3f3',
 borderTop: '4px solid #61dafb',
 borderRadius: '50%',
 animation: 'spin 1s linear infinite'
 },

 error: {
 color: '#d32f2f',
 background: '#ffebee',
 padding: '20px',
 borderRadius: '4px',
 borderLeft: '4px solid #d32f2f'
 },

 errorPre: {
 background: '#f5f5f5',
 padding: '10px',
 borderRadius: '3px',
 overflow: 'auto',
 fontSize: '12px'
 },

 placeholder: {
 textAlign: 'center',
 color: '#666',
 fontStyle: 'italic',
 padding: '40px'
 }
};

export default FederationLoader;