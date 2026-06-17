const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `video_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10 GB
    fileFilter: (req, file, cb) => {
        const allowed = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only video files are allowed'));
    }
});

router.get('/', authenticateToken, async (req, res) => {
    const videos = (await db.query('SELECT * FROM videos ORDER BY created_at DESC', []))[0];
    res.json(videos);
});

router.post('/', authenticateToken, requireAdmin, upload.single('video'), async (req, res) => {
    try {
        const { title, description, category, url } = req.body;
        const filename = req.file ? req.file.filename : null;
        if (!title) return res.status(400).json({ error: 'Title is required.' });
        if (!filename && !url) return res.status(400).json({ error: 'Please upload a video file or provide a URL.' });

        const result = (await db.query(
            'INSERT INTO videos (title, description, category, filename, url, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)'
        , [title, description || '', category || 'Sermon', filename, url || '', req.user.name]))[0];

        res.json({ id: result.insertId, message: 'Video uploaded successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const video = (await db.query('SELECT filename FROM videos WHERE id = ?', [req.params.id]))[0][0];
        if (video && video.filename) {
            const filePath = path.join(__dirname, '../uploads', video.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        (await db.query('DELETE FROM videos WHERE id = ?', [req.params.id]))[0];
        res.json({ message: 'Video deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
