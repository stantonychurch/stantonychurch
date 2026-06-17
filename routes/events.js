const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    const events = (await db.query('SELECT * FROM events ORDER BY event_date ASC', []))[0];
    res.json(events);
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, event_date, event_time, location, description } = req.body;
        if (!title || !event_date) return res.status(400).json({ error: 'Title and date are required.' });

        const result = (await db.query(
            'INSERT INTO events (title, event_date, event_time, location, description) VALUES (?, ?, ?, ?, ?)'
        , [title, event_date, event_time || '', location || '', description || '']))[0];

        res.json({ id: result.insertId, message: 'Event added successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM events WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Event deleted successfully.' });
});

module.exports = router;
