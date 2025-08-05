import { Tree } from '@angular-devkit/schematics';
import { logging } from '@angular-devkit/core';

export class RuntimeTransformer {
  constructor(
    private tree: Tree,
    private logger: logging.LoggerApi
  ) {}

  /**
   * Transform Webpack Module Federation runtime to Native Federation
   */
  transformRuntimeCalls(filePath: string): boolean {
    if (!this.tree.exists(filePath)) {
      this.logger.warn(`File not found: ${filePath}`);
      return false;
    }

    const content = this.tree.read(filePath);
    if (!content) return false;

    let fileContent = content.toString();
    let modified = false;

    // Transform import() calls for remotes
    const importPattern = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    fileContent = fileContent.replace(importPattern, (match, modulePath) => {
      if (this.isRemoteModule(modulePath)) {
        modified = true;
        const [remoteName, exposedModule] = this.parseRemotePath(modulePath);
        return `window.nativeFederation.loadRemoteModule('${remoteName}', '${exposedModule}')`;
      }
      return match;
    });

    // Transform container references
    const containerPattern = /window\[['"`]([^'"`]+)['"`]\]\s*\.\s*get\s*\(/g;
    fileContent = fileContent.replace(containerPattern, (match, containerName) => {
      modified = true;
      return `window.nativeFederation.getRemote('${containerName}').get(`;
    });

    // Transform shared module references
    const sharedPattern = /__webpack_require__\.S\[['"`]([^'"`]+)['"`]\]/g;
    fileContent = fileContent.replace(sharedPattern, (match, moduleName) => {
      modified = true;
      return `window.nativeFederation.getSharedModule('${moduleName}')`;
    });

    if (modified) {
      this.tree.overwrite(filePath, fileContent);
      this.logger.info(` Transformed runtime calls in: ${filePath}`);
    }

    return modified;
  }

  /**
   * Add Native Federation runtime initialization
   */
  addRuntimeInitialization(entryPath: string): void {
    if (!this.tree.exists(entryPath)) {
      this.logger.warn(`Entry file not found: ${entryPath}`);
      return;
    }

    const content = this.tree.read(entryPath);
    if (!content) return;

    let fileContent = content.toString();

    // Check if already initialized
    if (fileContent.includes('nativeFederation.initialize')) {
      this.logger.info('Native Federation runtime already initialized');
      return;
    }

    // Add initialization at the beginning of the file
    const initCode = `// Native Federation Runtime Initialization
import { initFederation } from '@native-federation/core';

// Initialize federation before app starts
await initFederation('./federation.manifest.json');

`;

    fileContent = initCode + fileContent;
    this.tree.overwrite(entryPath, fileContent);
    this.logger.info(` Added runtime initialization to: ${entryPath}`);
  }

  private isRemoteModule(modulePath: string): boolean {
    // Check if the module path matches remote module pattern
    return modulePath.includes('/') && !modulePath.startsWith('.') && !modulePath.startsWith('/');
  }

  private parseRemotePath(modulePath: string): [string, string] {
    const parts = modulePath.split('/');
    const remoteName = parts[0];
    const exposedModule = './' + parts.slice(1).join('/');
    return [remoteName, exposedModule];
  }
}