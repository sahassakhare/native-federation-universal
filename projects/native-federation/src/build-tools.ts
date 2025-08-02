/*
 * Build Tools API for Node.js environments only
 * These exports require Node.js modules and are not browser-compatible
 */

// Core Build Tools (Node.js only)
export { NativeFederationPlugin } from './lib/core/plugin';
export { PackagePreparator } from './lib/core/package-preparator';
export { SharedDependencyResolver } from './lib/core/shared-dependency-resolver';
export { ImportMapGenerator } from './lib/core/import-map-generator';
export { RemoteEntryGenerator } from './lib/core/remote-entry-generator';
export { BuildNotificationManager, watchFederationBuildCompletion } from './lib/core/build-notification-manager';

// Build Utilities (Node.js only)
export {
  shareAll,
  share,
  singleton,
  discoverDependencies,
  shareAllDependencies,
  withFederation,
  createRemoteMap,
  normalizeExposedModules,
  validateFederationConfig,
  FederationConfigBuilder,
  createFederationConfig
} from './lib/utils/helpers';

// Types (shared)
export * from './lib/types/federation';

export const version = '1.0.0';