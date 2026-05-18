/**
 * Run once to create the admin account:
 *   node scripts/seed-admin.mjs
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local manually ─────────────────────────────────────────────────
const envPath = resolve(__dirname, '../.env.local');
try {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
} catch {
  console.error('❌ Could not read .env.local — make sure it exists.');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@accessory.eg';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!';
const ADMIN_NAME     = 'Admin';
const ADMIN_PHONE    = '01000000000';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local');
  process.exit(1);
}

const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');

// ── Minimal User schema (mirrors src/models/User.ts) ────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true },
    email:           { type: String, required: true, unique: true, lowercase: true },
    phone:           { type: String, required: true },
    password:        { type: String, required: true },
    role:            { type: String, enum: ['customer', 'admin'], default: 'customer' },
    savedAddresses:  { type: Array, default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.');

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    // If user exists but is not admin, promote them
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ Existing user "${ADMIN_EMAIL}" promoted to admin.`);
    } else {
      console.log(`ℹ️  Admin user "${ADMIN_EMAIL}" already exists.`);
    }
  } else {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL.toLowerCase(),
      phone:    ADMIN_PHONE,
      password: hashed,
      role:     'admin',
    });
    console.log(`✅ Admin user created:`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
  console.log('🎉 Done! You can now log in at /admin/login');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
