const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET all prayer requests (members see all non-anonymous names; anonymous shows "Anonymous")
router.get('/', authenticateToken, async (req, res) => {
    const items = (await db.query('SELECT * FROM prayer_requests ORDER BY is_emergency DESC, created_at DESC', []))[0];
    const sanitized = items.map(item => ({
        ...item,
        member_name: item.is_anonymous ? 'Anonymous' : item.member_name
    }));
    res.json(sanitized);
});

// POST submit prayer request
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { request, category, is_anonymous, is_emergency } = req.body;
        if (!request) return res.status(400).json({ error: 'Prayer request text is required.' });
        const [result] = await db.query(
            'INSERT INTO prayer_requests (member_id, member_name, request, request_text, category, is_anonymous, is_emergency) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, req.user.name, request, request, category || 'General', is_anonymous ? 1 : 0, is_emergency ? 1 : 0]
        );
        res.json({ id: result.insertId, message: 'Prayer request submitted. The church is praying for you! 🙏' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH mark as answered (admin)
router.patch('/:id/answered', authenticateToken, requireAdmin, async (req, res) => {
    const { testimony } = req.body;
    (await db.query('UPDATE prayer_requests SET is_answered = 1, answered_testimony = ? WHERE id = ?', [testimony || '', req.params.id]))[0];
    res.json({ message: 'Marked as answered. Praise God!' });
});

// DELETE prayer request (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM prayer_requests WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Prayer request deleted.' });
});

module.exports = router;
