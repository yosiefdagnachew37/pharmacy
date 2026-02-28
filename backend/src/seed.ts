import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Connection ──────────────────────────────────────────────────────
const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    ssl: {
        rejectUnauthorized: false,   // ⭐ REQUIRED for Railway
    },
});

// ── Helpers ─────────────────────────────────────────────────────────
function futureDate(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
}

function pastDate(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split('T')[0];
}

// ── Seed Data ───────────────────────────────────────────────────────
const users = [
    { username: 'admin', password: 'admin123', role: 'ADMIN' },
    { username: 'pharmacist', password: 'pharma123', role: 'PHARMACIST' },
    { username: 'cashier', password: 'cash123', role: 'CASHIER' },
    { username: 'auditor', password: 'audit123', role: 'AUDITOR' },
];

const medicines = [
    { name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin', category: 'Antibiotics', unit: 'Capsule', is_controlled: false, minimum_stock_level: 50 },
    { name: 'Paracetamol 500mg', generic_name: 'Acetaminophen', category: 'Painkillers', unit: 'Tablet', is_controlled: false, minimum_stock_level: 100 },
    { name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen', category: 'Painkillers', unit: 'Tablet', is_controlled: false, minimum_stock_level: 80 },
    { name: 'Metformin 850mg', generic_name: 'Metformin HCl', category: 'Antidiabetics', unit: 'Tablet', is_controlled: false, minimum_stock_level: 60 },
    { name: 'Ciprofloxacin 500mg', generic_name: 'Ciprofloxacin', category: 'Antibiotics', unit: 'Tablet', is_controlled: false, minimum_stock_level: 40 },
    { name: 'Omeprazole 20mg', generic_name: 'Omeprazole', category: 'Antacids', unit: 'Capsule', is_controlled: false, minimum_stock_level: 50 },
    { name: 'Amlodipine 5mg', generic_name: 'Amlodipine Besylate', category: 'Antihypertensives', unit: 'Tablet', is_controlled: false, minimum_stock_level: 40 },
    { name: 'Cetirizine 10mg', generic_name: 'Cetirizine HCl', category: 'Antihistamines', unit: 'Tablet', is_controlled: false, minimum_stock_level: 60 },
    { name: 'Azithromycin 250mg', generic_name: 'Azithromycin', category: 'Antibiotics', unit: 'Tablet', is_controlled: false, minimum_stock_level: 30 },
    { name: 'Morphine 10mg', generic_name: 'Morphine Sulfate', category: 'Opioid Analgesics', unit: 'Ampoule', is_controlled: true, minimum_stock_level: 10 },
    { name: 'Diazepam 5mg', generic_name: 'Diazepam', category: 'Anxiolytics', unit: 'Tablet', is_controlled: true, minimum_stock_level: 15 },
    { name: 'Salbutamol Inhaler', generic_name: 'Salbutamol', category: 'Bronchodilators', unit: 'Inhaler', is_controlled: false, minimum_stock_level: 20 },
    { name: 'Metronidazole 400mg', generic_name: 'Metronidazole', category: 'Antibiotics', unit: 'Tablet', is_controlled: false, minimum_stock_level: 50 },
    { name: 'Losartan 50mg', generic_name: 'Losartan Potassium', category: 'Antihypertensives', unit: 'Tablet', is_controlled: false, minimum_stock_level: 30 },
    { name: 'Insulin Glargine 100IU', generic_name: 'Insulin Glargine', category: 'Antidiabetics', unit: 'Vial', is_controlled: false, minimum_stock_level: 10 },
];

const patients = [
    { name: 'Abebe Kebede', phone: '0911223344', age: 45, gender: 'MALE', address: 'Addis Ababa, Bole', allergies: ['Penicillin'], chronic_conditions: ['Hypertension'] },
    { name: 'Fatima Ali', phone: '0922334455', age: 32, gender: 'FEMALE', address: 'Addis Ababa, Kirkos', allergies: [], chronic_conditions: ['Diabetes Type 2'] },
    { name: 'Daniel Tesfaye', phone: '0933445566', age: 28, gender: 'MALE', address: 'Addis Ababa, Arada', allergies: ['Sulfa drugs'], chronic_conditions: [] },
    { name: 'Sara Mohammed', phone: '0944556677', age: 55, gender: 'FEMALE', address: 'Addis Ababa, Yeka', allergies: [], chronic_conditions: ['Asthma', 'Hypertension'] },
    { name: 'Yonas Gebre', phone: '0955667788', age: 67, gender: 'MALE', address: 'Addis Ababa, Nifas Silk', allergies: ['Aspirin'], chronic_conditions: ['Diabetes Type 2', 'Arthritis'] },
    { name: 'Meron Hailu', phone: '0966778899', age: 22, gender: 'FEMALE', address: 'Addis Ababa, Gulele', allergies: [], chronic_conditions: [] },
    { name: 'Tewodros Bekele', phone: '0977889900', age: 38, gender: 'MALE', address: 'Addis Ababa, Lideta', allergies: ['Codeine'], chronic_conditions: ['Gastritis'] },
    { name: 'Hana Solomon', phone: '0988990011', age: 41, gender: 'FEMALE', address: 'Addis Ababa, Kolfe Keranio', allergies: [], chronic_conditions: ['Hypothyroidism'] },
];

// Batches will be generated dynamically after medicines are inserted

// ── Main Seed Function ──────────────────────────────────────────────
async function seed() {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    try {
        // ── 1. SEED USERS ─────────────────────────────────────────────
        console.log('\n📦 Seeding users...');
        for (const u of users) {
            const exists = await queryRunner.query(
                `SELECT id FROM users WHERE username = $1`, [u.username]
            );
            if (exists.length > 0) {
                console.log(`   ⏭️  User "${u.username}" already exists, skipping`);
                continue;
            }
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(u.password, salt);
            await queryRunner.query(
                `INSERT INTO users (id, username, password_hash, role, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())`,
                [u.username, hash, u.role]
            );
            console.log(`   ✅ Created user: ${u.username} (${u.role})`);
        }

        // ── 2. SEED MEDICINES ─────────────────────────────────────────
        console.log('\n💊 Seeding medicines...');
        const medicineIds: { name: string; id: string }[] = [];

        for (const m of medicines) {
            const exists = await queryRunner.query(
                `SELECT id FROM medicines WHERE name = $1`, [m.name]
            );
            if (exists.length > 0) {
                console.log(`   ⏭️  Medicine "${m.name}" already exists, skipping`);
                medicineIds.push({ name: m.name, id: exists[0].id });
                continue;
            }
            const result = await queryRunner.query(
                `INSERT INTO medicines (id, name, generic_name, category, unit, is_controlled, minimum_stock_level, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
                [m.name, m.generic_name, m.category, m.unit, m.is_controlled, m.minimum_stock_level]
            );
            medicineIds.push({ name: m.name, id: result[0].id });
            console.log(`   ✅ Created medicine: ${m.name}`);
        }

        // ── 3. SEED BATCHES ───────────────────────────────────────────
        console.log('\n📦 Seeding batches...');

        // Pricing and quantity templates per medicine
        const batchTemplates = [
            // Amoxicillin
            {
                medicineName: 'Amoxicillin 500mg', batches: [
                    { bn: 'AMX-2026-001', qty: 200, pp: 2.50, sp: 5.00, expiry: futureDate(18) },
                    { bn: 'AMX-2026-002', qty: 150, pp: 2.50, sp: 5.00, expiry: futureDate(12) },
                ]
            },
            // Paracetamol
            {
                medicineName: 'Paracetamol 500mg', batches: [
                    { bn: 'PCM-2026-001', qty: 500, pp: 0.50, sp: 1.50, expiry: futureDate(24) },
                    { bn: 'PCM-2025-003', qty: 100, pp: 0.50, sp: 1.50, expiry: futureDate(2) },  // expiring soon
                ]
            },
            // Ibuprofen
            {
                medicineName: 'Ibuprofen 400mg', batches: [
                    { bn: 'IBU-2026-001', qty: 300, pp: 1.00, sp: 3.00, expiry: futureDate(20) },
                ]
            },
            // Metformin
            {
                medicineName: 'Metformin 850mg', batches: [
                    { bn: 'MET-2026-001', qty: 250, pp: 1.20, sp: 3.50, expiry: futureDate(15) },
                    { bn: 'MET-2025-002', qty: 80, pp: 1.20, sp: 3.50, expiry: futureDate(3) },
                ]
            },
            // Ciprofloxacin
            {
                medicineName: 'Ciprofloxacin 500mg', batches: [
                    { bn: 'CIP-2026-001', qty: 150, pp: 3.00, sp: 7.00, expiry: futureDate(16) },
                ]
            },
            // Omeprazole
            {
                medicineName: 'Omeprazole 20mg', batches: [
                    { bn: 'OMP-2026-001', qty: 200, pp: 1.80, sp: 4.50, expiry: futureDate(14) },
                ]
            },
            // Amlodipine
            {
                medicineName: 'Amlodipine 5mg', batches: [
                    { bn: 'AML-2026-001', qty: 180, pp: 0.80, sp: 2.50, expiry: futureDate(22) },
                ]
            },
            // Cetirizine
            {
                medicineName: 'Cetirizine 10mg', batches: [
                    { bn: 'CET-2026-001', qty: 300, pp: 0.60, sp: 2.00, expiry: futureDate(20) },
                ]
            },
            // Azithromycin
            {
                medicineName: 'Azithromycin 250mg', batches: [
                    { bn: 'AZI-2026-001', qty: 120, pp: 4.00, sp: 8.50, expiry: futureDate(10) },
                ]
            },
            // Morphine (controlled)
            {
                medicineName: 'Morphine 10mg', batches: [
                    { bn: 'MOR-2026-001', qty: 30, pp: 15.00, sp: 25.00, expiry: futureDate(12) },
                ]
            },
            // Diazepam (controlled)
            {
                medicineName: 'Diazepam 5mg', batches: [
                    { bn: 'DIA-2026-001', qty: 50, pp: 5.00, sp: 12.00, expiry: futureDate(18) },
                ]
            },
            // Salbutamol
            {
                medicineName: 'Salbutamol Inhaler', batches: [
                    { bn: 'SAL-2026-001', qty: 40, pp: 8.00, sp: 15.00, expiry: futureDate(24) },
                ]
            },
            // Metronidazole
            {
                medicineName: 'Metronidazole 400mg', batches: [
                    { bn: 'MTZ-2026-001', qty: 200, pp: 1.50, sp: 4.00, expiry: futureDate(16) },
                    { bn: 'MTZ-2024-002', qty: 50, pp: 1.50, sp: 4.00, expiry: pastDate(1) },  // expired
                ]
            },
            // Losartan
            {
                medicineName: 'Losartan 50mg', batches: [
                    { bn: 'LOS-2026-001', qty: 150, pp: 2.00, sp: 5.50, expiry: futureDate(20) },
                ]
            },
            // Insulin Glargine
            {
                medicineName: 'Insulin Glargine 100IU', batches: [
                    { bn: 'INS-2026-001', qty: 20, pp: 35.00, sp: 55.00, expiry: futureDate(6) },
                ]
            },
        ];

        for (const template of batchTemplates) {
            const med = medicineIds.find(m => m.name === template.medicineName);
            if (!med) {
                console.log(`   ⚠️  Medicine "${template.medicineName}" not found, skipping batches`);
                continue;
            }
            for (const b of template.batches) {
                const exists = await queryRunner.query(
                    `SELECT id FROM batches WHERE batch_number = $1`, [b.bn]
                );
                if (exists.length > 0) {
                    console.log(`   ⏭️  Batch "${b.bn}" already exists, skipping`);
                    continue;
                }
                await queryRunner.query(
                    `INSERT INTO batches (id, batch_number, medicine_id, expiry_date, purchase_price, selling_price, initial_quantity, quantity_remaining, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $6, NOW())`,
                    [b.bn, med.id, b.expiry, b.pp, b.sp, b.qty]
                );
                console.log(`   ✅ Created batch: ${b.bn} for ${template.medicineName} (qty: ${b.qty})`);
            }
        }

        // ── 4. SEED PATIENTS ──────────────────────────────────────────
        console.log('\n🧑‍⚕️ Seeding patients...');
        for (const p of patients) {
            const exists = await queryRunner.query(
                `SELECT id FROM patients WHERE name = $1 AND phone = $2`, [p.name, p.phone]
            );
            if (exists.length > 0) {
                console.log(`   ⏭️  Patient "${p.name}" already exists, skipping`);
                continue;
            }
            await queryRunner.query(
                `INSERT INTO patients (id, name, phone, age, gender, address, allergies, chronic_conditions, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                [p.name, p.phone, p.age, p.gender, p.address, JSON.stringify(p.allergies), JSON.stringify(p.chronic_conditions)]
            );
            console.log(`   ✅ Created patient: ${p.name}`);
        }

        // ── COMMIT ────────────────────────────────────────────────────
        await queryRunner.commitTransaction();
        console.log('\n🎉 Seed completed successfully!\n');

        // Print credentials table
        console.log('┌──────────────┬──────────────┬──────────────┐');
        console.log('│ Role         │ Username     │ Password     │');
        console.log('├──────────────┼──────────────┼──────────────┤');
        for (const u of users) {
            console.log(`│ ${u.role.padEnd(12)} │ ${u.username.padEnd(12)} │ ${u.password.padEnd(12)} │`);
        }
        console.log('└──────────────┴──────────────┴──────────────┘');

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('❌ Seed failed, transaction rolled back:', error);
    } finally {
        await queryRunner.release();
        await AppDataSource.destroy();
    }
}

seed();
