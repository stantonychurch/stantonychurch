const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(routesDir, file), 'utf8');

    // 1. Make routes async
    content = content.replace(/router\.(get|post|put|delete)\('(.*?)',\s*(authenticateToken,?\s*)?(requireAdmin,?\s*)?\(req, res\)\s*=>\s*\{/g, 
        (match, method, path, auth, admin) => {
            return `router.${method}('${path}', ${auth || ''}${admin || ''}async (req, res) => {`;
        });

    // 2. Replace .all()
    // e.g. db.prepare('SELECT * FROM x WHERE id = ?').all(id)
    // to: (await db.query('SELECT * FROM x WHERE id = ?', [id]))[0]
    content = content.replace(/db\.prepare\((.*?)\)\.all\((.*?)\)/g, '(await db.query($1, [$2]))[0]');
    content = content.replace(/db\.prepare\((.*?)\)\.all\(\)/g, '(await db.query($1))[0]');

    // 3. Replace .get()
    content = content.replace(/db\.prepare\((.*?)\)\.get\((.*?)\)/g, '(await db.query($1, [$2]))[0][0]');
    content = content.replace(/db\.prepare\((.*?)\)\.get\(\)/g, '(await db.query($1))[0][0]');

    // 4. Replace .run()
    content = content.replace(/db\.prepare\((.*?)\)\.run\((.*?)\)/g, '(await db.query($1, [$2]))[0]');
    content = content.replace(/db\.prepare\((.*?)\)\.run\(\)/g, '(await db.query($1))[0]');

    // Write back
    fs.writeFileSync(path.join(routesDir, file), content, 'utf8');
    console.log(`Refactored ${file}`);
});
