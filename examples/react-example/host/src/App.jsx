import React, { useState } from 'react';
import FederationLoader from './FederationLoader';

const App = () => {
 const [showLocal, setShowLocal] = useState(false);

 const toggleMessage = () => {
 setShowLocal(!showLocal);
 };

 return (
 <div style={styles.appContainer}>
 <header style={styles.appHeader}>
 <h1> React Host Application</h1>
 <p>Native Federation React Example</p>
 </header>

 <main style={styles.appMain}>
 <div style={styles.section}>
 <h2>Local Components</h2>
 <div style={styles.localContent}>
 <p>This content is served from the React Host application.</p>
 <button onClick={toggleMessage} style={styles.btn}>
 {showLocal ? 'Hide' : 'Show'} Local Message
 </button>
 {showLocal && (
 <div style={styles.message}>
 Hello from React Host!
 </div>
 )}
 </div>
 </div>

 <div style={styles.section}>
 <h2>Federated Components</h2>
 <FederationLoader />
 </div>
 </main>
 </div>
 );
};

const styles = {
 appContainer: {
 maxWidth: '1200px',
 margin: '0 auto',
 padding: '20px'
 },

 appHeader: {
 background: 'linear-gradient(135deg, #61dafb, #21a0c4)',
 color: 'white',
 padding: '30px',
 borderRadius: '8px',
 textAlign: 'center',
 marginBottom: '30px'
 },

 appMain: {
 display: 'flex',
 flexDirection: 'column',
 gap: '30px'
 },

 section: {
 background: 'white',
 padding: '30px',
 borderRadius: '8px',
 boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
 },

 localContent: {
 display: 'flex',
 flexDirection: 'column',
 gap: '15px'
 },

 btn: {
 background: '#61dafb',
 color: 'white',
 border: 'none',
 padding: '12px 24px',
 borderRadius: '4px',
 cursor: 'pointer',
 fontSize: '16px',
 alignSelf: 'flex-start',
 transition: 'background-color 0.3s'
 },

 message: {
 background: '#e8f5e8',
 color: '#2e7d32',
 padding: '15px',
 borderRadius: '4px',
 borderLeft: '4px solid #4caf50'
 }
};

export default App;