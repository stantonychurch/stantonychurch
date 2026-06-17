require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    try {
        await db.query('ALTER TABLE members ADD COLUMN status VARCHAR(20) DEFAULT "approved"');
    } catch(e) {}
    try {
        await db.query('ALTER TABLE members ADD COLUMN bio TEXT');
    } catch(e) {}
    try {
        await db.query('ALTER TABLE members ADD COLUMN birthday VARCHAR(50)');
    } catch(e) {}
    try {
        await db.query('ALTER TABLE members ADD COLUMN profile_visible TINYINT(1) DEFAULT 1');
    } catch(e) {}
    
    console.log('Columns added.');
    process.exit(0);
}
run();
