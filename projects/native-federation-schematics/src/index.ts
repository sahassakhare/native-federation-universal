/*
 * Public API Surface of @native-federation/schematics
 */

// Schematic exports
export { migrate } from './migrate';
export { convertConfig } from './convert-config';
export { updateRuntime } from './update-runtime';
export { setupBuild } from './setup-build';
export { analyze } from './analyze';

// Utility exports
export * from './utils/webpack-analyzer';
export * from './utils/dependency-updater';
export * from './utils/runtime-transformer';