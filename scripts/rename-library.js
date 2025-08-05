#!/usr/bin/env node

/**
 * Native Federation Library Rename Utility
 * 
 * This utility allows you to rename the Native Federation library and update
 * all references across files, documentation, package names, and configurations.
 * 
 * Usage:
 *   node scripts/rename-library.js --from "native-federation" --to "my-federation"
 *   node scripts/rename-library.js --config rename-config.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Default configuration
const DEFAULT_CONFIG = {
  patterns: {
    'native-federation': '{NEW_NAME}',
    'Native Federation': '{NEW_NAME_TITLE}',
    'NATIVE_FEDERATION': '{NEW_NAME_UPPER}',
    'native_federation': '{NEW_NAME_UNDERSCORE}',
    'NativeFederation': '{NEW_NAME_PASCAL}',
    'nativeFederation': '{NEW_NAME_CAMEL}',
    '@native-federation': '@{NEW_NAME}',
    'native federation': '{NEW_NAME_SPACED}'
  },
  filePatterns: [
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.json',
    '**/*.md',
    '**/*.html',
    '**/*.css',
    '**/*.scss',
    '**/*.yaml',
    '**/*.yml',
    '**/*.xml',
    '**/*.config.js',
    '**/*.config.ts'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    '.git/**',
    '**/*.log',
    'scripts/rename-library.js'
  ],
  directoryRenames: [
    {
      from: 'native-federation',
      to: '{NEW_NAME}'
    }
  ],
  packageRenames: [
    {
      from: '@native-federation/core',
      to: '@{NEW_NAME}/core'
    },
    {
      from: '@native-federation/schematics',
      to: '@{NEW_NAME}/schematics'
    }
  ]
};

class LibraryRenamer {
  constructor(config = DEFAULT_CONFIG) {
    this.config = config;
    this.dryRun = false;
    this.verbose = false;
    this.backupDir = null;
    this.changedFiles = [];
    this.renamedDirectories = [];
  }

  /**
   * Generate name variations from the new library name
   */
  generateNameVariations(newName) {
    return {
      '{NEW_NAME}': newName,
      '{NEW_NAME_TITLE}': this.toTitleCase(newName),
      '{NEW_NAME_UPPER}': newName.toUpperCase().replace(/-/g, '_'),
      '{NEW_NAME_UNDERSCORE}': newName.replace(/-/g, '_'),
      '{NEW_NAME_PASCAL}': this.toPascalCase(newName),
      '{NEW_NAME_CAMEL}': this.toCamelCase(newName),
      '{NEW_NAME_SPACED}': newName.replace(/-/g, ' ')
    };
  }

  /**
   * Convert kebab-case to Title Case
   */
  toTitleCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Convert kebab-case to PascalCase
   */
  toPascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Convert kebab-case to camelCase
   */
  toCamelCase(str) {
    const parts = str.split('-');
    return parts[0] + parts.slice(1).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }

  /**
   * Create backup of the project
   */
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = path.join(projectRoot, `backup-${timestamp}`);
    
    if (this.verbose) {
      console.log(`Creating backup at: ${this.backupDir}`);
    }
    
