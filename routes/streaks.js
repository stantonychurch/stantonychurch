const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET member streaks
router.get('/:memberId', authenticateToken, async (req, res) => {
    let streak = (await db.query('SELECT * FROM member_streaks WHERE member_id = ?', [req.params.memberId]))[0][0];
    if (!streak) {
        (await db.query('INSERT IGNORE INTO member_streaks (member_id) VALUES (?)', [req.params.memberId]))[0];
        streak = (await db.query('SELECT * FROM member_streaks WHERE member_id = ?', [req.params.memberId]))[0][0];
    }
    res.json(streak);
});

// POST update a streak (type: prayer|bible|devotional)
router.post('/update', authenticateToken, async (req, res) => {
    try {
        const { member_id, type } = req.body;
        if (!member_id || !type) return res.status(400).json({ error: 'member_id and type required.' });

        const today = new Date().toISOString().split('T')[0];
        (await db.query('INSERT IGNORE INTO member_streaks (member_id) VALUES (?)', [member_id]))[0];
        const streak = (await db.query('SELECT * FROM member_streaks WHERE member_id = ?', [member_id]))[0][0];

        const lastDateField = `last_${type}_date`;
        const streakField = `${type}_streak`;
        const lastDate = streak[lastDateField];

        let newStreak = streak[streakField] || 0;
        if (lastDate === today) {
            return res.json({ message: 'Already logged today!', streak: newStreak });
        }
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStreak = lastDate === yesterday ? newStreak + 1 : 1;

        (await db.query(`UPDATE member_streaks SET ${streakField} = ?, ${lastDateField} = ? WHERE member_id = ?`, [newStreak, today, member_id]))[0];
        res.json({ message: `${type} streak updated!`, streak: newStreak });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
