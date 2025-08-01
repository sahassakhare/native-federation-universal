// Shopping Cart Main Component
console.log('🛒 Cart MFE - ShoppingCart loaded');

export class ShoppingCart {
  constructor(initialItems = []) {
    this.items = [...initialItems];
    this.container = null;
  }

  render(cartItems = []) {
    this.items = cartItems;
    const total = this.calculateTotal();
    const itemCount = this.items.length;

    return `
      <div class="shopping-cart" id="shopping-cart">
        <div class="cart-header">
          <h2>🛒 Shopping Cart</h2>
          <p class="mfe-info">
            <small>Loaded from Cart MFE (http://localhost:4002)</small>
          </p>
        </div>
        
        <div class="cart-content">
          ${itemCount === 0 ? this.renderEmptyCart() : this.renderCartItems()}
        </div>
        
        ${itemCount > 0 ? this.renderCartSummary(total) : ''}
        
        <style>
          .shopping-cart {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .cart-header h2 {
            margin: 0 0 0.5rem 0;
            color: #2c3e50;
          }
          
          .mfe-info {
            color: #666;
            font-style: italic;
          }
          
          .cart-content {
            margin: 2rem 0;
          }
          
          .empty-cart {
            text-align: center;
            padding: 4rem 2rem;
            color: #666;
          }
          
          .empty-cart-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          
          .cart-items {
            space-y: 1rem;
          }
          
          .cart-item {
            display: flex;
            align-items: center;
            padding: 1rem;
            border: 1px solid #eee;
            border-radius: 8px;
            margin-bottom: 1rem;
            transition: box-shadow 0.2s;
          }
          
          .cart-item:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .item-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            object-fit: cover;
            margin-right: 1rem;
          }
          
          .item-details {
            flex: 1;
          }
          
          .item-name {
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            color: #2c3e50;
          }
          
          .item-category {
            color: #666;
            font-size: 14px;
            margin-bottom: 0.5rem;
          }
          
          .item-price {
            font-size: 1.1rem;
            font-weight: bold;
            color: #3498db;
          }
          
          .item-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .quantity-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .quantity-btn {
            background: #f8f9fa;
            border: 1px solid #ddd;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }
          
          .quantity-btn:hover {
            background: #e9ecef;
          }
          
          .quantity-display {
            min-width: 40px;
            text-align: center;
            font-weight: 500;
          }
          
          .remove-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
          }
          
          .remove-btn:hover {
            background: #c82333;
          }
          
          .cart-summary {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }
          
          .summary-total {
            font-size: 1.25rem;
            font-weight: bold;
            color: #2c3e50;
            border-top: 1px solid #ddd;
            padding-top: 1rem;
            margin-top: 1rem;
          }
          
          .checkout-actions {
            margin-top: 1.5rem;
            display: flex;
            gap: 1rem;
          }
          
          .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
            text-align: center;
          }
          
          .btn-primary {
            background: #3498db;
            color: white;
          }
          
          .btn-primary:hover {
            background: #2980b9;
          }
          
          .btn-secondary {
            background: #6c757d;
            color: white;
          }
          
          .btn-secondary:hover {
            background: #5a6268;
          }
          
          @media (max-width: 768px) {
            .cart-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }
            
            .item-actions {
              width: 100%;
              justify-content: space-between;
            }
            
            .checkout-actions {
              flex-direction: column;
            }
          }
        </style>
      </div>
    `;
  }

  renderEmptyCart() {
    return `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started!</p>
        <button class="btn btn-primary" onclick="window.__ECOMMERCE_SHARED__?.navigate?.('/products')">
          Continue Shopping
        </button>
      </div>
    `;
  }

