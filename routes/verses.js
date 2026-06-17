const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    const verses = (await db.query('SELECT * FROM bible_verses ORDER BY created_at DESC', []))[0];
    res.json(verses);
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { verse, reference } = req.body;
        if (!verse || !reference) return res.status(400).json({ error: 'Verse text and reference are required.' });

        const result = (await db.query(
            'INSERT INTO bible_verses (verse, reference, added_by) VALUES (?, ?, ?)'
        , [verse, reference, req.user.name]))[0];

        res.json({ id: result.insertId, message: 'Bible verse added successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM bible_verses WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Verse deleted successfully.' });
});

module.exports = router;
