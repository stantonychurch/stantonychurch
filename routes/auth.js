const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// Church Member Register
router.post('/member/register', async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        if (!name || !phone || !password)
            return res.status(400).json({ error: 'Name, phone number, and password are required.' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });

        const exists = (await db.query('SELECT id FROM members WHERE phone = ?', [phone]))[0][0];
        if (exists)
            return res.status(400).json({ error: 'This phone number is already registered.' });

        const password_hash = bcrypt.hashSync(password, 10);
        const [result] = await db.query(
            'INSERT INTO members (name, phone, password_hash, status) VALUES (?, ?, ?, ?)',
            [name.trim(), phone.trim(), password_hash, 'approved']
        );

        const token = jwt.sign(
            { id: result.insertId, role: 'member', name: name.trim() },
            JWT_SECRET, { expiresIn: '7d' }
        );
        res.json({ token, name: name.trim(), id: result.insertId, role: 'member', message: 'Registration successful! Welcome to St Antony Church.' });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
});

// Church Member Login
router.post('/member/login', async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        if (!name || !phone || !password)
            return res.status(400).json({ error: 'All fields are required.' });

        const member = (await db.query('SELECT * FROM members WHERE phone = ? AND LOWER(name) = LOWER(?)', [phone.trim(), name.trim()]))[0][0];
        if (!member)
            return res.status(401).json({ error: 'No account found with this name and phone number.' });

        const valid = bcrypt.compareSync(password, member.password_hash);
        if (!valid)
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });

        const token = jwt.sign(
            { id: member.id, role: 'member', name: member.name },
            JWT_SECRET, { expiresIn: '7d' }
        );
        res.json({ token, name: member.name, id: member.id, role: 'member', message: `Welcome back, ${member.name}!` });
    } catch (err) {
        res.status(500).json({ error: 'Login failed: ' + err.message });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name || !password)
            return res.status(400).json({ error: 'Name and password are required.' });

        const admin = (await db.query('SELECT * FROM admins WHERE LOWER(name) = LOWER(?)', [name.trim()]))[0][0];
        if (!admin)
            return res.status(401).json({ error: 'Admin not found.' });

        const valid = bcrypt.compareSync(password, admin.password_hash);
        if (!valid)
            return res.status(401).json({ error: 'Incorrect password.' });

        const token = jwt.sign(
            { id: admin.id, role: 'admin', name: admin.name },
            JWT_SECRET, { expiresIn: '12h' }
        );
        res.json({ token, name: admin.name, id: admin.id, role: 'admin', message: `Welcome, Admin ${admin.name}!` });
    } catch (err) {
        res.status(500).json({ error: 'Login failed: ' + err.message });
    }
});

module.exports = router;
