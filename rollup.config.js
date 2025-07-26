import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const external = ['esbuild', 'semver', 'fs', 'path', 'child_process', 'commander'];

export default [
  // CLI build
  {
    input: 'src/cli/index.ts',
    output: {
      file: 'dist/cli/index.js',
      format: 'esm',
      banner: '#!/usr/bin/env node',
      sourcemap: true
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        rootDir: './src'
      })
    ]
  },
  {
    input: 'src/runtime.ts',
    output: [
      {
        file: 'dist/runtime.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/runtime.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    external: [...external, './types/federation.js'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist'
      })
    ]
  }
];