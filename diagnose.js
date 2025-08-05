#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log(' Native Federation Build Diagnostics\n');

// Check Node.js and npm versions
console.log(' Environment:');
try {
  const nodeVersion = process.version;
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`  Node.js: ${nodeVersion}`);
  console.log(`  npm: ${npmVersion}`);
} catch (error) {
  console.log('   Failed to get npm version');
}

// Check Angular CLI
console.log('\n  Angular:');
try {
  const ngVersion = execSync('ng version --skip-git', { encoding: 'utf8' });
  const angularCoreMatch = ngVersion.match(/Angular CLI:\s*(\d+\.\d+\.\d+)/);
  if (angularCoreMatch) {
    console.log(`  Angular CLI: ${angularCoreMatch[1]}`);
  }
} catch (error) {
  console.log('   Angular CLI not found or not installed');
}

// Check workspace structure
console.log('\n Workspace Structure:');
const requiredFiles = [
  'angular.json',
  'projects/native-federation/ng-package.json',
  'projects/native-federation/src/public-api.ts',
  'projects/native-federation-schematics/collection.json',
  'projects/native-federation-schematics/build.js',
  'projects/native-federation-schematics/tsconfig.json'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ${file}`);
  } else {
    console.log(`   ${file} - MISSING`);
  }
});

// Check package.json dependencies
console.log('\n Dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@angular/cli',
    '@angular/core',
    '@angular-devkit/build-angular',
    'ng-packagr',
    'typescript'
  ];

  requiredDeps.forEach(dep => {
    const devDep = packageJson.devDependencies?.[dep];
    const regularDep = packageJson.dependencies?.[dep];
    const version = devDep || regularDep;
    
    if (version) {
      console.log(`   ${dep}: ${version}`);
    } else {
      console.log(`   ${dep} - MISSING`);
    }
  });
} catch (error) {
  console.log('   Failed to read package.json');
}

// Check build outputs
console.log('\n  Build Outputs:');
const outputs = [
  'dist/native-federation/package.json',
  'dist/native-federation/index.d.ts',
  'dist/native-federation/fesm2022/native-federation-core.mjs',
  'dist/native-federation-schematics/package.json',
  'dist/native-federation-schematics/collection.json'
];

outputs.forEach(output => {
  if (fs.existsSync(output)) {
    console.log(`   ${output}`);
  } else {
    console.log(`    ${output} - Not built yet`);
  }
});

// Check for common issues
console.log('\n Common Issues:');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('   node_modules missing - Run: npm install');
} else {
  console.log('   node_modules present');
}

// Check if Angular cache is causing issues
if (fs.existsSync('.angular')) {
  console.log('    Angular cache exists - Clear if having issues: rm -rf .angular');
} else {
  console.log('   No Angular cache');
}

// Check TypeScript configuration
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsconfig.compilerOptions?.target) {
    console.log(`   TypeScript target: ${tsconfig.compilerOptions.target}`);
  }
} catch (error) {
  console.log('   Failed to read tsconfig.json');
}

console.log('\n Suggested Build Commands:');
console.log('  npm install                    # Install dependencies');
console.log('  npm run build:core            # Build core library only');
console.log('  npm run build:schematics      # Build schematics only');
console.log('  npm run build                 # Build both libraries');
console.log('  npm run pack:all              # Build and pack both');

console.log('\n For detailed troubleshooting, see BUILD.md');