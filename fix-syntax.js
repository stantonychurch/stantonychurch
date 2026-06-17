const fs = require('fs');

let h = fs.readFileSync('routes/history.js', 'utf8');
h = h.replace(/\(await db\.query\(\s*'SELECT \* FROM member_history WHERE member_id = \? ORDER BY timestamp DESC LIMIT 100'\s*\)\.all\(req\.params\.memberId\);/g, 
    "(await db.query('SELECT * FROM member_history WHERE member_id = ? ORDER BY timestamp DESC LIMIT 100', [req.params.memberId]))[0];");
h = h.replace(/db\.prepare\(\s*'INSERT INTO member_history \(member_id, action, content_type, content_id, content_title\) VALUES \(\?, \?, \?, \?, \?\)'\s*, \[member_id, action \|\| 'viewed', content_type \|\| '', content_id \|\| 0, content_title \|\| ''\]\)\)\[0\];/g, 
    "(await db.query('INSERT INTO member_history (member_id, action, content_type, content_id, content_title) VALUES (?, ?, ?, ?, ?)', [member_id, action || 'viewed', content_type || '', content_id || 0, content_title || '']))[0];");
fs.writeFileSync('routes/history.js', h);

let e = fs.readFileSync('routes/extended.js', 'utf8');
e = e.replace(/\(await db\.query\(`\s*SELECT mrp\.\*, rp\.title, rp\.duration_days FROM member_reading_progress mrp\s*JOIN reading_plans rp ON rp\.id = mrp\.plan_id WHERE mrp\.member_id = \?\s*`\)\.all\(req\.params\.memberId\);/g, 
    "(await db.query(`SELECT mrp.*, rp.title, rp.duration_days FROM member_reading_progress mrp JOIN reading_plans rp ON rp.id = mrp.plan_id WHERE mrp.member_id = ?`, [req.params.memberId]))[0];");
fs.writeFileSync('routes/extended.js', e);
