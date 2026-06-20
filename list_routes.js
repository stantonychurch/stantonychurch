const fs = require('fs');
const file = 'c:\\Users\\HP\\project\\christian-devotional-app\\routes\\extended.js';

if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const routes = [];

lines.forEach((line, idx) => {
    const match = line.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/);
    if (match) {
        routes.push({ line: idx + 1, method: match[1].toUpperCase(), path: match[2] });
    }
});

console.log('Endpoints registered in routes/extended.js:');
routes.forEach(r => console.log(`${r.line}: ${r.method} ${r.path}`));
