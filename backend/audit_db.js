const { Client } = require('pg');

async function audit() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'yosief',
    database: 'pharmacy_db',
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const orgsRes = await client.query('SELECT id, name FROM organizations');
    console.log('\n--- ORGANIZATIONS ---');
    console.table(orgsRes.rows);

    const tables = ['medicines', 'batches', 'sales', 'users'];
    console.log('\n--- DATA DISTRIBUTION ---');
    for (const table of tables) {
      const res = await client.query(`SELECT organization_id, count(*) FROM ${table} GROUP BY organization_id`);
      console.log(`Table: ${table}`);
      console.table(res.rows);
    }

    // Check for NULL organization_id
    console.log('\n--- NULL CHECK ---');
    for (const table of tables) {
      const res = await client.query(`SELECT count(*) FROM ${table} WHERE organization_id IS NULL`);
      if (parseInt(res.rows[0].count) > 0) {
        console.warn(`WARNING: Table ${table} has ${res.rows[0].count} records with NULL organization_id!`);
      } else {
        console.log(`Table ${table}: No NULL organization_id found.`);
      }
    }

  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    await client.end();
  }
}

audit();
