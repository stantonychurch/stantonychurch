require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const qrcode = require('qrcode-terminal');
const { initDatabase } = require('./database');

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const app = express();
const PORT = process.env.PORT || 3000;

initDatabase();

app.use(cors());
app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ limit: '10gb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/church_hero_bg.png', express.static(path.join(__dirname, '../church_hero_bg.png')));
app.use(express.static(path.join(__dirname, 'public')));

// Auth
app.use('/api/auth', require('./routes/auth'));
// Content
app.use('/api/videos', require('./routes/videos'));
app.use('/api/audio', require('./routes/audio'));
app.use('/api/events', require('./routes/events'));
app.use('/api/verses', require('./routes/verses'));
app.use('/api/devotionals', require('./routes/devotionals'));
app.use('/api/prayer', require('./routes/prayer'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/worship', require('./routes/worship'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/streaks', require('./routes/streaks'));
app.use('/api/history', require('./routes/history'));
app.use('/api/platform', require('./routes/extended'));
app.use('/api/social', require('./routes/social'));

app.get('/api/members', require('./middleware/auth').authenticateToken, require('./middleware/auth').requireAdmin, async (req, res) => {
    try {
        const { db } = require('./database');
        const [members] = await db.query('SELECT id, name, phone, created_at FROM members ORDER BY created_at DESC');
        res.json(members);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.delete('/api/members/:id', require('./middleware/auth').authenticateToken, require('./middleware/auth').requireAdmin, async (req, res) => {
    try {
        const { db } = require('./database');
        await db.query('DELETE FROM members WHERE id = ?', [req.params.id]);
        res.json({ message: 'Member removed.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: get all comments
app.get('/api/admin/comments', require('./middleware/auth').authenticateToken, require('./middleware/auth').requireAdmin, async (req, res) => {
    try {
        const { db } = require('./database');
        const [comments] = await db.query('SELECT * FROM media_comments ORDER BY created_at DESC');
        res.json(comments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin: get all likes
app.get('/api/admin/likes', require('./middleware/auth').authenticateToken, require('./middleware/auth').requireAdmin, async (req, res) => {
    try {
        const { db } = require('./database');
        const [likes] = await db.query(`
            SELECT ml.*, m.name as member_name 
            FROM media_likes ml
            LEFT JOIN members m ON ml.member_id = m.id
            ORDER BY ml.created_at DESC
        `);
        res.json(likes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin Database Reset
app.post('/api/admin/reset', require('./middleware/auth').authenticateToken, require('./middleware/auth').requireAdmin, async (req, res) => {
    const { db } = require('./database');
    try {
        const [tables] = await db.query("SELECT name FROM sqlite_master WHERE type='table'");
        for (const row of tables) {
            const tableName = row.name;
            if (tableName !== 'admins' && tableName !== 'sqlite_sequence') {
                await db.query(`DELETE FROM ${tableName}`);
            }
        }
        res.json({ message: 'Database reset successful. All content wiped except Admins.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    // Get local network IP for phone access
    const nets = os.networkInterfaces();
    let localIP = 'localhost';
    for (const iface of Object.values(nets)) {
        for (const net of iface) {
            if (net.family === 'IPv4' && !net.internal) {
                localIP = net.address;
                break;
            }
        }
        if (localIP !== 'localhost') break;
    }
    const localURL = `http://${localIP}:${PORT}`;

    console.log(`\n✝️  St Antony Church Devotional App`);
    console.log(`🌐 Local:   http://localhost:${PORT}`);
    console.log(`📱 Network: ${localURL}`);
    console.log(`📖 Admin → name: admin | password: admin123\n`);
    console.log(`📲 Scan this QR code with your phone to open the app:\n`);
    qrcode.generate(localURL, { small: true });
    console.log(`\n   URL: ${localURL}\n`);
});