  renderCartItems() {
    return `
      <div class="cart-items">
        ${this.items.map((item, index) => `
          <div class="cart-item" data-item-index="${index}">
            <img src="${item.image}" alt="${item.name}" class="item-image">
            
            <div class="item-details">
              <h4 class="item-name">${item.name}</h4>
              <div class="item-category">${item.category}</div>
              <div class="item-price">$${item.price}</div>
            </div>
            
            <div class="item-actions">
              <div class="quantity-controls">
                <button class="quantity-btn decrease-btn" data-index="${index}">−</button>
                <span class="quantity-display">${item.quantity || 1}</span>
                <button class="quantity-btn increase-btn" data-index="${index}">+</button>
              </div>
              
              <button class="remove-btn" data-index="${index}">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderCartSummary(total) {
    const itemCount = this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const subtotal = total;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const grandTotal = subtotal + shipping + tax;

    return `
      <div class="cart-summary">
        <h3>Order Summary</h3>
        
        <div class="summary-row">
          <span>Items (${itemCount}):</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
        </div>
        
        <div class="summary-row">
          <span>Tax:</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        
        <div class="summary-row summary-total">
          <span>Total:</span>
          <span>$${grandTotal.toFixed(2)}</span>
        </div>
        
        <div class="checkout-actions">
          <button class="btn btn-primary" onclick="cart.proceedToCheckout()">
            Proceed to Checkout
          </button>
          <button class="btn btn-secondary" onclick="window.__ECOMMERCE_SHARED__?.navigate?.('/products')">
            Continue Shopping
          </button>
        </div>
      </div>
    `;
  }

  initialize(container, cartItems = []) {
    this.container = container;
    this.items = cartItems;
    
    // Make cart instance globally available
    window.cart = this;
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Sync with global cart
    this.syncWithGlobalCart();
    
    console.log('✅ ShoppingCart initialized with', this.items.length, 'items');
  }

  setupEventListeners() {
    if (!this.container) return;
    
    // Quantity controls
    this.container.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      
      if (e.target.classList.contains('increase-btn')) {
        this.increaseQuantity(index);
      } else if (e.target.classList.contains('decrease-btn')) {
        this.decreaseQuantity(index);
      } else if (e.target.classList.contains('remove-btn')) {
        this.removeItem(index);
      }
    });
  }

  increaseQuantity(index) {
    if (this.items[index]) {
      this.items[index].quantity = (this.items[index].quantity || 1) + 1;
      this.updateDisplay();
      this.syncWithGlobalCart();
    }
  }

  decreaseQuantity(index) {
    if (this.items[index]) {
      const currentQuantity = this.items[index].quantity || 1;
      if (currentQuantity > 1) {
        this.items[index].quantity = currentQuantity - 1;
        this.updateDisplay();
        this.syncWithGlobalCart();
      } else {
        this.removeItem(index);
      }
    }
  }

  removeItem(index) {
    if (this.items[index]) {
      const removedItem = this.items[index];
      this.items.splice(index, 1);
      this.updateDisplay();
      this.syncWithGlobalCart();
      
      // Use global remove function if available
      if (window.__ECOMMERCE_SHARED__?.removeFromCart) {
        window.__ECOMMERCE_SHARED__.removeFromCart(removedItem.id);
      }
      
      console.log('🗑️ Removed item from cart:', removedItem.name);
    }
  }

  updateDisplay() {
    if (this.container) {
      this.container.innerHTML = this.render(this.items);
      this.setupEventListeners();
    }
  }

  syncWithGlobalCart() {
    // Update global cart state
    if (window.__ECOMMERCE_SHARED__) {
      window.__ECOMMERCE_SHARED__.cart = [...this.items];
    }
  }

  calculateTotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  }

  proceedToCheckout() {
    if (this.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    const total = this.calculateTotal();
    const itemCount = this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    alert(`Proceeding to checkout!\n\nItems: ${itemCount}\nSubtotal: $${total.toFixed(2)}\n\nThis would redirect to payment processing...`);
    
    console.log('💳 Proceeding to checkout:', {
      items: this.items,
      total: total,
      itemCount: itemCount
    });
  }

  addItem(product) {
    // Check if item already exists
    const existingIndex = this.items.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      this.items[existingIndex].quantity = (this.items[existingIndex].quantity || 1) + 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    
    this.updateDisplay();
    this.syncWithGlobalCart();
    console.log('➕ Added item to cart:', product.name);
  }

  clearCart() {
    this.items = [];
    this.updateDisplay();
    this.syncWithGlobalCart();
    console.log('🧹 Cart cleared');
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  destroy() {
    this.container = null;
    window.cart = null;
  }
}

// Export functions for direct usage
export function render(cartItems = []) {
  const cart = new ShoppingCart(cartItems);
  return cart.render(cartItems);
}

export function initialize(container, cartItems = []) {
  const cart = new ShoppingCart(cartItems);
  cart.initialize(container, cartItems);
  return cart;
}

export default ShoppingCart;