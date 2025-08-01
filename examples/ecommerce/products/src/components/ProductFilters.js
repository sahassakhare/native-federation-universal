// Product Filters Component
export class ProductFilters {
  constructor(options = {}) {
    this.categories = options.categories || [];
    this.onFilterChange = options.onFilterChange || (() => {});
    this.container = null;
    
    this.filters = {
      category: '',
      priceRange: [0, 1000],
      inStock: false
    };
  }

  render() {
    return `
      <div class="product-filters">
        <div class="filters-header">
          <h4>Filters</h4>
          <button class="clear-filters">Clear All</button>
        </div>
        
        <div class="filters-content">
          <!-- Category Filter -->
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <select class="category-select">
              <option value="">All Categories</option>
              ${this.categories.map(category => 
                `<option value="${category}">${category}</option>`
              ).join('')}
            </select>
          </div>
          
          <!-- Price Range Filter -->
          <div class="filter-group">
            <label class="filter-label">Price Range</label>
            <div class="price-range-container">
              <div class="price-inputs">
                <input type="number" class="price-min" placeholder="Min" min="0" value="0">
                <span class="price-separator">to</span>
                <input type="number" class="price-max" placeholder="Max" min="0" value="1000">
              </div>
              <div class="price-range-slider">
                <input type="range" class="range-min" min="0" max="1000" value="0" step="10">
                <input type="range" class="range-max" min="0" max="1000" value="1000" step="10">
              </div>
              <div class="price-display">
                $<span class="current-min">0</span> - $<span class="current-max">1000</span>
              </div>
            </div>
          </div>
          
          <!-- Stock Filter -->
          <div class="filter-group">
            <label class="filter-checkbox">
              <input type="checkbox" class="stock-filter">
              <span class="checkmark"></span>
              In Stock Only
            </label>
          </div>
        </div>
        
        <style>
          .product-filters {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
          }
          
          .filters-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #eee;
          }
          
          .filters-header h4 {
            margin: 0;
            color: #333;
          }
          
          .clear-filters {
            background: none;
            border: 1px solid #ddd;
            color: #666;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }
          
          .clear-filters:hover {
            background: #f8f9fa;
            border-color: #ccc;
          }
          
          .filters-content {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
          }
          
          .filter-group {
            flex: 1;
            min-width: 200px;
          }
          
          .filter-label {
            display: block;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: #555;
          }
          
          .category-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
          }
          
          .category-select:focus {
            outline: none;
            border-color: #3498db;
          }
          
          .price-range-container {
            space-y: 0.5rem;
          }
          
          .price-inputs {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          .price-inputs input {
            flex: 1;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
          }
          
          .price-separator {
            color: #666;
            font-size: 14px;
          }
          
          .price-range-slider {
            position: relative;
            height: 20px;
            margin: 0.5rem 0;
          }
          
          .price-range-slider input[type="range"] {
            position: absolute;
            width: 100%;
            height: 4px;
            background: none;
            pointer-events: none;
            -webkit-appearance: none;
          }
          
          .price-range-slider input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: all;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3498db;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .price-range-slider input[type="range"]::-moz-range-thumb {
            pointer-events: all;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3498db;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .price-range-slider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 4px;
            background: #ddd;
            border-radius: 2px;
            transform: translateY(-50%);
          }
          
          .price-display {
            text-align: center;
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }
          
          .filter-checkbox {
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;
          }
          
          .filter-checkbox input[type="checkbox"] {
            display: none;
          }
          
          .checkmark {
            width: 18px;
            height: 18px;
            border: 2px solid #ddd;
            border-radius: 3px;
            margin-right: 0.5rem;
            position: relative;
            transition: all 0.2s;
          }
          
          .filter-checkbox input[type="checkbox"]:checked + .checkmark {
            background: #3498db;
            border-color: #3498db;
          }
          
          .filter-checkbox input[type="checkbox"]:checked + .checkmark::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            font-weight: bold;
          }
          
          @media (max-width: 768px) {
            .filters-content {
              flex-direction: column;
            }
            
            .filter-group {
              min-width: auto;
            }
          }
        </style>
      </div>
    `;
  }

