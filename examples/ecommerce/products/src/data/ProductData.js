// Product Data Service
export class ProductData {
  static products = [
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 199.99,
      category: "Electronics",
      image: "https://via.placeholder.com/300x200/007bff/ffffff?text=Headphones",
      inStock: true,
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      name: "Organic Cotton T-Shirt",
      description: "Comfortable organic cotton t-shirt in various colors",
      price: 29.99,
      category: "Clothing",
      image: "https://via.placeholder.com/300x200/28a745/ffffff?text=T-Shirt",
      inStock: true,
      rating: 4.2,
      reviews: 89
    },
    {
      id: 3,
      name: "Smart Fitness Watch",
      description: "Advanced fitness tracking with heart rate monitoring",
      price: 299.99,
      category: "Electronics",
      image: "https://via.placeholder.com/300x200/dc3545/ffffff?text=Watch",
      inStock: false,
      rating: 4.7,
      reviews: 203
    },
    {
      id: 4,
      name: "Ergonomic Office Chair",
      description: "Comfortable office chair with lumbar support",
      price: 449.99,
      category: "Furniture",
      image: "https://via.placeholder.com/300x200/ffc107/000000?text=Chair",
      inStock: true,
      rating: 4.3,
      reviews: 156
    },
    {
      id: 5,
      name: "Stainless Steel Water Bottle",
      description: "Insulated water bottle that keeps drinks cold for 24 hours",
      price: 24.99,
      category: "Outdoor",
      image: "https://via.placeholder.com/300x200/17a2b8/ffffff?text=Bottle",
      inStock: true,
      rating: 4.6,
      reviews: 94
    },
    {
      id: 6,
      name: "Gaming Mechanical Keyboard",
      description: "RGB backlit mechanical keyboard for gaming",
      price: 159.99,
      category: "Electronics",
      image: "https://via.placeholder.com/300x200/6f42c1/ffffff?text=Keyboard",
      inStock: true,
      rating: 4.4,
      reviews: 167
    },
    {
      id: 7,
      name: "Yoga Mat Premium",
      description: "Non-slip premium yoga mat with alignment guides",
      price: 79.99,
      category: "Sports",
      image: "https://via.placeholder.com/300x200/20c997/ffffff?text=Yoga+Mat",
      inStock: true,
      rating: 4.8,
      reviews: 245
    },
    {
      id: 8,
      name: "Coffee Maker Deluxe",
      description: "Programmable coffee maker with thermal carafe",
      price: 129.99,
      category: "Appliances",
      image: "https://via.placeholder.com/300x200/fd7e14/ffffff?text=Coffee",
      inStock: true,
      rating: 4.1,
      reviews: 78
    },
    {
      id: 9,
      name: "Backpack Travel Pro",
      description: "Durable travel backpack with laptop compartment",
      price: 89.99,
      category: "Travel",
      image: "https://via.placeholder.com/300x200/6c757d/ffffff?text=Backpack",
      inStock: true,
      rating: 4.5,
      reviews: 134
    },
    {
      id: 10,
      name: "LED Desk Lamp",
      description: "Adjustable LED desk lamp with USB charging port",
      price: 59.99,
      category: "Furniture",
      image: "https://via.placeholder.com/300x200/e83e8c/ffffff?text=Lamp",
      inStock: false,
      rating: 4.3,
      reviews: 67
    },
    {
      id: 11,
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with precision tracking",
      price: 39.99,
      category: "Electronics",
      image: "https://via.placeholder.com/300x200/007bff/ffffff?text=Mouse",
      inStock: true,
      rating: 4.2,
      reviews: 112
    },
    {
      id: 12,
      name: "Running Shoes Pro",
      description: "Professional running shoes with advanced cushioning",
      price: 149.99,
      category: "Sports",
      image: "https://via.placeholder.com/300x200/28a745/ffffff?text=Shoes",
      inStock: true,
      rating: 4.6,
      reviews: 189
    }
  ];

  static getAllProducts() {
    return [...this.products];
  }

  static getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  static getProductsByCategory(category) {
    return this.products.filter(product => product.category === category);
  }

  static searchProducts(term) {
    const searchTerm = term.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }

  static getCategories() {
    return [...new Set(this.products.map(product => product.category))];
  }

  static getFeaturedProducts() {
    return this.products.filter(product => product.rating >= 4.5);
  }

  static getInStockProducts() {
    return this.products.filter(product => product.inStock);
  }

  static getProductsInPriceRange(min, max) {
    return this.products.filter(product => 
      product.price >= min && product.price <= max
    );
  }
}