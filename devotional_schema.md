# SQLite Schemas in devotional.db

## Table: `admins`
```sql
CREATE TABLE admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
```

## Table: `ai_chat_log`
```sql
CREATE TABLE ai_chat_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `announcements`
```sql
CREATE TABLE announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT DEFAULT 'General',
            is_emergency INTEGER DEFAULT 0,
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        , title_tamil TEXT, content_tamil TEXT)
```

## Table: `articles`
```sql
CREATE TABLE articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author TEXT,
            category TEXT DEFAULT 'Faith',
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `audio`
```sql
CREATE TABLE audio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            pastor TEXT,
            description TEXT,
            filename TEXT,
            uploaded_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `bible_verses`
```sql
CREATE TABLE bible_verses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            verse TEXT NOT NULL,
            reference TEXT NOT NULL,
            verse_tamil TEXT,
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `birthday_wishes`
```sql
CREATE TABLE birthday_wishes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_member_id INTEGER,
            from_name TEXT,
            to_member_id INTEGER,
            to_name TEXT,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `certificates`
```sql
CREATE TABLE certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            cert_code TEXT UNIQUE,
            issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `chat_messages`
```sql
CREATE TABLE chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            member_id INTEGER,
            member_name TEXT,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `children_stories`
```sql
CREATE TABLE children_stories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            age_group TEXT DEFAULT 'All',
            language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `choir_materials`
```sql
CREATE TABLE choir_materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            filename TEXT,
            url TEXT,
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `church_bulletins`
```sql
CREATE TABLE church_bulletins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            week_date TEXT,
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `comments`
```sql
CREATE TABLE comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            media_type TEXT NOT NULL,
            media_id INTEGER NOT NULL,
            comment_text TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `course_lessons`
```sql
CREATE TABLE course_lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            order_num INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            video_url TEXT,
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
```

## Table: `courses`
```sql
CREATE TABLE courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT DEFAULT 'Bible',
            language TEXT DEFAULT 'en',
            lesson_count INTEGER DEFAULT 0,
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `daily_challenges`
```sql
CREATE TABLE daily_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            challenge_date TEXT,
            category TEXT DEFAULT 'Faith',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `devotionals`
```sql
CREATE TABLE devotionals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            scripture TEXT,
            scripture_reference TEXT,
            prayer TEXT,
            author TEXT,
            category TEXT DEFAULT 'General',
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        , content_tamil TEXT, title_tamil TEXT)
```

## Table: `event_galleries`
```sql
CREATE TABLE event_galleries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            event_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `event_media`
```sql
CREATE TABLE event_media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gallery_id INTEGER NOT NULL,
            media_type TEXT,
            filename TEXT,
            url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (gallery_id) REFERENCES event_galleries(id)
        )
```

## Table: `event_registrations`
```sql
CREATE TABLE event_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(event_id, member_id)
        )
```

## Table: `events`
```sql
CREATE TABLE events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            event_date TEXT NOT NULL,
            event_time TEXT,
            location TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `faith_journals`
```sql
CREATE TABLE faith_journals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            title TEXT,
            content TEXT NOT NULL,
            mood TEXT DEFAULT 'Grateful',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `family_candle_history`
```sql
CREATE TABLE family_candle_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            family_id INTEGER NOT NULL,
            date_string TEXT NOT NULL, -- e.g. '2026-06-17'
            minutes_prayed INTEGER DEFAULT 0,
            candles_earned INTEGER DEFAULT 0,
            FOREIGN KEY(family_id) REFERENCES family_connections(id)
        )
```

## Table: `family_candles`
```sql
CREATE TABLE family_candles (
            family_id INTEGER PRIMARY KEY,
            candles_completed INTEGER DEFAULT 0,
            prayer_hours REAL DEFAULT 0.0,
            family_streak INTEGER DEFAULT 0,
            current_candle_minutes INTEGER DEFAULT 0,
            last_prayer_date TEXT,
            FOREIGN KEY(family_id) REFERENCES family_connections(id)
        )
```

