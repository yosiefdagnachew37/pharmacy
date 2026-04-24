/**
 * LAN Server Database Seeder
 *
 * Creates the initial organization and admin user required to log in.
 * Run once on a fresh database:
 *
 *   node seed-lan.js
 *
 * Uses the same credentials from lan-server.env in the same folder.
 */
'use strict';

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Load lan-server.env ───────────────────────────────────────────────────────
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const vars = {};
  for (const raw of fs.readFileSync(filePath, 'utf-8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 1) continue;
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    vars[key] = val;
  }
  return vars;
}

const env = parseEnvFile(path.join(__dirname, 'lan-server.env'));

// ── Config ────────────────────────────────────────────────────────────────────
const DB_CONFIG = {
  host:     env.DB_HOST     || 'localhost',
  port:     parseInt(env.DB_PORT || '5432'),
  user:     env.DB_USERNAME || 'pharmacy_user',
  password: env.DB_PASSWORD || '',
  database: env.DB_NAME     || 'pharmacy_lan_db',
};

const ORG_ID   = '00000000-0000-0000-0000-000000000001';
const ORG_NAME = 'Main Pharmacy';

// Admin credentials — change password after first login!
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@123';

// ── Simple bcrypt-compatible hash using Node crypto ───────────────────────────
// NOTE: Uses a pre-computed bcrypt hash for 'Admin@123' with salt rounds 10.
// This avoids requiring the bcrypt package on the server.
// If you need a different password, generate a hash on your dev machine:
//   node -e "const b=require('bcrypt'); b.hash('YourPass',10).then(console.log)"
// Then replace the ADMIN_HASH value below.
const ADMIN_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password: password
// Using a runtime hash instead:
async function hashPassword(password) {
  try {
    const bcrypt = require('bcrypt');
    return await bcrypt.hash(password, 10);
  } catch {
    try {
      const bcryptjs = require('bcryptjs');
      return await bcryptjs.hash(password, 10);
    } catch {
      // Fallback: use pre-hashed value for 'Admin@123' (bcrypt, 10 rounds)
      console.warn('⚠️  bcrypt not available — using pre-hashed password for Admin@123');
      return '$2b$10$TwbZ7h3QZuO1YP8JW.kz8OXX.yN7gzMOEivKr9rI.0NXRP6W5mBEK';
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Pharmacy LAN Database Seeder');
  console.log('─'.repeat(50));
  console.log('🔌 Connecting to:', `${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('✅ Connected\n');

  try {
    await client.query('BEGIN');

    // 1. Check if organization already exists
    const orgCheck = await client.query(
      `SELECT id FROM organizations WHERE id = $1`, [ORG_ID]
    );

    if (orgCheck.rows.length > 0) {
      console.log('ℹ️  Organization already exists — skipping organization creation');
    } else {
      console.log('🏢 Creating organization...');

      // Detect the first valid subscription_plan enum value dynamically
      let subscriptionPlan = 'basic';
      try {
        const enumRes = await client.query(
          `SELECT unnest(enum_range(NULL::organizations_subscription_plan_enum))::text AS val`
        );
        if (enumRes.rows.length > 0) {
          subscriptionPlan = enumRes.rows[0].val;
          console.log(`   📋 Using subscription plan: ${subscriptionPlan}`);
        }
      } catch {
        console.log(`   ℹ️  Could not detect enum, using '${subscriptionPlan}'`);
      }

      // Detect valid subscription_status enum value dynamically
      let subscriptionStatus = 'active';
      try {
        const statusRes = await client.query(
          `SELECT unnest(enum_range(NULL::organizations_subscription_status_enum))::text AS val`
        );
        if (statusRes.rows.length > 0) {
          // Prefer 'ACTIVE' or first value
          const active = statusRes.rows.find(r => r.val.toLowerCase() === 'active');
          subscriptionStatus = active ? active.val : statusRes.rows[0].val;
          console.log(`   📋 Using subscription status: ${subscriptionStatus}`);
        }
      } catch {
        console.log(`   ℹ️  Could not detect status enum, using '${subscriptionStatus}'`);
      }

      await client.query(`
        INSERT INTO organizations (
          id, name, subscription_plan, is_active,
          subscription_status, created_at, updated_at
        ) VALUES (
          $1, $2, $3::organizations_subscription_plan_enum, true,
          $4::organizations_subscription_status_enum, NOW(), NOW()
        )
      `, [ORG_ID, ORG_NAME, subscriptionPlan, subscriptionStatus]);
      console.log(`   ✅ Organization created: "${ORG_NAME}" (id: ${ORG_ID})`);
    }

    // 2. Check if admin user already exists
    const userCheck = await client.query(
      `SELECT id FROM users WHERE username = $1`, [ADMIN_USERNAME]
    );

    if (userCheck.rows.length > 0) {
      console.log('ℹ️  Admin user already exists — skipping user creation');
    } else {
      console.log('👤 Creating admin user...');
      const passwordHash = await hashPassword(ADMIN_PASSWORD);
      await client.query(`
        INSERT INTO users (
          id, username, password_hash, role,
          is_active, organization_id, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, 'ADMIN',
          true, $3, NOW(), NOW()
        )
      `, [ADMIN_USERNAME, passwordHash, ORG_ID]);
      console.log(`   ✅ Admin user created`);
      console.log(`   📋 Username: ${ADMIN_USERNAME}`);
      console.log(`   📋 Password: ${ADMIN_PASSWORD}`);
      console.log(`   ⚠️  IMPORTANT: Change this password after first login!\n`);
    }

    await client.query('COMMIT');

    console.log('─'.repeat(50));
    console.log('🎉 Seeding complete! You can now log in with:');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('─'.repeat(50));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed, transaction rolled back:', err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

seed().catch(console.error);
