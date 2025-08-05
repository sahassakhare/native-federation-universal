module.exports = {
  name: 'mfe1',
  exposes: {
    './ProductList': './src/components/ProductList.jsx'
  },
  shared: {
    'react': { singleton: true, strictVersion: false },
    'react-dom': { singleton: true, strictVersion: false }
  }
};