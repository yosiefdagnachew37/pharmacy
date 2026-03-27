const fs = require('fs');
const path = require('path');

const migrationDir = path.join(__dirname, 'database', 'migrations');
const files = fs.readdirSync(migrationDir);
const migrationFile = files.find(f => f.includes('AddOrganizationIdToEntities'));

if (!migrationFile) {
    console.error('Migration file not found');
    process.exit(1);
}

const filePath = path.join(migrationDir, migrationFile);
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

const newLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Inject deduplication before creating composite unique constraints
    const uniqueMatch = line.match(/ALTER TABLE "([^"]+)" ADD CONSTRAINT "[^"]+" UNIQUE \(([^)]+)\)/);
    if (uniqueMatch && !line.includes('down(')) {
        const tableName = uniqueMatch[1];
        // Parse columns, e.g., '"phone", "organization_id"' -> 'phone, organization_id'
        const cols = uniqueMatch[2].replace(/"/g, ''); 
        // We only deduplicate if organization_id is part of it
        if (cols.includes('organization_id')) {
            newLines.push(`        await queryRunner.query(\`DELETE FROM "${tableName}" WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (partition BY ${cols} ORDER BY id DESC) as rnum FROM "${tableName}") t WHERE t.rnum > 1)\`).catch(() => {});`);
        }
    }
    
    newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Migration patched successfully (v4 deduplication)!');
