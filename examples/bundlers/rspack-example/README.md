# Rspack + Native Federation Example

This example demonstrates how to use Native Federation with Rspack, a fast Rust-based bundler that's webpack-compatible.

## Structure

```
rspack-example/
├── host/                        # Host application (Angular + Rspack)
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   └── federation-loader.service.ts
│   │   ├── main.ts
│   │   └── index.html
│   ├── rspack.config.js         # Rspack config with Native Federation
│   ├── federation.config.js     # Federation configuration
│   └── package.json
└── remote/                      # Remote micro-frontend
    ├── src/
    │   ├── app/
    │   │   └── remote.component.ts
    │   ├── main.ts
    │   └── index.html
    ├── rspack.config.js
    ├── federation.config.js
    └── package.json
```

## Key Features

### Rspack Integration
- Rust-based bundler with webpack compatibility
- 10x faster than webpack with same configuration
- Compatible with webpack plugins and loaders
- Native Federation plugin support
- Fast development builds and HMR

### Native Federation Benefits
- Perfect for Rspack's performance focus
- Smaller bundles with ES modules
- Better tree-shaking than Module Federation
- Cross-bundler compatibility
- Future-proof architecture

## Running the Example

### Terminal 1: Start Remote MFE
```bash
cd remote
npm install
npm run dev --port 4201
```

### Terminal 2: Start Host Application
```bash
cd host
npm install
npm run dev --port 4200
```

### Access Applications
- Host: http://localhost:4200
- Remote: http://localhost:4201

## Build Process

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run serve
```

The Rspack build process:
1. Fast Rust-based compilation
2. Native Federation plugin processing
3. Webpack-compatible output
4. ES module generation
5. Optimized production bundles

## Configuration Files

### rspack.config.js
```javascript
const { NativeFederationPlugin } = require('@native-federation/core');
const federationConfig = require('./federation.config.js');

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  entry: './src/main.ts',
  mode: process.env.NODE_ENV || 'development',
  
  plugins: [
    new NativeFederationPlugin(federationConfig)
  ],
  
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  decorators: true
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: true
                }
              }
            }
          }
        ]
      }
    ]
  },
  
  resolve: {
    extensions: ['.ts', '.js']
  },
  
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        angular: {
          test: /[\\/]node_modules[\\/]@angular[\\/]/,
          name: 'angular',
          chunks: 'all',
          priority: 20
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          priority: 10
        }
      }
    }
  },
  
  experiments: {
    outputModule: true
  },
  
  devServer: {
    port: 4200,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "rspack serve",
    "build": "rspack build",
    "serve": "serve dist"
  }
}
```

## Performance Comparison

### Build Speed
- **Rspack**: 10x faster than webpack
- **webpack**: Baseline
- **esbuild**: Fastest for simple builds
- **Vite**: Fast for development

### Bundle Size
- **Rspack + Native Federation**: Optimized
- **webpack + Module Federation**: Larger
- **Similar optimization** to webpack but faster

### Development Experience
- **HMR**: Fast and reliable
- **Compatibility**: Drop-in webpack replacement
- **Memory usage**: Lower than webpack

## Rspack Advantages

### Performance
```javascript
// Lightning fast builds
console.time('build');
// Rspack build completes in ~1-2s vs webpack's 10-20s
console.timeEnd('build');
```

### Webpack Compatibility
```javascript
// Most webpack plugins work out of the box
const HtmlWebpackPlugin = require('html-webpack-plugin');
// ↑ Works with Rspack
```

### Built-in Features
```javascript
// Many features built-in, no plugins needed
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'builtin:swc-loader' // Built-in TypeScript support
      }
    ]
  }
};
```

## Why Rspack + Native Federation?

1. **Speed**: 10x faster builds than webpack
2. **Compatibility**: Drop-in webpack replacement
3. **Modern**: Built with Rust for performance
4. **Ecosystem**: Use existing webpack plugins
5. **Future**: Active development by ByteDance

## Migration from Webpack

### Simple Migration
```bash
# Replace webpack with rspack
npm uninstall webpack webpack-cli
npm install @rspack/core @rspack/cli
```

### Configuration Update
```javascript
// webpack.config.js → rspack.config.js
// Most configurations work as-is
/** @type {import('@rspack/core').Configuration} */
module.exports = {
  // Same as webpack config
};
```

### Built-in Loaders
```javascript
// Use built-in loaders for better performance
{
  test: /\.ts$/,
  use: 'builtin:swc-loader' // Instead of ts-loader
}
```

## Advanced Configuration

### SWC Integration
```javascript
// Built-in SWC for TypeScript
{
  loader: 'builtin:swc-loader',
  options: {
    jsc: {
      parser: { syntax: 'typescript' },
      transform: { react: { runtime: 'automatic' } }
    }
  }
}
```

### CSS Processing
```javascript
// Built-in CSS support
{
  test: /\.css$/,
  use: ['builtin:lightningcss-loader']
}
```

### Asset Handling
```javascript
// Modern asset handling
{
  test: /\.(png|jpe?g|gif|svg)$/,
  type: 'asset/resource'
}
```

## Troubleshooting

### Common Issues

1. **Plugin compatibility**: Check Rspack plugin compatibility list
2. **Loader syntax**: Use builtin: prefix for built-in loaders
3. **Configuration**: Most webpack configs work directly

### Debug Mode
```bash
# Enable Rspack debug logging
RSPACK_PROFILE=true npm run build
```

### Performance Monitoring
```javascript
// rspack.config.js
module.exports = {
  stats: {
    timings: true,
    builtAt: true
  }
};
```

This example showcases Rspack's webpack compatibility combined with Native Federation's modern micro-frontend architecture, delivering the best of both worlds: familiar development experience with significantly improved build performance.