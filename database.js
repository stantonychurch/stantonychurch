const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL 
  ? { uri: process.env.DATABASE_URL } 
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'christian_devotional'
  };

const db = mysql.createPool({
    ...poolConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined
});

async function initDatabase() {
    try {
        console.log('Connecting to MySQL Database...');
        
        // Basic Tables
        await db.query(`
            CREATE TABLE IF NOT EXISTS members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                language VARCHAR(10) DEFAULT 'en',
                status VARCHAR(20) DEFAULT 'approved',
                email VARCHAR(255),
                bio TEXT,
                birthday VARCHAR(50),
                profile_visible TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS videos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100) DEFAULT 'Sermon',
                filename VARCHAR(255),
                url VARCHAR(255),
                uploaded_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS audio (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                pastor VARCHAR(255),
                description TEXT,
                filename VARCHAR(255),
                uploaded_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                event_date VARCHAR(50) NOT NULL,
                event_time VARCHAR(50),
                location VARCHAR(255),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS bible_verses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                verse TEXT NOT NULL,
                reference VARCHAR(255) NOT NULL,
                verse_tamil TEXT,
                added_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS devotionals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                title_tamil VARCHAR(255),
                content_tamil TEXT,
                scripture TEXT,
                scripture_reference VARCHAR(255),
                prayer TEXT,
                author VARCHAR(100),
                category VARCHAR(100) DEFAULT 'General',
                added_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS prayer_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                member_name VARCHAR(255),
                request TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'General',
                is_anonymous BOOLEAN DEFAULT 0,
                is_answered BOOLEAN DEFAULT 0,
                answered_testimony TEXT,
                is_emergency BOOLEAN DEFAULT 0,
                request_text TEXT,
                is_public BOOLEAN DEFAULT 1,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                title_tamil TEXT,
                content_tamil TEXT,
                type VARCHAR(100) DEFAULT 'General',
                is_emergency BOOLEAN DEFAULT 0,
                added_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS faith_journals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                title VARCHAR(255),
                content TEXT NOT NULL,
                mood VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                media_type VARCHAR(50) NOT NULL,
                media_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_like (member_id, media_type, media_id)
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS views (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                media_type VARCHAR(50) NOT NULL,
                media_id INT NOT NULL,
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_view (member_id, media_type, media_id)
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                media_type VARCHAR(50) NOT NULL,
                media_id INT NOT NULL,
                comment_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS media_likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                media_id INT NOT NULL,
                member_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_media_like (media_id, member_id)
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS media_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                media_id INT NOT NULL,
                member_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS worship_songs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                artist VARCHAR(255),
                lyrics TEXT,
                category VARCHAR(100) DEFAULT 'Worship',
                language VARCHAR(50) DEFAULT 'English',
                added_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS quiz_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer VARCHAR(10) NOT NULL,
                category VARCHAR(100) DEFAULT 'General',
                difficulty VARCHAR(50) DEFAULT 'Medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS articles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                author VARCHAR(100),
                category VARCHAR(100) DEFAULT 'Faith',
                added_by VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS member_streaks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT UNIQUE NOT NULL,
                prayer_streak INT DEFAULT 0,
                bible_streak INT DEFAULT 0,
                devotional_streak INT DEFAULT 0,
                last_prayer_date VARCHAR(50),
                last_bible_date VARCHAR(50),
                last_devotional_date VARCHAR(50)
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS member_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                action VARCHAR(255),
                content_type VARCHAR(100),
                content_id INT,
                content_title VARCHAR(255),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS family_connections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                qr_code_id VARCHAR(100) UNIQUE NOT NULL,
                family_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS family_members (
                family_id INT NOT NULL,
                member_id INT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(family_id, member_id)
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS family_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                family_id INT NOT NULL,
                member_id INT NOT NULL,
                content TEXT,
                media_url VARCHAR(255),
                media_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS family_candles (
                family_id INT PRIMARY KEY,
                candles_completed INT DEFAULT 0,
                prayer_hours DECIMAL(10,2) DEFAULT 0.0,
                family_streak INT DEFAULT 0,
                current_candle_minutes INT DEFAULT 0,
                last_prayer_date VARCHAR(50)
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS family_candle_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                family_id INT NOT NULL,
                date_string VARCHAR(50) NOT NULL,
                minutes_prayed INT DEFAULT 0,
                candles_earned INT DEFAULT 0
            )
        `);

        // Seed default admin
        const [admins] = await db.query('SELECT id FROM admins LIMIT 1');
        if (admins.length === 0) {
            const hash = bcrypt.hashSync('admin123', 10);
            await db.query('INSERT INTO admins (name, password_hash) VALUES (?, ?)', ['admin', hash]);
            console.log('✅ Default admin seeded');
        }

        // Alter tables to safely add missing columns if they don't exist
        try {
            await db.query('ALTER TABLE members ADD COLUMN email VARCHAR(255)');
            console.log('✅ Added email column to members');
        } catch (err) {}
        try {
            await db.query('ALTER TABLE announcements ADD COLUMN title_tamil TEXT');
            console.log('✅ Added title_tamil column to announcements');
        } catch (err) {}
        try {
            await db.query('ALTER TABLE announcements ADD COLUMN content_tamil TEXT');
            console.log('✅ Added content_tamil column to announcements');
        } catch (err) {}
        try {
            await db.query('ALTER TABLE devotionals ADD COLUMN title_tamil VARCHAR(255)');
            console.log('✅ Added title_tamil column to devotionals');
        } catch (err) {}
        try {
            await db.query('ALTER TABLE devotionals ADD COLUMN content_tamil TEXT');
            console.log('✅ Added content_tamil column to devotionals');
        } catch (err) {}
        try {
            await db.query('ALTER TABLE devotionals ADD COLUMN prayer TEXT');
            console.log('✅ Added prayer column to devotionals');
        } catch (err) {}

        const { initExtendedSchema } = require('./database-ext');
        await initExtendedSchema(db);

        console.log('✅ MySQL Database initialized successfully');
    } catch (e) {
        console.error('❌ Database Initialization Error:', e);
    }
}

module.exports = { db, initDatabase };
