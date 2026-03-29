import 'reflect-metadata';
import { AppDataSource } from './src/data-source';

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

    const res = await AppDataSource.query(`
        SELECT table_name, column_name, is_nullable 
        FROM information_schema.columns 
        WHERE column_name = 'organization_id' 
        AND table_name IN (${tables.map(t => `'${t}'`).join(',')})
    `);

    console.log(JSON.stringify(res, null, 2));
    await AppDataSource.destroy();
}

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
