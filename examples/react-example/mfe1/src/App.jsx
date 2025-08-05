import React from 'react';
import ProductList from './components/ProductList';

const App = () => {
 return (
 <div style={styles.appContainer}>
 <h2> React MFE1 Standalone Application</h2>
 <p>This is the standalone version of React MFE1. The ProductList component below is also exposed via Native Federation.</p>
 <ProductList />
 </div>
 );
};

const styles = {
 appContainer: {
 padding: '20px 0'
 }
};

export default App;