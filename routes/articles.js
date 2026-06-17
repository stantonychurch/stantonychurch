const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    const items = (await db.query('SELECT * FROM articles ORDER BY created_at DESC', []))[0];
    res.json(items);
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, author, category } = req.body;
        if (!title || !content) return res.status(400).json({ error: 'Title and content are required.' });
        const result = (await db.query(
            'INSERT INTO articles (title, content, author, category, added_by) VALUES (?, ?, ?, ?, ?)'
        , [title, content, author || '', category || 'Faith', req.user.name]))[0];
        res.json({ id: result.insertId, message: 'Article published!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Article deleted.' });
});

module.exports = router;
