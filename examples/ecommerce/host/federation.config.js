// E-commerce Host - Federation Configuration
export const federationConfig = {
  name: 'ecommerce-host',
  
  // Remote micro-frontends
  remotes: {
    // Product catalog service
    'products': {
      entry: 'http://localhost:4001/remoteEntry.js',
      url: 'http://localhost:4001'
    },
    
    // Shopping cart service  
    'cart': {
      entry: 'http://localhost:4002/remoteEntry.js',
      url: 'http://localhost:4002'
    },
    
    // User profile service
    'user': {
      entry: 'http://localhost:4003/remoteEntry.js', 
      url: 'http://localhost:4003'
    },
    
    // Shared UI components
    'ui-components': {
      entry: 'http://localhost:4004/remoteEntry.js',
      url: 'http://localhost:4004'
    }
  },
  
  // Shared dependencies
  shared: {
    // Core utilities
    'lodash': { singleton: true, requiredVersion: '^4.17.0' },
    'axios': { singleton: true, requiredVersion: '^1.0.0' },
    
    // React ecosystem (if using React)
    'react': { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
    
    // State management
    'zustand': { singleton: true, requiredVersion: '^4.0.0' },
    
    // Styling
    'styled-components': { singleton: true, requiredVersion: '^6.0.0' }
  },
  
  // Development settings
  dev: process.env.NODE_ENV === 'development',
  verbose: true
};