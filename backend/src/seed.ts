import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Connection ──────────────────────────────────────────────────────
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'yosief',
    database: process.env.DB_NAME || 'pharmacy_db',
    synchronize: false,
    logging: false,
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

function randomDateWithinPastDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * days));
    return d;
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
];

const suppliers = [
    { name: 'EPHARM', contact_person: 'Dawit Alemu', phone: '0112233445', email: 'sales@epharm.com.et', address: 'Addis Ababa', credit_limit: 500000, payment_terms: 'NET_30', average_lead_time: 5 },
    { name: 'Cadila Pharmaceuticals', contact_person: 'Hanna Tadesse', phone: '0113344556', email: 'info@cadila.et', address: 'Gelan', credit_limit: 200000, payment_terms: 'NET_15', average_lead_time: 3 },
    { name: 'Julphar Ethiopia', contact_person: 'Kebede Worku', phone: '0114455667', email: 'orders@julphar.et', address: 'Addis Ababa', credit_limit: 300000, payment_terms: 'NET_30', average_lead_time: 7 },
];

const expenses = [
    { name: 'Pharmacy Rent', category: 'RENT', amount: 15000, frequency: 'MONTHLY', is_recurring: true },
    { name: 'Staff Salary', category: 'SALARY', amount: 25000, frequency: 'MONTHLY', is_recurring: true },
    { name: 'Electricity Bill', category: 'ELECTRICITY', amount: 1200, frequency: 'MONTHLY', is_recurring: true },
    { name: 'Water Bill', category: 'WATER', amount: 400, frequency: 'MONTHLY', is_recurring: true },
    { name: 'Internet (Ethio Telecom)', category: 'INTERNET', amount: 1500, frequency: 'MONTHLY', is_recurring: true },
    { name: 'Printer Maintenance', category: 'MAINTENANCE', amount: 800, frequency: 'ONE_TIME', is_recurring: false },
];

