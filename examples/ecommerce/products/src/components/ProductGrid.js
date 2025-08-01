// Product Grid Component
import { ProductCard } from './ProductCard.js';

export class ProductGrid {
  constructor(options = {}) {
    this.products = options.products || [];
    this.onAddToCart = options.onAddToCart || (() => {});
    this.container = null;
  }

  render() {
    if (this.products.length === 0) {
      return `
        <div class="product-grid-empty">
          <div class="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="product-grid">
        ${this.products.map(product => {
          const card = new ProductCard({
            product,
            onAddToCart: this.onAddToCart
          });
          return card.render();
        }).join('')}
      </div>
      
      <style>
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .product-grid-empty {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .empty-state {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .empty-state h3 {
          color: #666;
          margin-bottom: 1rem;
        }
        
        .empty-state p {
          color: #999;
        }
        
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .product-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }

  initialize(container) {
    this.container = container;
    
    // Initialize product cards
    this.products.forEach((product, index) => {
      const cardElement = container.querySelector(`[data-product-id="${product.id}"]`);
      if (cardElement) {
        const card = new ProductCard({
          product,
          onAddToCart: this.onAddToCart
        });
        card.initialize(cardElement);
      }
    });
    
    console.log('✅ ProductGrid initialized with', this.products.length, 'products');
  }

  updateProducts(newProducts) {
    this.products = newProducts;
    if (this.container) {
      this.container.innerHTML = this.render();
      this.initialize(this.container);
    }
  }

  destroy() {
    this.container = null;
  }
}

export default ProductGrid;