  initialize(container) {
    this.container = container;
    
    const categorySelect = container.querySelector('.category-select');
    const priceMin = container.querySelector('.price-min');
    const priceMax = container.querySelector('.price-max');
    const rangeMin = container.querySelector('.range-min');
    const rangeMax = container.querySelector('.range-max');
    const stockFilter = container.querySelector('.stock-filter');
    const clearFilters = container.querySelector('.clear-filters');
    
    // Category filter
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.notifyFilterChange();
      });
    }
    
    // Price range filters
    if (priceMin && priceMax) {
      const updatePriceRange = () => {
        const min = parseInt(priceMin.value) || 0;
        const max = parseInt(priceMax.value) || 1000;
        
        this.filters.priceRange = [Math.min(min, max), Math.max(min, max)];
        this.updatePriceDisplay();
        this.updateRangeSliders();
        this.notifyFilterChange();
      };
      
      priceMin.addEventListener('input', updatePriceRange);
      priceMax.addEventListener('input', updatePriceRange);
    }
    
    // Range sliders
    if (rangeMin && rangeMax) {
      const updateFromSliders = () => {
        const min = parseInt(rangeMin.value);
        const max = parseInt(rangeMax.value);
        
        this.filters.priceRange = [Math.min(min, max), Math.max(min, max)];
        this.updatePriceInputs();
        this.updatePriceDisplay();
        this.notifyFilterChange();
      };
      
      rangeMin.addEventListener('input', updateFromSliders);
      rangeMax.addEventListener('input', updateFromSliders);
    }
    
    // Stock filter
    if (stockFilter) {
      stockFilter.addEventListener('change', (e) => {
        this.filters.inStock = e.target.checked;
        this.notifyFilterChange();
      });
    }
    
    // Clear filters
    if (clearFilters) {
      clearFilters.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearAllFilters();
      });
    }
    
    console.log('✅ ProductFilters initialized');
  }

  updatePriceDisplay() {
    const currentMin = this.container?.querySelector('.current-min');
    const currentMax = this.container?.querySelector('.current-max');
    
    if (currentMin && currentMax) {
      currentMin.textContent = this.filters.priceRange[0];
      currentMax.textContent = this.filters.priceRange[1];
    }
  }

  updatePriceInputs() {
    const priceMin = this.container?.querySelector('.price-min');
    const priceMax = this.container?.querySelector('.price-max');
    
    if (priceMin && priceMax) {
      priceMin.value = this.filters.priceRange[0];
      priceMax.value = this.filters.priceRange[1];
    }
  }

  updateRangeSliders() {
    const rangeMin = this.container?.querySelector('.range-min');
    const rangeMax = this.container?.querySelector('.range-max');
    
    if (rangeMin && rangeMax) {
      rangeMin.value = this.filters.priceRange[0];
      rangeMax.value = this.filters.priceRange[1];
    }
  }

  clearAllFilters() {
    this.filters = {
      category: '',
      priceRange: [0, 1000],
      inStock: false
    };
    
    // Update UI
    const categorySelect = this.container?.querySelector('.category-select');
    const priceMin = this.container?.querySelector('.price-min');
    const priceMax = this.container?.querySelector('.price-max');
    const stockFilter = this.container?.querySelector('.stock-filter');
    
    if (categorySelect) categorySelect.value = '';
    if (priceMin) priceMin.value = '0';
    if (priceMax) priceMax.value = '1000';
    if (stockFilter) stockFilter.checked = false;
    
    this.updatePriceDisplay();
    this.updateRangeSliders();
    this.notifyFilterChange();
    
    console.log('🧹 All filters cleared');
  }

  notifyFilterChange() {
    console.log('🔧 Filters changed:', this.filters);
    this.onFilterChange(this.filters);
  }

  getFilters() {
    return { ...this.filters };
  }

  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    // Update UI elements to reflect new filters
    // Implementation would update all form elements
  }

  destroy() {
    this.container = null;
  }
}

export default ProductFilters;