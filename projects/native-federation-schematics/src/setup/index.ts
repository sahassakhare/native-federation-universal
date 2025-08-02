import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { SetupSchema } from './schema';

export function setup(options: SetupSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Setting up Native Federation for a new project...');

    // Create federation.config.js
    const federationConfig = createFederationConfig(options);
    tree.create('federation.config.js', federationConfig);
    context.logger.info('✅ Created federation.config.js');

    // Create esbuild configuration
    const esbuildConfig = createEsbuildConfig(options);
    tree.create('build.js', esbuildConfig);
    context.logger.info('✅ Created build.js');

    // Update package.json
    if (!options.skipPackageJson) {
      updatePackageJson(tree, context, options);
    }

    // Create sample files if requested
    if (options.createSamples) {
      createSampleFiles(tree, context, options);
    }

    context.logger.info('\\n🎉 Native Federation setup complete!');
    context.logger.info('\\nNext steps:');
    context.logger.info('1. Install dependencies: npm install');
    context.logger.info('2. Build your project: npm run build');
    context.logger.info('3. Serve your project: npm run serve');

    return tree;
  };
}

function createFederationConfig(options: SetupSchema): string {
  const config = {
    name: options.name,
    ...(options.type === 'host' && {
      remotes: {
        // Add your remotes here
      }
    }),
    ...(options.type === 'remote' && {
      exposes: {
        './Module': './src/bootstrap.js'
      }
    }),
    shared: {
      // Add shared dependencies here
    }
  };

  return `// Native Federation Configuration
const config = ${JSON.stringify(config, null, 2)};

export default config;
`;
}

function createEsbuildConfig(options: SetupSchema): string {
  return `// Build script for Native Federation
import esbuild from 'esbuild';
// Note: Import build tools from source until separate package is available
import { NativeFederationPlugin } from '@native-federation/core/dist/native-federation/esm2022/lib/core/plugin.mjs';
import federationConfig from './federation.config.js';

const isProduction = process.env.NODE_ENV === 'production';
const isDev = !isProduction;

async function build() {
  const plugin = new NativeFederationPlugin(federationConfig);
  
  await esbuild.build({
    entryPoints: ['./src/main.js'],
    bundle: true,
    platform: 'browser',
    target: 'es2020',
    format: 'esm',
    outdir: './dist',
    sourcemap: isDev,
    minify: isProduction,
    plugins: [plugin.createEsbuildPlugin()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  });

  console.log('✅ Build completed successfully!');
}

if (isDev) {
  // Development with watch mode
  esbuild.context({
    entryPoints: ['./src/main.js'],
    bundle: true,
    platform: 'browser',
    target: 'es2020',
    format: 'esm',
    outdir: './dist',
    sourcemap: true,
    plugins: [new NativeFederationPlugin(federationConfig).createEsbuildPlugin()]
  }).then(ctx => {
    ctx.watch();
    ctx.serve({ servedir: './dist', port: ${options.port || 3000} });
    console.log('🚀 Development server running on http://localhost:${options.port || 3000}');
  });
} else {
  build().catch(console.error);
}
`;
}

function updatePackageJson(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  const packageJsonPath = 'package.json';
  
  if (!tree.exists(packageJsonPath)) {
    // Create new package.json
    const packageJson = {
      name: options.name,
      version: '1.0.0',
      type: 'module',
      scripts: {
        build: 'NODE_ENV=production node build.js',
        'build:dev': 'node build.js',
        serve: 'npm run build:dev',
        start: 'npm run serve'
      },
      devDependencies: {
        '@native-federation/core': '^1.0.0',
        'esbuild': '^0.20.0'
      }
    };
    tree.create(packageJsonPath, JSON.stringify(packageJson, null, 2));
    context.logger.info('✅ Created package.json');
  } else {
    // Update existing package.json
    const packageJsonContent = tree.read(packageJsonPath)?.toString() || '{}';
    const packageJson = JSON.parse(packageJsonContent);
    
    // Add scripts
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.build = 'NODE_ENV=production node build.js';
    packageJson.scripts['build:dev'] = 'node build.js';
    packageJson.scripts.serve = 'npm run build:dev';
    
    // Add dependencies
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies['@native-federation/core'] = '^1.0.0';
    packageJson.devDependencies['esbuild'] = '^0.20.0';
    
    // Ensure ES modules
    packageJson.type = 'module';
    
    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    context.logger.info('✅ Updated package.json');
  }
}

function createSampleFiles(tree: Tree, context: SchematicContext, options: SetupSchema): void {
  // Create src directory
  if (!tree.exists('src')) {
    tree.create('src/.gitkeep', '');
  }

  // Create main.js
  const mainJs = options.type === 'host' ? createHostMainJs() : createRemoteMainJs();
  tree.create('src/main.js', mainJs);
  
  // Create index.html
  const indexHtml = createIndexHtml(options);
  tree.create('index.html', indexHtml);

  if (options.type === 'remote') {
    tree.create('src/bootstrap.js', createBootstrapJs());
  }

  context.logger.info('✅ Created sample files');
}

function createHostMainJs(): string {
  return `// Host Application Entry Point
import { initFederation, loadRemoteModule } from '@native-federation/core';

async function bootstrap() {
  // Initialize federation
  await initFederation();
  
  // Example: Load a remote module
  // const remoteModule = await loadRemoteModule('remoteName', './Module');
  
  console.log('🚀 Host application initialized');
  
  // Your application logic here
}

bootstrap().catch(console.error);
`;
}

function createRemoteMainJs(): string {
  return `// Remote Application Entry Point
import('./bootstrap.js').catch(console.error);
`;
}

function createBootstrapJs(): string {
  return `// Remote Bootstrap
console.log('🚀 Remote application initialized');

// Export your module
export default {
  mount: (element) => {
    element.innerHTML = '<h1>Hello from Remote!</h1>';
  },
  unmount: (element) => {
    element.innerHTML = '';
  }
};
`;
}

function createIndexHtml(options: SetupSchema): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.name}</title>
</head>
<body>
    <div id="app">
        <h1>${options.name}</h1>
        <p>Native Federation ${options.type} application</p>
    </div>
    <script type="module" src="./dist/main.js"></script>
</body>
</html>
`;
}