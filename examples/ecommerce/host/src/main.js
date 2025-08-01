// E-commerce Host Application
import { loadRemoteModule } from '@native-federation/core/runtime';

console.log('🛒 E-commerce Host Application Starting...');

class EcommerceApp {
  constructor() {
    this.container = document.getElementById('app');
    this.currentRoute = window.location.pathname;
    this.cart = [];
    this.user = null;
    
    this.initializeApp();
    this.setupRouting();
  }

  async initializeApp() {
    try {
      console.log('🔧 Initializing Native Federation...');
      
      // Show loading state
      this.showLoading();
      
      // Initialize shared state
      await this.initializeSharedState();
      
      // Load initial components
      await this.loadSharedComponents();
      
      // Render application
      await this.render();
      
      console.log('✅ Application initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showError('Failed to load application. Please try again.');
    }
  }

  async initializeSharedState() {
    // Initialize global state that will be shared across micro-frontends
    window.__ECOMMERCE_SHARED__ = {
      cart: this.cart,
      user: this.user,
      
      // Global actions
      addToCart: (product) => {
        this.cart.push(product);
        this.updateCartBadge();
        console.log('🛒 Added to cart:', product);
      },
      
      removeFromCart: (productId) => {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartBadge();
        console.log('🗑️ Removed from cart:', productId);
      },
      
      setUser: (userData) => {
        this.user = userData;
        this.updateUserDisplay();
        console.log('👤 User updated:', userData);
      },
      
      navigate: (path) => {
        this.navigate(path);
      }
    };
  }

  async loadSharedComponents() {
    try {
      // Load shared UI components
      const { Button, Modal, Card } = await loadRemoteModule('ui-components', './components');
      
      // Make components globally available
      window.__SHARED_COMPONENTS__ = {
        Button,
        Modal, 
        Card
      };
      
      console.log('🎨 Shared UI components loaded');
      
    } catch (error) {
      console.warn('⚠️ Could not load shared components, using fallback UI');
      this.setupFallbackComponents();
    }
  }

  setupFallbackComponents() {
    // Fallback components if shared library fails to load
    window.__SHARED_COMPONENTS__ = {
      Button: (props) => {
        const btn = document.createElement('button');
        btn.textContent = props.text || 'Button';
        btn.className = 'btn btn-primary';
        if (props.onClick) btn.onclick = props.onClick;
        return btn;
      },
      
      Card: (props) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = props.content || '';
        return card;
      }
    };
  }

  async render() {
    this.container.innerHTML = '';
    
    // Create main layout
    const layout = this.createLayout();
    this.container.appendChild(layout);
    
    // Load content based on current route
    await this.loadRouteContent();
  }

  createLayout() {
    const layout = document.createElement('div');
    layout.className = 'app-layout';
    
    layout.innerHTML = `
      <!-- Header -->
      <header class="app-header">
        <div class="container">
          <h1 class="logo">🛒 FederatedMart</h1>
          
          <nav class="main-nav">
            <a href="/" data-route="/">Home</a>
            <a href="/products" data-route="/products">Products</a>
            <a href="/cart" data-route="/cart">Cart (<span id="cart-count">0</span>)</a>
            <a href="/profile" data-route="/profile">Profile</a>
          </nav>
          
          <div class="user-actions">
            <span id="user-display">Guest</span>
            <button id="login-btn" class="btn btn-outline">Login</button>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="app-main">
        <div class="container">
          <div id="route-content" class="route-content">
            <!-- Dynamic content loaded here -->
          </div>
        </div>
      </main>
      
      <!-- Footer -->
      <footer class="app-footer">
        <div class="container">
          <p>&copy; 2024 FederatedMart - Powered by Native Federation</p>
        </div>
      </footer>
    `;
    
    return layout;
  }

