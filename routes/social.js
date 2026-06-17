const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// --- Likes ---
router.get('/likes/:type/:id', authenticateToken, async (req, res) => {
    const { type, id } = req.params;
    const countRow = (await db.query('SELECT COUNT(*) as count FROM likes WHERE media_type = ? AND media_id = ?', [type, id]))[0][0];
    const userLike = (await db.query('SELECT 1 FROM likes WHERE media_type = ? AND media_id = ? AND member_id = ?', [type, id, req.user.id]))[0][0];
    res.json({ count: countRow.count, hasLiked: !!userLike });
});

router.post('/like', authenticateToken, async (req, res) => {
    const { media_type, media_id } = req.body;
    const existing = (await db.query('SELECT id FROM likes WHERE media_type = ? AND media_id = ? AND member_id = ?', [media_type, media_id, req.user.id]))[0][0];
    if (existing) {
        (await db.query('DELETE FROM likes WHERE id = ?', [existing.id]))[0];
        res.json({ message: 'Unliked' });
    } else {
        (await db.query('INSERT INTO likes (member_id, media_type, media_id) VALUES (?, ?, ?)', [req.user.id, media_type, media_id]))[0];
        res.json({ message: 'Liked' });
    }
});

// --- Comments ---
router.get('/comments/:type/:id', authenticateToken, async (req, res) => {
    const { type, id } = req.params;
    const comments = (await db.query(`
        SELECT c.*, m.name as member_name 
        FROM comments c
        JOIN members m ON c.member_id = m.id
        WHERE c.media_type = ? AND c.media_id = ?
        ORDER BY c.created_at DESC
    `, [type, id]))[0];
    res.json(comments);
});

router.post('/comment', authenticateToken, async (req, res) => {
    const { media_type, media_id, text } = req.body;
    (await db.query('INSERT INTO comments (member_id, media_type, media_id, comment_text) VALUES (?, ?, ?, ?)', [req.user.id, media_type, media_id, text]))[0];
    res.json({ message: 'Comment added' });
});

router.delete('/comment/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Comment deleted' });
});

// --- Views ---
router.post('/view', authenticateToken, async (req, res) => {
    // Optional analytics
    res.json({ message: 'Viewed' });
});

module.exports = router;
