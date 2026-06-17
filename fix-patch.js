const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(routesDir, file), 'utf8');
    content = content.replace(/router\.patch\('(.*?)',\s*(authenticateToken,?\s*)?(requireAdmin,?\s*)?\(req, res\)\s*=>\s*\{/g, 
        (match, route, auth, admin) => {
            return `router.patch('${route}', ${auth || ''}${admin || ''}async (req, res) => {`;
        }
    );
    // Also, some patch routes might look like: router.patch('/:id/approve', authenticateToken, requireAdmin, (req, res) => {
    fs.writeFileSync(path.join(routesDir, file), content, 'utf8');
});
console.log('Fixed patch routes async declarations');
