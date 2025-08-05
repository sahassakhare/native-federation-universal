import { Component } from '@angular/core';

@Component({
  selector: 'mfe1-product-list',
  standalone: true,
  imports: [],
  template: `
    <div class="product-list">
      <h2> Product List (Loaded from MFE1)</h2>
      <div class="products" id="product-container">
        <!-- Products will be rendered here -->
      </div>
      <p class="meta">This component is loaded dynamically from MFE1 running on port 4202</p>
    </div>
  `,
  styles: [`
    .product-list {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 2px solid #6c5ce7;
    }
    .products {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .product-card {
      background: white;
      padding: 15px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .product-card h3 {
      margin: 0 0 10px 0;
      color: #2d3436;
    }
    .price {
      color: #00b894;
      font-weight: bold;
      font-size: 1.2em;
    }
    .meta {
      margin-top: 20px;
      text-align: center;
      color: #636e72;
      font-style: italic;
    }
  `]
})
export class ProductListComponent {
  products = [
    { id: 1, name: 'Laptop', description: 'High-performance laptop', price: 999.99 },
    { id: 2, name: 'Smartphone', description: 'Latest model smartphone', price: 699.99 },
    { id: 3, name: 'Headphones', description: 'Wireless noise-canceling', price: 299.99 },
    { id: 4, name: 'Tablet', description: 'Portable tablet device', price: 499.99 }
  ];

  ngAfterViewInit() {
    // Manually render products since we're not using CommonModule
    const container = document.getElementById('product-container');
    if (container) {
      container.innerHTML = this.products.map(product => `
        <div class="product-card">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <span class="price">$${product.price.toFixed(2)}</span>
        </div>
      `).join('');
    }
  }
}