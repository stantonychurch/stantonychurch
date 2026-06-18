const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    const questions = (await db.query('SELECT * FROM quiz_questions ORDER BY RAND()', []))[0];
    res.json(questions);
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty } = req.body;
        if (!question || !option_a || !option_b || !option_c || !option_d || !correct_answer)
            return res.status(400).json({ error: 'All fields are required.' });
        const result = (await db.query(
            'INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        , [question, option_a, option_b, option_c, option_d, correct_answer, category || 'General', difficulty || 'Medium']))[0];
        res.json({ id: result.insertId, message: 'Quiz question added!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM quiz_questions WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Question deleted.' });
});

module.exports = router;
