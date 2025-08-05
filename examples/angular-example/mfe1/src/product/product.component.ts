import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
 selector: 'app-product',
 standalone: true,
 imports: [CommonModule],
 template: `
 <div class="product-container">
 <h3> Product Component (from MFE1)</h3>
 <div class="product-grid">
 <div *ngFor="let product of products" class="product-card">
 <div class="product-image">{{ product.emoji }}</div>
 <h4>{{ product.name }}</h4>
 <p class="product-price">\${{ product.price }}</p>
 <p class="product-description">{{ product.description }}</p>
 <button (click)="addToCart(product)" class="add-btn">
 Add to Cart
 </button>
 </div>
 </div>

 <div *ngIf="cartItems.length > 0" class="cart-summary">
 <h4> Cart Summary</h4>
 <div *ngFor="let item of cartItems" class="cart-item">
 {{ item.name }} - \${{ item.price }}
 </div>
 <div class="cart-total">
 <strong>Total: \${{ getCartTotal() }}</strong>
 </div>
 </div>

 <div class="mfe-info">
 <small>
  This component is loaded from MFE1 using Native Federation<br>
 Source: http://localhost:4201<br>
 Technology: Angular Standalone Component
 </small>
 </div>
 </div>
 `,
 styles: [`
 .product-container {
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
 }

 .product-container h3 {
 color: #1976d2;
 margin: 0 0 20px 0;
 font-size: 1.5em;
 }

 .product-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
 gap: 20px;
 margin-bottom: 30px;
 }

 .product-card {
 background: white;
 border: 1px solid #e0e0e0;
 border-radius: 8px;
 padding: 20px;
 text-align: center;
 box-shadow: 0 2px 4px rgba(0,0,0,0.1);
 transition: transform 0.2s, box-shadow 0.2s;
 }

 .product-card:hover {
 transform: translateY(-2px);
 box-shadow: 0 4px 8px rgba(0,0,0,0.15);
 }

 .product-image {
 font-size: 48px;
 margin-bottom: 15px;
 }

 .product-card h4 {
 margin: 0 0 10px 0;
 color: #333;
 }

 .product-price {
 font-size: 1.2em;
 font-weight: bold;
 color: #4caf50;
 margin: 0 0 10px 0;
 }

 .product-description {
 color: #666;
 font-size: 0.9em;
 margin: 0 0 15px 0;
 }

 .add-btn {
 background: #4caf50;
 color: white;
 border: none;
 padding: 10px 20px;
 border-radius: 4px;
 cursor: pointer;
 font-size: 14px;
 transition: background-color 0.3s;
 }

 .add-btn:hover {
 background: #45a049;
 }

 .cart-summary {
 background: #f8f9fa;
 padding: 20px;
 border-radius: 8px;
 border-left: 4px solid #4caf50;
 margin-bottom: 20px;
 }

 .cart-summary h4 {
 margin: 0 0 15px 0;
 color: #4caf50;
 }

 .cart-item {
 padding: 5px 0;
 border-bottom: 1px solid #e0e0e0;
 }

 .cart-total {
 padding: 10px 0;
 font-size: 1.1em;
 color: #4caf50;
 }

 .mfe-info {
 background: #e3f2fd;
 padding: 15px;
 border-radius: 4px;
 color: #1565c0;
 font-family: monospace;
 font-size: 12px;
 line-height: 1.4;
 }
 `]
})
export class ProductComponent {
 products = [
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
 }
 ];

 cartItems: any[] = [];

 addToCart(product: any) {
 this.cartItems.push({ ...product });
 console.log(`Added ${product.name} to cart`);
 }

 getCartTotal(): number {
 return this.cartItems.reduce((total, item) => total + item.price, 0);
 }
}

// Export for federation
export { ProductComponent };