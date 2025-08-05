// Host Federation Configuration
const config = {
  name: 'vite-host',
  remotes: {
    'mfe1': 'http://localhost:4201/remoteEntry.js'
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true },
    '@angular/common': { singleton: true, strictVersion: true },
    '@angular/platform-browser': { singleton: true, strictVersion: true },
    'rxjs': { singleton: true, strictVersion: false }
  }
};

export default config;