// ── Main Seed Function ──────────────────────────────────────────────
async function seed() {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // ── 1. SEED USERS
        console.log('\n📦 Seeding users...');
        const userIds: Record<string, string> = {};
        for (const u of users) {
            const exists = await queryRunner.query(`SELECT id FROM users WHERE username = $1`, [u.username]);
            if (exists.length > 0) {
                userIds[u.username] = exists[0].id;
                continue;
            }
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(u.password, salt);
            const res = await queryRunner.query(
                `INSERT INTO users (id, username, password_hash, role, is_active, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW()) RETURNING id`,
                [u.username, hash, u.role]
            );
            userIds[u.username] = res[0].id;
        }

        // ── 2. SEED SUPPLIERS
        console.log('\n🏭 Seeding suppliers...');
        const supplierIds: Record<string, string> = {};
        for (const s of suppliers) {
            const exists = await queryRunner.query(`SELECT id FROM suppliers WHERE name = $1`, [s.name]);
            if (exists.length > 0) {
                supplierIds[s.name] = exists[0].id;
                continue;
            }
            const res = await queryRunner.query(
                `INSERT INTO suppliers (id, name, contact_person, phone, email, address, credit_limit, payment_terms, average_lead_time, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
                [s.name, s.contact_person, s.phone, s.email, s.address, s.credit_limit, s.payment_terms, s.average_lead_time]
            );
            supplierIds[s.name] = res[0].id;
        }

        // ── 3. SEED MEDICINES
        console.log('\n💊 Seeding medicines...');
        const medicineIds: Record<string, string> = {};
        for (const m of medicines) {
            const exists = await queryRunner.query(`SELECT id FROM medicines WHERE name = $1`, [m.name]);
            if (exists.length > 0) {
                medicineIds[m.name] = exists[0].id;
                continue;
            }
            const res = await queryRunner.query(
                `INSERT INTO medicines (id, name, generic_name, category, unit, is_controlled, minimum_stock_level, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
                [m.name, m.generic_name, m.category, m.unit, m.is_controlled, m.minimum_stock_level]
            );
            medicineIds[m.name] = res[0].id;
        }

        // ── 4. SEED BATCHES & PURCHASE ORDERS
        console.log('\n📦 Seeding batches & POs...');
        const batchTemplates = [
            { medicineName: 'Amoxicillin 500mg', batches: [{ bn: 'AMX-2026-001', qty: 200, pp: 2.50, sp: 5.00, expiry: futureDate(18) }] },
            { medicineName: 'Paracetamol 500mg', batches: [{ bn: 'PCM-2026-001', qty: 500, pp: 0.50, sp: 1.50, expiry: futureDate(24) }] },
            { medicineName: 'Ibuprofen 400mg', batches: [{ bn: 'IBU-2026-001', qty: 300, pp: 1.00, sp: 3.00, expiry: futureDate(20) }] },
            { medicineName: 'Metformin 850mg', batches: [{ bn: 'MET-2026-001', qty: 250, pp: 1.20, sp: 3.50, expiry: futureDate(15) }] },
            { medicineName: 'Ciprofloxacin 500mg', batches: [{ bn: 'CIP-2026-001', qty: 150, pp: 3.00, sp: 7.00, expiry: futureDate(16) }] },
            { medicineName: 'Omeprazole 20mg', batches: [{ bn: 'OMP-2026-001', qty: 200, pp: 1.80, sp: 4.50, expiry: futureDate(14) }] },
            { medicineName: 'Amlodipine 5mg', batches: [{ bn: 'AML-2026-001', qty: 180, pp: 0.80, sp: 2.50, expiry: futureDate(22) }] },
            { medicineName: 'Cetirizine 10mg', batches: [{ bn: 'CET-2026-001', qty: 300, pp: 0.60, sp: 2.00, expiry: futureDate(20) }] }
        ];

        const batchIds: Record<string, string> = {};

        // Create a PO for the batches
        let globalPoCounter = 1;
        
        for (const template of batchTemplates) {
            const medId = medicineIds[template.medicineName];
            if (!medId) continue;
            
            for (const b of template.batches) {
                const exists = await queryRunner.query(`SELECT id FROM batches WHERE batch_number = $1`, [b.bn]);
                if (exists.length > 0) {
                    batchIds[b.bn] = exists[0].id;
                    continue;
                }
                const res = await queryRunner.query(
                    `INSERT INTO batches (id, batch_number, medicine_id, expiry_date, purchase_price, selling_price, initial_quantity, quantity_remaining, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $6, NOW()) RETURNING id`,
                    [b.bn, medId, b.expiry, b.pp, b.sp, b.qty]
                );
                batchIds[b.bn] = res[0].id;

                // Also create a PO for it
                const poTotal = b.qty * b.pp;
                const poNum = `PO-2025-${globalPoCounter.toString().padStart(3, '0')}`;
                globalPoCounter++;
                const createdDate = randomDateWithinPastDays(30);
                
                // Assign random supplier
                const supplierIdsList = Object.values(supplierIds);
                const randSupplier = supplierIdsList[Math.floor(Math.random() * supplierIdsList.length)];
                
                await queryRunner.query(
                    `INSERT INTO purchase_orders (id, po_number, supplier_id, status, total_amount, payment_method, payment_status, total_paid, created_by, approved_by, created_at, updated_at)
                    VALUES (gen_random_uuid(), $1, $2, 'COMPLETED', $3, 'CASH', 'PAID', $3, $4, $4, $5, $5)`,
                    [poNum, randSupplier, poTotal, userIds['admin'], createdDate]
                );
            }
        }

        // ── 5. SEED EXPERIENCES / EXPENSES
        console.log('\n💸 Seeding expenses...');
        for (const e of expenses) {
            await queryRunner.query(
                `INSERT INTO expenses (id, name, category, amount, frequency, is_recurring, expense_date, created_by, created_at)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), $6, NOW())`,
                [e.name, e.category, e.amount, e.frequency, e.is_recurring, userIds['admin']]
            );
        }

        // ── 6. SEED PATIENTS
        console.log('\n🧑‍⚕️ Seeding patients...');
        const patientIds: Record<string, string> = {};
        for (const p of patients) {
            const exists = await queryRunner.query(`SELECT id FROM patients WHERE phone = $1`, [p.phone]);
            if (exists.length > 0) {
                patientIds[p.name] = exists[0].id;
                continue;
            }
            const res = await queryRunner.query(
                `INSERT INTO patients (id, name, phone, age, gender, address, allergies, chronic_conditions, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
                [p.name, p.phone, p.age, p.gender, p.address, JSON.stringify(p.allergies), JSON.stringify(p.chronic_conditions)]
            );
            patientIds[p.name] = res[0].id;
        }

        // ── 7. SEED CREDIT CUSTOMERS
        console.log('\n💳 Seeding credit customers...');
        const creditCustIds: Record<string, string> = {};
        for (const p of patients) {
            const res = await queryRunner.query(
                `INSERT INTO customers (id, name, phone, address, total_credit, is_active, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, 0, true, NOW(), NOW()) RETURNING id`,
                [p.name, p.phone, p.address]
            );
            creditCustIds[p.name] = res[0].id;
        }

        // ── 8. SEED SALES (And Credit Records)
        console.log('\n🛒 Seeding sales...');
        let receiptCounter = 1;
        for (let i = 0; i < 20; i++) {
            const receiptNumber = `REC${1000 + receiptCounter}`;
            receiptCounter++;
            
            const saleDate = randomDateWithinPastDays(30);
            const isCredit = i % 5 === 0; // Every 5th sale is credit
            
            // Randomly select 1 or 2 batches
            const allBn = Object.keys(batchIds);
            const bn1 = allBn[Math.floor(Math.random() * allBn.length)];
            const batch1Id = batchIds[bn1];
            // Find medicine for batch
            const medName = batchTemplates.find(t => t.batches.some(b => b.bn === bn1))!.medicineName;
            const medId = medicineIds[medName];
            const sp1 = batchTemplates.find(t => t.batches.some(b => b.bn === bn1))!.batches[0].sp;
            const qty1 = Math.floor(Math.random() * 3) + 1;
            
            const totalAmount = sp1 * qty1;
            
            // Random patient
            const pNames = Object.keys(patientIds);
            const pName = pNames[Math.floor(Math.random() * pNames.length)];
            const patId = patientIds[pName];

            const saleRes = await queryRunner.query(
                `INSERT INTO sales (id, receipt_number, patient_id, total_amount, payment_method, created_by, is_refunded, refund_amount, is_controlled_transaction, created_at)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, false, 0, false, $6) RETURNING id`,
                [receiptNumber, patId, totalAmount, isCredit ? 'CREDIT' : 'CASH', userIds['cashier'], saleDate]
            );
            const saleId = saleRes[0].id;

            // Insert Sale Item
            await queryRunner.query(
                `INSERT INTO sale_items (id, sale_id, medicine_id, batch_id, quantity, unit_price, subtotal, created_at)
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
                [saleId, medId, batch1Id, qty1, sp1, totalAmount, saleDate]
            );

            // Update batch qty
            await queryRunner.query(`UPDATE batches SET quantity_remaining = quantity_remaining - $1 WHERE id = $2`, [qty1, batch1Id]);

            if (isCredit) {
                const credCustId = creditCustIds[pName];
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 15);
                
                await queryRunner.query(
                    `INSERT INTO credit_records (id, customer_id, sale_id, original_amount, paid_amount, due_date, status, created_at)
                    VALUES (gen_random_uuid(), $1, $2, $3, 0, $4, 'UNPAID', $5)`,
                    [credCustId, saleId, totalAmount, dueDate, saleDate]
                );
                
                // Update customer total credit
                await queryRunner.query(`UPDATE customers SET total_credit = total_credit + $1 WHERE id = $2`, [totalAmount, credCustId]);
            }
        }

        // ── 9. SEED PRESCRIPTIONS
        console.log('\n🏥 Seeding prescriptions...');
        const patNames = Object.keys(patientIds);
        if (patNames.length > 0) {
            const patId = patientIds[patNames[0]]; // Give first patient a prescription
            const presRes = await queryRunner.query(
                `INSERT INTO prescriptions (id, patient_id, doctor_name, facility, notes, created_at) 
                VALUES (gen_random_uuid(), $1, 'Dr. Smith', 'General Hospital', 'Infection', NOW()) RETURNING id`,
                [patId]
            );
            const presId = presRes[0].id;
            const medId = medicineIds['Amoxicillin 500mg'];
            await queryRunner.query(
                `INSERT INTO prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration, quantity_dispensed)
                VALUES (gen_random_uuid(), $1, $2, '500mg', 'TID', '7 days', 21)`,
                [presId, medId]
            );
        }

        // ── COMMIT ────────────────────────────────────────────────────
        await queryRunner.commitTransaction();
        console.log('\n🎉 Comprehensive Seed completed successfully!\n');

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('❌ Seed failed, transaction rolled back:', error);
    } finally {
        await queryRunner.release();
        await AppDataSource.destroy();
    }
}

seed();
