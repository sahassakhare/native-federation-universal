// MFE1 - Product List Component
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
}

@Component({
  selector: 'mfe1-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-list-container">
      <div class="header">
        <h2>Product Catalog</h2>
        <p class="subtitle">Loaded from MFE1 (http://localhost:4201)</p>
      </div>
      
      <div class="filters">
        <div class="filter-group">
          <label>Category:</label>
          <select (change)="filterByCategory($event)" class="filter-select">
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>
            <input type="checkbox" (change)="filterInStock($event)">
            In Stock Only
          </label>
        </div>
      </div>
      
      <div class="product-grid" *ngIf="filteredProducts.length > 0">
        <div class="product-card" *ngFor="let product of filteredProducts" [class.out-of-stock]="!product.inStock">
          <div class="product-image">
            <div class="image-placeholder">{{ product.name.charAt(0) }}</div>
          </div>
          
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="description">{{ product.description }}</p>
            <div class="product-meta">
              <span class="category">{{ product.category }}</span>
              <span class="price">{{ product.price | currency }}</span>
            </div>
            <div class="stock-status">
              <span class="status" [class]="product.inStock ? 'in-stock' : 'out-of-stock'">
                {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
              </span>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="btn primary" [disabled]="!product.inStock" (click)="addToCart(product)">
              Add to Cart
            </button>
            <button class="btn secondary" (click)="viewDetails(product)">
              View Details
            </button>
          </div>
        </div>
      </div>
      
      <div class="no-products" *ngIf="filteredProducts.length === 0">
        <h3>No products found</h3>
        <p>Try adjusting your filters</p>
      </div>
      
      <div class="mfe-info">
        <p><strong>MFE1 Status:</strong> <span class="status-badge">Connected</span></p>
        <p><strong>Total Products:</strong> {{ products.length }}</p>
        <p><strong>Filtered Results:</strong> {{ filteredProducts.length }}</p>
      </div>
    </div>
  `,
  styles: [`
    .product-list-container {
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 500px;
      border-radius: 8px;
      color: white;
    }
    
    .header {
      margin-bottom: 2rem;
      text-align: center;
    }
    
    .header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }
    
    .subtitle {
      margin: 0;
      opacity: 0.8;
      font-style: italic;
    }
    
    .filters {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      backdrop-filter: blur(10px);
      flex-wrap: wrap;
    }
    
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .filter-group label {
      font-weight: 500;
    }
    
    .filter-select {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      background: white;
      color: #333;
    }
    
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .product-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .product-card.out-of-stock {
      opacity: 0.6;
    }
    
    .product-image {
      margin-bottom: 1rem;
    }
    
    .image-placeholder {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 auto;
    }
    
    .product-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
    }
    
    .description {
      margin: 0 0 1rem 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }
    
    .product-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .category {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .price {
      font-weight: bold;
      font-size: 1.1rem;
    }
    
    .stock-status {
      margin-bottom: 1rem;
    }
    
    .status.in-stock {
      color: #4caf50;
    }
    
    .status.out-of-stock {
      color: #f44336;
    }
    
    .product-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn.primary {
      background: #1976d2;
      color: white;
    }
    
    .btn.primary:hover:not(:disabled) {
      background: #1565c0;
    }
    
    .btn.secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .btn.secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .no-products {
      text-align: center;
      padding: 3rem;
      opacity: 0.8;
    }
    
    .mfe-info {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 1rem;
      border-radius: 8px;
      margin-top: 2rem;
    }
    
    .mfe-info p {
      margin: 0.5rem 0;
    }
    
    .status-badge {
      background: #4caf50;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [
    {
      id: 1,
      name: 'MacBook Pro 16"',
      description: 'Powerful laptop for professionals with M2 chip',
      price: 2499.99,
      category: 'Electronics',
      image: 'macbook.jpg',
      inStock: true
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 79.99,
      category: 'Electronics',
      image: 'mouse.jpg',
      inStock: true
    },
    {
      id: 3,
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% organic cotton t-shirt',
      price: 29.99,
      category: 'Clothing',
      image: 'tshirt.jpg',
      inStock: false
    },
    {
      id: 4,
      name: 'JavaScript Guide',
      description: 'Complete guide to modern JavaScript development',
      price: 49.99,
      category: 'Books',
      image: 'book.jpg',
      inStock: true
    },
    {
      id: 5,
      name: 'Coffee Mug',
      description: 'Ceramic coffee mug with ergonomic handle',
      price: 19.99,
      category: 'Home',
      image: 'mug.jpg',
      inStock: true
    },
    {
      id: 6,
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches',
      price: 149.99,
      category: 'Electronics',
      image: 'keyboard.jpg',
      inStock: false
    }
  ];

  filteredProducts: Product[] = [];
  selectedCategory = '';
  showInStockOnly = false;

  ngOnInit() {
    console.log('MFE1 Product List Component initialized');
    this.filteredProducts = [...this.products];
  }

  filterByCategory(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    this.applyFilters();
  }

  filterInStock(event: Event) {
    const target = event.target as HTMLInputElement;
    this.showInStockOnly = target.checked;
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const categoryMatch = !this.selectedCategory || product.category === this.selectedCategory;
      const stockMatch = !this.showInStockOnly || product.inStock;
      return categoryMatch && stockMatch;
    });
    
    console.log('Filters applied:', {
      category: this.selectedCategory,
      inStockOnly: this.showInStockOnly,
      results: this.filteredProducts.length
    });
  }

  addToCart(product: Product) {
    console.log('Adding to cart:', product.name);
    // In a real app, this would add to a cart service
    alert(`Added "${product.name}" to cart!`);
  }

  viewDetails(product: Product) {
    console.log('Viewing details for:', product.name);
    // In a real app, this would navigate to product details
    alert(`Viewing details for "${product.name}"`);
  }
}