const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET member's own journals (with optional memberId parameter for backwards compatibility)
router.get('/:memberId?', authenticateToken, async (req, res) => {
    const memberId = req.params.memberId || req.user.id;
    // Security check: if user is not admin and trying to get someone else's journal
    if (req.user.role !== 'admin' && parseInt(memberId) !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only view your own journal.' });
    }
    const journals = (await db.query('SELECT * FROM faith_journals WHERE member_id = ? ORDER BY created_at DESC', [memberId]))[0];
    res.json(journals);
});

// POST new journal entry
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { member_id, title, content, mood } = req.body;
        if (!content) return res.status(400).json({ error: 'Journal content is required.' });
        const result = (await db.query(
            'INSERT INTO faith_journals (member_id, title, content, mood) VALUES (?, ?, ?, ?)'
        , [member_id || req.user.id, title || '', content, mood || 'Grateful']))[0];
        res.json({ id: result.insertId, message: 'Journal entry saved!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE journal entry
router.delete('/:id', authenticateToken, async (req, res) => {
    (await db.query('DELETE FROM faith_journals WHERE id = ? AND member_id = ?', [req.params.id, req.user.id]))[0];
    res.json({ message: 'Journal entry deleted.' });
});

module.exports = router;
