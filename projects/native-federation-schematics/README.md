# @native-federation/schematics

Angular schematics for Native Federation - migrate from Webpack Module Federation to Native Federation seamlessly.

## Installation

```bash
npm install @native-federation/schematics --save-dev
```

## Available Schematics

### migrate
Migrate from Webpack Module Federation to Native Federation

```bash
ng generate @native-federation/schematics:migrate
```

Options:
- `--project`: The name of the project to migrate
- `--webpack-config`: Path to webpack configuration file (default: webpack.config.js)
- `--skip-package-json`: Skip updating package.json dependencies
- `--skip-build-config`: Skip creating esbuild configuration
- `--skip-runtime-update`: Skip updating runtime imports
- `--dry-run`: Run migration analysis without making changes
- `--verbose`: Enable verbose logging

### convert-config
Convert webpack federation config to native federation

```bash
ng generate @native-federation/schematics:convert-config
```

### update-runtime
Update runtime imports and federation calls

```bash
ng generate @native-federation/schematics:update-runtime
```

### setup-build
Setup esbuild configuration for Native Federation

```bash
ng generate @native-federation/schematics:setup-build
```

### analyze
Analyze existing webpack module federation setup

```bash
ng generate @native-federation/schematics:analyze
```

## Migration Process

1. **Analysis**: The schematics analyze your existing webpack configuration
2. **Dependencies**: Update package.json with Native Federation dependencies
3. **Configuration**: Convert webpack config to Native Federation format
4. **Runtime**: Update import statements and federation calls
5. **Build Setup**: Configure esbuild for your project
6. **Report**: Generate a detailed migration report

## Requirements

- Angular 18+
- Node.js 18+
- Existing Webpack Module Federation setup

## License

MIT