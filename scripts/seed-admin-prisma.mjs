/**
 * Creates the admin account in the SQLite database.
 * Run once: node scripts/seed-admin-prisma.mjs
 */
import { createRequire } from 'module';
import { randomBytes } from 'crypto';
const require = createRequire(import.meta.url);

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@accessory.eg';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!';
const ADMIN_NAME     = 'Admin';
const ADMIN_PHONE    = '01000000000';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'dev.db');

const db = new Database(DB_PATH);

const existing = db.prepare('SELECT id, role FROM "User" WHERE email = ?').get(ADMIN_EMAIL.toLowerCase());

if (existing) {
  if (existing.role !== 'admin') {
    db.prepare('UPDATE "User" SET role = ? WHERE id = ?').run('admin', existing.id);
    console.log(`✅ User "${ADMIN_EMAIL}" promoted to admin.`);
  } else {
    console.log(`ℹ️  Admin "${ADMIN_EMAIL}" already exists.`);
  }
} else {
  const hashed = bcrypt.hashSync(ADMIN_PASSWORD, 12);
  const id     = randomBytes(12).toString('hex');
  const now    = new Date().toISOString();
  db.prepare(`
    INSERT INTO "User" (id, name, email, phone, password, role, isActive, isVerified, addresses, orderCount, totalSpent, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, 'admin', 1, 1, '[]', 0, 0, ?, ?)
  `).run(id, ADMIN_NAME, ADMIN_EMAIL.toLowerCase(), ADMIN_PHONE, hashed, now, now);
  console.log(`✅ Admin created:`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}

db.close();
console.log('🎉 Done! Log in at http://localhost:3000/admin/login');
