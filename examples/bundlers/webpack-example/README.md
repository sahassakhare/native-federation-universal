# Webpack + Native Federation Example

This example demonstrates how to use Native Federation with webpack in an Angular application.

## Structure

```
webpack-example/
├── host/                      # Host application (Angular + Webpack)
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   └── federation-loader.service.ts
│   │   ├── main.ts
│   │   └── index.html
│   ├── webpack.config.js      # Custom webpack config with Native Federation
│   ├── federation.config.js   # Federation configuration
│   ├── angular.json          # Updated for custom webpack
│   └── package.json
└── remote/                    # Remote micro-frontend
    ├── src/
    │   ├── app/
    │   │   └── remote.component.ts
    │   ├── main.ts
    │   └── index.html
    ├── webpack.config.js
    ├── federation.config.js
    └── package.json
```

## Key Features

### Webpack Integration
- Uses `@angular-builders/custom-webpack` for Angular integration
- Custom webpack configuration with `NativeFederationPlugin`
- Standard `ng build` and `ng serve` commands
- Hot Module Replacement (HMR) support

### Native Federation Benefits
- ES modules instead of webpack-specific formats
- Smaller bundle sizes compared to Module Federation
- Better tree-shaking and optimization
- Import maps for shared dependencies

## Running the Example

### Terminal 1: Start Remote MFE
```bash
cd remote
npm install
ng serve --port 4201
```

### Terminal 2: Start Host Application
```bash
cd host  
npm install
ng serve --port 4200
```

### Access Applications
- Host: http://localhost:4200
- Remote: http://localhost:4201

## Build Process

### Development Build
```bash
ng build --configuration development
```

### Production Build
```bash
ng build --configuration production
```

The webpack configuration automatically:
1. Bundles the application using webpack
2. Applies Native Federation plugin
3. Generates `remoteEntry.js` for remotes
4. Creates import maps for hosts
5. Optimizes shared dependencies

## Configuration Files

### webpack.config.js
```javascript
const { NativeFederationPlugin } = require('@native-federation/core');
const federationConfig = require('./federation.config.js');

module.exports = {
  plugins: [
    new NativeFederationPlugin(federationConfig)
  ],
  optimization: {
    runtimeChunk: false,
    splitChunks: false
  },
  experiments: {
    outputModule: true
  }
};
```

### angular.json (Updated)
```json
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "builder": "@angular-builders/custom-webpack:browser",
          "options": {
            "customWebpackConfig": {
              "path": "./webpack.config.js"
            }
          }
        },
        "serve": {
          "builder": "@angular-builders/custom-webpack:dev-server"
        }
      }
    }
  }
}
```

## Advantages over Standard Module Federation

1. **Smaller Bundles**: Native ES modules are more efficient
2. **Better Tree Shaking**: Webpack can optimize ES modules better
3. **Standards Compliant**: Uses web standards, not webpack-specific APIs
4. **Faster Loading**: Direct ES module imports are faster
5. **Better Caching**: Individual modules can be cached separately

## Common Webpack Optimizations

### Code Splitting
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        angular: {
          test: /[\\/]node_modules[\\/]@angular[\\/]/,
          name: 'angular',
          chunks: 'all',
        }
      }
    }
  }
};
```

### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze bundles
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

This example shows how webpack can be effectively combined with Native Federation for enterprise Angular applications while maintaining familiar webpack workflows and optimizations.