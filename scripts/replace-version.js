import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const versionFile = path.join(__dirname, '../dist/version.js');

if (!fs.existsSync(versionFile)) {
  console.error('Error: version.js not found in dist folder');
  process.exit(1);
}

const content = fs.readFileSync(versionFile, 'utf-8');
const replaced = content.replace('${__BKT_SDK_VERSION__}', pkg.version);
fs.writeFileSync(versionFile, replaced);

console.log(`✓ Version ${pkg.version} replaced successfully in version.js`);
