const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { db } = require('../database');
const { uploadToFirebase } = require('../services/firebase');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const upload = multer({
    dest: './uploads/',
    limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10 GB
});

router.post('/reset-database', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.query("SHOW TABLES");
        for (const row of rows) {
            const tableName = Object.values(row)[0];
            if (tableName !== 'admins') {
                await db.query(`DELETE FROM ${tableName}`);
            }
        }
        res.json({ message: 'Database reset successful.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

function crud(table, orderBy = 'created_at DESC') {
    return {
        list: async () => (await db.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`, []))[0],
        get: async (id) => (await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]))[0][0],
        del: async (id) => (await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]))[0],
    };
}

// ─── Reading Plans ───────────────────────────────────
router.get('/reading-plans', authenticateToken, async (req, res) => {
    const plans = (await db.query('SELECT * FROM reading_plans ORDER BY duration_days', []))[0];
    res.json(plans);
});
router.get('/reading-plans/:id/days', authenticateToken, async (req, res) => {
    const days = (await db.query('SELECT * FROM reading_plan_days WHERE plan_id = ? ORDER BY day_num', [req.params.id]))[0];
    res.json(days);
});
router.post('/reading-plans/:id/start', authenticateToken, async (req, res) => {
    (await db.query('INSERT IGNORE INTO member_reading_progress (member_id, plan_id) VALUES (?, ?)', [req.user.id, req.params.id]))[0];
    const progress = (await db.query('SELECT * FROM member_reading_progress WHERE member_id = ? AND plan_id = ?', [req.user.id, req.params.id]))[0][0];
    res.json(progress);
});
router.get('/reading-plans/progress/:memberId', authenticateToken, async (req, res) => {
    const items = (await db.query(`SELECT mrp.*, rp.title, rp.duration_days FROM member_reading_progress mrp JOIN reading_plans rp ON rp.id = mrp.plan_id WHERE mrp.member_id = ?`, [req.params.memberId]))[0];
    res.json(items);
});
router.post('/reading-plans/progress/advance', authenticateToken, async (req, res) => {
    const { plan_id } = req.body;
    const prog = (await db.query('SELECT * FROM member_reading_progress WHERE member_id = ? AND plan_id = ?', [req.user.id, plan_id]))[0][0];
    if (!prog) return res.status(404).json({ error: 'Plan not started.' });
    const plan = (await db.query('SELECT duration_days FROM reading_plans WHERE id = ?', [plan_id]))[0][0];
    const next = Math.min(prog.current_day + 1, plan.duration_days);
    (await db.query('UPDATE member_reading_progress SET current_day = ? WHERE member_id = ? AND plan_id = ?', [next, req.user.id, plan_id]))[0];
    res.json({ current_day: next, completed: next >= plan.duration_days });
});

// ─── Verse of the Day ────────────────────────────────
router.get('/verse-of-day', authenticateToken, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    let entry = (await db.query('SELECT v.* FROM verse_of_day vod JOIN bible_verses v ON v.id = vod.verse_id WHERE vod.display_date = ?', [today]))[0][0];
    if (!entry) {
        const verse = (await db.query('SELECT * FROM bible_verses ORDER BY RAND() LIMIT 1', []))[0][0];
        if (verse) {
            (await db.query('REPLACE INTO verse_of_day (verse_id, display_date) VALUES (?, ?)', [verse.id, today]))[0];
            entry = verse;
        }
    }
    res.json(entry || {});
});

// ─── Podcasts ────────────────────────────────────────
router.post('/media/:id/like', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const existing = (await db.query('SELECT id FROM media_likes WHERE media_id = ? AND member_id = ?', [id, req.user.id]))[0][0];
    if (existing) {
        (await db.query('DELETE FROM media_likes WHERE id = ?', [existing.id]))[0];
        res.json({ message: 'Unliked', liked: false });
    } else {
        (await db.query('INSERT INTO media_likes (media_id, member_id) VALUES (?, ?)', [id, req.user.id]))[0];
        res.json({ message: 'Liked', liked: true });
    }
});
router.post('/media/:id/comment', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content required' });
    const r = (await db.query('INSERT INTO media_comments (media_id, member_id, content) VALUES (?, ?, ?)', [id, req.user.id, content]))[0];
    res.json({ message: 'Comment added', id: r.insertId });
});
router.delete('/media/comment/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    (await db.query('DELETE FROM media_comments WHERE id = ?', [id]))[0];
    res.json({ message: 'Comment deleted' });
});
router.get('/podcasts', authenticateToken, async (req, res) => res.json(await crud('podcasts').list()));
router.post('/podcasts', authenticateToken, requireAdmin, upload.single('audio'), async (req, res) => {
    const { title, pastor, description, url, language } = req.body;
    const filename = req.file ? req.file.filename : null;
    const r = (await db.query('INSERT INTO podcasts (title, pastor, description, filename, url, language, added_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, pastor || '', description || '', filename, url || '', language || 'en', req.user.name]))[0];
    res.json({ id: r.insertId, message: 'Podcast added.' });
});
router.delete('/podcasts/:id', authenticateToken, requireAdmin, async (req, res) => {
    crud('podcasts').del(req.params.id);
    res.json({ message: 'Deleted.' });
});

// ─── Testimonies ─────────────────────────────────────
router.get('/testimonies', authenticateToken, async (req, res) => {
    res.json((await db.query('SELECT * FROM testimonies WHERE is_public = 1 ORDER BY created_at DESC', []))[0]);
});
router.get('/testimonies/mine/:memberId', authenticateToken, async (req, res) => {
    res.json((await db.query('SELECT * FROM testimonies WHERE member_id = ? ORDER BY created_at DESC', [req.params.memberId]))[0]);
});
router.post('/testimonies', authenticateToken, async (req, res) => {
    const { title, content, is_public } = req.body;
    const r = (await db.query('INSERT INTO testimonies (member_id, member_name, title, content, is_public) VALUES (?, ?, ?, ?, ?)', [req.user.id, req.user.name, title, content, is_public !== false ? 1 : 0]))[0];
    res.json({ id: r.insertId, message: 'Testimony saved.' });
});
router.delete('/testimonies/:id', authenticateToken, async (req, res) => {
    const t = await crud('testimonies').get(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found.' });
    if (req.user.role !== 'admin' && t.member_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });
    await crud('testimonies').del(req.params.id);
    res.json({ message: 'Deleted.' });
});

// ─── Scripture Memorization ────────────────────────────
router.get('/memorization/:memberId', authenticateToken, async (req, res) => {
    res.json((await db.query('SELECT * FROM scripture_memorization WHERE member_id = ? ORDER BY created_at DESC', [req.params.memberId]))[0]);
});
router.post('/memorization', authenticateToken, async (req, res) => {
    const { verse, reference } = req.body;
    const r = (await db.query('INSERT INTO scripture_memorization (member_id, verse, reference) VALUES (?, ?, ?)', [req.user.id, verse, reference]))[0];
    res.json({ id: r.insertId });
});
router.patch('/memorization/:id/master', authenticateToken, async (req, res) => {
    (await db.query('UPDATE scripture_memorization SET mastered = 1 WHERE id = ? AND member_id = ?', [req.params.id, req.user.id]))[0];
    res.json({ message: 'Marked as mastered! 🎉' });
});
router.delete('/memorization/:id', authenticateToken, async (req, res) => {
    (await db.query('DELETE FROM scripture_memorization WHERE id = ? AND member_id = ?', [req.params.id, req.user.id]))[0];
    res.json({ message: 'Deleted.' });
});

// ─── Courses ───────────────────────────────────────────
router.get('/courses', authenticateToken, async (req, res) => res.json(await crud('courses').list()));
router.get('/courses/:id/lessons', authenticateToken, async (req, res) => {
    res.json((await db.query('SELECT * FROM course_lessons WHERE course_id = ? ORDER BY order_num', [req.params.id]))[0]);
});
router.post('/courses', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, category, language } = req.body;
    const r = (await db.query('INSERT INTO courses (title, description, category, language, added_by) VALUES (?, ?, ?, ?, ?)', [title, description || '', category || 'Bible', language || 'en', req.user.name]))[0];
    res.json({ id: r.insertId });
});
router.post('/courses/:id/lessons', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content, order_num, video_url } = req.body;
    const r = (await db.query('INSERT INTO course_lessons (course_id, order_num, title, content, video_url) VALUES (?, ?, ?, ?, ?)', [req.params.id, order_num || 1, title, content || '', video_url || '']))[0];
    (await db.query('UPDATE courses SET lesson_count = (SELECT COUNT(*) FROM course_lessons WHERE course_id = ?) WHERE id = ?', [req.params.id, req.params.id]))[0];
    res.json({ id: r.insertId });
});
router.post('/courses/:id/progress', authenticateToken, async (req, res) => {
    const courseId = req.params.id;
    const course = await crud('courses').get(courseId);
    (await db.query('INSERT IGNORE INTO member_course_progress (member_id, course_id) VALUES (?, ?)', [req.user.id, courseId]))[0];
    const prog = (await db.query('SELECT * FROM member_course_progress WHERE member_id = ? AND course_id = ?', [req.user.id, courseId]))[0][0];
    const next = (prog.completed_lessons || 0) + 1;
    const done = next >= course.lesson_count;
    (await db.query('UPDATE member_course_progress SET completed_lessons = ?, completed = ?, completed_at = ? WHERE member_id = ? AND course_id = ?', [next, done ? 1 : 0, done ? new Date().toISOString() : null, req.user.id, courseId]))[0];
    if (done) {
        const code = `GC-${courseId}-${req.user.id}-${Date.now()}`;
        (await db.query('INSERT IGNORE INTO certificates (member_id, course_id, cert_code) VALUES (?, ?, ?)', [req.user.id, courseId, code]))[0];
        return res.json({ completed: true, cert_code: code, message: 'Course completed! Certificate issued.' });
    }
    res.json({ completed_lessons: next, completed: false });
});
router.get('/certificates/:memberId', authenticateToken, async (req, res) => {
    res.json((await db.query(`
        SELECT c.*, co.title as course_title FROM certificates c
        JOIN courses co ON co.id = c.course_id WHERE c.member_id = ?
    `, [req.params.memberId]))[0]);
});
router.delete('/courses/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM course_lessons WHERE course_id = ?', [req.params.id]))[0];
    await crud('courses').del(req.params.id);
    res.json({ message: 'Deleted.' });
});

// ─── Prayer Extended ─────────────────────────────────
router.get('/prayer-groups', authenticateToken, async (req, res) => {
    const groups = await crud('prayer_groups').list();
    const withCount = await Promise.all(groups.map(async g => ({
        ...g,
        member_count: (await db.query('SELECT COUNT(*) as c FROM prayer_group_members WHERE group_id = ?', [g.id]))[0][0].c
    })));
    res.json(withCount);
});
router.post('/prayer-groups', authenticateToken, requireAdmin, async (req, res) => {
    const { name, description, leader_name } = req.body;
    const r = (await db.query('INSERT INTO prayer_groups (name, description, leader_name) VALUES (?, ?, ?)', [name, description || '', leader_name || '']))[0];
    res.json({ id: r.insertId });
});
router.post('/prayer-groups/:id/join', authenticateToken, async (req, res) => {
    (await db.query('INSERT IGNORE INTO prayer_group_members (group_id, member_id) VALUES (?, ?)', [req.params.id, req.user.id]))[0];
    res.json({ message: 'Joined prayer group!' });
});
router.get('/prayer-reminders/:memberId', authenticateToken, async (req, res) => {
    res.json((await db.query('SELECT * FROM prayer_reminders WHERE member_id = ?', [req.params.memberId]))[0]);
});
router.post('/prayer-reminders', authenticateToken, async (req, res) => {
    const { reminder_time, message } = req.body;
    const r = (await db.query('INSERT INTO prayer_reminders (member_id, reminder_time, message) VALUES (?, ?, ?)', [req.user.id, reminder_time, message || 'Time to pray']))[0];
    res.json({ id: r.insertId });
});
router.delete('/prayer-reminders/:id', authenticateToken, async (req, res) => {
    (await db.query('DELETE FROM prayer_reminders WHERE id = ? AND member_id = ?', [req.params.id, req.user.id]))[0];
    res.json({ message: 'Deleted.' });
});
router.get('/fasting/:memberId', authenticateToken, async (req, res) => {
    res.json((await db.query('SELECT * FROM fasting_tracker WHERE member_id = ? ORDER BY created_at DESC', [req.params.memberId]))[0]);
});
router.post('/fasting', authenticateToken, async (req, res) => {
    const { start_date, end_date, purpose, notes } = req.body;
    const r = (await db.query('INSERT INTO fasting_tracker (member_id, start_date, end_date, purpose, notes) VALUES (?, ?, ?, ?, ?)', [req.user.id, start_date, end_date || '', purpose || '', notes || '']))[0];
    res.json({ id: r.insertId });
});
router.get('/prayer-calendar', authenticateToken, async (req, res) => res.json(await crud('prayer_calendar', 'event_date').list()));
router.post('/prayer-calendar', authenticateToken, requireAdmin, async (req, res) => {
    const { title, event_date, description, event_type } = req.body;
    const r = (await db.query('INSERT INTO prayer_calendar (title, event_date, description, event_type) VALUES (?, ?, ?, ?)', [title, event_date, description || '', event_type || 'Prayer']))[0];
    res.json({ id: r.insertId });
});

// ─── Worship Extended ────────────────────────────────
router.get('/worship-playlists', authenticateToken, async (req, res) => {
    const playlists = await crud('worship_playlists').list();
    const songs = (await db.query('SELECT * FROM worship_songs', []))[0];
    res.json(playlists.map(p => ({
        ...p,
        songs: (p.song_ids || '').split(',').filter(Boolean).map(id => songs.find(s => s.id === parseInt(id))).filter(Boolean)
    })));
});
router.post('/worship-playlists', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, song_ids } = req.body;
    const r = (await db.query('INSERT INTO worship_playlists (title, description, song_ids, created_by) VALUES (?, ?, ?, ?)', [title, description || '', song_ids || '', req.user.name]))[0];
    res.json({ id: r.insertId });
});
router.get('/choir-materials', authenticateToken, async (req, res) => res.json(await crud('choir_materials').list()));
router.post('/choir-materials', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });
        
        let finalUrl = null;
        let mediaType = 'pdf';
        
        if (req.file) {
            const mime = req.file.mimetype;
            if (mime.startsWith('image')) mediaType = 'image';
            else if (mime.startsWith('audio')) mediaType = 'audio';
            else if (mime.startsWith('video')) mediaType = 'video';
            else mediaType = 'pdf';
            
            try {
                const buffer = fs.readFileSync(req.file.path);
                finalUrl = await uploadToFirebase(buffer, req.file.originalname, mime);
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error("Firebase upload failed:", e);
                finalUrl = `/uploads/${req.file.filename}`;
            }
        }
        
        const r = (await db.query(
            'INSERT INTO choir_materials (title, description, filename, url, media_type, added_by) VALUES (?, ?, ?, ?, ?, ?)', 
            [title, description || '', req.file ? req.file.filename : '', finalUrl || '', mediaType, req.user.name]
        ))[0];
        
        res.json({ id: r.insertId, message: 'Choir material uploaded successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/choir-materials/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM choir_materials WHERE id = ?', [req.params.id]);
        res.json({ message: 'Choir material deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/song-requests', authenticateToken, async (req, res) => res.json(await crud('song_requests').list()));
router.post('/song-requests', authenticateToken, async (req, res) => {
    const { song_title, occasion } = req.body;
    const r = (await db.query('INSERT INTO song_requests (member_id, member_name, song_title, occasion) VALUES (?, ?, ?, ?)', [req.user.id, req.user.name, song_title, occasion || '']))[0];
    res.json({ id: r.insertId, message: 'Song request submitted!' });
});
router.patch('/song-requests/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('UPDATE song_requests SET status = ? WHERE id = ?', [req.body.status, req.params.id]))[0];
    res.json({ message: 'Updated.' });
});

// ─── Church Services ───────────────────────────────────
router.get('/service-schedules', authenticateToken, async (req, res) => res.json(await crud('service_schedules').list()));
router.post('/service-schedules', authenticateToken, requireAdmin, async (req, res) => {
    const { day_of_week, service_time, service_type, location, description, stream_url } = req.body;
    const r = (await db.query('INSERT INTO service_schedules (day_of_week, service_time, service_type, location, description, stream_url) VALUES (?, ?, ?, ?, ?, ?)', [day_of_week, service_time, service_type || 'Service', location || '', description || '', stream_url || '']))[0];
    res.json({ id: r.insertId });
});
router.post('/events/:id/register', authenticateToken, async (req, res) => {
    (await db.query('INSERT IGNORE INTO event_registrations (event_id, member_id) VALUES (?, ?)', [req.params.id, req.user.id]))[0];
    res.json({ message: 'Registered for event!' });
});
router.get('/events/:id/registrations', authenticateToken, requireAdmin, async (req, res) => {
    res.json((await db.query(`
        SELECT er.*, m.name, m.phone FROM event_registrations er
        JOIN members m ON m.id = er.member_id WHERE er.event_id = ?
    `, [req.params.id]))[0]);
});

// Event Galleries
router.get('/event-galleries', authenticateToken, async (req, res) => res.json(await crud('event_galleries').list()));
router.post('/event-galleries', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, event_date } = req.body;
    const r = (await db.query('INSERT INTO event_galleries (title, description, event_date) VALUES (?, ?, ?)', [title, description || '', event_date || '']))[0];
    res.json({ id: r.insertId });
});
router.get('/event-galleries/:id/media', authenticateToken, async (req, res) => {
    const mediaList = (await db.query(`
        SELECT m.*, 
            (SELECT COUNT(*) FROM media_likes WHERE media_id = m.id) as likes_count,
            (SELECT COUNT(*) FROM media_likes WHERE media_id = m.id AND member_id = ?) as is_liked,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', c.id, 'content', c.content, 'member_name', mem.name, 'created_at', c.created_at)) 
             FROM media_comments c JOIN members mem ON c.member_id = mem.id WHERE c.media_id = m.id) as comments,
            (SELECT JSON_ARRAYAGG(mem.name) 
             FROM media_likes l JOIN members mem ON l.member_id = mem.id WHERE l.media_id = m.id) as likers
        FROM event_media m
        WHERE m.gallery_id = ? ORDER BY m.created_at DESC
    `, [req.user.id, req.params.id]))[0];
    
    // Parse the JSON arrays for each media item
    const formatted = mediaList.map(m => ({
        ...m,
        is_liked: m.is_liked > 0,
        comments: m.comments && m.comments !== '[null]' ? JSON.parse(m.comments) : [],
        likers: m.likers && m.likers !== '[null]' ? JSON.parse(m.likers) : []
    }));
    
    res.json(formatted);
});
router.post('/event-galleries/:id/media', authenticateToken, requireAdmin, upload.array('files', 50), async (req, res) => {
    const files = req.files || [];
    for (const file of files) {
        const type = file.mimetype.startsWith('video') ? 'video' : file.mimetype.startsWith('audio') ? 'audio' : 'image';
        let finalUrl = `/uploads/${file.filename}`;
        
        if (type === 'image' || type === 'audio') {
            try {
                const buffer = fs.readFileSync(file.path);
                finalUrl = await uploadToFirebase(buffer, file.originalname, file.mimetype);
                fs.unlinkSync(file.path);
            } catch(e) {
                console.error("Firebase upload failed:", e);
            }
        }
        await db.query('INSERT INTO event_media (gallery_id, media_type, filename, url) VALUES (?, ?, ?, ?)', [req.params.id, type, file.filename, finalUrl]);
    }
    res.json({ message: 'Files uploaded' });
});
router.delete('/event-galleries/:id', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query('DELETE FROM event_media WHERE gallery_id = ?', [req.params.id]))[0];
    (await db.query('DELETE FROM event_galleries WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Gallery deleted' });
});
router.get('/sermon-notes', authenticateToken, async (req, res) => res.json(await crud('sermon_notes').list()));
router.post('/sermon-notes', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content, language, event_id } = req.body;
    const r = (await db.query('INSERT INTO sermon_notes (title, content, language, event_id, added_by) VALUES (?, ?, ?, ?, ?)', [title, content || '', language || 'en', event_id || null, req.user.name]))[0];
    res.json({ id: r.insertId });
});
router.get('/bulletins', authenticateToken, async (req, res) => res.json(await crud('church_bulletins').list()));
router.post('/bulletins', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content, week_date } = req.body;
    const r = (await db.query('INSERT INTO church_bulletins (title, content, week_date, added_by) VALUES (?, ?, ?, ?)', [title, content || '', week_date || '', req.user.name]))[0];
    res.json({ id: r.insertId });
});

// Children Stories
router.get('/children-stories', authenticateToken, async (req, res) => {
    try {
        const stories = (await db.query('SELECT * FROM children_stories ORDER BY created_at DESC'))[0];
        res.json(stories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.post('/children-stories', authenticateToken, requireAdmin, upload.single('video'), async (req, res) => {
    try {
        const { title, content, age_group, language, url } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });
        
        let finalUrl = url || '';
        let mediaType = 'text';
        
        if (req.file) {
            mediaType = 'video';
            try {
                const buffer = fs.readFileSync(req.file.path);
                finalUrl = await uploadToFirebase(buffer, req.file.originalname, req.file.mimetype);
                fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error("Firebase video upload failed:", e);
                finalUrl = `/uploads/${req.file.filename}`;
            }
        } else if (finalUrl) {
            mediaType = 'video';
        }
        
        const r = (await db.query(
            'INSERT INTO children_stories (title, content, video_url, media_type, age_group, language) VALUES (?, ?, ?, ?, ?, ?)',
            [title, content || '', finalUrl, mediaType, age_group || 'All', language || 'en']
        ))[0];
        res.json({ id: r.insertId, message: 'Children story uploaded successfully!' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/children-stories/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM children_story_completions WHERE story_id = ?', [req.params.id]);
        await db.query('DELETE FROM children_stories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Story deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/children-profiles', authenticateToken, async (req, res) => {
    try {
        const profiles = (await db.query('SELECT * FROM children_profiles WHERE member_id = ? ORDER BY created_at DESC', [req.user.id]))[0];
        res.json(profiles);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.post('/children-profiles', authenticateToken, async (req, res) => {
    try {
        const { child_name, dob, class_name, student_phone } = req.body;
        if (!child_name || !dob || !class_name) {
            return res.status(400).json({ error: 'Child name, DOB, and class are required' });
        }
        const r = (await db.query(
            'INSERT INTO children_profiles (member_id, child_name, dob, class, student_phone) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, child_name.trim(), dob.trim(), class_name.trim(), student_phone ? student_phone.trim() : null]
        ))[0];
        res.json({ id: r.insertId, message: 'Child profile registered successfully!' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/children-stories/:id/complete', authenticateToken, async (req, res) => {
    try {
        const { child_id } = req.body;
        if (!child_id) return res.status(400).json({ error: 'child_id is required' });
        await db.query(
            'INSERT IGNORE INTO children_story_completions (child_id, story_id) VALUES (?, ?)',
            [child_id, req.params.id]
        );
        res.json({ message: 'Story marked as completed!' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/children-stories/report/completions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const report = (await db.query(`
            SELECT csc.id, csc.completed_at, cp.child_name, cp.class, cp.student_phone, cs.title as story_title
            FROM children_story_completions csc
            JOIN children_profiles cp ON csc.child_id = cp.id
            JOIN children_stories cs ON csc.story_id = cs.id
            ORDER BY csc.completed_at DESC
        `))[0];
        res.json(report);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─── Family ────────────────────────────────────────────
router.get('/family-prayers', authenticateToken, async (req, res) => res.json(await crud('family_prayer_requests').list()));
router.post('/family-prayers', authenticateToken, async (req, res) => {
    const { family_name, request } = req.body;
    const r = (await db.query('INSERT INTO family_prayer_requests (member_id, family_name, request) VALUES (?, ?, ?)', [req.user.id, family_name || '', request]))[0];
    res.json({ id: r.insertId });
});
router.get('/family-devotionals', authenticateToken, async (req, res) => res.json(await crud('family_devotional_plans').list()));
router.post('/family-devotionals', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content, duration_days, language } = req.body;
    const r = (await db.query('INSERT INTO family_devotional_plans (title, content, duration_days, language) VALUES (?, ?, ?, ?)', [title, content, duration_days || 7, language || 'en']))[0];
    res.json({ id: r.insertId });
});

router.get('/youth-corner', authenticateToken, async (req, res) => res.json(await crud('youth_corner').list()));
router.post('/youth-corner', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content, category, language } = req.body;
    const r = (await db.query('INSERT INTO youth_corner (title, content, category, language) VALUES (?, ?, ?, ?)', [title, content, category || 'Youth', language || 'en']))[0];
    res.json({ id: r.insertId });
});
router.get('/parenting', authenticateToken, async (req, res) => res.json(await crud('parenting_resources').list()));
router.post('/parenting', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content, category, language } = req.body;
    const r = (await db.query('INSERT INTO parenting_resources (title, content, category, language) VALUES (?, ?, ?, ?)', [title, content, category || 'Parenting', language || 'en']))[0];
    res.json({ id: r.insertId });
});

// ─── Community ─────────────────────────────────────────
router.get('/directory', authenticateToken, async (req, res) => {
    res.json((await db.query(`SELECT id, name, bio, birthday, created_at FROM members WHERE profile_visible = 1 AND status = 'approved' ORDER BY name`, []))[0]);
});
router.patch('/members/:id/profile', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) return res.status(403).json({ error: 'Forbidden.' });
    const { bio, birthday, email, profile_visible } = req.body;
    (await db.query('UPDATE members SET bio = COALESCE(?, bio), birthday = COALESCE(?, birthday), email = COALESCE(?, email), profile_visible = COALESCE(?, profile_visible) WHERE id = ?', [bio, birthday, email, profile_visible, req.params.id]))[0];
    res.json({ message: 'Profile updated.' });
});
router.patch('/members/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    (await db.query("UPDATE members SET status = 'approved' WHERE id = ?", [req.params.id]))[0];
    res.json({ message: 'Member approved.' });
});
router.patch('/members/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { name, phone, email, status } = req.body;
    (await db.query('UPDATE members SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email), status = COALESCE(?, status) WHERE id = ?', [name, phone, email, status, req.params.id]))[0];
    res.json({ message: 'Member updated.' });
});
router.post('/members', authenticateToken, requireAdmin, async (req, res) => {
    const bcrypt = require('bcryptjs');
    const { name, phone, password, email } = req.body;
    const hash = bcrypt.hashSync(password || 'password123', 10);
    const r = (await db.query('INSERT INTO members (name, phone, password_hash, email, status) VALUES (?, ?, ?, ?, ?)', [name, phone, hash, email || '', 'approved']))[0];
    res.json({ id: r.insertId, message: 'Member added.' });
});
router.get('/ministry-groups', authenticateToken, async (req, res) => {
    const groups = await crud('ministry_groups').list();
    res.json(await Promise.all(groups.map(async g => ({ ...g, member_count: (await db.query('SELECT COUNT(*) as c FROM ministry_members WHERE group_id = ?', [g.id]))[0][0].c }))));
});
router.post('/ministry-groups', authenticateToken, requireAdmin, async (req, res) => {
    const { name, description, leader_name } = req.body;
    const r = (await db.query('INSERT INTO ministry_groups (name, description, leader_name) VALUES (?, ?, ?)', [name, description || '', leader_name || '']))[0];
    res.json({ id: r.insertId });
});
router.post('/ministry-groups/:id/join', authenticateToken, async (req, res) => {
    (await db.query('INSERT IGNORE INTO ministry_members (group_id, member_id) VALUES (?, ?)', [req.params.id, req.user.id]))[0];
    res.json({ message: 'Joined ministry group!' });
});
router.get('/volunteers', authenticateToken, async (req, res) => {
    const opps = await crud('volunteer_opportunities').list();
    res.json(await Promise.all(opps.map(async o => ({ ...o, signed_up: (await db.query('SELECT COUNT(*) as c FROM volunteer_signups WHERE opportunity_id = ?', [o.id]))[0][0].c }))));
});
router.post('/volunteers', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, event_id, slots } = req.body;
    const r = (await db.query('INSERT INTO volunteer_opportunities (title, description, event_id, slots) VALUES (?, ?, ?, ?)', [title, description || '', event_id || null, slots || 10]))[0];
    res.json({ id: r.insertId });
});
router.post('/volunteers/:id/signup', authenticateToken, async (req, res) => {
    (await db.query('INSERT IGNORE INTO volunteer_signups (opportunity_id, member_id) VALUES (?, ?)', [req.params.id, req.user.id]))[0];
    res.json({ message: 'Signed up to volunteer!' });
});
router.get('/birthdays', authenticateToken, async (req, res) => {
    const members = (await db.query("SELECT id, name, birthday FROM members WHERE birthday IS NOT NULL AND birthday != '' AND status = 'approved'", []))[0];
    res.json(members);
});
router.get('/birthday-wishes', authenticateToken, async (req, res) => res.json(await crud('birthday_wishes').list()));
router.post('/birthday-wishes', authenticateToken, async (req, res) => {
    const { to_member_id, to_name, message } = req.body;
    const r = (await db.query('INSERT INTO birthday_wishes (from_member_id, from_name, to_member_id, to_name, message) VALUES (?, ?, ?, ?, ?)', [req.user.id, req.user.name, to_member_id, to_name, message]))[0];
    res.json({ id: r.insertId });
});
router.get('/chats', authenticateToken, async (req, res) => res.json(await crud('group_chats').list()));
router.get('/chats/:id/messages', authenticateToken, async (req, res) => {
    res.json((await db.query('SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT 100', [req.params.id]))[0]);
});
router.post('/chats/:id/messages', authenticateToken, async (req, res) => {
    const { message } = req.body;
    const r = (await db.query('INSERT INTO chat_messages (chat_id, member_id, member_name, message) VALUES (?, ?, ?, ?)', [req.params.id, req.user.id, req.user.name, message]))[0];
    res.json({ id: r.insertId });
});
router.post('/chats', authenticateToken, requireAdmin, async (req, res) => {
    const { name, chat_type } = req.body;
    const r = (await db.query('INSERT INTO group_chats (name, chat_type) VALUES (?, ?)', [name, chat_type || 'general']))[0];
    res.json({ id: r.insertId });
});

// ─── Communication ─────────────────────────────────────
router.get('/newsletters', authenticateToken, async (req, res) => res.json(await crud('newsletters').list()));
router.post('/newsletters', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    const r = (await db.query('INSERT INTO newsletters (title, content, added_by) VALUES (?, ?, ?)', [title, content, req.user.name]))[0];
    res.json({ id: r.insertId });
});
router.get('/notifications/:memberId', authenticateToken, async (req, res) => {
    res.json((await db.query('SELECT * FROM notifications WHERE member_id = ? OR member_id IS NULL ORDER BY created_at DESC LIMIT 50', [req.params.memberId]))[0]);
});
router.post('/notifications', authenticateToken, requireAdmin, async (req, res) => {
    const { title, message, member_id } = req.body;
    if (member_id) {
        (await db.query('INSERT INTO notifications (member_id, title, message) VALUES (?, ?, ?)', [member_id, title, message]))[0];
    } else {
        const members = (await db.query("SELECT id FROM members WHERE status = 'approved'", []))[0];
        await Promise.all(members.map(m => db.query('INSERT INTO notifications (member_id, title, message) VALUES (?, ?, ?)', [m.id, title, message])));
    }
    res.json({ message: 'Notification sent.' });
});
router.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
    (await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]))[0];
    res.json({ message: 'Marked read.' });
});
router.get('/scheduled-posts', authenticateToken, requireAdmin, async (req, res) => res.json(await crud('scheduled_posts').list()));
router.post('/scheduled-posts', authenticateToken, requireAdmin, async (req, res) => {
    const { content_type, title, content, publish_at } = req.body;
    const r = (await db.query('INSERT INTO scheduled_posts (content_type, title, content, publish_at, added_by) VALUES (?, ?, ?, ?, ?)', [content_type, title, content, publish_at, req.user.name]))[0];
    res.json({ id: r.insertId });
});

// ─── Challenges & AI ───────────────────────────────────
router.get('/challenges', authenticateToken, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    res.json((await db.query('SELECT * FROM daily_challenges WHERE challenge_date = ? OR challenge_date IS NULL ORDER BY id', [today]))[0]);
});
router.post('/challenges', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, challenge_date, category } = req.body;
    const r = (await db.query('INSERT INTO daily_challenges (title, description, challenge_date, category) VALUES (?, ?, ?, ?)', [title, description, challenge_date || new Date().toISOString().split('T')[0], category || 'Faith']))[0];
    res.json({ id: r.insertId });
});
router.post('/challenges/:id/complete', authenticateToken, async (req, res) => {
    (await db.query('INSERT IGNORE INTO member_challenges (member_id, challenge_id) VALUES (?, ?)', [req.user.id, req.params.id]))[0];
    res.json({ message: 'Challenge completed! 🎉' });
});
router.get('/challenges/completed/:memberId', authenticateToken, async (req, res) => {
    res.json((await db.query(`
        SELECT mc.*, dc.title, dc.category FROM member_challenges mc
        JOIN daily_challenges dc ON dc.id = mc.challenge_id WHERE mc.member_id = ?
    `, [req.params.memberId]))[0]);
});

const BIBLE_ANSWERS = {
    love: 'God is love (1 John 4:8). His greatest commandment is to love God and love your neighbor (Matthew 22:37-39).',
    faith: 'Faith is confidence in what we hope for and assurance about what we do not see (Hebrews 11:1). Without faith it is impossible to please God (Hebrews 11:6).',
    prayer: 'Pray continually (1 Thessalonians 5:17). The prayer of a righteous person is powerful and effective (James 5:16). Jesus taught us to pray the Lord\'s Prayer in Matthew 6:9-13.',
    forgiveness: 'Forgive as the Lord forgave you (Colossians 3:13). If you forgive others, your heavenly Father will forgive you (Matthew 6:14).',
    salvation: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life (John 3:16).',
    jesus: 'Jesus said "I am the way, the truth, and the life. No one comes to the Father except through me" (John 14:6).',
    peace: 'The peace of God, which transcends all understanding, will guard your hearts and minds in Christ Jesus (Philippians 4:7).',
    hope: 'May the God of hope fill you with all joy and peace as you trust in him (Romans 15:13).',
    default: 'The Bible says: "Your word is a lamp for my feet, a light on my path" (Psalm 119:105). I encourage you to read God\'s Word daily and pray for understanding. For deeper study, speak with your pastor.'
};

router.post('/ai-chat', authenticateToken, async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required.' });
    const q = question.toLowerCase();
    let answer = BIBLE_ANSWERS.default;
    for (const [key, val] of Object.entries(BIBLE_ANSWERS)) {
        if (key !== 'default' && q.includes(key)) { answer = val; break; }
    }
    const verse = (await db.query('SELECT verse, reference FROM bible_verses ORDER BY RAND() LIMIT 1', []))[0][0];
    if (verse) answer += `\n\n📖 Related verse: "${verse.verse}" — ${verse.reference}`;
    (await db.query('INSERT INTO ai_chat_log (member_id, question, answer) VALUES (?, ?, ?)', [req.user.id, question, answer]))[0];
    res.json({ answer });
});

// ─── Family Connections ─────────────────────────────────────
router.post('/family/create', authenticateToken, async (req, res) => {
    const crypto = require('crypto');
    const { family_name } = req.body;
    const qr_code_id = crypto.randomUUID();
    const r = (await db.query('INSERT INTO family_connections (qr_code_id, family_name) VALUES (?, ?)', [qr_code_id, family_name]))[0];
    (await db.query('INSERT INTO family_members (family_id, member_id) VALUES (?, ?)', [r.insertId, req.user.id]))[0];
    res.json({ id: r.insertId, qr_code_id, message: 'Family group created.' });
});
router.post('/family/join', authenticateToken, async (req, res) => {
    const { qr_code_id } = req.body;
    if (!qr_code_id) return res.status(400).json({ error: 'QR Code is required.' });
    
    const cleanCode = qr_code_id.trim();
    const family = (await db.query('SELECT id FROM family_connections WHERE qr_code_id = ?', [cleanCode]))[0][0];
    
    if (!family) return res.status(404).json({ error: 'Invalid QR code or Invite code.' });
    (await db.query('INSERT IGNORE INTO family_members (family_id, member_id) VALUES (?, ?)', [family.id, req.user.id]))[0];
    res.json({ message: 'Joined family group successfully.' });
});
router.get('/family/my', authenticateToken, async (req, res) => {
    const families = (await db.query(`SELECT f.* FROM family_connections f JOIN family_members fm ON f.id = fm.family_id WHERE fm.member_id = ?`, [req.user.id]))[0];
    res.json(families);
});
router.delete('/family/:id/leave', authenticateToken, async (req, res) => {
    const { id } = req.params;
    (await db.query('DELETE FROM family_members WHERE family_id = ? AND member_id = ?', [id, req.user.id]))[0];
    // If no members left, we could optionally delete the family:
    const count = (await db.query('SELECT COUNT(*) as c FROM family_members WHERE family_id = ?', [id]))[0][0];
    if (count.c === 0) {
        (await db.query('DELETE FROM family_posts WHERE family_id = ?', [id]))[0];
        (await db.query('DELETE FROM family_candles WHERE family_id = ?', [id]))[0];
        (await db.query('DELETE FROM family_connections WHERE id = ?', [id]))[0];
    }
    res.json({ message: 'Left family group successfully.' });
});
router.get('/family/all', authenticateToken, requireAdmin, async (req, res) => {
    const families = (await db.query('SELECT * FROM family_connections ORDER BY created_at DESC', []))[0];
    res.json(families);
});
router.post('/family/:id/message', authenticateToken, requireAdmin, async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });
    
    const members = (await db.query('SELECT member_id FROM family_members WHERE family_id = ?', [req.params.id]))[0];
    const family = (await db.query('SELECT family_name FROM family_connections WHERE id = ?', [req.params.id]))[0][0];
    
    if (members.length === 0) return res.status(400).json({ error: 'No members in this family group.' });
    
    await Promise.all(members.map(m => db.query('INSERT INTO notifications (member_id, title, message) VALUES (?, ?, ?)', [m.member_id, `Message to ${family.family_name}`, message])));
    
    res.json({ message: 'Message sent to family members.' });
});

// ─── Youth Connections ──────────────────────────────────────
router.post('/youth/create', authenticateToken, requireAdmin, async (req, res) => {
    const crypto = require('crypto');
    const { group_name } = req.body;
    const qr_code_id = crypto.randomUUID().substring(0, 8).toUpperCase();
    const r = (await db.query('INSERT INTO youth_connections (qr_code_id, group_name) VALUES (?, ?)', [qr_code_id, group_name]))[0];
    res.json({ id: r.insertId, qr_code_id, message: 'Youth group created.' });
});
router.post('/youth/join', authenticateToken, async (req, res) => {
    const { qr_code_id } = req.body;
    const group = (await db.query('SELECT id FROM youth_connections WHERE qr_code_id = ?', [qr_code_id]))[0][0];
    if (!group) return res.status(404).json({ error: 'Invalid invite code.' });
    
    const existing = (await db.query('SELECT id, status FROM youth_members WHERE youth_group_id = ? AND member_id = ?', [group.id, req.user.id]))[0][0];
    if (existing) {
        if (existing.status === 'pending') {
            return res.status(400).json({ error: 'You have already requested to join this group. Awaiting admin approval.' });
        } else if (existing.status === 'approved') {
            return res.status(400).json({ error: 'You are already a member of this group.' });
        }
    }
    
    (await db.query("INSERT INTO youth_members (youth_group_id, member_id, status) VALUES (?, ?, 'pending')", [group.id, req.user.id]))[0];
    res.json({ message: 'Request sent. Waiting for admin approval.' });
});
router.get('/youth/my-status', authenticateToken, async (req, res) => {
    const membership = (await db.query(`
        SELECT ym.id, ym.status, yc.group_name
        FROM youth_members ym
        JOIN youth_connections yc ON ym.youth_group_id = yc.id
        WHERE ym.member_id = ?
    `, [req.user.id]))[0][0];
    res.json(membership || null);
});
router.get('/youth/pending', authenticateToken, requireAdmin, async (req, res) => {
    const list = (await db.query(`
        SELECT ym.id as youth_member_id, ym.joined_at, m.name as member_name, m.phone as member_phone, yc.group_name
        FROM youth_members ym
        JOIN members m ON ym.member_id = m.id
        JOIN youth_connections yc ON ym.youth_group_id = yc.id
        WHERE ym.status = 'pending'
        ORDER BY ym.joined_at DESC
    `, []))[0];
    res.json(list);
});
router.post('/youth/approve', authenticateToken, requireAdmin, async (req, res) => {
    const { youth_member_id } = req.body;
    if (!youth_member_id) return res.status(400).json({ error: 'youth_member_id required.' });
    (await db.query("UPDATE youth_members SET status = 'approved' WHERE id = ?", [youth_member_id]))[0];
    res.json({ message: 'Member request approved successfully.' });
});
router.get('/youth/groups', authenticateToken, requireAdmin, async (req, res) => {
    const groups = (await db.query('SELECT * FROM youth_connections ORDER BY created_at DESC', []))[0];
    res.json(groups);
});
router.get('/youth/announcements', authenticateToken, async (req, res) => {
    res.json(await crud('youth_announcements').list());
});
router.post('/youth/announcements', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    (await db.query('INSERT INTO youth_announcements (title, content) VALUES (?, ?)', [title, content]))[0];
    res.json({ message: 'Announcement posted.' });
});

// ─── Admin Stats ────────────────────────────────────────────────────────────────────────────────────
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    const stats = {
        members: (await db.query("SELECT COUNT(*) as c FROM members WHERE status = 'approved'", []))[0][0].c,
        pending_members: (await db.query("SELECT COUNT(*) as c FROM members WHERE status = 'pending'", []))[0][0].c,
        prayer_requests: (await db.query('SELECT COUNT(*) as c FROM prayer_requests', []))[0][0].c,
        answered_prayers: (await db.query('SELECT COUNT(*) as c FROM prayer_requests WHERE is_answered = 1', []))[0][0].c,
        events: (await db.query('SELECT COUNT(*) as c FROM events', []))[0][0].c,
        courses: (await db.query('SELECT COUNT(*) as c FROM courses', []))[0][0].c,
        volunteers: (await db.query('SELECT COUNT(*) as c FROM volunteer_signups', []))[0][0].c,
    };
    res.json(stats);
});

// ─── Tamil content filter helper ───────────────────────
router.get('/tamil/devotionals', authenticateToken, async (req, res) => {
    res.json((await db.query("SELECT * FROM devotionals WHERE title_tamil IS NOT NULL OR category LIKE '%Tamil%' ORDER BY created_at DESC", []))[0]);
});

// ─── Prayer Requests ──────────────────────────────────────────
router.post('/prayer/create', authenticateToken, async (req, res) => {
    const { request_text, is_public } = req.body;
    if (!request_text) return res.status(400).json({ error: 'Prayer request cannot be empty.' });
    
    const result = (await db.query('INSERT INTO prayer_requests (member_id, request_text, is_public) VALUES (?, ?, ?)', [req.user.id, request_text, is_public ? 1 : 0]))[0];
    res.json({ message: 'Prayer request submitted successfully.', id: result.insertId });
});

router.get('/prayer/public', authenticateToken, async (req, res) => {
    const prayers = (await db.query(`
        SELECT p.*, m.name as member_name 
        FROM prayer_requests p 
        JOIN members m ON p.member_id = m.id 
        WHERE p.is_public = 1 
        ORDER BY p.created_at DESC
    `, []))[0];
    res.json(prayers);
});

router.get('/prayer/my', authenticateToken, async (req, res) => {
    const prayers = (await db.query('SELECT * FROM prayer_requests WHERE member_id = ? ORDER BY created_at DESC', [req.user.id]))[0];
    res.json(prayers);
});

router.get('/prayer/all', authenticateToken, requireAdmin, async (req, res) => {
    const prayers = (await db.query(`
        SELECT p.*, m.name as member_name, m.phone as member_phone 
        FROM prayer_requests p 
        JOIN members m ON p.member_id = m.id 
        ORDER BY p.created_at DESC
    `, []))[0];
    res.json(prayers);
});

router.post('/prayer/:id/reply', authenticateToken, requireAdmin, async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Reply message cannot be empty.' });
    
    const prayer = (await db.query('SELECT * FROM prayer_requests WHERE id = ?', [req.params.id]))[0][0];
    if (!prayer) return res.status(404).json({ error: 'Prayer request not found.' });

    // Update prayer status
    (await db.query("UPDATE prayer_requests SET status = 'answered' WHERE id = ?", [req.params.id]))[0];
    
    // Send in-app notification to the member
    await db.query('INSERT INTO notifications (member_id, title, message) VALUES (?, ?, ?)', [prayer.member_id, 'Father replied to your prayer request', message]);
    
    res.json({ message: 'Reply sent successfully.' });
});

router.get('/youth/all', authenticateToken, requireAdmin, async (req, res) => {
    res.json((await db.query('SELECT * FROM youth_connections ORDER BY created_at DESC', []))[0]);
});

router.get('/youth/my', authenticateToken, async (req, res) => {
    const groups = (await db.query(`
        SELECT y.*, ym.status, ym.joined_at 
        FROM youth_connections y 
        JOIN youth_members ym ON y.id = ym.youth_group_id 
        WHERE ym.member_id = ?
    `, [req.user.id]))[0];
    res.json(groups);
});

router.get('/youth/:id/posts', authenticateToken, async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
        const check = (await db.query('SELECT 1 FROM youth_members WHERE youth_group_id = ? AND member_id = ?', [req.params.id, req.user.id]))[0][0];
        if (!check) return res.status(403).json({ error: 'Not a member of this youth group.' });
    }
    const posts = (await db.query(`
        SELECT p.*, 'Admin' as member_name 
        FROM youth_posts p 
        WHERE p.youth_group_id = ? 
        ORDER BY p.created_at DESC
    `, [req.params.id]))[0];
    res.json(posts);
});

router.post('/youth/:id/post', authenticateToken, requireAdmin, upload.single('media'), async (req, res) => {
    const { content } = req.body;
    let media_url = null;
    let media_type = null;
    if (req.file) {
        media_url = `/uploads/${req.file.filename}`;
        media_type = req.file.mimetype.startsWith('video') ? 'video' : req.file.mimetype.startsWith('audio') ? 'audio' : 'image';
    }
    (await db.query('INSERT INTO youth_posts (youth_group_id, content, media_url, media_type) VALUES (?, ?, ?, ?)', [req.params.id, content || '', media_url, media_type]))[0];
    res.json({ message: 'Message sent to youth group.' });
});

// ─── Family Groups Sharing & Gamification ────────────────────────

// Get posts for a family
router.get('/family/:id/posts', authenticateToken, async (req, res) => {
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
        const check = (await db.query('SELECT 1 FROM family_members WHERE family_id = ? AND member_id = ?', [req.params.id, req.user.id]))[0][0];
        if (!check) return res.status(403).json({ error: 'Not a member of this family.' });
    }

    const posts = (await db.query(`
        SELECT p.*, COALESCE(m.name, 'Admin') as member_name 
        FROM family_posts p 
        LEFT JOIN members m ON p.member_id = m.id 
        WHERE p.family_id = ? 
        ORDER BY p.created_at DESC
    `, [req.params.id]))[0];
    res.json(posts);
});

// Delete a post in a family (Admin moderation)
router.delete('/family/posts/:postId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM family_posts WHERE id = ?', [req.params.postId]);
        res.json({ message: 'Family post deleted by admin.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a post in a family
router.post('/family/:id/post', authenticateToken, upload.single('media'), async (req, res) => {
    const { content } = req.body;
    let media_url = null;
    let media_type = 'note';
    if (req.file) {
        media_url = `/uploads/${req.file.filename}`;
        media_type = req.file.mimetype.startsWith('video') ? 'video' : req.file.mimetype.startsWith('audio') ? 'audio' : 'image';
    }
    
    const check = (await db.query('SELECT 1 FROM family_members WHERE family_id = ? AND member_id = ?', [req.params.id, req.user.id]))[0][0];
    if (!check) return res.status(403).json({ error: 'Not a member of this family.' });

    (await db.query('INSERT INTO family_posts (family_id, member_id, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)', [req.params.id, req.user.id, content || '', media_url, media_type]))[0];
    res.json({ message: 'Posted successfully' });
});

// Get family candle status
router.get('/family/:id/candle', authenticateToken, async (req, res) => {
    // Ensure candle record exists
    const check = (await db.query('SELECT * FROM family_candles WHERE family_id = ?', [req.params.id]))[0][0];
    if (!check) {
        (await db.query('INSERT INTO family_candles (family_id) VALUES (?)', [req.params.id]))[0];
    }
    
    const candle = (await db.query('SELECT * FROM family_candles WHERE family_id = ?', [req.params.id]))[0][0];
    
    // Get this week's history (last 7 days)
    const history = (await db.query(`
        SELECT date_string, minutes_prayed, candles_earned 
        FROM family_candle_history 
        WHERE family_id = ? 
        ORDER BY date_string DESC LIMIT 7
    `, [req.params.id]))[0];

    res.json({ stats: candle, history });
});

// Burn candle (add minutes)
router.post('/family/:id/candle/burn', authenticateToken, async (req, res) => {
    const { minutes } = req.body; // e.g., 5, 10, 30
    if (!minutes || minutes <= 0) return res.status(400).json({ error: 'Invalid minutes' });

    const familyId = req.params.id;
    const today = new Date().toISOString().split('T')[0];

    // Ensure records exist
    (await db.query('INSERT IGNORE INTO family_candles (family_id) VALUES (?)', [familyId]))[0];
    (await db.query('INSERT IGNORE INTO family_candle_history (family_id, date_string) VALUES (?, ?)', [familyId, today]))[0];

    // Get current state
    const candle = (await db.query('SELECT * FROM family_candles WHERE family_id = ?', [familyId]))[0][0];
    
    // Streak logic
    let streak = candle.family_streak;
    if (candle.last_prayer_date) {
        const lastDate = new Date(candle.last_prayer_date);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak += 1;
        else if (diffDays > 1) streak = 1; // reset
    } else {
        streak = 1; // first time
    }

    // Calculate new candle minutes (30 mins = 1 candle)
    let newCurrentMinutes = candle.current_candle_minutes + minutes;
    let earnedCandles = 0;
    
    while (newCurrentMinutes >= 30) {
        earnedCandles += 1;
        newCurrentMinutes -= 30;
    }

    const totalHours = (candle.prayer_hours || 0) + (minutes / 60.0);
    const totalCompleted = candle.candles_completed + earnedCandles;

    // Update family_candles
    (await db.query(`
        UPDATE family_candles 
        SET candles_completed = ?, prayer_hours = ?, family_streak = ?, current_candle_minutes = ?, last_prayer_date = ?
        WHERE family_id = ?
    `, [totalCompleted, totalHours, streak, newCurrentMinutes, today, familyId]))[0];

    // Update today's history
    const todayHistory = (await db.query('SELECT * FROM family_candle_history WHERE family_id = ? AND date_string = ?', [familyId, today]))[0][0];
    (await db.query(`
        UPDATE family_candle_history 
        SET minutes_prayed = minutes_prayed + ?, candles_earned = candles_earned + ?
        WHERE family_id = ? AND date_string = ?
    `, [minutes, earnedCandles, familyId, today]))[0];

    res.json({ 
        message: 'Candle updated', 
        candles_earned: earnedCandles,
        current_candle_minutes: newCurrentMinutes,
        streak
    });
});

// Admin global family report
router.get('/family/report/candles', authenticateToken, requireAdmin, async (req, res) => {
    const report = (await db.query(`
        SELECT c.family_id, c.candles_completed, c.prayer_hours, c.family_streak, f.family_name 
        FROM family_candles c
        JOIN family_connections f ON c.family_id = f.id
        ORDER BY c.candles_completed DESC, c.prayer_hours DESC
    `, []))[0];
    res.json(report);
});
// Analytics and Tracking
router.get('/admin/analytics', authenticateToken, async (req, res) => {
    try {
        const [likes] = await db.query(`
            SELECT l.*, m.name as member_name 
            FROM likes l 
            JOIN members m ON l.member_id = m.id 
            ORDER BY l.created_at DESC LIMIT 50
        `);
        const [views] = await db.query(`
            SELECT v.*, m.name as member_name 
            FROM views v 
            JOIN members m ON v.member_id = m.id 
            ORDER BY v.viewed_at DESC LIMIT 50
        `);
        res.json({ likes, views });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/event-galleries/media/:id/view', authenticateToken, async (req, res) => {
    try {
        await db.query('INSERT IGNORE INTO views (member_id, media_type, media_id) VALUES (?, ?, ?)', 
            [req.user.id, 'event_gallery', req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/event-galleries/media/:id/like', authenticateToken, async (req, res) => {
    try {
        await db.query('INSERT IGNORE INTO likes (member_id, media_type, media_id) VALUES (?, ?, ?)', 
            [req.user.id, 'event_gallery', req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
