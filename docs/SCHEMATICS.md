# Native Federation Schematics

This document provides comprehensive guidance on using Native Federation schematics to migrate from Webpack Module Federation to Native Federation.

## Overview

Native Federation schematics are Angular CLI code generation tools that automate the migration process from Webpack Module Federation to Native Federation. They analyze your existing configuration, update dependencies, transform runtime code, and set up the new build system.

## Installation

First, ensure you have built and packed the schematics:

```bash
npm run build:schematics
cd dist/native-federation-schematics
npm pack
```

Then install the schematics globally or locally:

```bash
# Global installation
npm install -g native-federation-schematics-1.0.0.tgz

# Local installation
npm install native-federation-schematics-1.0.0.tgz --save-dev
```

## Available Schematics

### 1. Analyze (`ng-mf:analyze`)

Analyzes your existing Webpack Module Federation configuration without making any changes.

**Usage:**
```bash
ng generate @native-federation/schematics:analyze

# With options
ng generate @native-federation/schematics:analyze --configPath=webpack.config.ts --output=analysis-report.json
```

**Options:**
- `--configPath` (string): Path to webpack configuration file (default: `webpack.config.js`)
- `--output` (string): Path to save analysis report (optional)

**Example:**
```bash
# Analyze default webpack config
ng generate @native-federation/schematics:analyze

# Analyze custom config and save report
ng generate @native-federation/schematics:analyze --configPath=apps/shell/webpack.config.js --output=migration-analysis.json
```

### 2. Migrate (`ng-mf:migrate`)

Complete migration from Webpack Module Federation to Native Federation. This is the main schematic that orchestrates the entire migration process.

**Usage:**
```bash
ng generate @native-federation/schematics:migrate --project=your-app

# With options
ng generate @native-federation/schematics:migrate --project=shell --webpackConfig=webpack.config.ts --verbose
```

**Options:**
- `--project` (string, required): The name of the Angular project to migrate
- `--webpackConfig` (string): Path to webpack configuration file (default: `webpack.config.js`)
- `--skipPackageJson` (boolean): Skip updating package.json dependencies (default: `false`)
- `--skipBuildConfig` (boolean): Skip creating esbuild configuration (default: `false`)
- `--skipRuntimeUpdate` (boolean): Skip updating runtime imports (default: `false`)
- `--dryRun` (boolean): Run migration analysis without making changes (default: `false`)
- `--verbose` (boolean): Enable verbose logging (default: `false`)

**Example:**
```bash
# Basic migration
ng generate @native-federation/schematics:migrate --project=shell

# Migration with dry run (preview changes)
ng generate @native-federation/schematics:migrate --project=shell --dryRun

# Custom webpack config location
ng generate @native-federation/schematics:migrate --project=mfe1 --webpackConfig=apps/mfe1/webpack.config.js

# Skip package.json updates (useful for monorepos)
ng generate @native-federation/schematics:migrate --project=mfe1 --skipPackageJson
```

### 3. Convert Config (`ng-mf:convert-config`)

Converts Webpack Module Federation configuration to Native Federation configuration.

**Usage:**
```bash
ng generate @native-federation/schematics:convert-config

# With options
ng generate @native-federation/schematics:convert-config --input=webpack.config.ts --output=federation.config.ts
```

**Options:**
- `--input` (string): Input webpack config file path (default: `webpack.config.js`)
- `--output` (string): Output federation config file path (default: `federation.config.js`)
- `--format` (string): Output format - 'js' or 'ts' (default: `js`)

**Example:**
```bash
# Convert default webpack config
ng generate @native-federation/schematics:convert-config

# Convert TypeScript config
ng generate @native-federation/schematics:convert-config --input=webpack.config.ts --output=federation.config.ts --format=ts
```

### 4. Update Runtime (`ng-mf:update-runtime`)

Updates runtime imports and federation API calls in your source code.

**Usage:**
```bash
ng generate @native-federation/schematics:update-runtime

# With options
ng generate @native-federation/schematics:update-runtime --sourceRoot=src --include="**/*.ts" --exclude="**/*.spec.ts"
```

**Options:**
- `--sourceRoot` (string): Source root directory (default: `src`)
- `--include` (string): Glob pattern for files to include (default: `**/*.{ts,js}`)
- `--exclude` (string): Glob pattern for files to exclude (default: `**/*.{spec.ts,test.ts}`)

**Example:**
```bash
# Update all TypeScript files
ng generate @native-federation/schematics:update-runtime

# Update specific directory only
ng generate @native-federation/schematics:update-runtime --sourceRoot=apps/shell/src --include="**/*.ts"
```

### 5. Setup Build (`ng-mf:setup-build`)

Sets up esbuild configuration for Native Federation.

**Usage:**
```bash
ng generate @native-federation/schematics:setup-build

# With options
ng generate @native-federation/schematics:setup-build --configPath=esbuild.config.js --target=es2020
```

**Options:**
- `--configPath` (string): Path for esbuild configuration file (default: `esbuild.config.js`)
- `--target` (string): ECMAScript target version (default: `es2022`)
- `--platform` (string): Build platform - 'browser' or 'node' (default: `browser`)

**Example:**
```bash
# Basic setup
ng generate @native-federation/schematics:setup-build

# Custom configuration
ng generate @native-federation/schematics:setup-build --configPath=build.config.js --target=es2020
```

## Migration Workflow

### Step 1: Analysis (Recommended)

Before migrating, analyze your current setup:

```bash
ng generate @native-federation/schematics:analyze --output=analysis.json
```

Review the analysis to understand:
- Configuration type (host/remote/host-remote)
- Exposed modules
- Remote dependencies
- Shared dependencies

