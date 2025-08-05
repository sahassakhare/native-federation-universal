#!/usr/bin/env node

/**
 * Test script for the library rename utility
 * 
 * This script creates a minimal test environment and validates
 * that the rename utility works correctly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { LibraryRenamer } from './rename-library.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RenameUtilityTester {
  constructor() {
    this.testDir = path.join(__dirname, 'test-env');
    this.results = [];
  }

  /**
   * Create test environment with sample files
   */
  createTestEnvironment() {
    // Clean up existing test environment
    if (fs.existsSync(this.testDir)) {
      execSync(`rm -rf "${this.testDir}"`);
    }

    fs.mkdirSync(this.testDir, { recursive: true });

    // Create test files with various patterns
    const testFiles = {
      'package.json': JSON.stringify({
        name: '@native-federation/test',
        version: '1.0.0',
        dependencies: {
          '@native-federation/core': '^1.0.0',
          'native-federation-utils': '^1.0.0'
        }
      }, null, 2),

      'README.md': `# Native Federation Test

This is a test project for Native Federation.

## Features

- Uses native-federation for micro-frontends
- Supports NativeFederation class
- Works with @native-federation packages

## Configuration

\`\`\`javascript
import { NativeFederation } from '@native-federation/core';
const config = { name: 'native-federation' };
\`\`\`
`,

      'src/main.js': `import { NativeFederation } from '@native-federation/core';
import { nativeFederation } from 'native-federation-utils';

const NATIVE_FEDERATION_VERSION = '1.0.0';

export class NativeFederation {
  constructor() {
    this.name = 'native-federation';
  }
}
`,

      'src/config.ts': `export interface NativeFederationConfig {
  name: string;
  version: string;
}

export const config: NativeFederationConfig = {
  name: 'native-federation',
  version: '1.0.0'
};
`,

      'docs/guide.md': `# Native Federation Guide

Welcome to Native Federation! This library provides native federation capabilities.

## Installation

\`\`\`bash
npm install @native-federation/core
\`\`\`

## Usage

Native Federation makes it easy to create federated applications.
`
    };

    // Create test files
    Object.entries(testFiles).forEach(([filePath, content]) => {
      const fullPath = path.join(this.testDir, filePath);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, content, 'utf8');
    });

    // Create a test directory to rename
    fs.mkdirSync(path.join(this.testDir, 'native-federation-modules'), { recursive: true });
    fs.writeFileSync(
      path.join(this.testDir, 'native-federation-modules', 'index.js'),
      'export * from "./native-federation";',
      'utf8'
    );

    console.log(`✓ Test environment created at: ${this.testDir}`);
  }

  /**
   * Run the rename utility in test mode
   */
  async runRenameTest() {
    const renamer = new LibraryRenamer({
      patterns: {
        'native-federation': '{NEW_NAME}',
        'Native Federation': '{NEW_NAME_TITLE}',
        'NATIVE_FEDERATION': '{NEW_NAME_UPPER}',
        'NativeFederation': '{NEW_NAME_PASCAL}',
        'nativeFederation': '{NEW_NAME_CAMEL}',
        '@native-federation': '@{NEW_NAME}'
      },
      filePatterns: [
        '**/*.js',
        '**/*.ts',
        '**/*.json',
        '**/*.md'
      ],
      excludePatterns: [
        'node_modules/**',
        '.git/**'
      ],
      directoryRenames: [
        {
          from: 'native-federation-modules',
          to: '{NEW_NAME}-modules'
        }
      ],
      packageRenames: [
        {
          from: '@native-federation/core',
          to: '@{NEW_NAME}/core'
        },
        {
          from: '@native-federation/test',
          to: '@{NEW_NAME}/test'
        },
        {
          from: 'native-federation-utils',
          to: '{NEW_NAME}-utils'
        }
      ]
    });

    // Change to test directory for the operation
    const originalCwd = process.cwd();
    process.chdir(this.testDir);

    try {
      console.log('\n🧪 Running rename test...');
      await renamer.rename('native-federation', 'test-federation', {
        dryRun: false,
        verbose: true,
        backup: false // Skip backup for test
      });

      process.chdir(originalCwd);
      return true;
    } catch (error) {
      process.chdir(originalCwd);
      console.error(`Test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate the results
   */
  validateResults() {
    console.log('\n🔍 Validating results...');
    
    const tests = [
      {
        name: 'Package.json name updated',
        check: () => {
          const pkg = JSON.parse(fs.readFileSync(path.join(this.testDir, 'package.json'), 'utf8'));
          return pkg.name === '@test-federation/test';
        }
      },
      {
        name: 'Dependencies updated',
        check: () => {
          const pkg = JSON.parse(fs.readFileSync(path.join(this.testDir, 'package.json'), 'utf8'));
          return pkg.dependencies['@test-federation/core'] && pkg.dependencies['test-federation-utils'];
        }
      },
      {
        name: 'README title updated',
        check: () => {
          const readme = fs.readFileSync(path.join(this.testDir, 'README.md'), 'utf8');
          return readme.includes('# Test Federation Test') && readme.includes('This is a test project for Test Federation');
        }
      },
      {
        name: 'JavaScript class names updated',
        check: () => {
          const main = fs.readFileSync(path.join(this.testDir, 'src/main.js'), 'utf8');
          return main.includes('TestFederation') && main.includes("name: 'test-federation'");
        }
      },
      {
        name: 'TypeScript interfaces updated',
        check: () => {
          const config = fs.readFileSync(path.join(this.testDir, 'src/config.ts'), 'utf8');
          return config.includes('TestFederationConfig') && config.includes("name: 'test-federation'");
        }
      },
      {
        name: 'Documentation updated',
        check: () => {
          const guide = fs.readFileSync(path.join(this.testDir, 'docs/guide.md'), 'utf8');
          return guide.includes('# Test Federation Guide') && guide.includes('@test-federation/core');
        }
      },
      {
        name: 'Directory renamed',
        check: () => {
          return fs.existsSync(path.join(this.testDir, 'test-federation-modules')) &&
                !fs.existsSync(path.join(this.testDir, 'native-federation-modules'));
        }
      },
      {
        name: 'Files in renamed directory updated',
        check: () => {
          if (fs.existsSync(path.join(this.testDir, 'test-federation-modules', 'index.js'))) {
            const content = fs.readFileSync(path.join(this.testDir, 'test-federation-modules', 'index.js'), 'utf8');
            return content.includes('"./test-federation"');
          }
          return false;
        }
      }
    ];

    let passed = 0;
    let failed = 0;

    tests.forEach(test => {
      try {
        if (test.check()) {
          console.log(`  ✓ ${test.name}`);
          passed++;
        } else {
          console.log(`  ✗ ${test.name}`);
          failed++;
        }
      } catch (error) {
        console.log(`  ✗ ${test.name} (Error: ${error.message})`);
        failed++;
      }
    });

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
  }

  /**
   * Clean up test environment
   */
  cleanup() {
    if (fs.existsSync(this.testDir)) {
      execSync(`rm -rf "${this.testDir}"`);
      console.log(`🧹 Cleaned up test environment`);
    }
  }

  /**
   * Run all tests
   */
  async runTests() {
    console.log('🚀 Starting rename utility tests...\n');

    try {
      // Create test environment
      this.createTestEnvironment();

      // Run rename test
      const renameSuccess = await this.runRenameTest();
      if (!renameSuccess) {
        throw new Error('Rename operation failed');
      }

      // Validate results
      const validationSuccess = this.validateResults();
      
      if (validationSuccess) {
        console.log('\n🎉 All tests passed! The rename utility is working correctly.');
        return true;
      } else {
        console.log('\n❌ Some tests failed. Please check the implementation.');
        return false;
      }

    } catch (error) {
      console.error(`\n💥 Test suite failed: ${error.message}`);
      return false;
    } finally {
      // Always clean up
      this.cleanup();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Rename Utility Test Suite

Usage:
  node test-rename.js [options]

Options:
  --keep-test-env    Keep test environment after tests (for debugging)
  --help, -h         Show this help message

This script creates a test environment and validates that the rename utility
works correctly by renaming "native-federation" to "test-federation" and
checking that all expected transformations occur.
`);
    return;
  }

  const tester = new RenameUtilityTester();
  
  if (args.includes('--keep-test-env')) {
    // Override cleanup method to keep test environment
    tester.cleanup = () => {
      console.log(`🔍 Test environment preserved at: ${tester.testDir}`);
    };
  }

  const success = await tester.runTests();
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}