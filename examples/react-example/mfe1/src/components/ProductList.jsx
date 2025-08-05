import React, { useState } from 'react';

const ProductList = () => {
 const [products] = useState([
 {
 id: 1,
 name: 'Wireless Headphones',
 price: 99.99,
 description: 'High-quality wireless headphones with noise cancellation',
 emoji: ''
 },
 {
 id: 2,
 name: 'Smart Watch',
 price: 199.99,
 description: 'Feature-rich smartwatch with health monitoring',
 emoji: ''
 },
 {
 id: 3,
 name: 'Laptop Stand',
 price: 49.99,
 description: 'Ergonomic adjustable laptop stand',
 emoji: ''
 },
 {
 id: 4,
 name: 'Wireless Mouse',
 price: 29.99,
 description: 'Ergonomic wireless mouse with precision tracking',
 emoji: ''
 }
 ]);

 const [cartItems, setCartItems] = useState([]);

 const addToCart = (product) => {
 setCartItems([...cartItems, { ...product }]);
 console.log(`Added ${product.name} to cart`);
 };

 const getCartTotal = () => {
 return cartItems.reduce((total, item) => total + item.price, 0);
 };

 return (
 <div style={styles.productContainer}>
 <h3> Product List (from React MFE1)</h3>
 <div style={styles.productGrid}>
 {products.map((product) => (
 <div key={product.id} style={styles.productCard}>
 <div style={styles.productImage}>{product.emoji}</div>
 <h4 style={styles.productName}>{product.name}</h4>
 <p style={styles.productPrice}>${product.price}</p>
 <p style={styles.productDescription}>{product.description}</p>
 <button
 onClick={() => addToCart(product)}
 style={styles.addBtn}
 >
 Add to Cart
 </button>
 </div>
 ))}
 </div>

 {cartItems.length > 0 && (
 <div style={styles.cartSummary}>
 <h4> Cart Summary</h4>
 {cartItems.map((item, index) => (
 <div key={index} style={styles.cartItem}>
 {item.name} - ${item.price}
 </div>
 ))}
 <div style={styles.cartTotal}>
 <strong>Total: ${getCartTotal().toFixed(2)}</strong>
 </div>
 </div>
 )}

 <div style={styles.mfeInfo}>
 <small>
  This component is loaded from React MFE1 using Native Federation<br/>
 Source: http://localhost:3001<br/>
 Technology: React Functional Component with Hooks
 </small>
 </div>
 </div>
 );
};

const styles = {
 productContainer: {
 fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
 },

 productGrid: {
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
 gap: '20px',
 marginBottom: '30px'
 },

 productCard: {
 background: 'white',
 border: '1px solid #e0e0e0',
 borderRadius: '8px',
 padding: '20px',
 textAlign: 'center',
 boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
 transition: 'transform 0.2s, box-shadow 0.2s',
 cursor: 'pointer'
 },

 productImage: {
 fontSize: '48px',
 marginBottom: '15px'
 },

 productName: {
 margin: '0 0 10px 0',
 color: '#333'
 },

 productPrice: {
 fontSize: '1.2em',
 fontWeight: 'bold',
 color: '#4caf50',
 margin: '0 0 10px 0'
 },

 productDescription: {
 color: '#666',
 fontSize: '0.9em',
 margin: '0 0 15px 0'
 },

 addBtn: {
 background: '#4caf50',
 color: 'white',
 border: 'none',
 padding: '10px 20px',
 borderRadius: '4px',
 cursor: 'pointer',
 fontSize: '14px',
 transition: 'background-color 0.3s'
 },

 cartSummary: {
 background: '#f8f9fa',
 padding: '20px',
 borderRadius: '8px',
 borderLeft: '4px solid #4caf50',
 marginBottom: '20px'
 },

 cartItem: {
 padding: '5px 0',
 borderBottom: '1px solid #e0e0e0'
 },

 cartTotal: {
 padding: '10px 0',
 fontSize: '1.1em',
 color: '#4caf50'
 },

 mfeInfo: {
 background: '#e3f2fd',
 padding: '15px',
 borderRadius: '4px',
 color: '#1565c0',
 fontFamily: 'monospace',
 fontSize: '12px',
 lineHeight: '1.4'
 }
};

// Export as default for federation
export default ProductList;