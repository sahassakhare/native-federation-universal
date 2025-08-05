// Angular + Rspack + Native Federation Configuration
const { NativeFederationPlugin } = require('@native-federation/core');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const federationConfig = require('./federation.config.js');

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  entry: './src/main.ts',
  mode: process.env.NODE_ENV || 'development',
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Rspack + Native Federation Host'
    }),
    new NativeFederationPlugin(federationConfig)
  ],
  
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                  decorators: true,
                  tsx: false
                },
                transform: {
                  legacyDecorator: true,
                  decoratorMetadata: true
                },
                target: 'es2022'
              },
              module: {
                type: 'es6'
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['builtin:lightningcss-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': require('path').resolve(__dirname, 'src')
    }
  },
  
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        angular: {
          test: /[\\/]node_modules[\\/]@angular[\\/]/,
          name: 'angular',
          chunks: 'all',
          priority: 20,
          enforce: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          priority: 10
        },
        federation: {
          test: /[\\/]node_modules[\\/]@native-federation[\\/]/,
          name: 'federation',
          chunks: 'all',
          priority: 30
        }
      }
    },
    minimize: process.env.NODE_ENV === 'production',
    usedExports: true,
    sideEffects: false
  },
  
  experiments: {
    outputModule: true
  },
  
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    path: require('path').resolve(__dirname, 'dist'),
    clean: true,
    module: true,
    chunkFormat: 'module',
    library: {
      type: 'module'
    }
  },
  
  devServer: {
    port: 4200,
    hot: true,
    liveReload: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    historyApiFallback: true,
    static: {
      directory: require('path').join(__dirname, 'dist')
    }
  },
  
  stats: {
    timings: true,
    builtAt: true,
    colors: true,
    chunks: false,
    modules: false
  }
};