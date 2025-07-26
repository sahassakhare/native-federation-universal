# @native-federation/schematics

Angular schematics for automating migration from Webpack Module Federation to Native Federation.

## Installation

```bash
npm install -g @angular/cli
npm install @native-federation/schematics
```

## Quick Migration

To migrate an existing webpack Module Federation project:

```bash
ng generate @native-federation/schematics:migrate --project=your-project-name
```

## Available Schematics

### `migrate`
Complete migration from webpack Module Federation to Native Federation.

```bash
ng generate @native-federation/schematics:migrate [options]
```

**Options:**
- `--project` - Project name (required)
- `--webpack-config` - Path to webpack config (default: webpack.config.js)
- `--skip-package-json` - Skip updating dependencies
- `--skip-build-config` - Skip creating esbuild config
- `--skip-runtime-update` - Skip updating runtime imports
- `--dry-run` - Show what would be changed without making changes
- `--verbose` - Enable verbose logging

### `analyze`
Analyze existing project for migration complexity and requirements.

```bash
ng generate @native-federation/schematics:analyze --project=your-project
```

**Options:**
- `--project` - Project name (required)
- `--detailed` - Generate detailed analysis report
- `--output-report` - Custom report file name

### `convert-config`
Convert webpack configuration to Native Federation configuration.

```bash
ng generate @native-federation/schematics:convert-config [options]
```

### `update-runtime`
Update runtime imports and federation calls in TypeScript files.

```bash
ng generate @native-federation/schematics:update-runtime [options]
```

### `setup-build`
Setup esbuild configuration for Native Federation.

```bash
ng generate @native-federation/schematics:setup-build [options]
```

## Migration Workflow

### 1. Pre-Migration Analysis
```bash
# Analyze your project first
ng generate @native-federation/schematics:analyze --project=my-app

# Review the generated MIGRATION_ANALYSIS.md
```

### 2. Full Migration
```bash
# Run the complete migration
ng generate @native-federation/schematics:migrate --project=my-app

# Install new dependencies
npm install
```

### 3. Post-Migration Testing
```bash
# Build with new configuration
npm run build

# Start development server
npm run dev

# Test remote module loading
```

## What Gets Migrated

### Configuration Files
- `webpack.config.js` → `federation.config.ts`
- Creates `esbuild.config.js`
- Updates `package.json` scripts and dependencies
- Updates `tsconfig.json` for ESM compatibility

### Code Changes
- Updates import statements from webpack Module Federation
- Converts `import('remote/module')` to `loadRemoteModule('remote', './module')`
- Adds federation initialization to `main.ts`
- Updates bootstrap patterns for federation

### Dependencies
- Removes webpack Module Federation packages
- Adds `@native-federation/core`
- Adds `esbuild` and development tools
- Updates build scripts

## Example: Before and After

### Before (Webpack)
```typescript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    mfe1: 'mfe1@http://localhost:4201/remoteEntry.js'
  }
});

// Runtime usage
const module = await import('mfe1/Component');
```

### After (Native Federation)
```typescript
// federation.config.ts
new NativeFederationPlugin({
  remotes: {
    mfe1: 'http://localhost:4201/remoteEntry.json'
  }
});

// Runtime usage
import { loadRemoteModule } from '@native-federation/core/runtime';
const { Component } = await loadRemoteModule('mfe1', './Component');
```

## Migration Reports

The schematics generate detailed reports:

- **`MIGRATION_ANALYSIS.md`** - Pre-migration analysis
- **`MIGRATION_REPORT.md`** - Post-migration summary
- **`RUNTIME_TRANSFORMATION_REPORT.md`** - Code changes made

## Troubleshooting

### Common Issues

1. **TypeScript errors after migration**
   - Check `tsconfig.json` ESM settings
   - Ensure all imports use `.js` extensions

2. **Build failures**
   - Verify `esbuild.config.js` is correct
   - Check for webpack-specific dependencies

3. **Runtime errors**
   - Ensure federation initialization in `main.ts`
   - Verify remote URLs are accessible

### Getting Help

- Review generated reports for specific guidance
- Use `--verbose` flag for detailed logging
- Check the [migration documentation](https://docs.native-federation.dev/migration)

## Advanced Usage

### Custom Configuration
```bash
# Migration with custom settings
ng generate @native-federation/schematics:migrate \
  --project=my-app \
  --webpack-config=custom-webpack.config.js \
  --verbose
```

### Partial Migration
```bash
# Only update runtime code
ng generate @native-federation/schematics:update-runtime --project=my-app

# Only convert configuration
ng generate @native-federation/schematics:convert-config --project=my-app
```

### Dry Run Testing
```bash
# See what would be changed
ng generate @native-federation/schematics:migrate --project=my-app --dry-run
```