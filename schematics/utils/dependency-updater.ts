export interface DependencyUpdates {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  toRemove: string[];
  scripts: Record<string, string>;
  warnings: string[];
}

export class DependencyUpdater {
  
  getUpdates(packageJson: any): DependencyUpdates {
    const updates: DependencyUpdates = {
      dependencies: {},
      devDependencies: {},
      toRemove: [],
      scripts: {},
      warnings: []
    };

    // Add Native Federation dependencies
    updates.dependencies['@native-federation/core'] = '^1.0.0';
    
    // Add esbuild for building
    updates.devDependencies['esbuild'] = '^0.19.0';
    
    // Add development utilities
    updates.devDependencies['http-server'] = '^14.0.0';
    updates.devDependencies['concurrently'] = '^8.0.0';

    // Remove webpack Module Federation dependencies
    const webpackDependencies = [
      '@module-federation/enhanced',
      '@angular-architects/module-federation',
      '@angular-architects/module-federation-tools',
      'webpack',
      'webpack-cli',
      'webpack-dev-server',
      '@angular-builders/custom-webpack',
      'webpack-merge'
    ];

    webpackDependencies.forEach(dep => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        updates.toRemove.push(dep);
        updates.warnings.push(`Removed webpack dependency: ${dep}`);
      }
    });

    // Update Angular dependencies if needed
    this.updateAngularDependencies(packageJson, updates);
    
    // Update build scripts
    this.updateBuildScripts(packageJson, updates);

    return updates;
  }

  private updateAngularDependencies(packageJson: any, updates: DependencyUpdates): void {
    const angularCore = packageJson.dependencies?.['@angular/core'];
    if (angularCore) {
      // Ensure Angular 16+ for Native Federation compatibility
      const version = this.extractVersionNumber(angularCore);
      if (version && version < 16) {
        updates.warnings.push('Native Federation requires Angular 16+. Consider upgrading.');
      }
    }

    // Ensure required Angular packages are present
    const requiredAngular = [
      '@angular/platform-browser',
      '@angular/common',
      '@angular/router'
    ];

    requiredAngular.forEach(pkg => {
      if (packageJson.dependencies?.[pkg]) {
        // Keep existing version
      } else {
        updates.warnings.push(`Consider adding ${pkg} if using its features`);
      }
    });
  }

  private updateBuildScripts(packageJson: any, updates: DependencyUpdates): void {
    const scripts = packageJson.scripts || {};
    
    // Backup existing scripts
    if (scripts.build && scripts.build.includes('webpack')) {
      updates.scripts['build:webpack'] = scripts.build;
    }
    if (scripts.serve && scripts.serve.includes('webpack')) {
      updates.scripts['serve:webpack'] = scripts.serve;
    }
    if (scripts.start && scripts.start.includes('webpack')) {
      updates.scripts['start:webpack'] = scripts.start;
    }

    // Add new Native Federation scripts
    updates.scripts.build = 'esbuild --config=esbuild.config.js';
    updates.scripts['build:watch'] = 'esbuild --config=esbuild.config.js --watch';
    updates.scripts.serve = 'http-server dist -p 4200 --cors';
    updates.scripts.dev = 'concurrently "npm run build:watch" "npm run serve"';
    
    // Update ng scripts if using Angular CLI
    if (scripts.ng) {
      updates.scripts['ng:original'] = scripts.ng;
      updates.warnings.push('Angular CLI commands backed up. You may need to configure esbuild with Angular CLI.');
    }
  }

  private extractVersionNumber(versionString: string): number | null {
    const match = versionString.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  // Method to validate package.json after updates
  validateUpdatedPackageJson(packageJson: any): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for Native Federation core
    if (!packageJson.dependencies?.['@native-federation/core']) {
      issues.push('Missing @native-federation/core dependency');
    }

    // Check for esbuild
    if (!packageJson.devDependencies?.['esbuild'] && !packageJson.dependencies?.['esbuild']) {
      issues.push('Missing esbuild dependency');
    }

    // Check for conflicting webpack dependencies
    const webpackDeps = [
      '@module-federation/enhanced',
      '@angular-architects/module-federation'
    ];

    webpackDeps.forEach(dep => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        issues.push(`Conflicting webpack dependency found: ${dep}`);
      }
    });

    // Check for proper build scripts
    if (!packageJson.scripts?.build || !packageJson.scripts.build.includes('esbuild')) {
      issues.push('Build script not updated to use esbuild');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Method to generate migration recommendations
  generateRecommendations(packageJson: any): string[] {
    const recommendations: string[] = [];

    // Check Angular version
    const angularVersion = packageJson.dependencies?.['@angular/core'];
    if (angularVersion) {
      const version = this.extractVersionNumber(angularVersion);
      if (version && version < 16) {
        recommendations.push('Consider upgrading to Angular 16+ for best Native Federation support');
      }
    }

    // Check for TypeScript
    if (!packageJson.devDependencies?.['typescript'] && !packageJson.dependencies?.['typescript']) {
      recommendations.push('Consider adding TypeScript for better development experience');
    }

    // Check for testing frameworks
    if (packageJson.devDependencies?.['@angular/testing'] || packageJson.devDependencies?.['jest']) {
      recommendations.push('Update test configurations to work with esbuild if needed');
    }

    // Check for linting
    if (packageJson.devDependencies?.['eslint'] || packageJson.devDependencies?.['tslint']) {
      recommendations.push('Update linting rules to support Native Federation patterns');
    }

    // Check for CI/CD indicators
    if (packageJson.scripts?.['ci'] || packageJson.scripts?.['deploy']) {
      recommendations.push('Update CI/CD pipelines to use esbuild instead of webpack');
    }

    return recommendations;
  }

  // Method to create a migration summary
  createMigrationSummary(updates: DependencyUpdates): string {
    let summary = '# Dependency Migration Summary\n\n';
    
    summary += '## Added Dependencies\n\n';
    if (Object.keys(updates.dependencies).length > 0) {
      summary += '### Production Dependencies\n';
      Object.entries(updates.dependencies).forEach(([name, version]) => {
        summary += `- ${name}@${version}\n`;
      });
      summary += '\n';
    }
    
    if (Object.keys(updates.devDependencies).length > 0) {
      summary += '### Development Dependencies\n';
      Object.entries(updates.devDependencies).forEach(([name, version]) => {
        summary += `- ${name}@${version}\n`;
      });
      summary += '\n';
    }

    summary += '## Removed Dependencies\n\n';
    if (updates.toRemove.length > 0) {
      updates.toRemove.forEach(dep => {
        summary += `- ${dep}\n`;
      });
    } else {
      summary += 'None\n';
    }
    summary += '\n';

    summary += '## Updated Scripts\n\n';
    if (Object.keys(updates.scripts).length > 0) {
      Object.entries(updates.scripts).forEach(([name, command]) => {
        summary += `- **${name}**: \`${command}\`\n`;
      });
    } else {
      summary += 'None\n';
    }
    summary += '\n';

    if (updates.warnings.length > 0) {
      summary += '## Warnings\n\n';
      updates.warnings.forEach(warning => {
        summary += `⚠️ ${warning}\n`;
      });
      summary += '\n';
    }

    return summary;
  }
}