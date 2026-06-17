const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(routesDir, file), 'utf8');

    // Undo the bad .all() replacements
    // Original regex: content.replace(/db\.prepare\((.*?)\)\.all\((.*?)\)/g, '(await db.query($1, [$2]))[0]');
    // Bad string: (await db.query('SELECT ...', [args]))[0]
    // Or if args had parens: (await db.query('SELECT ...', [phone.trim(]))[0], name.trim());
    // This is hard to reverse exactly with regex because of the broken parens.

    // Let's just do it manually for the files.
});
