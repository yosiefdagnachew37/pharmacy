const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'yosief',
    database: process.env.DB_NAME || 'pharmacy_db',
});

async function clearDB() {
    await AppDataSource.initialize();
    
    // Ignore organizations table if it exists so we keep the migration history? 
    // Truncate everything but migrations
    const tables = await AppDataSource.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'migrations'`);
    
    await AppDataSource.query('START TRANSACTION');
    for (const { tablename } of tables) {
        if (tablename !== 'migrations') {
             console.log('Truncating: ' + tablename);
             await AppDataSource.query(`TRUNCATE TABLE "${tablename}" CASCADE`);
        }
    }
    await AppDataSource.query('COMMIT');
    console.log('Database truncated structure saved!');
    process.exit(0);
}

clearDB().catch(console.error);
