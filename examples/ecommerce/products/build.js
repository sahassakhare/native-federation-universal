import { build } from 'esbuild';
import { NativeFederationPlugin } from '@native-federation/core';
import { federationConfig } from './federation.config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.argv.includes('--dev');

async function buildProducts() {
  try {
    console.log('🛍️  Building Products Micro-Frontend...');
    
    // Create Native Federation plugin
    const federationPlugin = new NativeFederationPlugin({
      ...federationConfig,
      workspaceRoot: __dirname,
      outputPath: path.join(__dirname, 'dist'),
      dev: isDev
    });

    const buildOptions = {
      entryPoints: [
        'src/ProductCatalog.js',
        'src/components/ProductCard.js',
        'src/components/ProductGrid.js',
        'src/components/ProductSearch.js',
        'src/components/ProductFilters.js'
      ],
      bundle: true,
      outdir: 'dist',
      format: 'esm',
      target: 'es2020',
      platform: 'browser',
      splitting: true,
      sourcemap: isDev,
      minify: !isDev,
      metafile: true,
      
      // Add Native Federation plugin
      plugins: [
        federationPlugin.createEsbuildPlugin()
      ],
      
      loader: {
        '.css': 'css',
        '.png': 'file',
        '.jpg': 'file',
        '.svg': 'text'
      },
      
      define: {
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
        'process.env.API_URL': JSON.stringify('http://localhost:3001/api/products')
      },
      
      external: [
        // External dependencies that should be loaded from shared
        'lodash',
        'axios'
      ]
    };

    const result = await build(buildOptions);
    
    console.log('✅ Products MFE build completed successfully!');
    
    if (isDev) {
      console.log('\n📊 Build Stats:');
      console.log(`- Output: ${path.resolve('dist')}`);
      console.log(`- Remote entry: dist/remoteEntry.js`);
      console.log(`- Exposed modules:`);
      Object.entries(federationConfig.exposes).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Products MFE build failed:', error);
    process.exit(1);
  }
}

buildProducts();