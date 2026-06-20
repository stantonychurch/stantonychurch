async function initExtendedSchema(db) {
    try {
        console.log('Initializing Extended Database Schema...');

        // Drop removed tables for cleanup
        const dropTables = [
            'giving_records',
            'member_course_progress',
            'course_lessons',
            'courses',
            'certificates'
        ];
        for (const t of dropTables) {
            try {
                await db.query(`DROP TABLE IF EXISTS ${t}`);
                console.log(`Dropped table ${t} if it existed.`);
            } catch (err) {
                console.error(`Error dropping table ${t}:`, err);
            }
        }


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

        // giving_records table removed


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

        // certificates table removed


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

        // courses table removed


        // course_lessons table removed


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

        // member_course_progress table removed


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
            CREATE TABLE IF NOT EXISTS global_memorizations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                verse TEXT NOT NULL,
                reference VARCHAR(255) NOT NULL,
                added_by VARCHAR(255),
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
                instructions TEXT NULL,
                signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_volunteer_signup (opportunity_id, member_id)
            )
        `);

        try {
            await db.query('ALTER TABLE volunteer_signups ADD COLUMN instructions TEXT NULL');
            console.log('✅ Added instructions column to volunteer_signups');
        } catch (_) {}

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

        await db.query(`
            CREATE TABLE IF NOT EXISTS prayer_group_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT NOT NULL,
                member_id INT NOT NULL,
                member_name VARCHAR(255),
                content TEXT,
                media_url VARCHAR(255),
                media_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Church Info Table for dynamic settings (like About modal)
        await db.query(`
            CREATE TABLE IF NOT EXISTS church_info (
                info_key VARCHAR(100) PRIMARY KEY,
                info_value TEXT,
                info_value_tamil TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const englishHistory = `HISTORY\n\nIt is the gate-way to the famous Blue Hills of the Nilgris Hill- resorts, the haven for the British of the South India and now for the tourists and the well-to do! Since the Nilgris Hills were lost to our Diocese only in 1940, with the division of Diocese, some general idea about the Hills may not be out of place, since atleast we could get a satisfaction that the new Diocese of Ooty, was nurtured by us for nearly 130 years! For many centuries the Blue Mountains remained a mysterious region. The Hindus believe that they are sacred and it is enough to look at them to be cleansed of all their sins! The peak, closest to us, is Pakaswrankottai. Supposed to be the abode of the demon Pakaswran. Infact there was once a fort, now in ruins, which was used by Tippu Sultan as a place of confinement of prisoners of War; Mr.John Sullivan, a Collector of Coimbatore was the first to set foot and discover Ooty (known as ‘Othai Mandhu’ popularly). He built a bungiow known as “Stone House” in 1 815 and is still preserved as a historical monument. Some European Planters started Coffee and Tea estates between 1 819 and 1825. The old ghat road from Mettupalayam to Coonoor was constructed in 1830-32. Before that, a steep mountain trail was the only link and supplies had to be transported on donkey’s back. The English, needing people to serve them as domestic servants, and work in the plantations, many people from Kodiveli, Erode areas, mostly Adi-Dravidas and later many Catholics from Pallapalayam etc. also settled there. In 1859, the Government of Madras Presidency established their summer head quarters at Ooty, even building , a building for the “Assembly Hall” (which is now used as a cinema theatre!) . It is a tourist center and one of best Botanical Garden of the East Asia is situated at Ooty. The Nilgris Railway was opened from Mettupalayam to Coonoor in 1 899 and extended to Qoty in 1 910. Because of the steep climbing, a unique system of rails with an iron locking-system, and mountain gauge. It is such a unique one, but now Indian Railways cannot find spares or fresh supply of Engines! The first ones were manufactured by a Swiss Company in the I 9th century and they had stopped production long ago! Hence the ghost of closure hangs over it. Because of the natural boundary, separating our Diocese first from Mysore Diocese and from 1955 from Ooty Diocese, is the river Bhavani and Moyar in the north, we have some anamolous situations with regard to jurisdiction. One is born in Coimbatore Diocese, but could be burned only in Ooty Diocese at Mettupalayam, since there the church built in 1846 by Fr. A.J. Langier was on the left bank of Bhavani ( while another chapel built in 1851 by Fr. Bonjean on the other side) which is now the cemetry; Fr. Petite built a new church and presbytery on the right bank (Coimbatore side, in 1922!) That is how one is baptized in Coimbatore Diocese and is buried in Ooty diocese! At Satiyamangalam town also the river Bhavani divides the town into 2 parts, but unluckily there, the church and cemetry is on the left bank (in Ooty diocese) By mutual understanding however things run smoothly:at Mettupalayaxn the parish priest for Coimbatore diocese looks after the Catholics on the other side and at Satyamangalam, the other way arround. Thus we have lost the Birth-place of Coimbatore mission by the “name” only (since Sathy was only called as ‘Sathy Mission’) while the actual first church and Residence of the Missionary was on our side, between 1643-56 and then, Kannuvakarai was the head-quarters of the Mission which is in our Diocese! Another anamoly is that even the Bishop of Ooty has to pass through our Diocese, to reach one half of his Diocese from Mettupalayam into Sathy to reach his parishes situated north of Bhavani to Thalai Malai of Thalavadi area, Gundri and Andiur Taluk; near the river Mayar, the gap is only a few kilometers of at Thengumarata!\n\nMettupalayam, being a Railway Colony parish, it was first attached to Cathedral parish along with Podanur and Shoranur, from 1903 it was a substation of Podanur when it was made a separate parish. In those days, the churches in the Railway Colonies, belonged to the Railway Company and built and maintained by them and the Parish Priests were given free passes (as for the Protestants). In those days, our Indian Railways had 3 classes of accornodation. I” class : all cushioned seats and large carpet area ;vith sleeper accomadation so as to accommodate families; (This was usually reserved only for the English); The II class, with cushioned seats, but no sleeper facilities, comfortable seating ensured; and finally the Ill class, fitted with wooden seats and no reservation. So the Railway companies (they were privately- owned) thought that it was a great act of condescension to Christian Pastors and Priests, to allow them to travel free, though with only II class accornodation! The Railway chaplains (whether Protestant or Catholic) were paid a monthly stipend Rs.l00/- But it could not be ascertained whether the Railway-chaplains had to hand over the amount to the diocese, of their stipend or pocket it! All these facilities were with-drawn with the Nationalization of the Railways, by the Indian government after the Independece, but the obligations were retained (for any change, improvements of buildings, additions etc. cannot be done, without the permission of the Railways).\n\nFr.Petite (1906-35) was really the first parish priest, since Mettupalayam and Shoranur were made substations of Podanur. He built a church in honour of St. Antony on the right side of Bhavani river in 1922. In 1947, Mettupalayam became a separate parish with Fr. S. Saveriar (1947-1951) as the first parish priest. The presbytery was extended by Fr.L. Antonyswamy (1951-1962) and the church was extended by 20 feet. In 1955, 20 families were baptized at Karanur (15 miles away). An Elementary School was started by Fr. S. Saveriar (1962 ) in his second term as parish priest and the church was completely rebuilt by him and blessed by Bishop Savarirnuthu. It was at this time, that the Italian Rayon Factory was started at Sirumugai. In 1964, a church was built there by him and was blessed by Bishop Savarimuthu. Another major extension was done in 1967 by Fr. Savariar. An Elementary School, started by a private Portestant management was acquired by the diocese, called “Gandhi Memorial School”. It was handed over tc the Presentation Sisters, who raised it to be an Higher Elementary ichool (mixed school). A Grotto of Our Lady of Vellankanni was zonconstructed, about 2 K.m. away on the main Mettupalayam Coimbatore Road in 1975, with a plot of land bought by Bishop Visuvasam, who had a penchant for choosing such vantage lands Eo catch the attention of Non- Catholics. It was blessed by him on 11-2-1975. Gradually it has grown into a major Pilgrimage centrc. Fr. S.Amalraj popularized it and the Grotto was made into a chapel! Fr. Maria Joseph, built a beautiful, modern church, behind the Grotto, and it was consecrated by Bishop Ambrose on 04-01-2003. The third extension of the parish church was done in 1997, as a memorial of the Golden Jubilee of the church and it was consecrated on 20-06-1997 by Bishop Ambrose. Bishop Ambrose Shopping Complex was built by the Diocese, and was blessed on 12-10-1999. St. Antony’s Community Hall (the first floor) was built by Fr. A. Pappu and blessed by Bishop Ambrose on 12-10- 1999. Fr. Henry Daniel, inspite of ilhealth, put up the second floor of the Community Hall (as a Dinning Hall) and it was blessed on 24-6-2001). A new presbytery, independent of the church was built by Fr. C.S. Madalaimuthu and blessed by Bishop Visuvasam in 1976.Mettupalayam parish has the distinction of being the first parish to organize the entire parish into 1 2 “Basic Christian Communities called “Anbiam” (named after the twelve Apostles Instead of Judas Iscariot, of course St. Mathias, I am sure!) even before the Tamil Nadu Bishops’ Council made it compulsary, thanks to the unceasing labours of Fr. A. Pappu! his silent but unceasing, self-less interest and efforts, was appreciated by the whole parish.`;

        const tamilHistory = `வரலாறு\n\nநீலகிரி மலைப் பகுதிகள் (புகழ்பெற்ற 'நீல மலைகள்') தென்னிந்தியாவில் வாழ்ந்த ஆங்கிலேயர்களுக்கும், தற்போது சுற்றுலாப் பயணிகள் மற்றும் வசதி படைத்தவர்களுக்கும் ஒரு சொர்க்கபுரியாகத் திகழ்கின்றன; இப்பகுதிக்குச் செல்லும் நுழைவாயிலாக மேட்டுப்பாளையம் அமைகிறது. 1940-ல் மறைமாவட்டப் பிரிவினையின்போதுதான் நீலகிரி மலைப்பகுதி எங்கள் மறைமாவட்டத்திலிருந்து பிரிக்கப்பட்டது. எனவே, புதிய ஊட்டி மறைமாவட்டத்தை ஏறக்குறைய 130 ஆண்டுகள் நாமே வளர்த்தெடுத்தோம் என்ற மனநிறைவைப் பெறும் வகையில், இம்மலைப்பகுதி குறித்த சில பொதுவான தகவல்களை அறிந்துகொள்வது பொருத்தமானதாக இருக்கும். பல நூற்றாண்டுகளாக 'நீல மலைகள்' ஒரு மர்மமான பகுதியாகவே இருந்து வந்தன. இம்மலைகள் புனிதமானவை என்றும், அவற்றைக் காண்பதே பாவங்களைப் போக்கப் போதுமானது என்றும் இந்துக்கள் நம்புகின்றனர்! நமக்கு மிக அருகில் உள்ள மலைச்சிகரம் 'பகாசுரன் கோட்டை' (Pakaswrankottai) ஆகும். இது பகாசுரன் என்ற அரக்கனின் இருப்பிடமாகக் கருதப்படுகிறது. உண்மையில், இங்கு ஒரு காலத்தில் கோட்டை ஒன்று இருந்தது (தற்போது அது சிதிலமடைந்த நிலையில் உள்ளது); இக்கோட்டையை திப்பு சுல்தான் போர்க்கைதிகளை அடைத்து வைக்கும் இடமாகப் பயன்படுத்தினார். கோயம்புத்தூர் மாவட்ட ஆட்சியராக இருந்த திரு. ஜான் சல்லிவன் (John Sullivan) தான் முதன்முதலில் இங்கு காலடி வைத்து, ஊட்டியை (மக்கள் மத்தியில் 'ஒத்த மண்டு' என்று அறியப்பட்டது) கண்டறிந்தார். அவர் 1815-ல் "ஸ்டோன் ஹவுஸ்" (Stone House) என்ற பங்களாவைக் கட்டினார்; அது இன்றும் ஒரு வரலாற்றுச் சின்னாகப் பாதுகாக்கப்படுகிறது. 1819 மற்றும் 1825-க்கு இடைப்பட்ட காலத்தில், சில ஐரோப்பியத் தோட்ட உரிமையாளர்கள் காபி மற்றும் தேயிலைத் தோட்டங்களை உருவாக்கத் தொடங்கினர். மேட்டுப்பாளையத்திலிருந்து குன்னூருக்குச் செல்லும் பழைய மலைப்பாதை 1830-32 காலகட்டத்தில் அமைக்கப்பட்டது. அதற்கு முன், செங்குத்தான மலைப்பாதை மட்டுமே ஒரே வழியாக இருந்தது; அத்தியாவசியப் பொருட்கள் கழுதைகளின் முதுகில் சுமந்து கொண்டு செல்லப்பட்டன. ஆங்கிலேயர்களுக்கு வீட்டு வேலை செய்பவர்களும் தோட்டங்களில் பணிபுரிபவர்களும் தேவைப்பட்டதால், கொடிவேலி மற்றும் ஈரோடு பகுதிகளைச் சேர்ந்த பலர் (பெரும்பாலும் ஆதிதிராவிடர்கள்) அங்கு குடியேறினர்; பின்னர் பல்லாப்பாளையம் போன்ற இடங்களிலிருந்து பல கத்தோலிக்கர்களும் அங்கு குடியேறினர். 1859-இல், சென்னை மாகாண அரசு ஊட்டியில் தனது கோடைக்காலத் தலைமையகத்தை அமைந்தது; இதற்காக 'சபை மண்டபம்' (Assembly Hall) ஒன்றையும் கட்டியது (இது தற்போது ஒரு திரையரங்காகப் பயன்படுத்தப்படுகிறது!). ஊட்டி ஒரு சுற்றுலா மையமாகவும், கிழக்கு ஆசியாவின் சிறந்த தாவரவியல் பூங்காக்களில் ஒன்றை உள்ளடக்கிய இடமாகவும் திகழ்கிறது. நீலகிரி மலை ரயில் பாதை 1899-இல் மேட்டுப்பாளையத்திலிருந்து குன்னூர் வரை திறக்கப்பட்டு, 1910-இல் ஊட்டி வரை நீட்டிக்கப்பட்டது. செங்குத்தான பாதையில் ஏறுவதற்கு ஏற்றவாறு, இரும்புப் பூட்டு அமைப்பு மற்றும் 'மலைப் பாதை அகல அளவு' (mountain gauge) கொண்ட தனித்துவமான ரயில் அமைப்பு இதில் பயன்படுத்தப்படுகிறது. இது மிகவும் தனித்துவமானது என்றாலும், தற்போது இந்திய ரயில்வேயால் இதற்கான உதிரிபாகங்களையோ அல்லது புதிய என்ஜின்களையோ பெற முடியவில்லை! இதன் ஆரம்பகால என்ஜின்கள் 19-ஆம் நூற்றாண்டில் ஒரு சுவிஸ் நிறுவனத்தால் தயாரித்தன, ஆனால் அந்த நிறுவனம் நீண்ட காலத்திற்கு முன்பே உற்பத்தியை நிறுத்திவிட்டது! எனவே, இந்த ரயில் சேவை மூடப்படும் அபாயம் நிலவுகிறது. வடக்கே பவானி மற்றும் மோயார் ஆறுகள் எங்கள் மறைமாவட்டத்தை முதலில் மைசூர் மறைமாவட்டத்திலிருந்தும், 1955 முதல் ஊட்டி மறைமாவட்டத்திலிருந்தும் பிரிக்கின்றன; இந்த இயற்கை எல்லை அமைப்பால் அதிகார வரம்பு தொடர்பான சில விசித்திரமான சூழல்கள் உருவாகியுள்ளன. ஒருவர் கோயம்புத்தூர் மறைமாவட்டத்தைச் சேர்ந்தவராகப் பிறந்தாலும், மேட்டுப்பாளையத்தில் உள்ள ஊட்டி மறைமாவட்டப் பகுதியில் அடக்கம் செய்யப்பட வேண்டிய நிலை ஏற்படலாம்; ஏனெனில், 1846-இல் அருள்தந்தை ஏ.ஜே. லாங்கியர் (Fr. A.J. Langier) கட்டிய தேவாலயம் பவானி ஆற்றின் இடது கரையில் (ஊட்டி மறைமாவட்டப் பக்கம்) அமைந்திருந்தது (அதே சமயம் 1851-இல் அருள்தந்தை போன்ஜீன் மறுபுறம் ஒரு சிற்றாலயத்தைக் கட்டினார்), அந்த இடமே இப்போது கல்லறையாக உள்ளது; பின்னர் 1922-இல் அருள்தந்தை பெட்டிட் (Fr. Petite) வலது கரையில் (கோயம்புத்தூர் பக்கம்) புதிய தேவாலயத்தையும் பங்குத்தந்தை இல்லத்தையும் கட்டினார்! இப்படியாக, ஒருவர் கோயம்புத்தூர் மறைமாவட்ட எல்லைக்குள் திருமுழுக்கு (ஞானஸ்நானம்) பெற்று, ஊட்டி மறைமாவட்ட எல்லைக்குள் அடக்கம் செய்யப்படுகிறார்! சத்தியமங்கலம் நகரிலும் பவானி ஆறு நகரத்தை இரு பகுதிகளாகப் பிரிக்கிறது; ஆனால் துரதிர்ஷ்டவசமாக அங்கு தேவாலயமும் கல்லறையும் இடது கரையில் (ஊட்டி மறைமாவட்டப் பகுதியில்) அமைந்துள்ளன. இருப்பினும், பரஸ்பர புரிதலின் அடிப்படையில் பணிகள் சுமூகமாக நடைபெறுகின்றன: மேட்டுப்பாளையத்தில் கோயம்புத்தூர் மறைமாவட்டப் பங்குத்தந்தை ஆற்றின் மறுபுறம் உள்ள கத்தோலிக்கர்களைக் கவனித்துக்கொள்கிறார்; சத்தியமங்கலத்தில் இதற்கு நேர்மாறான ஏற்பாடு பின்பற்றப்படுகிறது. இவ்வாறு, 'சத்ய மிஷன்' (Sathy Mission) என்ற பெயரின் காரணமாகவே கோயம்புத்தூர் மறைப்பணியின் (Mission) பிறப்பிடத்தை நாம் இழந்துவிட்டோம்; உண்மையில், 1643-56 காலகட்டத்தில் மறைப்பணியாளரின் முதல் தேவாலயமும் இருப்பிடமும் நம் பகுதியில்தான் இருந்தன. மேலும், பின்னர் இம்மறைப்பணியின் தலைமையகமாகத் திகழ்ந்த 'கண்ணுவகரை' (Kannuvakarai) பகுதியும் நம் மறைமாவட்டத்திற்குள்ளேயே அமைந்துள்ளது! மற்றொரு விசித்திரமான சூழல் என்னவென்றால், ஊட்டி மறைமாவட்ட ஆயர் தனது மறைமாவட்டத்தின் ஒரு பகுதியிலிருந்து (மேட்டுப்பாளையத்திலிருந்து சத்யமங்கலம் வழியாக) பவானிக்கு வடக்கே உள்ள பங்குகள் (parishes), தலவாடி பகுதியின் தலைமலை, குன்றி மற்றும் அந்தியூர் தாலுகா ஆகிய இடங்களுக்குச் செல்ல நம் மறைமாவட்டத்தின் வழியாகவே பயணிக்க வேண்டியுள்ளது; மாயாறுக்கு அருகில் உள்ள தேங்குமரஹடா (Thengumarahada) பகுதியில் இந்த இடைவெளி வெறும் சில கிலோமீட்டர்கள் மட்டுமே!\n\nமேட்டுப்பாளையம் ஒரு ரயில்வே காலனிப் பங்காக (Railway Colony parish) இருந்ததால், ஆரம்பத்தில் போத்தனூர் மற்றும் ஷொர்ணூர் ஆகியவற்றுடன் இணைந்து கதீட்ரல் பங்கின் ஒரு பகுதியாக இருந்தது; பின்னர் 1903-ல் போத்தனூர் தனிப் பங்காக மாற்றப்பட்டபோது, மேட்டுப்பாளையம் அதன் ஒரு துணை நிலையமாக (substation) இணைக்கப்பட்டது. அக்காலத்தில், ரயில்வே காலனிகளில் இருந்த தேவாலயங்கள் ரயில்வே நிறுவனத்திற்குச் சொந்தமானவையாகவும், அவர்களாலேயே கட்டப்பட்டுப் பராமரிக்கப்படுபவையாகவும் இருந்தன; மேலும், (புரட்டஸ்டன்ட் சபைப் போதகர்களுக்கு வழங்கப்பட்டது போலவே) கத்தோலிக்கப் பங்குத் தந்தையர்களுக்கும் இலவசப் பயணச் சீட்டுகள் (free passes) வழங்கப்பட்டன. அக்காலத்தில், இந்திய ரயில்வேயில் மூன்று வகையான பயண வகுப்புகள் இருந்தன: முதல் வகுப்பு (I Class) - மெத்தை இருக்கைகள், பெரிய தரைவிரிப்புப் பகுதி மற்றும் குடும்பங்கள் தங்கும் வகையிலான படுக்கை வசதிகள் (sleeper accommodation) கொண்டதாக இருந்தது (இது பொதுவாக ஆங்கிலேயர்களுக்கு மட்டுமே ஒதுக்கப்பட்டிருந்தது); இரண்டாம் வகுப்பு (II Class) - மெத்தை இருக்கைகள் இருந்தன, ஆனால் படுக்கை வசதிகள் இல்லை, இருப்பினும் வசதியான இருக்கை அமைப்பு உறுதி செய்யப்பட்டது; இறுதியாக மூன்றாம் வகுப்பு (III Class) - மர இருக்கைகள் மட்டுமே இருந்தன, முன்பதிவு வசதி இல்லை. எனவே, (தனியார் உடைமையில் இருந்த) ரயில்வே நிறுவனங்கள், கிறிஸ்தவ போதகர்களையும் குருக்களையும் அனுமதிப்பதை ஒரு பெரிய பெருந்தன்மையான செயலாகக் கருதின அவர்கள் இரண்டாம் வகுப்பு வசதியுடன் இலவசமாகப் பயணம் செய்ய அனுமதிக்கப்பட்டனர்! ரயில்வே மதகுருமார்களுக்கு (புரட்டஸ்டன்ட் அல்லது கத்தோலிக்கர் யாராக இருந்தாலும்) மாதம் 100 ரூபாய் ஊதியம் வழங்கப்பட்டது. ஆனால், அந்தத் தொகையை அவர்கள் தங்கள் மறைமாவட்டத்திடம் ஒப்படைக்க வேண்டுமா அல்லது அதைத் தங்கள் சொந்தப் பயன்பாட்டிற்கு வைத்துக்கொள்ளலாமா என்பது குறித்துத் தெளிவான தகவல் இல்லை. சுதந்திரத்திற்குப் பிறகு இந்திய அரசால் ரயில்வே தேசியமயமாக்கப்பட்டபோது இந்தச் சலுகைகள் அனைத்தும் திரும்பப் பெறப்பட்டன; இருப்பினும், அதற்கான கடமைகள் மற்றும் கட்டுப்பாடுகள் தொடர்ந்து நடைமுறையில் இருந்தன (அதாவது, ரயில்வேயின் அனுமதியின்றி கட்டிடங்களில் எந்த மாற்றமோ, மேம்பாட்டோ அல்லது கூடுதல் கட்டுமானங்களோ செய்ய முடியாது).\n\nமேட்டுப்பாளையம் மற்றும் ஷொர்ணூர் ஆகியவை போத்தனூரின் கிளைப் பங்குகள் (substations) ஆக்கப்பட்ட பிறகு, அருள்தந்தை பெட்டிட் (1906-35) உண்மையில் அப்பங்கின் முதல் பங்குத் தந்தையாகத் திகழ்ந்தார். அவர் 1922-ல் பவானி ஆற்றின் வலது கரையில் புனித அந்தோனியார் பெயரில் ஒரு தேவாலயத்தைக் கட்டினார். 1947-ல், அருள்தந்தை எஸ். சவேரியார் (1947-1951) முதல் பங்குத் தந்தையாகப் பொறுப்பேற்க, மேட்டுப்பாளையம் ஒரு தனிப் பங்காக (parish) உருவானது. அருள்தந்தை எல். அந்தோனிசாமி (1951-1962) பங்குத் தந்தையாக இருந்த காலத்தில், பங்குத் தந்தையின் இல்லம் (presbytery) விரிவாக்கப்பட்டது மற்றும் தேவாலயம் 20 அடி நீளத்திற்கு விரிவாக்கம் செய்யப்பட்டது. 1955-ல், காரனூரில் (15 மைல் தொலைவில்) 20 குடும்பங்களுக்குத் திருமுழுக்கு வழங்கப்பட்டது. பங்குத் தந்தையாகத் தனது இரண்டாவது பதவிக்காலத்தில், அருள்தந்தை எஸ். சவேரியார் ஒரு தொடக்கப் பள்ளியைத் தொடங்கினார்; மேலும் தேவாலயத்தை முழுமையாகப் புதிதாகக் கட்டி, ஆயர் சவரிமுத்து அவர்களால் அர்ச்சிக்கச் செய்தார். அக்காலகட்டத்தில்தான் சிறுமுகையில் 'இத்தாலியன் ரேயான் தொழிற்சாலை' (Italian Rayon Factory) தொடங்கப்பட்டது. 1964-ல், அங்கு ஒரு தேவாலயத்தை அவர் கட்டினார்; அதுவும் ஆயர் சவரிமுத்து அவர்களால் அர்ச்சிக்கப்பட்டது. 1967-ல் அருள்தந்தை சவேரியார் மூலம் மற்றொரு முக்கிய விரிவாக்கப் பணி மேற்கொள்ளப்பட்டது. தனியார் புரட்டஸ்டன்ட் நிர்வாகத்தால் தொடங்கப்பட்ட ஒரு தொடக்கப் பள்ளி மறைமாவட்டத்தால் கையகப்படுத்தப்பட்டு, "காந்தி நினைவுப் பள்ளி" என்று பெயரிடப்பட்டது. அப்பள்ளி 'பிரசன்டேஷன் சிஸ்டர்ஸ்' (Presentation Sisters) சபையினரிடம் ஒப்படைக்கப்பட்டது; அவர்கள் அதனை ஓர் உயர் தொடக்கப் பள்ளியாக (ஆண்-பெண் இருபாலரும் பயிலும் பள்ளி) உயர்த்தினர். சுமார் 2 கி.மீ. தொலைவில் வேளாங்கண்ணி மாதாவுக்கான ஒரு கெபி (Grotto) கட்டப்பட்டது. கத்தோலிக்கர் அல்லாதவர்களின் கவனத்தை ஈர்க்கக்கூடிய முக்கிய இடங்களில் நிலம் வாங்குவதில் ஆர்வம் கொண்ட ஆயர் விசுவாசம் அவர்கள், 1975-ல் மேட்டுப்பாளையம்-கோயம்புத்தூர் பிரதான சாலையில் ஒரு நிலத்தை வாங்கினார். 11-2-1975 அன்று அவர் அதை அர்்ப்பணித்து ஆசீர்வதித்தார். காலப்போக்கில் இது ஒரு முக்கிய புனிதத் தலமாக வளர்ந்தது. அருள்தந்தை எஸ். அமல்ராஜ் இதனைப் பிரபலப்படுத்தினார்; மேலும் அங்குள்ள குகை ஆலயம் (Grotto) ஒரு சிற்றாலயமாக மாற்றப்பட்டது. அருள்தந்தை மரியா ஜோசப் அந்தக் குகை ஆலயத்திற்குப் பின்னால் ஒரு அழகான, நவீன தேவாலயத்தைக் கட்டினார்; அது 04-01-2003 அன்று ஆயர் ஆம்ப்ரோஸ் அவர்களால் அர்்ப்பணிக்கப்பட்டது. தேவாலயத்தின் பொன்விழா நினைவாக 1997-ல் பங்குத் தேவாலயத்தின் மூன்றாவது விரிவாக்கப் பணி மேற்கொள்ளப்பட்டு, 20-06-1997 அன்று ஆயர் ஆம்ப்ரோஸ் அவர்களால் அர்்ப்பணிக்கப்பட்டது. மறைமாவட்டத்தால் 'ஆயர் ஆம்ப்ரோஸ் வணிக வளாகம்' கட்டப்பட்டது மற்றும் 12-10-1999 அன்று அது அர்்ப்பணிக்கப்பட்டது. புனித அந்தோனியார் சமுதாயக் கூடத்தின் முதல் தளம் அருள்தந்தை ஏ. பாப்பு அவர்களால் கட்டப்பட்டது மற்றும் 12-10-1999 அன்று ஆயர் ஆம்ப்ரோஸ் அவர்களால் அர்்ப்பணிக்கப்பட்டது. உடல்நலக்குறைவு இருந்தபோதிலும், அருள்தந்தை ஹென்றி டேனியல் சமுதாயக் கூடத்தின் இரண்டாவது தளத்தை (உணவருந்தும் கூடமாக) அமைத்தார்; அது 24-6-2001 அன்று அர்்ப்பணிக்கப்பட்டது. தேவாலயத்திலிருந்து தனித்து இயங்கும் வகையிலான புதிய பங்குத்தந்தை இல்லம் அருள்தந்தை சி.எஸ். மடலைமுத்து அவர்களால் கட்டப்பட்டது மற்றும் 1976-ல் ஆயர் விசுவாசம் அவர்களால் அர்்ப்பணிக்கப்பட்டது. அருள்தந்தை ஏ. பாப்புவின் அயராத உழைப்பால், தமிழ்நாடு ஆயர் பேரவை கட்டாயமாக்குவதற்கு முன்பே, மேட்டுப்பாளையம் பங்கு தனது முழுப் பகுதியையும் 12 'அடிப்படை கிறிஸ்தவ சமூகங்களாக' (அன்பியம்) - அதாவது யூதாஸ் இஸ்காரியோத்திற்குப் பதிலாக புனித மத்தியாஸ் உட்பட பன்னிரு திருத்தூதர்களின் பெயர்களில் - அமைத்த பெருமையைப் பெற்றது. அவரது அமைதியான, ஆனால் இடைவிடாத மற்றும் சுயநலமற்ற ஆர்வமும் முயற்சிகளும் முழுப் பங்கு மக்களாலும் பாராட்டப்பட்டன.`;

        await db.query(`
            INSERT INTO church_info (info_key, info_value, info_value_tamil) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE info_value = VALUES(info_value), info_value_tamil = VALUES(info_value_tamil)
        `, ['about', englishHistory, tamilHistory]);

        console.log('✅ Extended schema initialized with all 39 tables.');
    } catch (e) {
        console.error('❌ Extended schema init error:', e);
    }
}

module.exports = { initExtendedSchema };
