const fs = require('fs');
const path = require('path');

// Load medicines.js by eval-ing it as var declarations
const src = fs.readFileSync(path.join(__dirname, '../src/data/medicines.js'), 'utf8');
const modSrc = src
  .replace(/export const /g, 'var ')
  .replace(/export function /g, 'function ');

// Run in a sandbox
const script = new Function('require', 'module', modSrc + '\nmodule.exports = { categories, medicinesData };');
const result = {};
script(require, { exports: result });

const { categories, medicinesData } = result;

if (!categories || !medicinesData) {
  console.error('ERROR: could not extract data');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });
const outPath = path.join(publicDir, 'medicines.json');
fs.writeFileSync(outPath, JSON.stringify({ categories, medicines: medicinesData }));

console.log(`✅ Written: public/medicines.json`);
console.log(`   Medicines: ${medicinesData.length}`);
console.log(`   Categories: ${categories.length}`);
console.log(`   File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
