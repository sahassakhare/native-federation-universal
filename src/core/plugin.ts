import { BuildOptions, Plugin } from 'esbuild';
import { NativeFederationOptions, FederationConfig } from '../types/federation.js';
import { PackagePreparator } from './package-preparator.js';
import { ImportMapGenerator } from './import-map-generator.js';
import { RemoteEntryGenerator } from './remote-entry-generator.js';
import { SharedDependencyResolver } from './shared-dependency-resolver.js';
import { BuildNotificationManager } from './build-notification-manager.js';
import * as path from 'path';
import * as fs from 'fs/promises';

export class NativeFederationPlugin {
  private config: NativeFederationOptions;
  private packagePreparator: PackagePreparator;
  private importMapGenerator: ImportMapGenerator;
  private remoteEntryGenerator: RemoteEntryGenerator;
  private sharedResolver: SharedDependencyResolver;
  private buildNotificationManager?: BuildNotificationManager;

  constructor(config: NativeFederationOptions) {
    this.config = {
      workspaceRoot: process.cwd(),
      outputPath: 'dist',
      cacheDir: 'node_modules/.cache/native-federation',
      dev: false,
      verbose: false,
      ...config
    };

    this.packagePreparator = new PackagePreparator(this.config);
    this.importMapGenerator = new ImportMapGenerator(this.config);
    this.remoteEntryGenerator = new RemoteEntryGenerator(this.config);
    this.sharedResolver = new SharedDependencyResolver(this.config);

    if (this.config.buildNotifications) {
      this.buildNotificationManager = new BuildNotificationManager(this.config.buildNotifications);
    }
  }

  createEsbuildPlugin(): Plugin {
    return {
      name: 'native-federation',
      setup: (build) => {
        build.onStart(async () => {
          if (this.config.verbose) {
            console.log('[Native Federation] Build started');
          }
          
          this.buildNotificationManager?.notifyBuildStart();
        });

        build.onEnd(async (result) => {
          try {
            if (result.errors.length > 0) {
              this.buildNotificationManager?.notifyBuildError(result.errors);
              return;
            }

            await this.processFederation();
            
            if (this.config.verbose) {
              console.log('[Native Federation] Build completed successfully');
            }

            this.buildNotificationManager?.notifyBuildComplete();
          } catch (error: any) {
            console.error('[Native Federation] Build failed:', error);
            this.buildNotificationManager?.notifyBuildError([{ text: error.message }]);
          }
        });

        if (this.config.shared) {
          build.onResolve({ filter: /.*/ }, async (args) => {
            const resolvedShared = await this.sharedResolver.resolveSharedDependency(args.path);
            if (resolvedShared) {
              return {
                path: resolvedShared.path,
                external: true
              };
            }
          });
        }
      }
    };
  }

  private async processFederation(): Promise<void> {
    await this.ensureOutputDirectory();

    if (this.config.shared) {
      await this.prepareSharedDependencies();
    }

    if (this.config.exposes) {
      await this.generateRemoteEntry();
    }

    await this.generateImportMaps();
  }

  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.outputPath!, { recursive: true });
    } catch (error: any) {
    }
  }

  private async prepareSharedDependencies(): Promise<void> {
    const sharedPackages = Object.keys(this.config.shared!);
    
    for (const packageName of sharedPackages) {
      if (this.config.skip?.includes(packageName)) {
        continue;
      }

      try {
        await this.packagePreparator.preparePackage(packageName);
      } catch (error: any) {
        if (this.config.verbose) {
          console.warn(`[Native Federation] Failed to prepare package ${packageName}:`, error.message);
        }
      }
    }
  }

  private async generateRemoteEntry(): Promise<void> {
    const remoteEntry = await this.remoteEntryGenerator.generate();
    const outputFile = path.join(this.config.outputPath!, 'remoteEntry.json');
    
    await fs.writeFile(outputFile, JSON.stringify(remoteEntry, null, 2));
    
    if (this.config.verbose) {
      console.log(`[Native Federation] Remote entry generated: ${outputFile}`);
    }
  }

  private async generateImportMaps(): Promise<void> {
    const importMap = await this.importMapGenerator.generate();
    const outputFile = path.join(this.config.outputPath!, 'importmap.json');
    
    await fs.writeFile(outputFile, JSON.stringify(importMap, null, 2));
    
    if (this.config.verbose) {
      console.log(`[Native Federation] Import map generated: ${outputFile}`);
    }
  }

  async apply(buildOptions: BuildOptions): Promise<BuildOptions> {
    const plugin = this.createEsbuildPlugin();
    
    return {
      ...buildOptions,
      plugins: [
        ...(buildOptions.plugins || []),
        plugin
      ]
    };
  }
}