import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableRLSPolicies1774499999999 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tables = [
            'users', 'suppliers', 'supplier_performance', 'purchase_orders', 
            'supplier_payments', 'supplier_contracts', 'batches', 'medicines', 
            'price_history', 'stock_transactions', 'audit_items', 'audit_sessions', 
            'prescription_items', 'prescriptions', 'patients', 'sale_items', 
            'customers', 'credit_records', 'sales', 'refunds', 'purchase_order_items', 
            'goods_receipts', 'notifications', 'forecast_results', 
            'purchase_recommendations', 'expenses', 'credit_payments', 
            'cheque_records', 'branches', 'audit_logs', 'alerts'
        ];

        for (const table of tables) {
            console.log("Enabling RLS for table: " + table);
            await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
            await queryRunner.query(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
            await queryRunner.query(`
                CREATE POLICY "tenant_isolation_policy" ON "${table}" 
                FOR ALL 
                USING (
                    organization_id::text = current_setting('app.current_tenant', true)
                    OR current_setting('app.is_super_admin', true) = 'true'
                );
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tables = [
            'users', 'suppliers', 'supplier_performance', 'purchase_orders', 
            'supplier_payments', 'supplier_contracts', 'batches', 'medicines', 
            'price_history', 'stock_transactions', 'audit_items', 'audit_sessions', 
            'prescription_items', 'prescriptions', 'patients', 'sale_items', 
            'customers', 'credit_records', 'sales', 'refunds', 'purchase_order_items', 
            'goods_receipts', 'notifications', 'forecast_results', 
            'purchase_recommendations', 'expenses', 'credit_payments', 
            'cheque_records', 'branches', 'audit_logs', 'alerts'
        ];

        for (const table of tables) {
            await queryRunner.query(`DROP POLICY IF EXISTS "tenant_isolation_policy" ON "${table}";`);
            await queryRunner.query(`ALTER TABLE "${table}" NO FORCE ROW LEVEL SECURITY;`);
            await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
        }
    }

}
