#!/usr/bin/env node

import { program } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ProjectConfig {
  name: string;
  type: 'host' | 'remote';
  port: number;
  framework: 'angular' | 'react' | 'vue' | 'vanilla';
  typescript: boolean;
}

const version = '1.0.0';

program
  .name('native-federation')
  .description('CLI tool for Native Federation projects')
  .version(version);

program
  .command('init')
  .description('Initialize a new Native Federation project')
  .option('-n, --name <name>', 'Project name')
  .option('-t, --type <type>', 'Project type (host|remote)', 'host')
  .option('-p, --port <port>', 'Development port', '4200')
  .option('-f, --framework <framework>', 'Framework (angular|react|vue|vanilla)', 'angular')
  .option('--no-typescript', 'Use JavaScript instead of TypeScript')
  .action(async (options) => {
    const config: ProjectConfig = {
      name: options.name || path.basename(process.cwd()),
      type: options.type,
      port: parseInt(options.port),
      framework: options.framework,
      typescript: options.typescript !== false
    };

    await initProject(config);
  });

program
  .command('add-remote')
  .description('Add a remote to existing project')
  .argument('<name>', 'Remote name')
  .argument('<url>', 'Remote URL')
  .action(async (name, url) => {
    await addRemote(name, url);
  });

program
  .command('generate')
  .alias('g')
  .description('Generate federation components')
  .argument('<type>', 'Type to generate (component|service|module)')
  .argument('<name>', 'Name of the component')
  .option('--expose', 'Expose the component for federation')
  .action(async (type, name, options) => {
    await generateComponent(type, name, options);
  });

async function initProject(config: ProjectConfig) {
  console.log(` Initializing ${config.type} project: ${config.name}`);
  
  try {
    // Create basic structure
    await createProjectStructure(config);
    await createFederationConfig(config);
    await createPackageJson(config);
    
    if (config.framework === 'angular') {
      await createAngularFiles(config);
    }
    
    console.log(' Project initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. npm install');
    console.log('2. npm run build');
    console.log(`3. npm run serve (starts on port ${config.port})`);
    
  } catch (error) {
    console.error(' Failed to initialize project:', error);
    process.exit(1);
  }
}

async function createProjectStructure(config: ProjectConfig) {
  const dirs = [
    'src',
    'src/app',
    'src/app/components',
    'src/app/services',
    'dist'
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function createFederationConfig(config: ProjectConfig) {
  const template = config.type === 'host' 
    ? getHostConfigTemplate(config)
    : getRemoteConfigTemplate(config);
    
  const filename = config.typescript ? 'federation.config.ts' : 'federation.config.js';
  await fs.writeFile(filename, template);
}

function getHostConfigTemplate(config: ProjectConfig): string {
  return `import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      shared: {
        ...shareAll({
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        })
      },
      remotes: {
        // Add your remotes here
        // 'remote1': 'http://localhost:4201/remoteEntry.json'
      },
      dev: true,
      verbose: true
    })
  ]
};
`;
}

function getRemoteConfigTemplate(config: ProjectConfig): string {
  return `import { NativeFederationPlugin, shareAll } from '@native-federation/core';

export default {
  plugins: [
    new NativeFederationPlugin({
      name: '${config.name}',
      exposes: {
        // Add your exposed modules here
        // './Component': './src/app/components/my-component.ts'
      },
      shared: {
        ...shareAll({
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        })
      },
      dev: true,
      verbose: true
    })
  ]
};
`;
}

async function createPackageJson(config: ProjectConfig) {
  const packageJson = {
    name: config.name,
    version: '1.0.0',
    type: 'module',
    scripts: {
      build: 'esbuild --config=esbuild.config.js',
      serve: `http-server dist -p ${config.port} --cors`,
      dev: 'concurrently "npm run build -- --watch" "npm run serve"'
    },
    dependencies: {
      '@native-federation/core': '^1.0.0'
    },
    devDependencies: {
      'esbuild': '^0.19.0',
      'http-server': '^14.0.0',
      'concurrently': '^8.0.0'
    }
  };
  
  if (config.framework === 'angular') {
    Object.assign(packageJson.dependencies, {
      '@angular/core': '^16.0.0',
      '@angular/common': '^16.0.0',
      '@angular/platform-browser': '^16.0.0'
    });
  }
  
  if (config.typescript) {
    Object.assign(packageJson.devDependencies, {
      'typescript': '^5.0.0',
      '@types/node': '^20.0.0'
    });
  }
  
  await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
}

async function createAngularFiles(config: ProjectConfig) {
  // Create main.ts
  const mainTs = `import { initFederation } from '@native-federation/core/runtime';

async function bootstrap() {
  await initFederation();
  
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { AppComponent } = await import('./app/app.component');
  
  bootstrapApplication(AppComponent);
}

bootstrap();
`;

  await fs.writeFile('src/main.ts', mainTs);
  
  // Create app.component.ts
  const appComponent = `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: \`
    <div class="app">
      <h1>${config.name}</h1>
      <p>Native Federation ${config.type} application</p>
    </div>
  \`,
  styles: [\`
    .app {
      text-align: center;
      padding: 2rem;
    }
  \`]
})
export class AppComponent {
  title = '${config.name}';
}
`;

  await fs.writeFile('src/app/app.component.ts', appComponent);
}

async function addRemote(name: string, url: string) {
  console.log(`Adding remote: ${name} -> ${url}`);
  
  try {
    // Read existing federation config
    const configPath = 'federation.config.ts';
    let configContent = await fs.readFile(configPath, 'utf-8');
    
    // Add remote to config (simple string replacement)
    const remotesPattern = /remotes:\s*{([^}]*)}/;
    const match = configContent.match(remotesPattern);
    
    if (match) {
      const existingRemotes = match[1];
      const newRemote = `\n        '${name}': '${url}'`;
      const updatedRemotes = existingRemotes + newRemote;
      configContent = configContent.replace(remotesPattern, `remotes: {${updatedRemotes}\n      }`);
      
      await fs.writeFile(configPath, configContent);
      console.log(' Remote added successfully!');
    } else {
      console.error(' Could not find remotes section in federation.config.ts');
    }
  } catch (error) {
    console.error(' Failed to add remote:', error);
  }
}

async function generateComponent(type: string, name: string, options: any) {
  console.log(`Generating ${type}: ${name}`);
  
  if (type === 'component') {
    await generateAngularComponent(name, options.expose);
  } else {
    console.log(`Type ${type} not yet supported`);
  }
}

async function generateAngularComponent(name: string, expose: boolean) {
  const componentName = name.charAt(0).toUpperCase() + name.slice(1) + 'Component';
  const selector = name.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase();
  
  const template = `import { Component } from '@angular/core';

@Component({
  selector: '${selector}',
  standalone: true,
  template: \`
    <div class="${name}-component">
      <h2>${componentName}</h2>
      <p>Generated federation component</p>
    </div>
  \`,
  styles: [\`
    .${name}-component {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  \`]
})
export class ${componentName} {
  
}
`;

  const filePath = `src/app/components/${name}.component.ts`;
  await fs.writeFile(filePath, template);
  
  console.log(` Component created: ${filePath}`);
  
  if (expose) {
    console.log(` Add this to your federation.config.ts exposes:
        './${componentName}': './src/app/components/${name}.component.ts'`);
  }
}

program.parse();