/**
 * Seeds default categories into the Category table.
 * Run once on the server after pulling this update:
 *   node scripts/seed-categories.mjs
 */
import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'dev.db');

const db = new Database(DB_PATH);

const defaults = [
  { slug: 'bracelets', nameAr: 'أساور',  nameEn: 'Bracelets', sortOrder: 1 },
  { slug: 'necklaces', nameAr: 'قلادات', nameEn: 'Necklaces', sortOrder: 2 },
  { slug: 'rings',     nameAr: 'خواتم',  nameEn: 'Rings',     sortOrder: 3 },
  { slug: 'sunglasses',nameAr: 'نظارات', nameEn: 'Sunglasses',sortOrder: 4 },
];

const insert = db.prepare(`
  INSERT INTO Category (id, slug, nameAr, nameEn, sortOrder, createdAt, updatedAt)
  VALUES (lower(hex(randomblob(9))), @slug, @nameAr, @nameEn, @sortOrder, datetime('now'), datetime('now'))
  ON CONFLICT(slug) DO NOTHING
`);

for (const cat of defaults) {
  insert.run(cat);
  console.log(`✓ ${cat.slug}`);
}

console.log('Done.');
db.close();
