export interface FederationConfig {
  name?: string;
  exposes?: Record<string, string>;
  shared?: SharedConfig;
  skip?: string[];
  remotes?: Record<string, string>;
}

export interface SharedConfig {
  [packageName: string]: SharedPackageConfig | boolean;
}

export interface SharedPackageConfig {
  singleton?: boolean;
  strictVersion?: boolean;
  requiredVersion?: string;
  packageName?: string;
  shareKey?: string;
  shareScope?: string;
  import?: string | false;
  version?: string;
  eager?: boolean;
}

export interface ShareOptions {
  singleton?: boolean;
  strictVersion?: boolean;
  requiredVersion?: string;
  eager?: boolean;
}

export interface RemoteEntry {
  name: string;
  type: 'esm';
  url: string;
  metadata: {
    exposes: Record<string, string>;
    shared: SharedConfig;
    version: string;
  };
}

export interface FederationManifest {
  [remoteName: string]: string;
}

export interface PreparedPackage {
  name: string;
  version: string;
  path: string;
  entryPoint: string;
  isEsm: boolean;
  dependencies: string[];
}

export interface ImportMapEntry {
  imports: Record<string, string>;
  scopes?: Record<string, Record<string, string>>;
}

export interface ModuleInfo {
  id: string;
  name: string;
  version: string;
  url: string;
  deps: string[];
  loaded: boolean;
  singleton: boolean;
}

export interface VersionStrategy {
  type: 'compatible' | 'exact' | 'fallback' | 'error';
  fallbackVersion?: string;
}

export interface BuildNotificationConfig {
  endpoint: string;
  events: ('build-complete' | 'build-error' | 'build-start')[];
}

export interface NativeFederationOptions extends FederationConfig {
  workspaceRoot?: string;
  outputPath?: string;
  cacheDir?: string;
  dev?: boolean;
  verbose?: boolean;
  buildNotifications?: BuildNotificationConfig;
}