# Bundlers + Native Federation Examples

This directory contains examples of using Native Federation with different bundlers, showcasing how the same federation setup works across various build tools.

## Available Examples

### [Webpack Example](./webpack-example/)
Traditional webpack setup with Native Federation for enterprise Angular applications.
- **Use Case**: Large enterprise applications, existing webpack infrastructure
- **Performance**: Baseline (traditional)
- **Compatibility**: Extensive plugin ecosystem
- **Learning Curve**: Moderate to high

### [esbuild Example](./esbuild-example/)
Ultra-fast esbuild setup (Angular 17+ default bundler).
- **Use Case**: Modern Angular applications, development speed priority
- **Performance**: Extremely fast (~500ms builds)
- **Compatibility**: Limited plugin ecosystem
- **Learning Curve**: Low

### [Vite Example](./vite-example/)
Modern development experience with Vite and instant HMR.
- **Use Case**: Modern applications, best DX priority
- **Performance**: Instant dev server, fast builds
- **Compatibility**: Rich plugin ecosystem
- **Learning Curve**: Low to moderate

### [Rspack Example](./rspack-example/)
Rust-powered bundler with webpack compatibility.
- **Use Case**: Migration from webpack, performance + compatibility
- **Performance**: 10x faster than webpack
- **Compatibility**: Drop-in webpack replacement
- **Learning Curve**: Low (if familiar with webpack)

## Performance Comparison

| Bundler | Dev Server Start | Build Time | HMR Speed | Bundle Size | Memory Usage |
|---------|------------------|------------|-----------|-------------|--------------|
| **esbuild** | ~300ms | ~500ms | <100ms | Smallest | Lowest |
| **Vite** | ~200ms | ~1-2s | <50ms | Small | Low |
| **Rspack** | ~1s | ~1-2s | ~100ms | Medium | Medium |
| **webpack** | ~5-10s | ~10-20s | ~1-3s | Largest | Highest |

## Feature Comparison

| Feature | webpack | esbuild | Vite | Rspack |
|---------|---------|---------|------|--------|
| **TypeScript** | Yes (ts-loader) | Yes (Built-in) | Yes (Built-in) | Yes (SWC loader) |
| **CSS Processing** | Yes (Loaders) | Yes (Basic) | Yes (Advanced) | Yes (Lightning CSS) |
| **Code Splitting** | Yes (Advanced) | Yes (Basic) | Yes (Advanced) | Yes (Advanced) |
| **Tree Shaking** | Yes (Good) | Yes (Excellent) | Yes (Excellent) | Yes (Good) |
| **Plugin Ecosystem** | Yes (Huge) | Limited | Yes (Rich) | Yes (webpack compatible) |
| **Angular Support** | Yes (Native) | Yes (CLI default) | Yes (@analogjs) | Yes (Compatible) |

## Native Federation Benefits Across All Bundlers

### Standards-Based
- Uses native ES modules instead of bundler-specific formats
- Works with any bundler that supports ES modules
- Future-proof architecture

### Smaller Bundles
- No federation runtime overhead
- Better tree-shaking than Module Federation
- Shared dependencies through import maps

### Better Performance
- Direct ES module imports
- No wrapper code generation
- Optimal caching strategies

### Bundler Agnostic
- Same federation config works across all bundlers
- Easy migration between build tools
- No vendor lock-in

## Choosing the Right Bundler

### Choose **esbuild** if:
- You're using Angular 17+
- Development speed is critical
- You want minimal configuration
- Bundle size optimization is important

### Choose **Vite** if:
- You want the best development experience
- You're building modern applications
- Instant HMR is important
- You like rich tooling

### Choose **Rspack** if:
- You're migrating from webpack
- You need webpack compatibility
- You want significant speed improvements
- You have existing webpack infrastructure

### Choose **webpack** if:
- You have complex build requirements
- You need extensive plugin support
- You're working with legacy applications
- You have existing webpack expertise

## Getting Started

Each example includes:
- Complete working setup
- Federation configuration
- Host and remote applications
- Performance optimizations
- Troubleshooting guides

### Quick Start

1. Choose your bundler example
2. Navigate to the example directory
3. Follow the README instructions
4. Run the demo applications

### Common Setup

All examples follow the same pattern:
```bash
cd bundler-example/host
npm install
npm run dev --port 4200

# In another terminal
cd bundler-example/remote  
npm install
npm run dev --port 4201
```

## Migration Guide

### From webpack to esbuild
1. Update Angular to 17+
2. Remove webpack-specific configurations
3. Use Angular CLI's built-in esbuild support
4. Add Native Federation plugin

### From webpack to Vite
1. Install @analogjs/vite-plugin-angular
2. Create vite.config.ts
3. Update package.json scripts
4. Add Native Federation plugin

### From webpack to Rspack
1. Replace webpack with @rspack/core
2. Rename webpack.config.js to rspack.config.js
3. Update builtin loaders (optional)
4. Keep Native Federation plugin as-is

## Best Practices

### Development
- Use the fastest bundler for development (esbuild/Vite)
- Enable HMR for better DX
- Use source maps for debugging

### Production
- Optimize for bundle size and performance
- Enable tree-shaking
- Use appropriate chunking strategies

### Federation
- Keep federation config consistent across bundlers
- Use shared dependencies wisely
- Test cross-bundler compatibility

## Troubleshooting

### Common Issues
1. **CORS errors**: Configure dev server headers
2. **Module resolution**: Check external dependencies
3. **Import paths**: Ensure proper ES module syntax

### Performance Issues
1. **Slow builds**: Choose faster bundler (esbuild/Rspack)
2. **Large bundles**: Check tree-shaking configuration
3. **Slow HMR**: Consider Vite for development

### Compatibility Issues
1. **Plugin conflicts**: Check bundler compatibility
2. **Loader syntax**: Use bundler-specific loaders
3. **Configuration**: Follow bundler-specific patterns

This collection demonstrates that Native Federation works seamlessly across all major bundlers, giving you the flexibility to choose the right tool for your specific needs while maintaining the same federation architecture.