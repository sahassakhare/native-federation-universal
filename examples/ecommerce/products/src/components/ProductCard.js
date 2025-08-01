// Product Card Component
export class ProductCard {
  constructor(options = {}) {
    this.product = options.product;
    this.onAddToCart = options.onAddToCart || (() => {});
    this.container = null;
  }

  render() {
    const { id, name, description, price, category, image, inStock, rating, reviews } = this.product;
    
    return `
      <div class="product-card" data-product-id="${id}">
        <div class="product-image">
          <img src="${image}" alt="${name}" loading="lazy">
          ${!inStock ? '<div class="out-of-stock-badge">Out of Stock</div>' : ''}
        </div>
        
        <div class="product-info">
          <div class="product-category">${category}</div>
          <h3 class="product-name">${name}</h3>
          <p class="product-description">${description}</p>
          
          <div class="product-rating">
            <div class="stars">
              ${this.renderStars(rating)}
            </div>
            <span class="rating-text">${rating} (${reviews} reviews)</span>
          </div>
          
          <div class="product-footer">
            <div class="product-price">$${price}</div>
            <button 
              class="add-to-cart-btn ${!inStock ? 'disabled' : ''}"
              data-product-id="${id}"
              ${!inStock ? 'disabled' : ''}
            >
              ${inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
        
        <style>
          .product-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
          }
          
          .product-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          }
          
          .product-image {
            position: relative;
            overflow: hidden;
            height: 200px;
          }
          
          .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }
          
          .product-card:hover .product-image img {
            transform: scale(1.05);
          }
          
          .out-of-stock-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #dc3545;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          
          .product-info {
            padding: 1rem;
          }
          
          .product-category {
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
          }
          
          .product-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            color: #333;
            line-height: 1.3;
          }
          
          .product-description {
            color: #666;
            font-size: 14px;
            margin: 0 0 1rem 0;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .product-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
          
          .stars {
            display: flex;
            gap: 2px;
          }
          
          .star {
            color: #ffc107;
            font-size: 14px;
          }
          
          .star.empty {
            color: #ddd;
          }
          
          .rating-text {
            font-size: 12px;
            color: #666;
          }
          
          .product-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .product-price {
            font-size: 1.25rem;
            font-weight: bold;
            color: #2c3e50;
          }
          
          .add-to-cart-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
          }
          
          .add-to-cart-btn:hover:not(.disabled) {
            background: #2980b9;
          }
          
          .add-to-cart-btn.disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          
          .add-to-cart-btn:active:not(.disabled) {
            transform: translateY(1px);
          }
        </style>
      </div>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="star">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
      starsHtml += '<span class="star">☆</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star empty">☆</span>';
    }
    
    return starsHtml;
  }

  initialize(container) {
    this.container = container;
    
    // Setup add to cart button
    const addToCartBtn = container.querySelector('.add-to-cart-btn');
    if (addToCartBtn && this.product.inStock) {
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAddToCart();
      });
    }
    
    console.log('✅ ProductCard initialized for:', this.product.name);
  }

  handleAddToCart() {
    // Disable button temporarily
    const btn = this.container.querySelector('.add-to-cart-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Adding...';
      
      // Call the callback
      this.onAddToCart(this.product);
      
      // Re-enable after a short delay
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Add to Cart';
      }, 1000);
    }
  }

  destroy() {
    this.container = null;
  }
}

export default ProductCard;