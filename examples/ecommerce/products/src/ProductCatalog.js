// Product Catalog Main Component
import { ProductData } from './data/ProductData.js';
import { ProductGrid } from './components/ProductGrid.js';
import { ProductSearch } from './components/ProductSearch.js';
import { ProductFilters } from './components/ProductFilters.js';

console.log('📦 Products MFE - ProductCatalog loaded');

export class ProductCatalog {
  constructor() {
    this.products = ProductData.getAllProducts();
    this.filteredProducts = [...this.products];
    this.filters = {
      category: '',
      priceRange: [0, 1000],
      searchTerm: ''
    };
    
    this.container = null;
  }

  render() {
    return `
      <div class="product-catalog" id="product-catalog">
        <div class="catalog-header">
          <h2>🛍️ Product Catalog</h2>
          <p class="mfe-info">
            <small>Loaded from Products MFE (http://localhost:4001)</small>
          </p>
        </div>
        
        <div class="catalog-controls">
          <div id="product-search"></div>
          <div id="product-filters"></div>
        </div>
        
        <div class="catalog-content">
          <div class="results-info">
            <span id="results-count">${this.filteredProducts.length}</span> products found
          </div>
          
          <div id="product-grid"></div>
        </div>
        
        <div class="catalog-footer">
          <p>Powered by Native Federation - Products MFE</p>
        </div>
      </div>
    `;
  }

  initialize(container) {
    this.container = container;
    
    // Setup search
    this.setupSearch();
    
    // Setup filters
    this.setupFilters();
    
    // Render product grid
    this.renderProductGrid();
    
    console.log('✅ ProductCatalog initialized with', this.products.length, 'products');
  }

  setupSearch() {
    const searchContainer = document.getElementById('product-search');
    if (!searchContainer) return;
    
    const search = new ProductSearch({
      onSearch: (term) => {
        this.filters.searchTerm = term;
        this.applyFilters();
      }
    });
    
    searchContainer.innerHTML = search.render();
    search.initialize(searchContainer);
  }

  setupFilters() {
    const filtersContainer = document.getElementById('product-filters');
    if (!filtersContainer) return;
    
    const filters = new ProductFilters({
      categories: this.getCategories(),
      onFilterChange: (newFilters) => {
        this.filters = { ...this.filters, ...newFilters };
        this.applyFilters();
      }
    });
    
    filtersContainer.innerHTML = filters.render();
    filters.initialize(filtersContainer);
  }

  renderProductGrid() {
    const gridContainer = document.getElementById('product-grid');
    if (!gridContainer) return;
    
    const grid = new ProductGrid({
      products: this.filteredProducts,
      onAddToCart: (product) => {
        this.addToCart(product);
      }
    });
    
    gridContainer.innerHTML = grid.render();
    grid.initialize(gridContainer);
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      // Search term filter
      if (this.filters.searchTerm) {
        const term = this.filters.searchTerm.toLowerCase();
        const matches = product.name.toLowerCase().includes(term) ||
                       product.description.toLowerCase().includes(term) ||
                       product.category.toLowerCase().includes(term);
        if (!matches) return false;
      }
      
      // Category filter
      if (this.filters.category && this.filters.category !== product.category) {
        return false;
      }
      
      // Price range filter
      if (product.price < this.filters.priceRange[0] || 
          product.price > this.filters.priceRange[1]) {
        return false;
      }
      
      return true;
    });
    
    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
      resultsCount.textContent = this.filteredProducts.length;
    }
    
    // Re-render grid
    this.renderProductGrid();
    
    console.log('🔍 Filters applied:', this.filters, 'Results:', this.filteredProducts.length);
  }

  getCategories() {
    return [...new Set(this.products.map(p => p.category))];
  }

  addToCart(product) {
    // Use global cart functionality from host
    if (window.__ECOMMERCE_SHARED__ && window.__ECOMMERCE_SHARED__.addToCart) {
      window.__ECOMMERCE_SHARED__.addToCart(product);
      
      // Show feedback
      this.showAddToCartFeedback(product);
    } else {
      console.warn('⚠️ Global cart not available');
      alert(`Added ${product.name} to cart! (Local notification)`);
    }
  }

  showAddToCartFeedback(product) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <div class="notification-content">
        ✅ Added "${product.name}" to cart!
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  destroy() {
    console.log('🗑️ ProductCatalog destroyed');
  }
}

// Export functions for direct usage
export function render() {
  const catalog = new ProductCatalog();
  return catalog.render();
}

export function initialize(container) {
  const catalog = new ProductCatalog();
  catalog.initialize(container);
  return catalog;
}

export default ProductCatalog;