    if (!this.dryRun) {
      try {
        execSync(`cp -r "${projectRoot}" "${this.backupDir}"`, { stdio: 'inherit' });
        // Remove the backup directory from within the backup
        const nestedBackup = path.join(this.backupDir, path.basename(this.backupDir));
        if (fs.existsSync(nestedBackup)) {
          execSync(`rm -rf "${nestedBackup}"`, { stdio: 'inherit' });
        }
        console.log(`✓ Backup created at: ${this.backupDir}`);
      } catch (error) {
        console.error(`Failed to create backup: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Find all files matching the patterns
   */
  async findFiles() {
    const files = [];
    
    for (const pattern of this.config.filePatterns) {
      const matches = await glob(pattern, {
        cwd: projectRoot,
        ignore: this.config.excludePatterns,
        absolute: true
      });
      files.push(...matches);
    }
    
    // Remove duplicates
    return [...new Set(files)];
  }

  /**
   * Process file content and replace patterns
   */
  processFileContent(content, nameVariations) {
    let newContent = content;
    let hasChanges = false;
    
    for (const [pattern, replacement] of Object.entries(this.config.patterns)) {
      const actualReplacement = nameVariations[replacement] || replacement;
      const regex = new RegExp(this.escapeRegex(pattern), 'g');
      
      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, actualReplacement);
        hasChanges = true;
      }
    }
    
    return { content: newContent, hasChanges };
  }

  /**
   * Escape special regex characters
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Process a single file
   */
  async processFile(filePath, nameVariations) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { content: newContent, hasChanges } = this.processFileContent(content, nameVariations);
      
      if (hasChanges) {
        if (this.verbose) {
          console.log(`Processing: ${path.relative(projectRoot, filePath)}`);
        }
        
        if (!this.dryRun) {
          fs.writeFileSync(filePath, newContent, 'utf8');
        }
        
        this.changedFiles.push(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error processing file ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Rename directories
   */
  async renameDirectories(nameVariations) {
    for (const dirRename of this.config.directoryRenames) {
      const actualNewName = nameVariations[dirRename.to] || dirRename.to;
      const pattern = path.join(projectRoot, '**', dirRename.from);
      
      const directories = await glob(pattern, {
        onlyDirectories: true,
        ignore: this.config.excludePatterns
      });
      
      for (const dir of directories) {
        const parentDir = path.dirname(dir);
        const newDir = path.join(parentDir, actualNewName);
        
        if (this.verbose) {
          console.log(`Renaming directory: ${path.relative(projectRoot, dir)} → ${path.relative(projectRoot, newDir)}`);
        }
        
        if (!this.dryRun && dir !== newDir) {
          fs.renameSync(dir, newDir);
          this.renamedDirectories.push({ from: dir, to: newDir });
        }
      }
    }
  }

  /**
   * Update package.json files with new package names
   */
  async updatePackageNames(nameVariations) {
    const packageFiles = await glob('**/package.json', {
      cwd: projectRoot,
      ignore: this.config.excludePatterns,
      absolute: true
    });
    
    for (const packageFile of packageFiles) {
      try {
        const content = fs.readFileSync(packageFile, 'utf8');
        const packageJson = JSON.parse(content);
        let hasChanges = false;
        
        // Update package name
        if (packageJson.name) {
          for (const pkgRename of this.config.packageRenames) {
            const actualNewName = nameVariations[pkgRename.to] || pkgRename.to;
            if (packageJson.name === pkgRename.from) {
              packageJson.name = actualNewName;
              hasChanges = true;
            }
          }
        }
        
        // Update dependencies
        const depSections = ['dependencies', 'devDependencies', 'peerDependencies'];
        for (const section of depSections) {
          if (packageJson[section]) {
            for (const pkgRename of this.config.packageRenames) {
              const actualNewName = nameVariations[pkgRename.to] || pkgRename.to;
              if (packageJson[section][pkgRename.from]) {
                const version = packageJson[section][pkgRename.from];
                delete packageJson[section][pkgRename.from];
                packageJson[section][actualNewName] = version;
                hasChanges = true;
              }
            }
          }
        }
        
        if (hasChanges) {
          if (this.verbose) {
            console.log(`Updating package.json: ${path.relative(projectRoot, packageFile)}`);
          }
          
          if (!this.dryRun) {
            fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
          }
          
          this.changedFiles.push(packageFile);
        }
        
      } catch (error) {
        console.error(`Error updating package.json ${packageFile}: ${error.message}`);
      }
    }
  }

  /**
   * Generate summary report
   */
  generateReport(fromName, toName) {
    console.log('\n=== RENAME OPERATION SUMMARY ===');
    console.log(`From: ${fromName}`);
    console.log(`To: ${toName}`);
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'ACTUAL CHANGES'}`);
    
    if (this.backupDir && !this.dryRun) {
      console.log(`Backup: ${this.backupDir}`);
    }
    
    console.log(`\nFiles processed: ${this.changedFiles.length}`);
    console.log(`Directories renamed: ${this.renamedDirectories.length}`);
    
    if (this.verbose && this.changedFiles.length > 0) {
      console.log('\nChanged files:');
      this.changedFiles.forEach(file => {
        console.log(`  - ${path.relative(projectRoot, file)}`);
      });
    }
    
    if (this.renamedDirectories.length > 0) {
      console.log('\nRenamed directories:');
      this.renamedDirectories.forEach(({ from, to }) => {
        console.log(`  - ${path.relative(projectRoot, from)} → ${path.relative(projectRoot, to)}`);
      });
    }
  }

  /**
   * Main rename operation
   */
  async rename(fromName, toName, options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    
    console.log(`Starting library rename: "${fromName}" → "${toName}"`);
    console.log(`Mode: ${this.dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE MODE'}`);
    
    try {
      // Create backup (unless dry run)
      if (!this.dryRun && options.backup !== false) {
        this.createBackup();
      }
      
      // Generate name variations
      const nameVariations = this.generateNameVariations(toName);
      
      if (this.verbose) {
        console.log('\nName variations:');
        Object.entries(nameVariations).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }
      
      // Find all files
      console.log('\nFinding files to process...');
      const files = await this.findFiles();
      console.log(`Found ${files.length} files to check`);
      
      // Process files
      console.log('\nProcessing files...');
      for (const file of files) {
        await this.processFile(file, nameVariations);
      }
      
      // Update package.json files
      console.log('\nUpdating package names...');
      await this.updatePackageNames(nameVariations);
      
      // Rename directories
      console.log('\nRenaming directories...');
      await this.renameDirectories(nameVariations);
      
      // Generate report
      this.generateReport(fromName, toName);
      
      if (this.dryRun) {
        console.log('\n⚠️  This was a DRY RUN. No actual changes were made.');
        console.log('Run without --dry-run to apply changes.');
      } else {
        console.log('\n✓ Library rename completed successfully!');
        if (this.backupDir) {
          console.log(`\n📁 Backup available at: ${this.backupDir}`);
          console.log('You can restore from backup if needed.');
        }
      }
      
    } catch (error) {
      console.error(`\n❌ Error during rename operation: ${error.message}`);
      
      if (this.backupDir && !this.dryRun) {
        console.log(`\n🔄 To restore from backup, run:`);
        console.log(`rm -rf "${projectRoot}" && mv "${this.backupDir}" "${projectRoot}"`);
      }
      
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Native Federation Library Rename Utility

Usage:
  node scripts/rename-library.js --from "native-federation" --to "my-federation"
  node scripts/rename-library.js --config rename-config.json

Options:
  --from <name>        Current library name (required if not using config)
  --to <name>          New library name (required if not using config)
  --config <file>      JSON configuration file
  --dry-run           Show what would be changed without making changes
  --verbose           Show detailed output
  --no-backup         Skip creating backup (not recommended)
  --help, -h          Show this help message

Examples:
  # Basic rename
  node scripts/rename-library.js --from "native-federation" --to "my-federation"
  
  # Dry run to see what would change
  node scripts/rename-library.js --from "native-federation" --to "my-federation" --dry-run
  
  # Verbose output with backup disabled
  node scripts/rename-library.js --from "native-federation" --to "custom-fed" --verbose --no-backup
  
  # Using configuration file
  node scripts/rename-library.js --config custom-rename.json --verbose
`);
    return;
  }
  
  let config = DEFAULT_CONFIG;
  let fromName, toName;
  let options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    backup: !args.includes('--no-backup')
  };
  
  // Parse arguments
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    const configFile = args[configIndex + 1];
    try {
      const configPath = path.resolve(configFile);
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = { ...DEFAULT_CONFIG, ...configData };
      fromName = configData.fromName;
      toName = configData.toName;
    } catch (error) {
      console.error(`Error reading config file: ${error.message}`);
      process.exit(1);
    }
  }
  
  const fromIndex = args.indexOf('--from');
  if (fromIndex !== -1 && args[fromIndex + 1]) {
    fromName = args[fromIndex + 1];
  }
  
  const toIndex = args.indexOf('--to');
  if (toIndex !== -1 && args[toIndex + 1]) {
    toName = args[toIndex + 1];
  }
  
  if (!fromName || !toName) {
    console.error('Error: Both --from and --to are required (or use --config with fromName/toName)');
    console.error('Use --help for usage information');
    process.exit(1);
  }
  
  // Validate names
  if (!/^[a-z][a-z0-9-]*$/.test(toName)) {
    console.error('Error: New name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens');
    process.exit(1);
  }
  
  try {
    const renamer = new LibraryRenamer(config);
    await renamer.rename(fromName, toName, options);
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

export { LibraryRenamer, DEFAULT_CONFIG };