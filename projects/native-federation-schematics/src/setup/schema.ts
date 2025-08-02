export interface SetupSchema {
  name: string;
  type: 'host' | 'remote';
  port?: number;
  skipPackageJson?: boolean;
  createSamples?: boolean;
}