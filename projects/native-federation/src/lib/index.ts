export { NativeFederationPlugin } from './core/plugin';
export { PackagePreparator } from './core/package-preparator';
export { SharedDependencyResolver } from './core/shared-dependency-resolver';
export { ImportMapGenerator } from './core/import-map-generator';
export { RemoteEntryGenerator } from './core/remote-entry-generator';
export { BuildNotificationManager, watchFederationBuildCompletion } from './core/build-notification-manager';

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
} from './utils/helpers';

export * from './types/federation';

export const version = '1.0.0';