### Step 2: Full Migration

Run the complete migration:

```bash
ng generate @native-federation/schematics:migrate --project=your-project-name
```

This will:
1. Analyze your webpack configuration
2. Update package.json dependencies
3. Convert federation configuration
4. Update runtime imports in your code
5. Set up esbuild configuration

### Step 3: Verification

After migration, verify the changes:

```bash
# Build your project
ng build your-project-name

# Check generated federation config
cat federation.config.js

# Check updated dependencies
npm list @native-federation/core
```

## Migration Examples

### Example 1: Simple Host Application

Original webpack.config.js:
```javascript
const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        mfe1: "mfe1@http://localhost:4201/remoteEntry.js",
        mfe2: "mfe2@http://localhost:4202/remoteEntry.js"
      },
      shared: {
        "@angular/core": { singleton: true },
        "@angular/common": { singleton: true }
      }
    })
  ]
};
```

Migration command:
```bash
ng generate @native-federation/schematics:migrate --project=shell
```

Generated federation.config.js:
```javascript
import { NativeFederationConfig } from '@native-federation/core';

const config: NativeFederationConfig = {
  name: 'shell',
  remotes: {
    mfe1: 'http://localhost:4201/',
    mfe2: 'http://localhost:4202/'
  },
  shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true }
  }
};

export default config;
```

### Example 2: Remote Application

Original webpack.config.js:
```javascript
const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "mfe1",
      filename: "remoteEntry.js",
      exposes: {
        "./Component": "./src/app/my-component/my-component.component.ts"
      },
      shared: {
        "@angular/core": { singleton: true }
      }
    })
  ]
};
```

Migration command:
```bash
ng generate @native-federation/schematics:migrate --project=mfe1
```

Generated federation.config.js:
```javascript
import { NativeFederationConfig } from '@native-federation/core';

const config: NativeFederationConfig = {
  name: 'mfe1',
  exposes: {
    './Component': './src/app/my-component/my-component.component.ts'
  },
  shared: {
    '@angular/core': { singleton: true }
  }
};

export default config;
```

## Code Transformations

The schematics automatically transform your code:

### Runtime Import Updates

**Before:**
```typescript
import { loadRemoteModule } from '@module-federation/runtime';

// Load remote component
const component = await loadRemoteModule({
  remoteName: 'mfe1',
  exposedModule: './Component'
});
```

**After:**
```typescript
import { loadRemoteModule } from '@native-federation/core';

// Load remote component
const component = await loadRemoteModule('mfe1', './Component');
```

### Dynamic Import Updates

**Before:**
```typescript
const mfe1 = await import('mfe1/Component');
```

**After:**
```typescript
import { loadRemoteModule } from '@native-federation/core';
const mfe1 = await loadRemoteModule('mfe1', './Component');
```

## Angular Integration

### Service Integration

After migration, you can use the Native Federation service:

```typescript
import { Component, inject } from '@angular/core';
import { NativeFederationService } from '@native-federation/core';

@Component({
  selector: 'app-remote-loader',
  template: `<div #container></div>`
})
export class RemoteLoaderComponent {
  private federation = inject(NativeFederationService);

  async loadRemoteComponent() {
    const component = await this.federation.loadRemoteModule('mfe1', './Component');
    // Use component...
  }
}
```

### Directive Usage

Use the built-in directive for easy component loading:

```typescript
import { LoadFederatedComponentDirective } from '@native-federation/core';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [LoadFederatedComponentDirective],
  template: `
    <div [loadFederatedComponent]="{ 
      remoteName: 'mfe1', 
      exposedModule: './Component' 
    }"></div>
  `
})
export class ShellComponent {}
```

## Troubleshooting

### Common Issues

1. **Schematic not found**
   ```bash
   Error: Schematic "@native-federation/schematics:migrate" not found
   ```
   **Solution:** Ensure the package is properly installed and built.

2. **Webpack config not found**
   ```bash
   Error: Webpack config not found at: webpack.config.js
   ```
   **Solution:** Specify the correct path with `--webpackConfig` option.

3. **Project not found**
   ```bash
   Error: Project 'my-app' not found
   ```
   **Solution:** Check project name in `angular.json` and use exact name.

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
ng generate @native-federation/schematics:migrate --project=shell --verbose
```

### Dry Run

Preview changes without applying them:

```bash
ng generate @native-federation/schematics:migrate --project=shell --dryRun
```

## Best Practices

1. **Always analyze first**: Use the analyze schematic before migration
2. **Use dry run**: Preview changes with `--dryRun` before applying
3. **Backup your code**: Commit changes before running schematics
4. **Test after migration**: Verify your application works after migration
5. **Incremental migration**: Migrate one project at a time in monorepos

## Advanced Usage

### Custom Templates

You can extend the schematics with custom templates:

```bash
# Copy schematics source
cp -r node_modules/@native-federation/schematics/src ./custom-schematics

# Modify templates
# Build custom schematics
# Use custom schematics
```

### Programmatic Usage

Use schematics programmatically:

```typescript
import { Tree } from '@angular-devkit/schematics';
import { migrate } from '@native-federation/schematics';

const tree: Tree = // ... create tree
const options = { project: 'shell', verbose: true };

migrate(options)(tree, context);
```

## Next Steps

After successful migration:

1. Update your build scripts to use esbuild
2. Test all federated components
3. Update CI/CD pipelines
4. Refer to [BUILD.md](../BUILD.md) for build instructions
5. Check [MIGRATION.md](./MIGRATION.md) for additional migration guidance

## Support

For issues and questions:
- Check the [troubleshooting section](#troubleshooting)
- Review build errors in [BUILD.md](../BUILD.md)
- File issues on the GitHub repository