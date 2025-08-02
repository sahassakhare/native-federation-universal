/*
 * Build Tools API for Node.js environments only
 * Import: import { NativeFederationPlugin, shareAll } from '@native-federation/core/build-tools'
 */

// Core Build Tools (Node.js only)
export { NativeFederationPlugin } from '../src/lib/core/plugin';

// Build Utilities (Node.js only) 
export { shareAll } from '../src/lib/utils/helpers';

// Types (shared)
export * from '../src/lib/types/federation';