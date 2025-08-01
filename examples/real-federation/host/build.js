import esbuild from 'esbuild';
import { NativeFederationPlugin } from '@native-federation/core';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Federation configuration
const federationConfig = {
  name: 'host',
  remotes: {
    mfe1: 'http://localhost:4201/remoteEntry.js'
  },
  shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    '@angular/router': { singleton: true },
    'rxjs': { singleton: true }
  }
};

// Create the plugin instance
const nativeFederationPlugin = new NativeFederationPlugin({
  federationConfig,
  workspaceRoot: __dirname,
  outputPath: join(__dirname, 'dist'),
  dev: true,
  verbose: true
});

// Build configuration
const buildConfig = {
  entryPoints: ['src/main.js'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  splitting: true,
  sourcemap: true,
  plugins: [nativeFederationPlugin.createEsbuildPlugin()],
  loader: {
    '.html': 'text',
    '.css': 'css'
  }
};

// Build the application
async function build() {
  try {
    console.log('Building host application...');
    await esbuild.build(buildConfig);
    console.log('Build complete!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Development server
async function serve() {
  const server = createServer(async (req, res) => {
    try {
      let filePath = join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
      
      // Set correct content type
      const ext = filePath.split('.').pop();
      const contentTypes = {
        'html': 'text/html',
        'js': 'application/javascript',
        'css': 'text/css',
        'json': 'application/json'
      };
      
      res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      const content = await readFile(filePath);
      res.end(content);
    } catch (error) {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  server.listen(4200, () => {
    console.log('Host application running at http://localhost:4200');
  });
}

// Run build and serve
build().then(() => serve());