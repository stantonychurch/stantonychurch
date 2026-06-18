const Database = require('better-sqlite3');
try {
  const db = new Database('app.db');
  const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
  console.log('--- app.db ---');
  tables.forEach(t => {
    console.log(`Table: ${t.name}`);
    console.log(t.sql);
    console.log('------------------------');
  });
} catch (err) {
  console.error('app.db error:', err.message);
}
try {
  const db2 = new Database('devotional.db');
  const tables2 = db2.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
  console.log('--- devotional.db ---');
  tables2.forEach(t => {
    console.log(`Table: ${t.name}`);
    console.log(t.sql);
    console.log('------------------------');
  });
} catch (err) {
  console.error('devotional.db error:', err.message);
}
