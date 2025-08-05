export default {
 name: 'angular-host',
 remotes: {
 'react-mfe': 'http://localhost:4201/remoteEntry.js'
 },
 shared: {
 '@angular/core': { singleton: true, strictVersion: false },
 '@angular/common': { singleton: true, strictVersion: false },
 '@angular/platform-browser': { singleton: true, strictVersion: false },
 'rxjs': { singleton: true, strictVersion: false },
 'zone.js': { singleton: true, strictVersion: false },
 'react': { singleton: true, strictVersion: false },
 'react-dom': { singleton: true, strictVersion: false }
 }
};