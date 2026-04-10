const { execSync } = require('child_process');

const path = require('path');
const root = path.resolve(__dirname, '..');

console.log('Building web bundle from Expo routes...');
execSync('npx expo export -p web', { cwd: root, stdio: 'inherit' });
