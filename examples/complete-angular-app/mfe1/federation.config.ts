// MFE1 (Products) - federation.config.ts
import { NativeFederationPlugin, shareAll, singleton, createFederationConfig } from '@native-federation/core';

const isDev = process.env['NODE_ENV'] === 'development';

export const federationConfig = createFederationConfig()
  .name('mfe1')
  .exposes({
    // Main feature modules
    './ProductsModule': './src/app/products/products.module.ts',
    './ProductListComponent': './src/app/products/product-list/product-list.component.ts',
    './ProductDetailComponent': './src/app/products/product-detail/product-detail.component.ts',
    
    // Standalone components
    './DynamicComponent': './src/app/components/dynamic/dynamic.component.ts',
    './ProductCardComponent': './src/app/components/product-card/product-card.component.ts',
    
    // Services
    './ProductService': './src/app/services/product.service.ts',
    './CartService': './src/app/services/cart.service.ts',
    
    // Routes
    './ProductRoutes': './src/app/products/products.routes.ts'
  })
  .shared({
    // Angular core packages as singletons
    '@angular/core': singleton({
      strictVersion: true,
      requiredVersion: '^16.0.0'
    }),
    '@angular/common': singleton({
      strictVersion: true,
      requiredVersion: '^16.0.0'
    }),
    '@angular/router': singleton({
      strictVersion: true,
      requiredVersion: '^16.0.0'
    }),
    '@angular/forms': singleton({
      strictVersion: true,
      requiredVersion: '^16.0.0'
    }),
    
    // RxJS as singleton
    'rxjs': singleton({
      strictVersion: false,
      requiredVersion: '^7.0.0'
    }),
    
    // Share all other dependencies
    ...shareAll({
      singleton: false,
      strictVersion: false,
      requiredVersion: 'auto'
    })
  })
  .skip([
    // Skip packages not needed at runtime
    'rxjs/ajax',
    'rxjs/testing',
    '@angular/platform-server',
    '@angular/service-worker',
    'typescript',
    'esbuild',
    '@angular/compiler',
    'jest',
    'jasmine',
    'karma',
    'eslint'
  ])
  .dev(isDev)
  .verbose(isDev)
  .build();

export default federationConfig;