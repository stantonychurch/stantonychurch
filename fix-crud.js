const fs = require('fs');
let c = fs.readFileSync('routes/extended.js', 'utf8');

// Fix crud calls missing await
c = c.replace(/res\.json\(crud\((.*?)\)\.list\(\)\)/g, 'res.json(await crud($1).list())');
c = c.replace(/const (\w+) = crud\((.*?)\)\.list\(\);/g, 'const $1 = await crud($2).list();');

// Fix groups.map(g => { await db.query }) -> await Promise.all(groups.map(async g => { await db.query }))
c = c.replace(/res\.json\((.*?)\.map\(([a-zA-Z0-9]+)\s*=>\s*\(\{\s*\.\.\.\2,\s*([a-zA-Z0-9_]+):\s*\(await db\.query\((.*?)\)\[0\]\[0\]\.c\s*\}\)\)\);/g, 
    'res.json(await Promise.all($1.map(async $2 => ({ ...$2, $3: (await db.query($4)[0][0].c }))));');

fs.writeFileSync('routes/extended.js', c);
