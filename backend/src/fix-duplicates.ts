import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

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

async function findDuplicates() {
    await AppDataSource.initialize();
    console.log('Finding duplicates...');
    const duplicates = await AppDataSource.query(`
        SELECT name, COUNT(*) 
        FROM medicines 
        GROUP BY name 
        HAVING COUNT(*) > 1
    `);
    console.log('Duplicates found:', JSON.stringify(duplicates, null, 2));
    
    for (const dup of duplicates) {
        console.log(`Processing ${dup.name}...`);
        const rows = await AppDataSource.query(`
            SELECT id, created_at FROM medicines 
            WHERE name = $1
            ORDER BY created_at ASC
        `, [dup.name]);
        
        // Keep the first one, rename others
        for (let i = 1; i < rows.length; i++) {
            const newName = `${dup.name} (${i + 1})`;
            console.log(`Renaming ${rows[i].id} to ${newName}`);
            await AppDataSource.query(`
                UPDATE medicines SET name = $1 WHERE id = $2
            `, [newName, rows[i].id]);
        }
    }
    
    await AppDataSource.destroy();
    console.log('Done.');
}

findDuplicates().catch(console.error);
