import { build } from 'esbuild';
import { NativeFederationPlugin } from '@native-federation/core';
import { federationConfig } from './federation.config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.argv.includes('--dev');

async function buildHost() {
  try {
    console.log('🏗️  Building E-commerce Host Application...');
    
    // Create Native Federation plugin
    const federationPlugin = new NativeFederationPlugin({
      ...federationConfig,
      workspaceRoot: __dirname,
      outputPath: path.join(__dirname, 'dist'),
      dev: isDev
    });

    const buildOptions = {
      entryPoints: [
        'src/main.js',
        'src/index.html'
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
        federationPlugin.createEsbuildPlugin(),
        
        // HTML plugin
        {
          name: 'html-plugin',
          setup(build) {
            build.onLoad({ filter: /\.html$/ }, async (args) => {
              const fs = await import('fs/promises');
              const html = await fs.readFile(args.path, 'utf8');
              return {
                contents: html,
                loader: 'copy'
              };
            });
          }
        }
      ],
      
      loader: {
        '.html': 'copy',
        '.css': 'css',
        '.png': 'file',
        '.jpg': 'file',
        '.svg': 'text'
      },
      
      define: {
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
        'process.env.API_URL': JSON.stringify('http://localhost:3001/api')
      }
    };

    const result = await build(buildOptions);
    
    console.log('✅ Build completed successfully!');
    
    if (isDev) {
      console.log('\n📊 Build Stats:');
      console.log(`- Output: ${path.resolve('dist')}`);
      console.log(`- Federation manifest: dist/federation.manifest.json`);
      console.log(`- Import map: dist/importmap.json`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildHost();