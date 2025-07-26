export interface Schema {
  project: string;
  webpackConfig?: string;
  skipPackageJson?: boolean;
  skipBuildConfig?: boolean;
  skipRuntimeUpdate?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}