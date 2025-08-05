# Native Federation Library Rename Utility

A comprehensive JavaScript utility to rename the Native Federation library and update all references across files, documentation, package names, and configurations throughout the entire codebase.

## Features

- **Complete Renaming**: Updates all occurrences across JavaScript, TypeScript, JSON, Markdown, and configuration files
- **Smart Name Variations**: Automatically generates kebab-case, camelCase, PascalCase, UPPER_CASE, and Title Case variations
- **Package Management**: Updates package.json files and dependency references
- **Directory Renaming**: Renames directories containing the old library name
- **Backup System**: Creates automatic backups before making changes
- **Dry Run Mode**: Preview changes without making actual modifications
- **Configurable**: Supports custom configuration files for advanced use cases
- **Safe Operation**: Excludes sensitive directories and creates restore points

## Quick Start

### Prerequisites

```bash
cd scripts
npm install
```

### Basic Usage

```bash
# Rename "native-federation" to "my-federation"
node rename-library.js --from "native-federation" --to "my-federation"

# Preview changes without applying them
node rename-library.js --from "native-federation" --to "my-federation" --dry-run

# Verbose output to see all changes
node rename-library.js --from "native-federation" --to "my-federation" --verbose
```

### Using NPM Scripts

```bash
# Run a test rename (dry run)
npm run test-rename

# Run with dry-run flag
npm run rename:dry-run -- --from "native-federation" --to "my-federation"

# Run actual rename
npm run rename -- --from "native-federation" --to "my-federation"
```

## Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--from <name>` | Current library name | `--from "native-federation"` |
| `--to <name>` | New library name | `--to "my-federation"` |
| `--config <file>` | Use configuration file | `--config my-config.json` |
| `--dry-run` | Preview changes without applying | `--dry-run` |
| `--verbose` | Show detailed output | `--verbose` |
| `--no-backup` | Skip creating backup | `--no-backup` |
| `--help, -h` | Show help message | `--help` |

## Name Transformations

The utility automatically generates these name variations:

| Input | Output Example | Usage |
|-------|----------------|-------|
| `my-federation` | `my-federation` | Package names, file names |
| | `My Federation` | Documentation titles |
| | `MY_FEDERATION` | Constants, environment variables |
| | `my_federation` | Internal identifiers |
| | `MyFederation` | Class names, TypeScript interfaces |
| | `myFederation` | Variable names, object properties |
| | `@my-federation` | Scoped package names |
| | `my federation` | Human-readable text |

## What Gets Updated

### File Types
- **JavaScript/TypeScript**: `.js`, `.ts`, `.jsx`, `.tsx`
- **Configuration**: `.json`, `.config.js`, `.config.ts`
- **Documentation**: `.md`, `.html`
- **Styles**: `.css`, `.scss`
- **Data**: `.yaml`, `.yml`, `.xml`

### Content Types
- Package names in `package.json`
- Import/export statements
- Documentation and comments
- Configuration values
- Directory and file names
- Dependency references

### Example Transformations

**Before:**
```json
{
  "name": "@native-federation/core",
  "dependencies": {
    "@native-federation/schematics": "^1.0.0"
  }
}
```

**After (my-federation):**
```json
{
  "name": "@my-federation/core", 
  "dependencies": {
    "@my-federation/schematics": "^1.0.0"
  }
}
```

**Before:**
```javascript
import { NativeFederation } from '@native-federation/core';
const config = { name: 'native-federation' };
```

**After:**
```javascript
import { MyFederation } from '@my-federation/core';
const config = { name: 'my-federation' };
```

## Configuration File

For advanced use cases, create a custom configuration file:

```bash
# Copy the template
cp rename-config.template.json my-rename-config.json

# Edit the configuration
# Then run with config
node rename-library.js --config my-rename-config.json
```

### Configuration Options

```json
{
  "fromName": "native-federation",
  "toName": "my-federation",
  "patterns": {
    "custom-pattern": "{NEW_NAME}"
  },
  "filePatterns": ["**/*.js", "**/*.md"],
  "excludePatterns": ["node_modules/**"],
  "directoryRenames": [
    {"from": "old-dir", "to": "{NEW_NAME}-dir"}
  ],
  "packageRenames": [
    {"from": "@old/package", "to": "@{NEW_NAME}/package"}
  ]
}
```

