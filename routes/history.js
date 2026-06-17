const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

router.get('/:memberId', authenticateToken, async (req, res) => {
    const history = (await db.query('SELECT * FROM member_history WHERE member_id = ? ORDER BY timestamp DESC LIMIT 100', [req.params.memberId]))[0];
    res.json(history);
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { member_id, action, content_type, content_id, content_title } = req.body;
        if (!member_id) return res.status(400).json({ error: 'member_id is required.' });

        (await db.query('INSERT INTO member_history (member_id, action, content_type, content_id, content_title) VALUES (?, ?, ?, ?, ?)', [member_id, action || 'viewed', content_type || '', content_id || 0, content_title || '']))[0];

        res.json({ message: 'History logged.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:memberId', authenticateToken, async (req, res) => {
    (await db.query('DELETE FROM member_history WHERE member_id = ?', [req.params.memberId]))[0];
    res.json({ message: 'History cleared.' });
});

module.exports = router;
