import 'reflect-metadata';
import { AppDataSource } from './src/data-source';

const PLATFORM_ORG_ID = '00000000-0000-0000-0000-000000000000';

const tables = [
    'branches', 'expenses', 'customers', 'patients', 'purchase_orders', 'purchase_order_items', 
    'goods_receipts', 'supplier_payments', 'supplier_contracts', 'supplier_performance', 
    'price_history', 'users', 'medicines', 'batches', 'sales', 'sale_items', 
    'refunds', 'stock_transactions', 'audit_logs', 'prescriptions', 'prescription_items', 
    'credit_records', 'credit_payments', 'audit_sessions', 'audit_items', 'alerts', 'notifications'
];

async function run() {
    await AppDataSource.initialize();
    console.log('Database initialized.');

    for (const table of tables) {
        try {
            const countRes = await AppDataSource.query(`SELECT COUNT(*) as count FROM "${table}" WHERE organization_id IS NULL`);
            const count = parseInt(countRes[0].count, 10);
            
            if (count > 0) {
                console.log(`Table ${table} has ${count} records with NULL organization_id. Updating to platform org...`);
                await AppDataSource.query(`UPDATE "${table}" SET organization_id = '${PLATFORM_ORG_ID}' WHERE organization_id IS NULL`);
                console.log(`Table ${table} updated successfully.`);
            } else {
                console.log(`Table ${table} is clean (no NULL organization_id).`);
            }
        } catch (err) {
            console.warn(`Could not check/update table ${table}: ${err.message}`);
        }
    }

    console.log('Finished updating organizations.');
    await AppDataSource.destroy();
}

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
