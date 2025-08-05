export default {
 name: 'angular-ssr-host',
 remotes: {
 'news-mfe': 'http://localhost:4301/remoteEntry.js'
 },
 shared: {
 '@angular/core': { singleton: true, strictVersion: false },
 '@angular/common': { singleton: true, strictVersion: false },
 '@angular/platform-browser': { singleton: true, strictVersion: false },
 'rxjs': { singleton: true, strictVersion: false },
 'zone.js': { singleton: true, strictVersion: false }
 }
};