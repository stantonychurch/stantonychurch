async function initExtendedSchema(db) {
    try {
        console.log('Initializing Extended Database Schema...');

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

        // --- NEW/VERIFIED MISSING TABLES IN EXTENDED SCHEMAS ---

        await db.query(`
            CREATE TABLE IF NOT EXISTS service_schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                day_of_week VARCHAR(50) NOT NULL,
                service_time VARCHAR(50) NOT NULL,
                service_type VARCHAR(100) DEFAULT 'Sunday Service',
                location VARCHAR(255),
                description TEXT,
                stream_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS family_prayer_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                family_name VARCHAR(255),
                request TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS ai_chat_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS birthday_wishes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                from_member_id INT,
                from_name VARCHAR(255),
                to_member_id INT,
                to_name VARCHAR(255),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS certificates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                course_id INT NOT NULL,
                cert_code VARCHAR(255) UNIQUE,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chat_id INT NOT NULL,
                member_id INT,
                member_name VARCHAR(255),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS children_stories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                video_url VARCHAR(255),
                media_type VARCHAR(50) DEFAULT 'text',
                age_group VARCHAR(100) DEFAULT 'All',
                language VARCHAR(50) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS children_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                child_name VARCHAR(255) NOT NULL,
                dob VARCHAR(50) NOT NULL,
                class VARCHAR(50) NOT NULL,
                student_phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS children_story_completions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                child_id INT NOT NULL,
                story_id INT NOT NULL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_completion (child_id, story_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS choir_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                filename VARCHAR(255),
                url VARCHAR(255),
                media_type VARCHAR(50) DEFAULT 'pdf',
                added_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS church_bulletins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                week_date VARCHAR(50),
                added_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100) DEFAULT 'Bible',
                language VARCHAR(50) DEFAULT 'en',
                lesson_count INT DEFAULT 0,
                added_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS course_lessons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                order_num INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                video_url VARCHAR(255)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS daily_challenges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                challenge_date VARCHAR(50),
                category VARCHAR(100) DEFAULT 'Faith',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS member_challenges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                challenge_id INT NOT NULL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_member_challenge (member_id, challenge_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS event_registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_id INT NOT NULL,
                member_id INT NOT NULL,
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_event_reg (event_id, member_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS family_devotional_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                duration_days INT DEFAULT 7,
                language VARCHAR(50) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS fasting_tracker (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                start_date VARCHAR(50) NOT NULL,
                end_date VARCHAR(50),
                purpose TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS group_chats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                chat_type VARCHAR(100) DEFAULT 'general',
                ministry_group_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS media_views (
                id INT AUTO_INCREMENT PRIMARY KEY,
                media_type VARCHAR(50) NOT NULL,
                media_id INT NOT NULL,
                member_id INT NOT NULL,
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_media_view (media_type, media_id, member_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS member_course_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                course_id INT NOT NULL,
                completed_lessons INT DEFAULT 0,
                completed INT DEFAULT 0,
                completed_at TIMESTAMP,
                UNIQUE KEY unique_course_prog (member_id, course_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS ministry_groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                leader_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS ministry_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT NOT NULL,
                member_id INT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_ministry_member (group_id, member_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS newsletters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                added_by VARCHAR(255)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS parenting_resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'Parenting',
                language VARCHAR(50) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS prayer_calendar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                event_date VARCHAR(50) NOT NULL,
                description TEXT,
                event_type VARCHAR(100) DEFAULT 'Prayer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS prayer_groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                leader_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS prayer_group_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT NOT NULL,
                member_id INT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_prayer_group_member (group_id, member_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS prayer_reminders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                reminder_time VARCHAR(50) NOT NULL,
                message TEXT,
                enabled TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS scheduled_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                content_type VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                publish_at TIMESTAMP,
                published TINYINT(1) DEFAULT 0,
                added_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS scripture_memorization (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT NOT NULL,
                verse TEXT NOT NULL,
                reference VARCHAR(255) NOT NULL,
                mastered TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS sermon_notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                event_id INT,
                filename VARCHAR(255),
                language VARCHAR(50) DEFAULT 'en',
                added_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS song_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                member_name VARCHAR(255),
                song_title VARCHAR(255) NOT NULL,
                occasion VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS testimonies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                member_id INT,
                member_name VARCHAR(255),
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                is_public TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS verse_of_day (
                id INT AUTO_INCREMENT PRIMARY KEY,
                verse_id INT,
                display_date VARCHAR(50) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS volunteer_opportunities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_id INT,
                slots INT DEFAULT 10,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS volunteer_signups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                opportunity_id INT NOT NULL,
                member_id INT NOT NULL,
                signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_volunteer_signup (opportunity_id, member_id)
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS worship_playlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                song_ids TEXT,
                created_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS youth_corner (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(100) DEFAULT 'Youth',
                language VARCHAR(50) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS youth_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                youth_group_id INT NOT NULL,
                content TEXT,
                media_url VARCHAR(255),
                media_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Extended schema initialized with all 38 tables.');
    } catch (e) {
        console.error('❌ Extended schema init error:', e);
    }
}

module.exports = { initExtendedSchema };
