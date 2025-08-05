export default {
 name: 'mfe1',
 exposes: {
 './ProductComponent': './src/product/product.component.ts'
 },
 shared: {
 '@angular/core': { singleton: true, strictVersion: false },
 '@angular/common': { singleton: true, strictVersion: false },
 '@angular/platform-browser': { singleton: true, strictVersion: false },
 'rxjs': { singleton: true, strictVersion: false },
 'zone.js': { singleton: true, strictVersion: false }
 }
};