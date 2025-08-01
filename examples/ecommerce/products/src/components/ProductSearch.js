// Product Search Component
export class ProductSearch {
  constructor(options = {}) {
    this.onSearch = options.onSearch || (() => {});
    this.placeholder = options.placeholder || 'Search products...';
    this.debounceDelay = options.debounceDelay || 300;
    this.container = null;
    this.debounceTimer = null;
  }

  render() {
    return `
      <div class="product-search">
        <div class="search-container">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              class="search-input"
              placeholder="${this.placeholder}"
              autocomplete="off"
            >
            <button class="search-clear" style="display: none;">
              <span>×</span>
            </button>
          </div>
          <button class="search-btn">
            <span class="search-icon">🔍</span>
          </button>
        </div>
        
        <style>
          .product-search {
            margin-bottom: 1rem;
          }
          
          .search-container {
            display: flex;
            gap: 0.5rem;
            max-width: 500px;
          }
          
          .search-input-wrapper {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
          }
          
          .search-input {
            width: 100%;
            padding: 12px 16px;
            padding-right: 40px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            background: white;
          }
          
          .search-input:focus {
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
          }
          
          .search-clear {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
            padding: 5px;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, color 0.2s;
          }
          
          .search-clear:hover {
            background: #f0f0f0;
            color: #666;
          }
          
          .search-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 50px;
          }
          
          .search-btn:hover {
            background: #2980b9;
          }
          
          .search-btn:active {
            transform: translateY(1px);
          }
          
          .search-icon {
            font-size: 18px;
          }
          
          @media (max-width: 768px) {
            .search-container {
              max-width: 100%;
            }
            
            .search-input {
              font-size: 16px; /* Prevent zoom on iOS */
            }
          }
        </style>
      </div>
    `;
  }

  initialize(container) {
    this.container = container;
    
    const searchInput = container.querySelector('.search-input');
    const searchBtn = container.querySelector('.search-btn');
    const clearBtn = container.querySelector('.search-clear');
    
    if (searchInput) {
      // Handle input with debouncing
      searchInput.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        
        // Show/hide clear button
        clearBtn.style.display = value ? 'flex' : 'none';
        
        // Debounced search
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.performSearch(value);
        }, this.debounceDelay);
      });
      
      // Handle Enter key
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          clearTimeout(this.debounceTimer);
          this.performSearch(searchInput.value.trim());
        }
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearTimeout(this.debounceTimer);
        this.performSearch(searchInput.value.trim());
      });
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        this.performSearch('');
      });
    }
    
    console.log('✅ ProductSearch initialized');
  }

  performSearch(term) {
    console.log('🔍 Searching for:', term);
    this.onSearch(term);
  }

  setValue(value) {
    const searchInput = this.container?.querySelector('.search-input');
    const clearBtn = this.container?.querySelector('.search-clear');
    
    if (searchInput) {
      searchInput.value = value;
      if (clearBtn) {
        clearBtn.style.display = value ? 'flex' : 'none';
      }
    }
  }

  clear() {
    this.setValue('');
    this.performSearch('');
  }

  focus() {
    const searchInput = this.container?.querySelector('.search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }

  destroy() {
    clearTimeout(this.debounceTimer);
    this.container = null;
  }
}

export default ProductSearch;