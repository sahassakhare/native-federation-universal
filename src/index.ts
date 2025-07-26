export { NativeFederationPlugin } from './core/plugin.js';
export { PackagePreparator } from './core/package-preparator.js';
export { SharedDependencyResolver } from './core/shared-dependency-resolver.js';
export { ImportMapGenerator } from './core/import-map-generator.js';
export { RemoteEntryGenerator } from './core/remote-entry-generator.js';
export { BuildNotificationManager, watchFederationBuildCompletion } from './core/build-notification-manager.js';

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
} from './utils/helpers.js';

export * from './types/federation.js';

export const version = '1.0.0';