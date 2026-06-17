const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(routesDir, file), 'utf8');

    // Multi-line db.prepare(SQL).run(ARGS)
    // We want to replace:
    // const r = db.prepare(SQL).run(ARGS);
    // with:
    // const [r] = await db.query(SQL, [ARGS]);
    
    // We need to match db.prepare, followed by parens, followed by optional whitespace/newlines, followed by .run(
    content = content.replace(/db\.prepare\(([\s\S]*?)\)\s*\.run\(([\s\S]*?)\)/g, '(await db.query($1, [$2]))[0]');
    
    // Also multi-line .all() and .get() just in case
    content = content.replace(/db\.prepare\(([\s\S]*?)\)\s*\.all\(([\s\S]*?)\)/g, '(await db.query($1, [$2]))[0]');
    content = content.replace(/db\.prepare\(([\s\S]*?)\)\s*\.get\(([\s\S]*?)\)/g, '(await db.query($1, [$2]))[0][0]');

    // No-arg versions
    content = content.replace(/db\.prepare\(([\s\S]*?)\)\s*\.run\(\)/g, '(await db.query($1))[0]');
    content = content.replace(/db\.prepare\(([\s\S]*?)\)\s*\.all\(\)/g, '(await db.query($1))[0]');
    content = content.replace(/db\.prepare\(([\s\S]*?)\)\s*\.get\(\)/g, '(await db.query($1))[0][0]');

    // Fix `id: r.lastInsertRowid` -> `id: r.insertId`
    content = content.replace(/\.lastInsertRowid/g, '.insertId');

    fs.writeFileSync(path.join(routesDir, file), content, 'utf8');
});
console.log('Fixed multiline db.prepare');
