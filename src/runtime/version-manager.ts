import { VersionStrategy } from '../types/federation.js';
import * as semver from 'semver';

export class VersionManager {
  private availableVersions = new Map<string, string[]>();
  private installedVersions = new Map<string, string>();

  async resolveVersion(packageName: string, strategy: VersionStrategy = { type: 'compatible' }): Promise<string> {
    const installedVersion = this.installedVersions.get(packageName);
    const availableVersions = this.availableVersions.get(packageName) || [];

    switch (strategy.type) {
      case 'exact':
        if (!installedVersion) {
          throw new Error(`Exact version required but ${packageName} not installed`);
        }
        return installedVersion;

      case 'compatible':
        return this.findCompatibleVersion(packageName, installedVersion, availableVersions);

      case 'fallback':
        try {
          return this.findCompatibleVersion(packageName, installedVersion, availableVersions);
        } catch {
          if (strategy.fallbackVersion) {
            return strategy.fallbackVersion;
          }
          throw new Error(`No compatible version found for ${packageName} and no fallback provided`);
        }

      case 'error':
        if (!this.isVersionCompatible(installedVersion, availableVersions)) {
          throw new Error(`Version conflict for ${packageName}: installed ${installedVersion}, available ${availableVersions.join(', ')}`);
        }
        return installedVersion!;

      default:
        throw new Error(`Unknown version strategy: ${strategy.type}`);
    }
  }

  private findCompatibleVersion(packageName: string, installedVersion?: string, availableVersions: string[] = []): string {
    if (!installedVersion) {
      if (availableVersions.length > 0) {
        return availableVersions[0];
      }
      throw new Error(`No version available for ${packageName}`);
    }

    if (availableVersions.length === 0) {
      return installedVersion;
    }

    const compatibleVersions = availableVersions.filter(version => 
      this.areVersionsCompatible(installedVersion, version)
    );

    if (compatibleVersions.length === 0) {
      throw new Error(`No compatible version found for ${packageName}. Installed: ${installedVersion}, Available: ${availableVersions.join(', ')}`);
    }

    return this.selectBestVersion(compatibleVersions);
  }

  private areVersionsCompatible(version1: string, version2: string): boolean {
    try {
      const range1 = semver.major(version1);
      const range2 = semver.major(version2);
      
      return range1 === range2;
    } catch {
      return version1 === version2;
    }
  }

  private isVersionCompatible(installedVersion?: string, availableVersions: string[] = []): boolean {
    if (!installedVersion || availableVersions.length === 0) {
      return true;
    }

    return availableVersions.some(version => 
      this.areVersionsCompatible(installedVersion, version)
    );
  }

  private selectBestVersion(versions: string[]): string {
    try {
      return semver.rsort(versions)[0];
    } catch {
      return versions[0];
    }
  }

  registerInstalledVersion(packageName: string, version: string): void {
    this.installedVersions.set(packageName, version);
  }

  registerAvailableVersions(packageName: string, versions: string[]): void {
    this.availableVersions.set(packageName, versions);
  }

  getInstalledVersion(packageName: string): string | undefined {
    return this.installedVersions.get(packageName);
  }

  getAvailableVersions(packageName: string): string[] {
    return this.availableVersions.get(packageName) || [];
  }

  validateVersionConstraint(packageName: string, constraint: string): boolean {
    const installedVersion = this.installedVersions.get(packageName);
    
    if (!installedVersion) {
      return false;
    }

    try {
      return semver.satisfies(installedVersion, constraint);
    } catch {
      return installedVersion === constraint;
    }
  }

  clear(): void {
    this.availableVersions.clear();
    this.installedVersions.clear();
  }
}