## Table: `family_connections`
```sql
CREATE TABLE family_connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            qr_code_id TEXT UNIQUE NOT NULL,
            family_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `family_devotional_plans`
```sql
CREATE TABLE family_devotional_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            duration_days INTEGER DEFAULT 7,
            language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `family_media`
```sql
CREATE TABLE family_media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            family_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            media_type TEXT,
            url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (family_id) REFERENCES family_connections(id)
        )
```

## Table: `family_members`
```sql
CREATE TABLE family_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            family_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(family_id, member_id),
            FOREIGN KEY (family_id) REFERENCES family_connections(id)
        )
```

## Table: `family_posts`
```sql
CREATE TABLE family_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            family_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            content TEXT,
            media_url TEXT,
            media_type TEXT, -- 'image', 'video', 'audio', 'note'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(family_id) REFERENCES family_connections(id),
            FOREIGN KEY(member_id) REFERENCES members(id)
        )
```

## Table: `family_prayer_requests`
```sql
CREATE TABLE family_prayer_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            family_name TEXT,
            request TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `family_prayers`
```sql
CREATE TABLE family_prayers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            family_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            prayer TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (family_id) REFERENCES family_connections(id)
        )
```

## Table: `fasting_tracker`
```sql
CREATE TABLE fasting_tracker (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT,
            purpose TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `group_chats`
```sql
CREATE TABLE group_chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            chat_type TEXT DEFAULT 'general',
            ministry_group_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `likes`
```sql
CREATE TABLE likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            media_type TEXT NOT NULL,
            media_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(member_id, media_type, media_id)
        )
```

## Table: `media_comments`
```sql
CREATE TABLE media_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            media_type TEXT NOT NULL,
            media_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            member_name TEXT,
            comment_text TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `media_likes`
```sql
CREATE TABLE media_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            media_type TEXT NOT NULL,
            media_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(media_type, media_id, member_id)
        )
```

## Table: `media_views`
```sql
CREATE TABLE media_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            media_type TEXT NOT NULL,
            media_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(media_type, media_id, member_id)
        )
```

## Table: `member_challenges`
```sql
CREATE TABLE member_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            challenge_id INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(member_id, challenge_id)
        )
```

## Table: `member_course_progress`
```sql
CREATE TABLE member_course_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            completed_lessons INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            completed_at DATETIME,
            UNIQUE(member_id, course_id)
        )
```

## Table: `member_history`
```sql
CREATE TABLE member_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            action TEXT,
            content_type TEXT,
            content_id INTEGER,
            content_title TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members(id)
        )
```

## Table: `member_reading_progress`
```sql
CREATE TABLE member_reading_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            current_day INTEGER DEFAULT 1,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(member_id, plan_id)
        )
```

## Table: `member_streaks`
```sql
CREATE TABLE member_streaks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER UNIQUE NOT NULL,
            prayer_streak INTEGER DEFAULT 0,
            bible_streak INTEGER DEFAULT 0,
            devotional_streak INTEGER DEFAULT 0,
            last_prayer_date TEXT,
            last_bible_date TEXT,
            last_devotional_date TEXT
        )
```

## Table: `members`
```sql
CREATE TABLE members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        , email TEXT, birthday TEXT, bio TEXT, status TEXT DEFAULT 'approved', profile_visible INTEGER DEFAULT 1)
```

## Table: `ministry_groups`
```sql
CREATE TABLE ministry_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            leader_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `ministry_members`
```sql
CREATE TABLE ministry_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(group_id, member_id)
        )
```

## Table: `newsletters`
```sql
CREATE TABLE newsletters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            added_by TEXT
        )
```

## Table: `notifications`
```sql
CREATE TABLE notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `parenting_resources`
```sql
CREATE TABLE parenting_resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'Parenting',
            language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `podcasts`
```sql
CREATE TABLE podcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            pastor TEXT,
            description TEXT,
            filename TEXT,
            url TEXT,
            language TEXT DEFAULT 'en',
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `prayer_calendar`
```sql
CREATE TABLE prayer_calendar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            event_date TEXT NOT NULL,
            description TEXT,
            event_type TEXT DEFAULT 'Prayer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `prayer_group_members`
```sql
CREATE TABLE prayer_group_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(group_id, member_id)
        )
