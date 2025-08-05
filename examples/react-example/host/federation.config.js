module.exports = {
  name: 'react-host',
  remotes: {
    'mfe1': 'http://localhost:4301/remoteEntry.js'
  },
  shared: {
    'react': { singleton: true, strictVersion: false },
    'react-dom': { singleton: true, strictVersion: false }
  }
};