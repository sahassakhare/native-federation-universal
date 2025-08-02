export interface SetupBuildSchema {
  name: string;
  bundler?: 'esbuild' | 'rollup' | 'vite';
  framework?: 'react' | 'vue' | 'angular' | 'none';
}