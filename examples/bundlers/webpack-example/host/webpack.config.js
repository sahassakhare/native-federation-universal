// Angular + Webpack + Native Federation Configuration
const { NativeFederationPlugin } = require('@native-federation/core');
const federationConfig = require('./federation.config.js');

module.exports = {
  plugins: [
    new NativeFederationPlugin(federationConfig)
  ],
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        angular: {
          test: /[\\/]node_modules[\\/]@angular[\\/]/,
          name: 'angular',
          chunks: 'all',
          priority: 20
        },
        federation: {
          test: /[\\/]node_modules[\\/]@native-federation[\\/]/,
          name: 'federation',
          chunks: 'all',
          priority: 30
        }
      }
    }
  },
  experiments: {
    outputModule: true
  },
  resolve: {
    alias: {
      '@': require('path').resolve(__dirname, 'src')
    }
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    historyApiFallback: true,
    hot: true,
    liveReload: true
  }
};