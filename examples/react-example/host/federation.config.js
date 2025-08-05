export default {
 name: 'react-host',
 remotes: {
 'mfe1': 'http://localhost:3001/remoteEntry.js'
 },
 shared: {
 'react': { singleton: true, strictVersion: false },
 'react-dom': { singleton: true, strictVersion: false }
 }
};