// Products MFE - Federation Configuration
export const federationConfig = {
  name: 'products',
  
  // Expose product catalog components
  exposes: {
    './ProductCatalog': './src/ProductCatalog.js',
    './ProductCard': './src/components/ProductCard.js',
    './ProductGrid': './src/components/ProductGrid.js',
    './ProductSearch': './src/components/ProductSearch.js',
    './ProductFilters': './src/components/ProductFilters.js'
  },
  
  // Shared dependencies
  shared: {
    'lodash': { singleton: true, requiredVersion: '^4.17.0' },
    'axios': { singleton: true, requiredVersion: '^1.0.0' }
  },
  
  // Remote dependencies (if needed)
  remotes: {
    'ui-components': {
      entry: 'http://localhost:4004/remoteEntry.js',
      url: 'http://localhost:4004'
    }
  },
  
  dev: process.env.NODE_ENV === 'development',
  verbose: true
};