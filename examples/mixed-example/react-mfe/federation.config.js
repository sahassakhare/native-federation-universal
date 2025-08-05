export default {
 name: 'react-mfe',
 exposes: {
 './ShoppingCart': './src/components/ShoppingCart.jsx'
 },
 shared: {
 'react': { singleton: true, strictVersion: false },
 'react-dom': { singleton: true, strictVersion: false }
 }
};