const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    const songs = (await db.query('SELECT * FROM worship_songs ORDER BY created_at DESC', []))[0];
    res.json(songs);
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, artist, lyrics, category, language } = req.body;
        if (!title) return res.status(400).json({ error: 'Song title is required.' });
        const result = (await db.query(
            'INSERT INTO worship_songs (title, artist, lyrics, category, language, added_by) VALUES (?, ?, ?, ?, ?, ?)'
        , [title, artist || '', lyrics || '', category || 'Worship', language || 'English', req.user.name]))[0];
        res.json({ id: result.insertId, message: 'Worship song added!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM worship_songs WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Song deleted.' });
});

module.exports = router;
