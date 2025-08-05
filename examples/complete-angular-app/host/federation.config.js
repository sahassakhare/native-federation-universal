module.exports = {
  name: 'host',
  remotes: {
    'mfe1': 'http://localhost:4201/remoteEntry.js'
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