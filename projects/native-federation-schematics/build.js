const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, '../../dist/native-federation-schematics');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Compile TypeScript
console.log('Compiling TypeScript...');
execSync(`cd "${__dirname}" && tsc`, { stdio: 'inherit' });

// Copy collection.json
fs.copyFileSync(
  path.join(__dirname, 'collection.json'),
  path.join(distDir, 'collection.json')
);

// Copy all schema.json files
function copyJsonFiles(dir, relativePath = '') {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const srcPath = path.join(dir, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyJsonFiles(srcPath, path.join(relativePath, item));
    } else if (item.endsWith('.json')) {
      const destPath = path.join(distDir, 'src', relativePath, item);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

copyJsonFiles(srcDir);

// Create package.json
const packageMetadata = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'package-metadata.json'), 'utf8')
);

const packageJson = {
  ...packageMetadata,
  schematics: "./collection.json",
  "ng-add": {
    "save": "devDependencies"
  },
  peerDependencies: {
    "@angular-devkit/core": "^18.0.0",
    "@angular-devkit/schematics": "^18.0.0",
    "@schematics/angular": "^18.0.0",
    "@native-federation/core": "^1.0.0"
  }
};

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

console.log('✅ Schematics build completed!');