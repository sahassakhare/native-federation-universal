export interface Schema {
  project: string;
  buildTool?: 'esbuild' | 'angular-cli';
  skipAngularConfig?: boolean;
  verbose?: boolean;
}