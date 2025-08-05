export default {
 name: 'angular-host',
 remotes: {
 'mfe1': 'http://localhost:4201/remoteEntry.js'
 },
 shared: {
 '@angular/core': { singleton: true, strictVersion: false },
 '@angular/common': { singleton: true, strictVersion: false },
 '@angular/platform-browser': { singleton: true, strictVersion: false },
 'rxjs': { singleton: true, strictVersion: false },
 'zone.js': { singleton: true, strictVersion: false }
 }
};