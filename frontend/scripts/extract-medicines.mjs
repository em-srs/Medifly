/**
 * One-shot script: reads src/data/medicines.js, writes:
 *   1. public/medicines.json    (static file - bundler ignores it)
 *   2. src/data/medicines.js    (lean shim with helpers only)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// ── 1. Dynamically load the existing JS exports ───────────────────────────────
const require = createRequire(import.meta.url);

// We'll eval the file in a minimal CommonJS wrapper
const src = readFileSync(path.join(root, 'src/data/medicines.js'), 'utf8');

// Convert ES module exports to CommonJS for eval
const cjsSrc = src
  .replace(/^export const /gm, 'exports.')
  .replace(/export const /g, 'exports.');

const mod = { exports: {} };
const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', cjsSrc);
fn(mod.exports, require, mod, __filename, __dirname);

const { categories, medicinesData } = mod.exports;

if (!categories || !medicinesData) {
  throw new Error('Could not extract categories or medicinesData from medicines.js');
}

// ── 2. Write public/medicines.json ────────────────────────────────────────────
const publicDir = path.join(root, 'public');
mkdirSync(publicDir, { recursive: true });

writeFileSync(
  path.join(publicDir, 'medicines.json'),
  JSON.stringify({ categories, medicines: medicinesData }, null, 0),  // compact
  'utf8'
);
console.log(`✅ Written: public/medicines.json (${medicinesData.length} medicines)`);

// ── 3. Write the new lean medicines.js shim ───────────────────────────────────
const shimSrc = `// ─── MediFly Medicines Data Layer ─────────────────────────────────────────────
// Data lives in public/medicines.json to keep the JS bundle tiny.
// Use loadMedicines() to fetch it (cached after first call).

export const categories = ${JSON.stringify(categories, null, 2)};

// Module-level cache so we never fetch twice per session
let _cache = null;
let _promise = null;

export async function loadMedicines() {
  if (_cache) return _cache;
  if (_promise) return _promise;
  _promise = fetch('/medicines.json')
    .then(r => r.json())
    .then(data => {
      _cache = data.medicines;
      return _cache;
    });
  return _promise;
}

// ── Sync helpers (work on a pre-loaded array) ─────────────────────────────────
export const searchMedicinesSync = (medsArray, query) => {
  const q = query.toLowerCase().trim();
  if (!q) return medsArray;
  return medsArray.filter(
    med =>
      med.name.toLowerCase().includes(q) ||
      med.salt.toLowerCase().includes(q) ||
      med.manufacturer.toLowerCase().includes(q)
  );
};

export const getMedicinesByCategorySync = (medsArray, categoryId) => {
  if (categoryId === 'all') return medsArray;
  return medsArray.filter(med => med.category === categoryId);
};

// ── Legacy sync exports (kept for dashboard quick-search compat) ──────────────
// These return [] until loadMedicines() has been called once.
export const medicines = [];
export const medicinesData = [];

export const searchMedicines = (query) => searchMedicinesSync(_cache || [], query);
export const getMedicinesByCategory = (categoryId) => getMedicinesByCategorySync(_cache || [], categoryId);
`;

writeFileSync(path.join(root, 'src/data/medicines.js'), shimSrc, 'utf8');
console.log('✅ Written: src/data/medicines.js (lean shim)');
console.log('Done! Restart `npm run dev` to see the speed improvement.');
