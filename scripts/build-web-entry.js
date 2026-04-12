const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const customEntry = path.join(root, 'web', 'index.html');
const distDir = path.join(root, 'dist');
const distEntry = path.join(distDir, 'index.html');

if (fs.existsSync(customEntry)) {
  fs.mkdirSync(distDir, { recursive: true });
  fs.copyFileSync(customEntry, distEntry);
  console.log('Custom web entry copied to dist/index.html');
  process.exit(0);
}

console.log('Custom web entry not found. Falling back to Expo export.');
execSync('npx expo export -p web', { cwd: root, stdio: 'inherit' });
