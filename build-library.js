const { ngPackagr } = require('ng-packagr');
const path = require('path');

async function buildLibrary() {
  try {
    console.log('Building Native Federation library with ng-packagr...');
    
    await ngPackagr()
      .forProject(path.join(__dirname, 'projects/native-federation/ng-package.json'))
      .withTsConfig(path.join(__dirname, 'projects/native-federation/tsconfig.lib.json'))
      .build();
      
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildLibrary();