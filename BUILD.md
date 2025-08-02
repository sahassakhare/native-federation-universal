# Native Federation Build Guide

This workspace contains two separate Angular libraries that need to be built independently.

## Workspace Structure

```
/
├── projects/
│   ├── native-federation/           # @native-federation/core
│   │   ├── src/lib/                # Core library source
│   │   ├── ng-package.json         # ng-packagr configuration
│   │   └── package.json            # Library dependencies
│   └── native-federation-schematics/ # @native-federation/schematics
│       ├── src/                    # Schematics source
│       ├── build.js                # Custom build script
│       ├── collection.json         # Schematics collection
│       └── tsconfig.json           # TypeScript configuration
├── angular.json                    # Angular workspace configuration
└── package.json                    # Root package.json
```

## Prerequisites

Ensure you have the required dependencies:

```bash
npm install
```

## Build Commands

### 1. Build Core Library Only
```bash
# Using npm script
npm run build:core

# Using Angular CLI directly
ng build native-federation
```

**Output:** `dist/native-federation/`

### 2. Build Schematics Library Only
```bash
# Using npm script
npm run build:schematics

# Using build script directly
node projects/native-federation-schematics/build.js
```

**Output:** `dist/native-federation-schematics/`

### 3. Build Both Libraries
```bash
npm run build
```

### 4. Pack for Distribution
```bash
# Build and pack both libraries (creates .tgz files at root level)
npm run pack:all

# Pack individual libraries (after building)
npm run pack:core      # Creates native-federation-core-1.0.0.tgz at root
npm run pack:schematics # Creates native-federation-schematics-1.0.0.tgz at root

# Or pack without rebuilding
npm run pack:only
```

## Manual Build Steps

If you need to build manually:

### Core Library (@native-federation/core)
```bash
# Step 1: Build the Angular library
ng build native-federation

# Step 2: Verify output
ls -la dist/native-federation/

# Step 3: Pack (optional) 
npm run pack:core
```

### Schematics Library (@native-federation/schematics)
```bash
# Step 1: Compile TypeScript
cd projects/native-federation-schematics
tsc

# Step 2: Copy assets
cp collection.json ../../dist/native-federation-schematics/
cp src/**/*.json ../../dist/native-federation-schematics/src/

# Step 3: Generate package.json
node build.js

# Step 4: Pack (optional)
npm run pack:schematics
```

## Common Build Errors & Solutions

### Error: "Cannot find module '@angular-devkit/build-angular'"
**Solution:**
```bash
npm install @angular-devkit/build-angular --save-dev
```

### Error: "Project 'native-federation' not found"
**Solution:** Check that `angular.json` contains the project configuration:
```bash
ng config projects.native-federation
```

### Error: "Module not found" in schematics
**Solution:** The schematics build uses CommonJS. Check imports:
```typescript
// ✅ Correct
import { Rule } from '@angular-devkit/schematics';

// ❌ Incorrect
import { Rule } from '@angular-devkit/schematics/index.js';
```

### Error: TypeScript compilation errors
**Solution:** Check TypeScript configuration:
```bash
# For core library
cat projects/native-federation/tsconfig.lib.json

# For schematics
cat projects/native-federation-schematics/tsconfig.json
```

### Error: "Cannot read property of undefined"
**Solution:** Ensure all peer dependencies are installed:
```bash
npm ls @angular/core @angular/common
```

## Verification Steps

After building, verify the packages:

### Core Library
```bash
# Check package structure
ls -la dist/native-federation/

# Verify exports
node -e "console.log(Object.keys(require('./dist/native-federation')))"

# Check types
ls -la dist/native-federation/lib/
```

### Schematics Library
```bash
# Check schematics collection
cat dist/native-federation-schematics/collection.json

# Verify compiled schematics
ls -la dist/native-federation-schematics/src/

# Test schematic execution (after installation)
ng add @native-federation/schematics
```

## Package Sizes

Expected package sizes:
- **@native-federation/core**: ~72 KB (packed), ~329 KB (unpacked)
- **@native-federation/schematics**: ~14 KB (packed), ~63 KB (unpacked)

## Troubleshooting

### Clear Build Cache
```bash
# Clear Angular cache
rm -rf .angular/

# Clear TypeScript cache
rm -rf dist/

# Clear node_modules (if needed)
rm -rf node_modules/
npm install
```

### Debug Build Process
```bash
# Verbose Angular build
ng build native-federation --verbose

# Debug TypeScript compilation
cd projects/native-federation-schematics
tsc --listFiles
```

### Check Dependencies
```bash
# Verify Angular CLI version
ng version

# Check TypeScript version
tsc --version

# Verify peer dependencies
npm ls --depth=0
```

## Publishing

After successful build:

```bash
# Publish core library
cd dist/native-federation
npm publish

# Publish schematics library
cd ../native-federation-schematics
npm publish
```

## Environment Requirements

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **Angular CLI**: >= 18.x
- **TypeScript**: >= 5.4.x