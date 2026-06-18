async function initExtendedSchema(db) {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS event_galleries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_date VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS event_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                gallery_id INT NOT NULL,
                media_type VARCHAR(50),
                filename VARCHAR(255),
                url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS family_prayers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                family_id INT NOT NULL,
                member_id INT NOT NULL,
                prayer TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS family_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                family_id INT NOT NULL,
                member_id INT NOT NULL,
                media_type VARCHAR(50),
                url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS youth_connections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                qr_code_id VARCHAR(100) UNIQUE NOT NULL,
                group_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS youth_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                youth_group_id INT NOT NULL,
                member_id INT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'pending',
                UNIQUE KEY unique_youth_member (youth_group_id, member_id)
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS youth_announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS reading_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                duration_days INT NOT NULL,
                description TEXT,
                language VARCHAR(50) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS reading_plan_days (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plan_id INT NOT NULL,
                day_num INT NOT NULL,
                title VARCHAR(255),
                scripture TEXT,
                content TEXT
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS member_reading_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                plan_id INT NOT NULL,
                current_day INT DEFAULT 1,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_plan_progress (member_id, plan_id)
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS podcasts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                url VARCHAR(255) NOT NULL,
                duration VARCHAR(50),
                published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS quiz_scores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                score INT NOT NULL,
                total INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS church_schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                day_of_week VARCHAR(50) NOT NULL,
                service_time VARCHAR(50) NOT NULL,
                description TEXT,
                language VARCHAR(50) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS giving_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                amount DECIMAL(10,2) NOT NULL,
                purpose VARCHAR(100),
                transaction_id VARCHAR(100),
                status VARCHAR(50) DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT 0,
                type VARCHAR(50) DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Extended schema initialized');
    } catch (e) {
        console.error('❌ Extended schema init error:', e);
    }
}

module.exports = { initExtendedSchema };
