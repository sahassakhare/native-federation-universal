import React from 'react';
import ShoppingCart from './components/ShoppingCart';

const App = () => {
 return (
 <div style={styles.appContainer}>
 <h2> React MFE Standalone Application</h2>
 <p>This is the standalone version of the React MFE. The ShoppingCart component below is also exposed via Native Federation for cross-framework loading.</p>

 <div style={styles.componentDemo}>
 <h3>Demo: ShoppingCart Component</h3>
 <p>This same component can be loaded dynamically in Angular, Vue, or other framework hosts:</p>

 <ShoppingCart
 title="Standalone Shopping Cart Demo"
 subtitle="This React component runs standalone here, but can be federated to other frameworks"
 />
 </div>

 <div style={styles.integrationInfo}>
 <h3> Integration Information</h3>
 <div style={styles.infoGrid}>
 <div style={styles.infoCard}>
 <h4>Federation Endpoint</h4>
 <code>http://localhost:4201/remoteEntry.js</code>
 </div>
 <div style={styles.infoCard}>
 <h4>Exposed Module</h4>
 <code>./ShoppingCart</code>
 </div>
 <div style={styles.infoCard}>
 <h4>Framework Compatibility</h4>
 <code>Angular, Vue, Vanilla JS, etc.</code>
 </div>
 <div style={styles.infoCard}>
 <h4>Technology</h4>
 <code>React 18 + Native Federation</code>
 </div>
 </div>
 </div>
 </div>
 );
};

const styles = {
 appContainer: {
 padding: '20px 0'
 },

 componentDemo: {
 margin: '30px 0'
 },

 integrationInfo: {
 marginTop: '40px',
 background: '#f8f9fa',
 padding: '20px',
 borderRadius: '8px'
 },

 infoGrid: {
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
 gap: '15px',
 marginTop: '15px'
 },

 infoCard: {
 background: 'white',
 padding: '15px',
 borderRadius: '4px',
 border: '1px solid #e0e0e0'
 },

 'infoCard h4': {
 margin: '0 0 10px 0',
 color: '#333'
 },

 'infoCard code': {
 background: '#f1f3f4',
 padding: '4px 8px',
 borderRadius: '3px',
 fontSize: '12px',
 wordBreak: 'break-all'
 }
};

export default App;