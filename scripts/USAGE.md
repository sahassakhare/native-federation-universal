# Quick Reference - Library Rename Utility

## Installation
```bash
cd scripts
npm install
```

## Basic Commands

### Safe Testing (Recommended First)
```bash
# See what would change without making changes
node rename-library.js --from "native-federation" --to "my-federation" --dry-run --verbose
```

### Actual Rename
```bash
# Rename with automatic backup
node rename-library.js --from "native-federation" --to "my-federation"
```

### Run Tests
```bash
# Test the utility itself
npm test
```

## Common Use Cases

### Corporate Rebrand
```bash
node rename-library.js \
  --from "native-federation" \
  --to "acme-federation" \
  --verbose
```

### Personal Fork
```bash
node rename-library.js \
  --from "native-federation" \
  --to "my-micro-frontend" \
  --dry-run  # Test first!
```

### Custom Domain/Branding
```bash
# Create custom config first
cp rename-config.template.json my-config.json
# Edit my-config.json with custom URLs, etc.

node rename-library.js --config my-config.json --verbose
```

## Name Rules
- ✅ `my-federation` (lowercase, hyphens)
- ✅ `acme-fed` (short names ok)
- ✅ `company-mf` (abbreviations ok)
- ❌ `MyFederation` (no uppercase)
- ❌ `my_federation` (no underscores)
- ❌ `123-federation` (must start with letter)

## Safety Tips

1. **Always test first**: Use `--dry-run` to preview changes
2. **Backup automatically created**: Unless you use `--no-backup`
3. **Version control**: Commit your changes before renaming
4. **Test after rename**: Run your build/test commands to verify

## Restore from Backup
```bash
# If something goes wrong
ls backup-*  # Find your backup
rm -rf "/path/to/project"
mv "backup-YYYY-MM-DD..." "/path/to/project"
```

## What Gets Updated

- ✅ All package.json files
- ✅ Import/export statements  
- ✅ Documentation
- ✅ Configuration files
- ✅ Directory names
- ✅ Class/interface names
- ✅ Variable names
- ✅ Comments

## Output Example
```
Starting library rename: "native-federation" → "my-federation"
✓ Backup created at: backup-2024-01-01T12-00-00
Found 127 files to check
Files processed: 45
Directories renamed: 2
✓ Library rename completed successfully!
```

## Need Help?
```bash
node rename-library.js --help
```