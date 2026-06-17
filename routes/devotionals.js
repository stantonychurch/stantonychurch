const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET all devotionals
router.get('/', authenticateToken, async (req, res) => {
    const items = (await db.query('SELECT * FROM devotionals ORDER BY created_at DESC', []))[0];
    res.json(items);
});

// GET single devotional
router.get('/:id', authenticateToken, async (req, res) => {
    const item = (await db.query('SELECT * FROM devotionals WHERE id = ?', [req.params.id]))[0][0];
    if (!item) return res.status(404).json({ error: 'Devotional not found' });
    res.json(item);
});

// POST create devotional (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, scripture, scripture_reference, prayer, category } = req.body;
        if (!title || !content) return res.status(400).json({ error: 'Title and content are required.' });
        const result = (await db.query(
            'INSERT INTO devotionals (title, content, scripture, scripture_reference, prayer, category, added_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
        , [title, content, scripture || '', scripture_reference || '', prayer || '', category || 'General', req.user.name]))[0];
        res.json({ id: result.insertId, message: 'Devotional created successfully!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE devotional (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM devotionals WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Devotional deleted.' });
});

module.exports = router;
