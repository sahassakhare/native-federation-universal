# Contributing to Native Federation

We welcome contributions from the community! This guide will help you get started with contributing to Native Federation.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat all contributors and users with respect and kindness.

## Getting Started

### Prerequisites

- Node.js 16+ (18+ recommended)
- npm 7+ or yarn 1.22+ or pnpm 7+
- Git
- TypeScript knowledge

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/your-username/native-federation-core.git
   cd native-federation-core
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Start Development**
   ```bash
   # Watch mode for development
   npm run dev
   
   # Run examples
   npm run example:angular
   ```

## Project Structure

```
native-federation/
├── src/                      # Source code
│   ├── core/                # Core federation logic
│   ├── runtime/             # Runtime module loading
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions
│   └── angular/             # Angular integrations
├── docs/                    # Documentation
├── examples/                # Example projects
├── tests/                   # Test suites
├── schematics/              # Angular schematics
└── dist/                    # Built artifacts
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write clean, well-documented code
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:core
npm run test:runtime
npm run test:schematics

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### 4. Commit Changes

We use conventional commit messages:

```bash
# Features
git commit -m "feat: add new federation plugin option"

# Bug fixes
git commit -m "fix: resolve module loading issue"

# Documentation
git commit -m "docs: update configuration guide"

# Tests
git commit -m "test: add tests for version manager"

# Refactoring
git commit -m "refactor: improve package preparator performance"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Contribution Types

### Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details** (Node.js version, OS, etc.)
- **Code samples** or repository links if applicable

**Bug Report Template:**
```markdown
## Bug Description
Clear description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
Description of what you expected to happen.

## Environment
- Node.js version:
- npm version:
- OS:
- Native Federation version:

## Additional Context
Any additional context about the problem.
```

### Feature Requests

When proposing features, please include:

- **Clear description** of the proposed feature
- **Use case** and motivation
- **Proposed API** or implementation approach
- **Examples** of how it would be used

**Feature Request Template:**
```markdown
## Feature Description
Clear description of the feature you'd like to see.

## Use Case
Explain why this feature would be useful.

## Proposed Solution
Describe how you envision this feature working.

## Alternative Solutions
Describe any alternative approaches you've considered.

## Examples
Provide code examples of how this feature would be used.
```

### Documentation Improvements

We welcome improvements to:

- API documentation
- Tutorials and guides
- Code examples
- README files
- Architecture documentation

### Code Contributions

Areas where we welcome code contributions:

- **Core Features** - New federation capabilities
- **Performance Improvements** - Optimization and caching
- **Framework Adapters** - React, Vue, Svelte integrations
- **Build Tool Support** - Vite, Rollup, Parcel plugins
- **Developer Tools** - CLI improvements, debugging tools
- **Testing** - Unit tests, integration tests, examples

## Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Provide comprehensive type definitions
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names

```typescript
// Good
interface FederationConfig {
  name?: string;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: SharedConfig;
}

// Avoid
type Config = {
  n?: string;
  e?: any;
  r?: any;
  s?: any;
}
```

### Code Organization

- Keep functions small and focused
- Use descriptive names for classes and methods
- Add JSDoc comments for public APIs
- Group related functionality in modules

```typescript
/**
 * Loads a remote module dynamically
 * @param remoteName - Name of the remote application
 * @param modulePath - Path to the module
 * @returns Promise that resolves to the loaded module
 */
export async function loadRemoteModule<T = any>(
  remoteName: string,
  modulePath: string
): Promise<T> {
  // Implementation
}
```

### Testing

- Write tests for all new functionality
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

```typescript
describe('ModuleLoader', () => {
  it('should load remote module successfully', async () => {
    // Test implementation
  });

  it('should handle module loading errors gracefully', async () => {
    // Test error handling
  });
});
```

## Testing Guidelines

### Unit Tests

- Test individual functions and classes in isolation
- Mock dependencies to focus on the unit under test
- Cover edge cases and error conditions

### Integration Tests

- Test complete workflows and interactions
- Use real federation scenarios
- Test with multiple frameworks

### End-to-End Tests

- Test complete user workflows
- Use example applications
- Test in real browser environments

### Running Tests

```bash
# All tests
npm test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test files
npm test -- --testNamePattern="ModuleLoader"
```

## Documentation Guidelines

### Writing Style

- Use clear, concise language
- Provide practical examples
- Include code samples for APIs
- Explain the "why" not just the "what"

### Documentation Types

- **API Reference** - Complete function and class documentation
- **Tutorials** - Step-by-step guides for common tasks
- **Examples** - Working code samples
- **Architecture** - High-level design documentation

### Code Examples

- Provide complete, runnable examples
- Include error handling
- Show TypeScript usage
- Explain key concepts

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backward compatible)
- **PATCH** version for bug fixes (backward compatible)

### Release Checklist

1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Build and verify distribution
5. Create release notes
6. Tag release in Git
7. Publish to npm

## Getting Help

### Communication Channels

- **GitHub Discussions** - General questions and discussion
- **GitHub Issues** - Bug reports and feature requests
- **Discord Server** - Real-time chat with maintainers
- **Stack Overflow** - Technical Q&A (tag: native-federation)

### Maintainer Response Times

- **Critical bugs** - Within 24 hours
- **Feature requests** - Within 1 week
- **General questions** - Within 3 days
- **Pull requests** - Within 1 week

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes for significant contributions
- Annual contributor highlights
- Conference talks and presentations

## License

By contributing to Native Federation, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Native Federation! Your help makes this project better for everyone.