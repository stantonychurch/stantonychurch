const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    const items = (await db.query('SELECT * FROM announcements ORDER BY is_emergency DESC, created_at DESC', []))[0];
    res.json(items);
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, type, is_emergency } = req.body;
        if (!title || !content) return res.status(400).json({ error: 'Title and content are required.' });
        const result = (await db.query(
            'INSERT INTO announcements (title, content, type, is_emergency, added_by) VALUES (?, ?, ?, ?, ?)'
        , [title, content, type || 'General', is_emergency ? 1 : 0, req.user.name]))[0];
        res.json({ id: result.insertId, message: 'Announcement published!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Announcement deleted.' });
});

module.exports = router;
