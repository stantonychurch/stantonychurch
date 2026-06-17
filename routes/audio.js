const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadToFirebase } = require('../services/firebase');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10 GB
    fileFilter: (req, file, cb) => {
        const allowed = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only audio files are allowed'));
    }
});

router.get('/', authenticateToken, async (req, res) => {
    const audios = (await db.query('SELECT * FROM audio ORDER BY created_at DESC', []))[0];
    res.json(audios);
});

router.post('/', authenticateToken, requireAdmin, upload.single('audio'), async (req, res) => {
    try {
        const { title, pastor, description } = req.body;
        let finalUrl = null;
        if (req.file) {
            try {
                const buffer = fs.readFileSync(req.file.path);
                finalUrl = await uploadToFirebase(buffer, req.file.originalname, req.file.mimetype);
                fs.unlinkSync(req.file.path); // remove local
            } catch(e) {
                console.error("Firebase upload failed:", e);
                finalUrl = `/uploads/${req.file.filename}`;
            }
        }

        if (!title) return res.status(400).json({ error: 'Title is required.' });
        if (!finalUrl) return res.status(400).json({ error: 'Audio file is required.' });

        const result = (await db.query(
            'INSERT INTO audio (title, pastor, description, filename, uploaded_by) VALUES (?, ?, ?, ?, ?)'
        , [title, pastor || 'Unknown', description || '', finalUrl, req.user.name]))[0];

        res.json({ id: result.insertId, message: 'Audio uploaded successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const audio = (await db.query('SELECT filename FROM audio WHERE id = ?', [req.params.id]))[0][0];
        if (audio && audio.filename) {
            const filePath = path.join(__dirname, '../uploads', audio.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        (await db.query('DELETE FROM audio WHERE id = ?', [req.params.id]))[0];
        res.json({ message: 'Audio deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
