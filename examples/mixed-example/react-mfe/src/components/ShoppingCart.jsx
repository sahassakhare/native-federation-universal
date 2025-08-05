import React, { useState } from 'react';

const ShoppingCart = ({ title = 'Shopping Cart', subtitle = 'React Component in MFE' }) => {
 const [items, setItems] = useState([
 { id: 1, name: 'Laptop', price: 999, quantity: 1 },
 { id: 2, name: 'Mouse', price: 25, quantity: 2 },
 { id: 3, name: 'Keyboard', price: 75, quantity: 1 }
 ]);

 const [newItem, setNewItem] = useState({ name: '', price: '' });

 const updateQuantity = (id, change) => {
 setItems(items.map(item =>
 item.id === id
 ? { ...item, quantity: Math.max(0, item.quantity + change) }
 : item
 ).filter(item => item.quantity > 0));
 };

 const addItem = () => {
 if (newItem.name && newItem.price) {
 const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
 setItems([...items, {
 id: newId,
 name: newItem.name,
 price: parseFloat(newItem.price),
 quantity: 1
 }]);
 setNewItem({ name: '', price: '' });
 }
 };

 const getTotal = () => {
 return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
 };

 return (
 <div style={styles.container}>
 <div style={styles.header}>
 <h3 style={styles.title}>{title}</h3>
 <p style={styles.subtitle}>{subtitle}</p>
 </div>

 <div style={styles.cartItems}>
 {items.length === 0 ? (
 <div style={styles.emptyCart}>
 <p> Your cart is empty</p>
 </div>
 ) : (
 items.map(item => (
 <div key={item.id} style={styles.cartItem}>
 <div style={styles.itemInfo}>
 <span style={styles.itemName}>{item.name}</span>
 <span style={styles.itemPrice}>${item.price}</span>
 </div>
 <div style={styles.quantityControls}>
 <button
 onClick={() => updateQuantity(item.id, -1)}
 style={styles.quantityBtn}
 >
 -
 </button>
 <span style={styles.quantity}>{item.quantity}</span>
 <button
 onClick={() => updateQuantity(item.id, 1)}
 style={styles.quantityBtn}
 >
 +
 </button>
 </div>
 <div style={styles.itemTotal}>
 ${(item.price * item.quantity).toFixed(2)}
 </div>
 </div>
 ))
 )}
 </div>

 <div style={styles.addItemSection}>
 <h4 style={styles.addItemTitle}>Add New Item</h4>
 <div style={styles.addItemForm}>
 <input
 type="text"
 placeholder="Item name"
 value={newItem.name}
 onChange={(e) => setNewItem({...newItem, name: e.target.value})}
 style={styles.input}
 />
 <input
 type="number"
 placeholder="Price"
 value={newItem.price}
 onChange={(e) => setNewItem({...newItem, price: e.target.value})}
 style={styles.input}
 />
 <button onClick={addItem} style={styles.addBtn}>
 Add Item
 </button>
 </div>
 </div>

 <div style={styles.total}>
 <strong>Total: ${getTotal()}</strong>
 </div>

 <div style={styles.federationInfo}>
 <small>
  This is a React component running inside an Angular application!<br/>
 Loaded via Native Federation from: http://localhost:4201<br/>
 Cross-framework micro-frontend architecture in action
 </small>
 </div>
 </div>
 );
};

const styles = {
 container: {
 fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
 background: 'linear-gradient(135deg, #667eea, #764ba2)',
 color: 'white',
 padding: '25px',
 borderRadius: '8px',
 boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
 },

 header: {
 marginBottom: '20px',
 textAlign: 'center'
 },

 title: {
 margin: '0 0 10px 0',
 fontSize: '1.5em'
 },

 subtitle: {
 margin: '0',
 opacity: '0.9',
 fontSize: '0.9em'
 },

 cartItems: {
 background: 'rgba(255,255,255,0.1)',
 borderRadius: '4px',
 padding: '15px',
 marginBottom: '20px'
 },

 emptyCart: {
 textAlign: 'center',
 padding: '20px',
 fontStyle: 'italic'
 },

 cartItem: {
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 padding: '10px 0',
 borderBottom: '1px solid rgba(255,255,255,0.2)'
 },

 itemInfo: {
 display: 'flex',
 flexDirection: 'column',
 flex: '1'
 },

 itemName: {
 fontWeight: 'bold'
 },

 itemPrice: {
 fontSize: '0.9em',
 opacity: '0.8'
 },

 quantityControls: {
 display: 'flex',
 alignItems: 'center',
 gap: '10px'
 },

 quantityBtn: {
 background: 'rgba(255,255,255,0.2)',
 color: 'white',
 border: 'none',
 width: '30px',
 height: '30px',
 borderRadius: '50%',
 cursor: 'pointer',
 fontSize: '16px'
 },

 quantity: {
 minWidth: '20px',
 textAlign: 'center',
 fontWeight: 'bold'
 },

 itemTotal: {
 fontWeight: 'bold',
 minWidth: '80px',
 textAlign: 'right'
 },

 addItemSection: {
 background: 'rgba(255,255,255,0.1)',
 borderRadius: '4px',
 padding: '15px',
 marginBottom: '20px'
 },

 addItemTitle: {
 margin: '0 0 15px 0'
 },

 addItemForm: {
 display: 'flex',
 gap: '10px',
 flexWrap: 'wrap'
 },

 input: {
 flex: '1',
 minWidth: '120px',
 padding: '8px 12px',
 borderRadius: '4px',
 border: 'none',
 fontSize: '14px'
 },

 addBtn: {
 background: '#4caf50',
 color: 'white',
 border: 'none',
 padding: '8px 16px',
 borderRadius: '4px',
 cursor: 'pointer',
 fontSize: '14px',
 whiteSpace: 'nowrap'
 },

 total: {
 fontSize: '1.2em',
 textAlign: 'center',
 padding: '15px',
 background: 'rgba(255,255,255,0.1)',
 borderRadius: '4px',
 marginBottom: '15px'
 },

 federationInfo: {
 background: 'rgba(255,255,255,0.1)',
 padding: '10px',
 borderRadius: '4px',
 fontFamily: 'monospace',
 fontSize: '11px',
 lineHeight: '1.4',
 textAlign: 'center'
 }
};

export default ShoppingCart;