## Safety Features

### Automatic Backup
- Creates timestamped backup before changes
- Backup location: `backup-YYYY-MM-DDTHH-MM-SS/`
- Excludes backup directories from rename operations

### Restore from Backup
```bash
# If something goes wrong, restore from backup
rm -rf "/path/to/project"
mv "/path/to/backup-2024-01-01T12-00-00" "/path/to/project"
```

### Dry Run Mode
Always test with `--dry-run` first:
```bash
node rename-library.js --from "native-federation" --to "new-name" --dry-run --verbose
```

### Excluded Patterns
- `node_modules/`
- `dist/`
- `.git/`
- `**/*.log`
- Backup directories
- The rename script itself

## Examples

### Basic Rename
```bash
node rename-library.js \
  --from "native-federation" \
  --to "micro-frontend" \
  --verbose
```

### Corporate Rebrand
```bash
node rename-library.js \
  --from "native-federation" \
  --to "acme-federation" \
  --backup
```

### Testing Changes
```bash
# See what would change
node rename-library.js \
  --from "native-federation" \
  --to "test-federation" \
  --dry-run \
  --verbose

# Apply if satisfied
node rename-library.js \
  --from "native-federation" \
  --to "test-federation"
```

### Custom Configuration
```bash
# Create custom config
cat > custom-rename.json << 'EOF'
{
  "fromName": "native-federation",
  "toName": "company-fed",
  "patterns": {
    "https://native-federation.com": "https://company-fed.com",
    "Native Federation Team": "Company Federation Team"
  }
}
EOF

# Run with config
node rename-library.js --config custom-rename.json --verbose
```

## Output Example

```
Starting library rename: "native-federation" → "my-federation"
Mode: LIVE MODE

✓ Backup created at: backup-2024-01-01T12-00-00

Finding files to process...
Found 127 files to check

Processing files...
Processing: package.json
Processing: README.md
Processing: examples/complete-angular-app/package.json
...

Updating package names...
Updating package.json: projects/native-federation-schematics/package.json

Renaming directories...
Renaming directory: projects/native-federation-schematics → projects/my-federation-schematics

=== RENAME OPERATION SUMMARY ===
From: native-federation
To: my-federation  
Mode: ACTUAL CHANGES
Backup: backup-2024-01-01T12-00-00

Files processed: 45
Directories renamed: 2

✓ Library rename completed successfully!

📁 Backup available at: backup-2024-01-01T12-00-00
You can restore from backup if needed.
```

## Troubleshooting

### Common Issues

**Permission Errors**
```bash
# Make script executable
chmod +x scripts/rename-library.js

# Run with proper permissions
sudo node scripts/rename-library.js --from "old" --to "new"
```

**Invalid Name Format**
```bash
# Names must be lowercase, start with letter, contain only letters/numbers/hyphens
node rename-library.js --from "native-federation" --to "my-federation"  # ✓ Valid
node rename-library.js --from "native-federation" --to "MyFederation"   # ✗ Invalid
```

**Missing Dependencies**
```bash
cd scripts
npm install
```

### Recovery

**Restore from Backup**
```bash
# Find backup directory
ls -la backup-*

# Restore
rm -rf /path/to/project
mv backup-YYYY-MM-DDTHH-MM-SS /path/to/project
```

**Partial Failures**
If the script fails partway through, use the backup to restore, fix the issue, and try again.

## Advanced Usage

### Programmatic Usage

```javascript
import { LibraryRenamer } from './rename-library.js';

const renamer = new LibraryRenamer({
  patterns: {
    'old-name': '{NEW_NAME}',
    'OldName': '{NEW_NAME_PASCAL}'
  }
});

await renamer.rename('old-name', 'new-name', {
  dryRun: false,
  verbose: true,
  backup: true
});
```

### Custom Patterns

Add custom replacement patterns in your config:

```json
{
  "patterns": {
    "https://old-site.com": "https://new-site.com",
    "Old Company": "New Company",
    "OLD_CONSTANT": "{NEW_NAME_UPPER}_CONSTANT"
  }
}
```

## Contributing

To modify the rename utility:

1. Edit `scripts/rename-library.js`
2. Test with `--dry-run` flag
3. Update documentation if needed
4. Test on a backup copy of the project

## License

This utility is part of the Native Federation project and follows the same license terms.