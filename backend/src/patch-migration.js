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
let injectedOrg = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!injectedOrg && line.includes('CREATE TABLE "organizations"')) {
        newLines.push(line);
        newLines.push(`        await queryRunner.query(\`INSERT INTO "organizations" ("id", "name", "subscription_plan") VALUES ('00000000-0000-0000-0000-000000000000', 'Legacy Default Organization', 'BASIC') ON CONFLICT ("id") DO NOTHING\`);`);
        injectedOrg = true;
        continue;
    }

    if (line.includes('ADD "organization_id" uuid NOT NULL')) {
        const match = line.match(/ALTER TABLE "([^"]+)"/);
        if (match) {
            const tableName = match[1];
            newLines.push(`        await queryRunner.query(\`ALTER TABLE "${tableName}" ADD "organization_id" uuid\`);`);
            newLines.push(`        await queryRunner.query(\`UPDATE "${tableName}" SET "organization_id" = '00000000-0000-0000-0000-000000000000' WHERE "organization_id" IS NULL\`);`);
            newLines.push(`        await queryRunner.query(\`ALTER TABLE "${tableName}" ALTER COLUMN "organization_id" SET NOT NULL\`);`);
            continue;
        }
    }
    
    newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join('\n'));
console.log('Migration patched successfully (v2)!');