```

## Table: `prayer_groups`
```sql
CREATE TABLE prayer_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            leader_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `prayer_reminders`
```sql
CREATE TABLE prayer_reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            reminder_time TEXT NOT NULL,
            message TEXT,
            enabled INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `prayer_requests`
```sql
CREATE TABLE prayer_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            member_name TEXT,
            request TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            is_anonymous INTEGER DEFAULT 0,
            is_answered INTEGER DEFAULT 0,
            answered_testimony TEXT,
            is_emergency INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        , language TEXT DEFAULT 'en')
```

## Table: `quiz_questions`
```sql
CREATE TABLE quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            difficulty TEXT DEFAULT 'Medium',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `reading_plan_days`
```sql
CREATE TABLE reading_plan_days (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            day_num INTEGER NOT NULL,
            title TEXT,
            scripture TEXT,
            content TEXT,
            FOREIGN KEY (plan_id) REFERENCES reading_plans(id)
        )
```

## Table: `reading_plans`
```sql
CREATE TABLE reading_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            duration_days INTEGER NOT NULL,
            description TEXT,
            language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `scheduled_posts`
```sql
CREATE TABLE scheduled_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            publish_at DATETIME,
            published INTEGER DEFAULT 0,
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `scripture_memorization`
```sql
CREATE TABLE scripture_memorization (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            verse TEXT NOT NULL,
            reference TEXT NOT NULL,
            mastered INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `sermon_notes`
```sql
CREATE TABLE sermon_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            event_id INTEGER,
            filename TEXT,
            language TEXT DEFAULT 'en',
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `service_schedules`
```sql
CREATE TABLE service_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day_of_week TEXT NOT NULL,
            service_time TEXT NOT NULL,
            service_type TEXT DEFAULT 'Sunday Service',
            location TEXT,
            description TEXT,
            stream_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `song_requests`
```sql
CREATE TABLE song_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            member_name TEXT,
            song_title TEXT NOT NULL,
            occasion TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `sqlite_sequence`
```sql
CREATE TABLE sqlite_sequence(name,seq)
```

## Table: `testimonies`
```sql
CREATE TABLE testimonies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            member_name TEXT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            is_public INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `verse_of_day`
```sql
CREATE TABLE verse_of_day (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            verse_id INTEGER,
            display_date TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `videos`
```sql
CREATE TABLE videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT DEFAULT 'Sermon',
            filename TEXT,
            url TEXT,
            uploaded_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        , language TEXT DEFAULT 'en')
```

## Table: `volunteer_opportunities`
```sql
CREATE TABLE volunteer_opportunities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            event_id INTEGER,
            slots INTEGER DEFAULT 10,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `volunteer_signups`
```sql
CREATE TABLE volunteer_signups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            opportunity_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(opportunity_id, member_id)
        )
```

## Table: `worship_playlists`
```sql
CREATE TABLE worship_playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            song_ids TEXT,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `worship_songs`
```sql
CREATE TABLE worship_songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist TEXT,
            lyrics TEXT,
            category TEXT DEFAULT 'Worship',
            language TEXT DEFAULT 'English',
            added_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `youth_announcements`
```sql
CREATE TABLE youth_announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `youth_connections`
```sql
CREATE TABLE youth_connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            qr_code_id TEXT UNIQUE NOT NULL,
            group_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `youth_corner`
```sql
CREATE TABLE youth_corner (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'Youth',
            language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
```

## Table: `youth_members`
```sql
CREATE TABLE youth_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            youth_group_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP, status TEXT DEFAULT 'pending',
            UNIQUE(youth_group_id, member_id),
            FOREIGN KEY (youth_group_id) REFERENCES youth_connections(id)
        )
```

## Table: `youth_posts`
```sql
CREATE TABLE youth_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, youth_group_id INTEGER NOT NULL, content TEXT, media_url TEXT, media_type TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(youth_group_id) REFERENCES youth_connections(id))
```