  setupRouting() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        this.navigate(route);
      }
    });
    
    // Handle back/forward buttons
    window.addEventListener('popstate', () => {
      this.loadRouteContent();
    });
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.currentRoute = path;
    this.loadRouteContent();
    this.updateActiveNav();
  }

  async loadRouteContent() {
    const contentContainer = document.getElementById('route-content');
    
    if (!contentContainer) return;
    
    try {
      contentContainer.innerHTML = '<div class="loading">Loading...</div>';
      
      switch (this.currentRoute) {
        case '/':
          await this.loadHomePage();
          break;
          
        case '/products':
          await this.loadProductsPage();
          break;
          
        case '/cart':
          await this.loadCartPage();
          break;
          
        case '/profile':
          await this.loadProfilePage();
          break;
          
        default:
          this.load404Page();
      }
      
    } catch (error) {
      console.error('❌ Failed to load route content:', error);
      this.showError('Failed to load page content');
    }
  }

  async loadHomePage() {
    const content = document.getElementById('route-content');
    content.innerHTML = `
      <div class="home-page">
        <section class="hero">
          <h2>Welcome to FederatedMart</h2>
          <p>Experience the future of e-commerce with micro-frontend architecture</p>
          <button class="btn btn-primary" onclick="app.navigate('/products')">
            Shop Now
          </button>
        </section>
        
        <section class="features">
          <h3>Powered by Native Federation</h3>
          <div class="feature-grid">
            <div class="feature-card">
              <h4>🏗️ Micro-Frontend Architecture</h4>
              <p>Each section is an independent application</p>
            </div>
            <div class="feature-card">
              <h4>🚀 Dynamic Loading</h4>
              <p>Components load on-demand for optimal performance</p>
            </div>
            <div class="feature-card">
              <h4>🔧 No Webpack Required</h4>
              <p>Uses native ES modules and import maps</p>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  async loadProductsPage() {
    try {
      console.log('📦 Loading Products micro-frontend...');
      
      // Load the products micro-frontend
      const productsModule = await loadRemoteModule('products', './ProductCatalog');
      
      // Get container and render products
      const content = document.getElementById('route-content');
      
      if (productsModule.render) {
        content.innerHTML = productsModule.render();
        
        // Initialize the products component if it has initialization
        if (productsModule.initialize) {
          productsModule.initialize(content);
        }
      } else {
        throw new Error('Products module does not export render function');
      }
      
      console.log('✅ Products page loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      this.showFallbackProductsPage();
    }
  }

  async loadCartPage() {
    try {
      console.log('🛒 Loading Cart micro-frontend...');
      
      const cartModule = await loadRemoteModule('cart', './ShoppingCart');
      
      const content = document.getElementById('route-content');
      
      if (cartModule.render) {
        content.innerHTML = cartModule.render(this.cart);
        
        if (cartModule.initialize) {
          cartModule.initialize(content, this.cart);
        }
      }
      
      console.log('✅ Cart page loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load cart:', error);
      this.showFallbackCartPage();
    }
  }

  async loadProfilePage() {
    try {
      console.log('👤 Loading User Profile micro-frontend...');
      
      const userModule = await loadRemoteModule('user', './UserProfile');
      
      const content = document.getElementById('route-content');
      
      if (userModule.render) {
        content.innerHTML = userModule.render(this.user);
        
        if (userModule.initialize) {
          userModule.initialize(content, this.user);
        }
      }
      
      console.log('✅ Profile page loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load profile:', error);
      this.showFallbackProfilePage();
    }
  }

  // Fallback pages when micro-frontends fail to load
  showFallbackProductsPage() {
    const content = document.getElementById('route-content');
    content.innerHTML = `
      <div class="fallback-page">
        <h2>Products (Fallback)</h2>
        <p>The products micro-frontend is temporarily unavailable.</p>
        <div class="error-actions">
          <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        </div>
      </div>
    `;
  }

  showFallbackCartPage() {
    const content = document.getElementById('route-content');
    content.innerHTML = `
      <div class="fallback-page">
        <h2>Shopping Cart (Fallback)</h2>
        <p>Cart items: ${this.cart.length}</p>
        <div class="cart-items">
          ${this.cart.map(item => `<div class="cart-item">${item.name} - $${item.price}</div>`).join('')}
        </div>
      </div>
    `;
  }

  showFallbackProfilePage() {
    const content = document.getElementById('route-content');
    content.innerHTML = `
      <div class="fallback-page">
        <h2>User Profile (Fallback)</h2>
        <p>Profile features are temporarily unavailable.</p>
        <button onclick="location.reload()" class="btn btn-primary">Retry</button>
      </div>
    `;
  }

  load404Page() {
    const content = document.getElementById('route-content');
    content.innerHTML = `
      <div class="error-page">
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <button onclick="app.navigate('/')" class="btn btn-primary">Go Home</button>
      </div>
    `;
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.textContent = this.cart.length;
    }
  }

  updateUserDisplay() {
    const display = document.getElementById('user-display');
    const loginBtn = document.getElementById('login-btn');
    
    if (display && loginBtn) {
      if (this.user) {
        display.textContent = this.user.name;
        loginBtn.textContent = 'Logout';
      } else {
        display.textContent = 'Guest';
        loginBtn.textContent = 'Login';
      }
    }
  }

  updateActiveNav() {
    document.querySelectorAll('[data-route]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-route') === this.currentRoute);
    });
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="loading-screen">
        <div class="loading-spinner"></div>
        <h2>Loading FederatedMart...</h2>
        <p>Initializing micro-frontends...</p>
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-screen">
        <h2>⚠️ Application Error</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn btn-primary">Reload</button>
      </div>
    `;
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EcommerceApp();
});

// Export for debugging
export { EcommerceApp };