module.exports = {
  name: 'mfe1',
  exposes: {
    './ProductList': './src/app/components/product-list/product-list.component',
    './DynamicComponent': './src/app/components/dynamic/dynamic.component'
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true },
    '@angular/platform-browser': { singleton: true, strictVersion: true },
    '@angular/platform-browser-dynamic': { singleton: true, strictVersion: true },
    'rxjs': { singleton: true, strictVersion: false },
    'zone.js': { singleton: true, strictVersion: false }
  }
};