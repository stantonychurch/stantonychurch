const mysql = require('mysql2/promise');
require('dotenv').config();

const url = process.env.DATABASE_URL || 'mysql://avnadmin:AVNS_7LAo_N4MREAO_-kEZEQ@mysql-23bd3e77-st-048f.d.aivencloud.com:15274/defaultdb?ssl-mode=REQUIRED';

async function main() {
    const conn = await mysql.createConnection(url);
    console.log('Connected to Aiven MySQL!');
    
    const [tables] = await conn.query('SHOW TABLES');
    console.log('\n--- Existing Tables in MySQL ---');
    for (const row of tables) {
        console.log(Object.values(row)[0]);
    }
    
    // Check members columns
    console.log('\n--- Columns in members ---');
    try {
        const [cols] = await conn.query('DESCRIBE members');
        cols.forEach(c => console.log(`${c.Field}: ${c.Type} (${c.Null})`));
    } catch(err) {
        console.error('Error describing members:', err.message);
    }

    // Check devotionals columns
    console.log('\n--- Columns in devotionals ---');
    try {
        const [cols] = await conn.query('DESCRIBE devotionals');
        cols.forEach(c => console.log(`${c.Field}: ${c.Type} (${c.Null})`));
    } catch(err) {
        console.error('Error describing devotionals:', err.message);
    }
    
    await conn.end();
}

main().catch(console.error);
