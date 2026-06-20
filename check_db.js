const { db, initDatabase } = require('./database');

async function test() {
    try {
        console.log('Initializing database connection...');
        await initDatabase();
        
        console.log('\n--- Checking Tables ---');
        const [tables] = await db.query('SHOW TABLES');
        console.log('Tables in database:', tables.map(t => Object.values(t)[0]));

        console.log('\n--- Describe family_connections ---');
        try {
            const [cols] = await db.query('DESCRIBE family_connections');
            console.log(cols.map(c => `${c.Field} (${c.Type})`));
        } catch (e) {
            console.error('Error describing family_connections:', e.message);
        }

        console.log('\n--- Describe family_candles ---');
        try {
            const [cols] = await db.query('DESCRIBE family_candles');
            console.log(cols.map(c => `${c.Field} (${c.Type})`));
        } catch (e) {
            console.error('Error describing family_candles:', e.message);
        }

        console.log('\n--- Describe family_prayers ---');
        try {
            const [cols] = await db.query('DESCRIBE family_prayers');
            console.log(cols.map(c => `${c.Field} (${c.Type})`));
        } catch (e) {
            console.error('Error describing family_prayers:', e.message);
        }

        console.log('\n--- Query family_connections records ---');
        const [connections] = await db.query('SELECT * FROM family_connections LIMIT 5');
        console.log('family_connections:', connections);

        console.log('\n--- Query family_candles records ---');
        const [candles] = await db.query('SELECT * FROM family_candles LIMIT 5');
        console.log('family_candles:', candles);

        console.log('\n--- Checking Admin Candle Report Query ---');
        try {
            const [report] = await db.query(`
                SELECT c.family_id, c.candles_completed, c.prayer_hours, c.family_streak, f.family_name 
                FROM family_candles c
                JOIN family_connections f ON c.family_id = f.id
                ORDER BY c.candles_completed DESC, c.prayer_hours DESC
            `);
            console.log('Leaderboard query result:', report);
        } catch (e) {
            console.error('Error running Leaderboard query:', e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error('Test script failed:', e);
        process.exit(1);
    }
}

test();
