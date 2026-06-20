/* ═══════════════════════════════════════════════════════
   ST ANTONY CHURCH DEVOTIONAL APP — Frontend Application
   ═══════════════════════════════════════════════════════ */

// ─── State ───────────────────────────────────────────
let currentUser = null;
let currentLang = localStorage.getItem('lang') || 'en';
let isDark = localStorage.getItem('theme') !== 'light';
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizActive = false;
let countdownInterval = null;

// ─── Translations ────────────────────────────────────
const T = {
  en: {
    appName: 'St Antony Church', home: 'Home', videos: 'Videos', audio: 'Audio',
    events: 'Events', bible: 'Bible', prayer: 'Prayer', devotional: 'Devotionals',
    worship: 'Worship', journal: 'Journal', articles: 'Articles', quiz: 'Bible Quiz',
    history: 'History', announce: 'Announcements', logout: 'Logout',
    welcome: 'Find Peace in Faith', enterChurch: 'Enter the Church',
    churchMember: 'Church Member', admin: 'Church Admin',
    loginTitle: 'Login', registerTitle: 'Register',
    name: 'Full Name', phone: 'Phone Number', password: 'Password',
    submit: 'Login', register: 'Create Account', noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?', greeting: 'Good', latestSermons: 'Latest Sermons',
    latestAudio: 'Latest Audio', nextEvent: 'Next Upcoming Event', noEvents: 'No upcoming events.',
    todayVerse: "Today's Verse", prayerReq: 'Prayer Requests', submitPrayer: 'Submit Prayer',
    anonymous: 'Submit Anonymously', emergency: 'Emergency Prayer', myJournal: 'My Faith Journal',
    newEntry: 'New Entry', writeJournal: 'Write your thoughts...', saveEntry: 'Save Entry',
    quizStart: 'Start Quiz', quizNext: 'Next', quizFinish: 'Finish', correct: 'Correct!',
    wrong: 'Wrong!', yourScore: 'Your Score', streaks: 'My Streaks', prayerStreak: 'Prayer',
    bibleStreak: 'Bible', devStreak: 'Devotional', days: 'days', markPrayed: '🙏 I Prayed Today',
    markRead: '📖 I Read Today', markDev: '✝️ I Did Devotional',
    sermonVideos: 'Sermon Videos', audioDevotionals: 'Audio Devotionals',
    churchEvents: 'Church Events', bibleVerses: 'Bible Verses',
    worshipSongs: 'Worship Songs', christianArticles: 'Christian Articles',
    activityHistory: 'Activity History', dashboard: 'Dashboard',
  },
  ta: {
    appName: 'செயின்ட் அந்தோனி சர்ச்', home: 'முகப்பு', videos: 'வீடியோ', audio: 'ஆடியோ',
    events: 'நிகழ்வுகள்', bible: 'வேதாகமம்', prayer: 'ஜெபம்', devotional: 'பிரார்த்தனைகள்',
    worship: 'ஆராதனை', journal: 'ஜர்னல்', articles: 'கட்டுரைகள்', quiz: 'வேத வினாடி வினா',
    history: 'வரலாறு', announce: 'அறிவிப்புகள்', logout: 'வெளியேறு',
    welcome: 'விசுவாசத்தில் அமைதி காணுங்கள்', enterChurch: 'சபையில் நுழையுங்கள்',
    churchMember: 'சர்ச் உறுப்பினர்', admin: 'நிர்வாகி',
    loginTitle: 'உள்நுழை', registerTitle: 'பதிவு செய்',
    name: 'முழு பெயர்', phone: 'தொலைபேசி எண்', password: 'கடவுச்சொல்',
    submit: 'உள்நுழை', register: 'கணக்கு திற', noAccount: 'கணக்கு இல்லையா?',
    hasAccount: 'கணக்கு உள்ளதா?', greeting: 'வணக்கம்', latestSermons: 'சமீபத்திய பிரசங்கங்கள்',
    latestAudio: 'சமீபத்திய ஆடியோ', nextEvent: 'அடுத்த நிகழ்வு', noEvents: 'நிகழ்வுகள் இல்லை.',
    todayVerse: 'இன்றைய வசனம்', prayerReq: 'ஜெப வேண்டுகோள்', submitPrayer: 'ஜெபம் சமர்ப்பி',
    anonymous: 'அநாமதேயமாக சமர்ப்பி', emergency: 'அவசர ஜெபம்', myJournal: 'என் விசுவாச நாட்குறிப்பு',
    newEntry: 'புதிய பதிவு', writeJournal: 'உங்கள் எண்ணங்களை எழுதுங்கள்...', saveEntry: 'சேமி',
    quizStart: 'வினாடி வினா தொடங்கு', quizNext: 'அடுத்து', quizFinish: 'முடி', correct: 'சரி!',
    wrong: 'தவறு!', yourScore: 'உங்கள் மதிப்பெண்', streaks: 'என் தொடர்ச்சி', prayerStreak: 'ஜெபம்',
    bibleStreak: 'வேதாகமம்', devStreak: 'தியானம்', days: 'நாட்கள்', markPrayed: '🙏 இன்று ஜெபித்தேன்',
    markRead: '📖 இன்று படித்தேன்', markDev: '✝️ இன்று தியானித்தேன்',
    sermonVideos: 'பிரசங்க வீடியோக்கள்', audioDevotionals: 'ஆடியோ தியானங்கள்',
    churchEvents: 'சர்ச் நிகழ்வுகள்', bibleVerses: 'வேத வசனங்கள்',
    worshipSongs: 'ஆராதனை பாடல்கள்', christianArticles: 'கிறிஸ்தவ கட்டுரைகள்',
    activityHistory: 'செயல் வரலாறு', dashboard: 'டாஷ்போர்டு',
  }
};
const t = (key) => (T[currentLang] || T.en)[key] || key;

// ─── Utility Functions ───────────────────────────────
function resolveUrl(path) {
  if (!path) return '';
  if (path.includes('http://') || path.includes('https://')) {
    const idx = path.indexOf('http');
    return path.substring(idx);
  }
  let cleanPath = path;
  while (cleanPath.startsWith('/') || cleanPath.startsWith('uploads/')) {
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    } else {
      cleanPath = cleanPath.substring(8);
    }
  }
  return `/uploads/${cleanPath}`;
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${id}`);
  if (el) el.classList.add('active');
}

function showToast(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', info: '✝️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(30px)'; setTimeout(() => toast.remove(), 400); }, duration);
}

function initMockData() {
  if (!localStorage.getItem('mock_initialized')) {
    const defaultVerses = [
      { id: "1", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11", created_at: new Date().toISOString() },
      { id: "2", text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13", created_at: new Date().toISOString() },
      { id: "3", text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1", created_at: new Date().toISOString() }
    ];
    const defaultVideos = [
      { id: "1", title: "Finding Strength in God's Promises", category: "Sermon", description: "A message of hope and strength in times of uncertainty.", url: "https://www.w3schools.com/html/mov_bbb.mp4", created_at: new Date().toISOString() },
      { id: "2", title: "Walking in Grace Daily", category: "Devotional", description: "Daily reflection on God's grace and love.", url: "https://www.w3schools.com/html/movie.mp4", created_at: new Date().toISOString() }
    ];
    const defaultAudio = [
      { id: "1", title: "Morning Devotional: Finding Peace", pastor: "Pastor John", description: "Start your day with a reflection on peace and gratitude.", filename: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", created_at: new Date().toISOString() },
      { id: "2", title: "Sermon: Faith Over Fear", pastor: "Pastor Sarah", description: "Trusting in God's plan in every season.", filename: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", created_at: new Date().toISOString() }
    ];

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 5); nextWeek.setHours(18, 30, 0, 0);

    const defaultEvents = [
      { id: "1", title: "Sunday Worship & Communion", date: tomorrow.toISOString().split('T')[0], time: "09:00", location: "Main Sanctuary", description: "Join us for sermon, prayer, and communion service.", created_at: new Date().toISOString() },
      { id: "2", title: "Youth Fellowship Night", date: nextWeek.toISOString().split('T')[0], time: "18:30", location: "Church Fellowship Hall", description: "A fun and spiritual time for youth and young adults.", created_at: new Date().toISOString() }
    ];

    const defaultPrayers = [
      { id: "1", member_name: "John Doe", request: "Pray for my grandmother's health recovery.", anonymous: 0, answered: 0, created_at: new Date().toISOString() },
      { id: "2", member_name: "Anonymous", request: "Strength and guidance in making a career decision.", anonymous: 1, answered: 0, created_at: new Date().toISOString() }
    ];

    const defaultJournal = [
      { id: "1", title: "First Entry", content: "Today I felt a deep sense of peace during morning prayer.", mood: "Peaceful", created_at: new Date().toISOString() }
    ];

    const defaultQuiz = [
      { id: "1", question: "How many books are in the Bible?", options: ["66", "72", "39", "27"], answer: "66" },
      { id: "2", question: "Who built the Ark?", options: ["Noah", "Moses", "David", "Abraham"], answer: "Noah" },
      { id: "3", question: "What is the first book of the Bible?", options: ["Genesis", "Exodus", "Matthew", "John"], answer: "Genesis" }
    ];

    const defaultWorship = [
      { id: "1", title: "Amazing Grace", lyrics: "Amazing grace! How sweet the sound,\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.\n\nTwas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.", created_at: new Date().toISOString() }
    ];

    const defaultDevotionals = [
      { id: "1", title: "The Good Shepherd", content: "Jesus describes Himself as the Good Shepherd. A good shepherd knows his sheep, protects them, and lays down his life for them. Today, remember that you are known, guided, and deeply loved by Him.", created_at: new Date().toISOString() }
    ];

    const defaultArticles = [
      { id: "1", title: "Understanding Faith", content: "Faith is not about having all the answers. It is about trusting God even when we cannot see the path ahead. True faith grows in times of trial.", created_at: new Date().toISOString() }
    ];

    localStorage.setItem('mock_verses', JSON.stringify(defaultVerses));
    localStorage.setItem('mock_videos', JSON.stringify(defaultVideos));
    localStorage.setItem('mock_audio', JSON.stringify(defaultAudio));
    localStorage.setItem('mock_events', JSON.stringify(defaultEvents));
    localStorage.setItem('mock_prayers', JSON.stringify(defaultPrayers));
    localStorage.setItem('mock_journal', JSON.stringify(defaultJournal));
    localStorage.setItem('mock_quiz', JSON.stringify(defaultQuiz));
    localStorage.setItem('mock_worship', JSON.stringify(defaultWorship));
    localStorage.setItem('mock_devotionals', JSON.stringify(defaultDevotionals));
    localStorage.setItem('mock_articles', JSON.stringify(defaultArticles));
    localStorage.setItem('mock_users', JSON.stringify([]));
    localStorage.setItem('mock_history', JSON.stringify([]));
    localStorage.setItem('mock_initialized', 'true');
  }
}

async function handleMockAPI(method, path, body) {
  initMockData();
  const cleanPath = path.split('?')[0];

  if (cleanPath === '/auth/register' || cleanPath === '/auth/member/register') {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    if (users.find(u => u.phone === body.phone)) {
      throw new Error('Phone number already registered');
    }
    const newUser = { id: Date.now().toString(), name: body.name, phone: body.phone, password: body.password, created_at: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));
    return { message: 'Registered successfully' };
  }

  if (cleanPath === '/auth/login' || cleanPath === '/auth/member/login') {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const user = users.find(u => u.phone === body.phone && u.name === body.name && u.password === body.password);
    if (!user) throw new Error('Invalid name, phone number or password');
    localStorage.setItem('mock_role', 'member');
    localStorage.setItem('mock_user_id', user.id);
    localStorage.setItem('mock_user_name', user.name);
    return { token: 'mock-member-token-' + user.id, member: { id: user.id, name: user.name, phone: user.phone } };
  }

  if (cleanPath === '/auth/admin-login' || cleanPath === '/auth/admin/login') {
    if (body.name === 'admin' && body.password === 'admin123') {
      localStorage.setItem('mock_role', 'admin');
      return { token: 'mock-admin-token', admin: { name: 'admin' } };
    } else {
      throw new Error('Invalid admin credentials');
    }
  }

  if (cleanPath === '/videos') {
    const videos = JSON.parse(localStorage.getItem('mock_videos') || '[]');
    if (method === 'GET') return videos;
    if (method === 'POST') {
      const newVideo = {
        id: Date.now().toString(),
        title: body ? body.title : 'New Sermon',
        category: body ? body.category : 'Sermon',
        description: body ? body.description : '',
        url: body ? body.url : 'https://www.w3schools.com/html/mov_bbb.mp4',
        created_at: new Date().toISOString()
      };
      videos.unshift(newVideo);
      localStorage.setItem('mock_videos', JSON.stringify(videos));
      return { message: 'Video uploaded successfully', video: newVideo };
    }
  }
  if (cleanPath.startsWith('/videos/')) {
    const id = cleanPath.split('/')[2];
    let videos = JSON.parse(localStorage.getItem('mock_videos') || '[]');
    if (method === 'DELETE') {
      videos = videos.filter(v => v.id !== id);
      localStorage.setItem('mock_videos', JSON.stringify(videos));
      return { message: 'Video deleted' };
    }
  }

  if (cleanPath === '/audio') {
    const audios = JSON.parse(localStorage.getItem('mock_audio') || '[]');
    if (method === 'GET') return audios;
    if (method === 'POST') {
      const newAudio = {
        id: Date.now().toString(),
        title: body ? body.title : 'New Audio',
        pastor: body ? body.pastor : 'Pastor',
        description: body ? body.description : '',
        filename: body ? body.filename : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        created_at: new Date().toISOString()
      };
      audios.unshift(newAudio);
      localStorage.setItem('mock_audio', JSON.stringify(audios));
      return { message: 'Audio uploaded successfully', audio: newAudio };
    }
  }
  if (cleanPath.startsWith('/audio/')) {
    const id = cleanPath.split('/')[2];
    let audios = JSON.parse(localStorage.getItem('mock_audio') || '[]');
    if (method === 'DELETE') {
      audios = audios.filter(a => a.id !== id);
      localStorage.setItem('mock_audio', JSON.stringify(audios));
      return { message: 'Audio deleted' };
    }
  }

  if (cleanPath === '/events') {
    const events = JSON.parse(localStorage.getItem('mock_events') || '[]');
    if (method === 'GET') return events;
    if (method === 'POST') {
      const newEvent = {
        id: Date.now().toString(),
        title: body.title,
        date: body.date,
        time: body.time || '',
        location: body.location || '',
        description: body.description || '',
        created_at: new Date().toISOString()
      };
      events.unshift(newEvent);
      localStorage.setItem('mock_events', JSON.stringify(events));
      return { message: 'Event added successfully', event: newEvent };
    }
  }
  if (cleanPath.startsWith('/events/')) {
    const id = cleanPath.split('/')[2];
    let events = JSON.parse(localStorage.getItem('mock_events') || '[]');
    if (method === 'DELETE') {
      events = events.filter(e => e.id !== id);
      localStorage.setItem('mock_events', JSON.stringify(events));
      return { message: 'Event deleted' };
    }
  }

  if (cleanPath === '/verses') {
    const verses = JSON.parse(localStorage.getItem('mock_verses') || '[]');
    if (method === 'GET') return verses;
    if (method === 'POST') {
      const newVerse = {
        id: Date.now().toString(),
        text: body.text,
        reference: body.reference,
        created_at: new Date().toISOString()
      };
      verses.unshift(newVerse);
      localStorage.setItem('mock_verses', JSON.stringify(verses));
      return { message: 'Verse added successfully', verse: newVerse };
    }
  }
  if (cleanPath.startsWith('/verses/')) {
    const id = cleanPath.split('/')[2];
    let verses = JSON.parse(localStorage.getItem('mock_verses') || '[]');
    if (method === 'DELETE') {
      verses = verses.filter(v => v.id !== id);
      localStorage.setItem('mock_verses', JSON.stringify(verses));
      return { message: 'Verse deleted' };
    }
  }

  if (cleanPath === '/devotionals') {
    const devotionals = JSON.parse(localStorage.getItem('mock_devotionals') || '[]');
    if (method === 'GET') return devotionals;
    if (method === 'POST') {
      const newDev = {
        id: Date.now().toString(),
        title: body.title,
        content: body.content,
        created_at: new Date().toISOString()
      };
      devotionals.unshift(newDev);
      localStorage.setItem('mock_devotionals', JSON.stringify(devotionals));
      return { message: 'Devotional added successfully', devotional: newDev };
    }
  }

  if (cleanPath === '/prayer') {
    const prayers = JSON.parse(localStorage.getItem('mock_prayers') || '[]');
    if (method === 'GET') return prayers;
    if (method === 'POST') {
      const newPrayer = {
        id: Date.now().toString(),
        member_name: body.anonymous ? 'Anonymous' : (localStorage.getItem('mock_user_name') || 'Member'),
        request: body.request,
        anonymous: body.anonymous ? 1 : 0,
        answered: 0,
        created_at: new Date().toISOString()
      };
      prayers.unshift(newPrayer);
      localStorage.setItem('mock_prayers', JSON.stringify(prayers));
      return { message: 'Prayer request submitted', prayer: newPrayer };
    }
  }
  if (cleanPath.startsWith('/prayer/')) {
    const parts = cleanPath.split('/');
    const id = parts[2];
    let prayers = JSON.parse(localStorage.getItem('mock_prayers') || '[]');
    if (method === 'DELETE') {
      prayers = prayers.filter(p => p.id !== id);
      localStorage.setItem('mock_prayers', JSON.stringify(prayers));
      return { message: 'Prayer request deleted' };
    }
    if (parts[3] === 'answer') {
      const prayer = prayers.find(p => p.id === id);
      if (prayer) prayer.answered = 1;
      localStorage.setItem('mock_prayers', JSON.stringify(prayers));
      return { message: 'Prayer answered testimony saved' };
    }
  }

  if (cleanPath === '/journal') {
    const journal = JSON.parse(localStorage.getItem('mock_journal') || '[]');
    if (method === 'GET') return journal;
    if (method === 'POST') {
      const newEntry = {
        id: Date.now().toString(),
        title: body.title,
        content: body.content,
        mood: body.mood || 'Blessed',
        created_at: new Date().toISOString()
      };
      journal.unshift(newEntry);
      localStorage.setItem('mock_journal', JSON.stringify(journal));
      return { message: 'Journal entry saved', entry: newEntry };
    }
  }
  if (cleanPath.startsWith('/journal/')) {
    const id = cleanPath.split('/')[2];
    let journal = JSON.parse(localStorage.getItem('mock_journal') || '[]');
    if (method === 'DELETE') {
      journal = journal.filter(j => j.id !== id);
      localStorage.setItem('mock_journal', JSON.stringify(journal));
      return { message: 'Journal entry deleted' };
    }
  }

  if (cleanPath === '/quiz') {
    const quiz = JSON.parse(localStorage.getItem('mock_quiz') || '[]');
    if (method === 'GET') return quiz;
  }

  if (cleanPath === '/worship') {
    const worship = JSON.parse(localStorage.getItem('mock_worship') || '[]');
    if (method === 'GET') return worship;
  }

  if (cleanPath === '/articles') {
    const articles = JSON.parse(localStorage.getItem('mock_articles') || '[]');
    if (method === 'GET') return articles;
  }

  if (cleanPath === '/streaks') {
    return { streak: 5, bibleStreak: 3 };
  }

  if (cleanPath === '/history') {
    const history = JSON.parse(localStorage.getItem('mock_history') || '[]');
    if (method === 'GET') return history;
    if (method === 'POST') {
      const newHistory = {
        id: Date.now().toString(),
        type: body.type,
        detail: body.detail,
        created_at: new Date().toISOString()
      };
      history.unshift(newHistory);
      localStorage.setItem('mock_history', JSON.stringify(history));
      return { message: 'History recorded' };
    }
  }

  if (cleanPath === '/members') {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    return users.map(u => ({ id: u.id, name: u.name, phone: u.phone, created_at: u.created_at }));
  }
  if (cleanPath.startsWith('/members/')) {
    const id = cleanPath.split('/')[2];
    let users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    if (method === 'DELETE') {
      users = users.filter(u => u.id !== id);
      localStorage.setItem('mock_users', JSON.stringify(users));
      return { message: 'Member deleted' };
    }
  }

  return [];
}

async function api(method, path, body, isFormData = false) {
  initMockData();
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  try {
    const res = await fetch(`/api${path}`, {
      method, headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : null)
    });
    if (res.status === 404) {
      return await handleMockAPI(method, path, body);
    }
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    if (path.includes('/auth/') || (err.status && err.status !== 404)) {
      throw err;
    }
    console.warn("Backend request failed, falling back to client-side localStorage database:", err);
    return await handleMockAPI(method, path, body);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function getGreeting() {
  const h = new Date().getHours();
  const en = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const ta = h < 12 ? 'காலை வணக்கம்' : h < 17 ? 'மதிய வணக்கம்' : 'மாலை வணக்கம்';
  return currentLang === 'ta' ? ta : en;
}
function setError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('visible', !!msg);
}
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const span = btn.querySelector('span');
  const spinner = btn.querySelector('.btn-spinner');
  if (span) span.style.opacity = loading ? '0' : '1';
  if (spinner) spinner.classList.toggle('hidden', !loading);
  btn.disabled = loading;
}
function setBtnLoading(btn, loading) {
  const span = btn.querySelector('span');
  const spinner = btn.querySelector('.btn-spinner');
  if (span) span.style.opacity = loading ? '0' : '1';
  if (spinner) spinner.classList.toggle('hidden', !loading);
  btn.disabled = loading;
}

function applyTheme() {
  document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
}
function applyLang() {
  // Update nav labels
  const navMap = { home: 'home', videos: 'videos', audio: 'audio', events: 'events', bible: 'bible', prayer: 'prayer', devotional: 'devotional', worship: 'worship', journal: 'journal', articles: 'articles', quiz: 'quiz', history: 'history', announce: 'announce' };
  document.querySelectorAll('[data-section]').forEach(el => {
    const key = el.dataset.section;
    if (T[currentLang][key]) el.innerHTML = el.innerHTML.replace(/[^\s🏠🎬🎵📅📖🙏✝️📔🎤📰🧠📜📢]+$/, t(key));
  });
}

// ─── Welcome Page ────────────────────────────────────
function initWelcome() {
  // Particle canvas animation
  createParticles();

  // Verse ticker
  const ticker = document.getElementById('verse-ticker');
  const defaultVerses = [
    '"The Lord is my shepherd; I shall not want." — Psalm 23:1',
    '"I can do all things through Christ who strengthens me." — Philippians 4:13',
    '"For God so loved the world..." — John 3:16'
  ];
  let vi = 0;
  const showVerse = () => { if (ticker) ticker.textContent = defaultVerses[vi++ % defaultVerses.length]; };
  showVerse();
  setInterval(showVerse, 5000);

  const continueTrigger = document.getElementById('welcome-continue-trigger');
  if (continueTrigger) {
    continueTrigger.addEventListener('click', () => showPage('login-select'));
  } else {
    document.getElementById('btn-get-started').addEventListener('click', () => showPage('login-select'));
  }
}

function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:absolute;color:rgba(200,153,26,${Math.random() * 0.3 + 0.05});font-size:${Math.random() * 14 + 8}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation:float-particle ${Math.random() * 15 + 10}s ease-in-out ${Math.random() * 5}s infinite alternate;pointer-events:none;`;
    p.textContent = ['✝', '☩', '✞', '✟'][Math.floor(Math.random() * 4)];
    container.appendChild(p);
  }
  if (!document.getElementById('particle-style')) {
    const style = document.createElement('style');
    style.id = 'particle-style';
    style.textContent = `@keyframes float-particle{0%{transform:translateY(0) rotate(0deg);opacity:.1}100%{transform:translateY(-40px) rotate(20deg);opacity:.4}}`;
    document.head.appendChild(style);
  }
}

// ─── Login Select Page ───────────────────────────────
function initLoginSelect() {
  document.getElementById('btn-back-from-select').addEventListener('click', () => showPage('welcome'));
  document.getElementById('btn-select-member').addEventListener('click', () => showPage('member-login'));
  document.getElementById('btn-select-admin').addEventListener('click', () => showPage('admin-login'));
}

// ─── Member Login/Register Page ──────────────────────
function initMemberLogin() {
  document.getElementById('btn-back-from-member').addEventListener('click', () => showPage('login-select'));

  // Tab switching
  document.getElementById('tab-login').addEventListener('click', () => switchMemberTab('login'));
  document.getElementById('tab-register').addEventListener('click', () => switchMemberTab('register'));
  document.getElementById('switch-to-register').addEventListener('click', (e) => { e.preventDefault(); switchMemberTab('register'); });
  document.getElementById('switch-to-login').addEventListener('click', (e) => { e.preventDefault(); switchMemberTab('login'); });

  // Password toggles
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  });

  // Login form
  document.getElementById('member-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('login-name').value.trim();
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value;
    setError('member-login-error', '');
    setLoading('btn-member-login', true);
    try {
      const data = await api('POST', '/auth/member/login', { name, phone, password });
      onLoginSuccess(data);
      showToast(data.message || `Welcome back, ${data.name}! 🙏`, 'success');
    } catch (err) {
      setError('member-login-error', err.message);
    } finally { setLoading('btn-member-login', false); }
  });

  // Register form
  document.getElementById('member-register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    setError('member-register-error', '');
    setLoading('btn-member-register', true);
    try {
      const data = await api('POST', '/auth/member/register', { name, phone, password });
      onLoginSuccess(data);
      showToast('Welcome to St Antony Church! God bless you! ✝️', 'success');
    } catch (err) {
      setError('member-register-error', err.message);
    } finally { setLoading('btn-member-register', false); }
  });
}

function switchMemberTab(tab) {
  document.getElementById('member-login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('member-register-form').classList.toggle('hidden', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('member-form-subtitle').textContent = tab === 'login' ? 'Login to your account' : 'Create a new account';
}

// ─── Admin Login Page ────────────────────────────────
function initAdminLogin() {
  document.getElementById('btn-back-from-admin').addEventListener('click', () => showPage('login-select'));
  document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('admin-name').value.trim();
    const password = document.getElementById('admin-password').value;
    setError('admin-login-error', '');
    setLoading('btn-admin-login', true);
    try {
      const data = await api('POST', '/auth/admin/login', { name, password });
      onLoginSuccess(data);
      showToast(`Welcome, Admin ${data.name}! ⚙️`, 'success');
    } catch (err) {
      setError('admin-login-error', err.message);
    } finally { setLoading('btn-admin-login', false); }
  });
}

// ─── Auth Success ────────────────────────────────────
function onLoginSuccess(data) {
  currentUser = data;
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
  if (data.role === 'admin') {
    showPage('admin-panel');
    initAdminPanel();
  } else {
    showPage('member-portal');
    initMemberPortal();
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (countdownInterval) clearInterval(countdownInterval);
  showPage('login-select');
  showToast('Logged out. God bless you! ✝️', 'info');
}

// ═══════════════════════════════════════════════════════
//  MEMBER PORTAL
// ═══════════════════════════════════════════════════════
function initMemberPortal() {
  const user = currentUser;
  document.getElementById('member-display-name').textContent = user.name;
  const heroName = document.getElementById('hero-member-name');
  if (heroName) heroName.textContent = user.name;

  document.getElementById('btn-member-logout').addEventListener('click', logout);
  const mobileLogout = document.getElementById('btn-member-logout-mobile');
  if (mobileLogout) mobileLogout.addEventListener('click', logout);

  const hamburger = document.getElementById('nav-hamburger');
  const sidebar = document.getElementById('member-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('visible');
  }
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
  }

  if (hamburger) hamburger.addEventListener('click', () => {
    sidebar && sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  document.querySelectorAll('.member-nav-link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchMemberSection(link.dataset.section);
      closeSidebar();
    });
  });

  document.querySelectorAll('.see-all-link').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); switchMemberSection(link.dataset.section); });
  });

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme();
    themeBtn.textContent = isDark ? '🌙' : '☀️';
  });
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLang();
    const active = document.querySelector('.portal-section.active');
    if (active) {
      const sec = active.id.replace('section-', '');
      loadSection(sec);
    }
  });
  const offlineBtn = document.getElementById('offline-cache-btn');
  if (offlineBtn) offlineBtn.addEventListener('click', () => window.cacheForOffline && window.cacheForOffline());

  switchMemberSection('home');
}

function switchMemberSection(section) {
  document.querySelectorAll('.portal-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.member-nav-link').forEach(l => l.classList.remove('active'));
  const el = document.getElementById(`section-${section}`);
  if (el) el.classList.add('active');
  document.querySelectorAll(`.member-nav-link[data-section="${section}"]`).forEach(l => l.classList.add('active'));
  loadSection(section);
}

async function loadSection(section) {
  const loaders = {
    home: loadHome,
    videos: loadVideos,
    audio: loadAudio,
    events: loadEvents,
    'event-galleries': loadEventGalleries,
    bible: loadBible,
    prayer: loadPrayer,
    devotional: loadDevotionals,
    worship: loadWorship,
    journal: loadJournal,
    articles: loadArticles,
    quiz: loadQuiz,
    history: loadHistory,
    announce: loadAnnouncements,
  };
  if (loaders[section]) await loaders[section]();
  else if (window.ExtendedFeatures && window.ExtendedFeatures[section]) await window.ExtendedFeatures[section]();
}

// ── Home ─────────────────────────────────────────────
async function loadHome() {
  const sec = document.getElementById('section-home');
  if (!document.getElementById('member-greeting')) {
    sec.innerHTML = `
      <div class="member-hero">
        <div class="member-hero-overlay"></div>
        <div class="member-hero-content">
          <p class="member-hero-greeting" id="member-greeting">${getGreeting()}, ✝</p>
          <h1 class="member-hero-title">Welcome Back,<br><span id="hero-member-name">${currentUser?.name || 'Faithful One'}</span></h1>
          <p class="member-hero-verse" id="hero-daily-verse">Loading verse...</p>
        </div>
      </div>
      <div class="home-section-block">
        <div class="section-label">🏆 Today's Challenge</div>
        <div id="home-challenge" class="feature-card"></div>
      </div>
      <div class="home-section-block">
        <div class="section-label">📅 ${t('nextEvent')}</div>
        <div class="event-countdown-card" id="home-next-event"><div class="countdown-no-event">${t('noEvents')}</div></div>
      </div>
      <div class="home-quick-stats" id="home-stats">
        <div class="quick-stat-card"><div class="qs-icon">🎬</div><div class="qs-num" id="stat-videos">0</div><div class="qs-label">Sermons</div></div>
        <div class="quick-stat-card"><div class="qs-icon">🎵</div><div class="qs-num" id="stat-audio">0</div><div class="qs-label">Audio</div></div>
        <div class="quick-stat-card"><div class="qs-icon">📅</div><div class="qs-num" id="stat-events">0</div><div class="qs-label">Events</div></div>
        <div class="quick-stat-card"><div class="qs-icon">📖</div><div class="qs-num" id="stat-verses">0</div><div class="qs-label">Verses</div></div>
      </div>
      <div class="home-section-block">
        <div class="section-label-row"><div class="section-label">🎬 ${t('latestSermons')}</div><a href="#" class="see-all-link member-nav-link" data-section="videos">See All →</a></div>
        <div class="content-grid" id="home-videos-grid"></div>
      </div>
      <div class="home-section-block">
        <div class="section-label-row"><div class="section-label">🎵 ${t('latestAudio')}</div><a href="#" class="see-all-link member-nav-link" data-section="audio">See All →</a></div>
        <div class="audio-list" id="home-audio-list"></div>
      </div>
      <div class="home-quick-nav">
        <button class="qa-btn" onclick="switchMemberSection('devotional')">✝️ Devotionals</button>
        <button class="qa-btn" onclick="switchMemberSection('prayer')">🙏 Prayer</button>
        <button class="qa-btn" onclick="switchMemberSection('ai-chat')">🤖 AI Chat</button>
        <button class="qa-btn" onclick="switchMemberSection('challenges')">🏆 Challenges</button>
      </div>`;
  }
  document.getElementById('member-greeting').textContent = getGreeting() + ', ✝';
  const [videos, audio, events, verses] = await Promise.all([
    api('GET', '/videos'), api('GET', '/audio'), api('GET', '/events'), api('GET', '/verses')
  ]);
  // Stats
  document.getElementById('stat-videos').textContent = videos.length;
  document.getElementById('stat-audio').textContent = audio.length;
  document.getElementById('stat-events').textContent = events.length;
  document.getElementById('stat-verses').textContent = verses.length;
  // Random verse of the day
  try {
    const vod = await api('GET', '/platform/verse-of-day');
    if (vod && vod.verse) {
      const verseText = currentLang === 'ta' && vod.verse_tamil ? vod.verse_tamil : vod.verse;
      document.getElementById('hero-daily-verse').textContent = `"${verseText}" — ${vod.reference}`;
    }
  } catch (_) { }
  if (verses.length && document.getElementById('hero-daily-verse').textContent === 'Loading verse...') {
    const v = verses[Math.floor(Math.random() * verses.length)];
    const verseText = currentLang === 'ta' && v.verse_tamil ? v.verse_tamil : v.verse;
    document.getElementById('hero-daily-verse').textContent = `"${verseText}" — ${v.reference}`;
  }
  try {
    const challenges = await api('GET', '/platform/challenges');
    const hc = document.getElementById('home-challenge');
    if (hc && challenges.length) hc.innerHTML = `<strong>${challenges[0].title}</strong><p>${challenges[0].description}</p><button class="btn-feature small" onclick="switchMemberSection('challenges')">View Challenges →</button>`;
  } catch (_) { }
  // Next event countdown
  renderNextEventCountdown(events);
  // Latest 3 videos
  renderHomeVideos(videos.slice(0, 3));
  // Latest 3 audio
  renderHomeAudio(audio.slice(0, 3));
}

function renderNextEventCountdown(events) {
  const container = document.getElementById('home-next-event');
  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  if (!upcoming.length) { container.innerHTML = `<div class="countdown-no-event">${t('noEvents')}</div>`; return; }
  const ev = upcoming[0];
  const evDate = new Date(`${ev.event_date}T${ev.event_time || '00:00'}`);
  const dayMonth = evDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  container.innerHTML = `
    <div>
      <div class="countdown-event-name">📅 ${ev.title}</div>
      <div class="countdown-meta">${dayMonth}${ev.event_time ? ' · ' + ev.event_time : ''}${ev.location ? ' · ' + ev.location : ''}</div>
      <div class="countdown-timer">
        <div class="countdown-unit"><span class="countdown-num" id="cd-days">--</span><div class="countdown-label">Days</div></div>
        <div class="countdown-unit"><span class="countdown-num" id="cd-hrs">--</span><div class="countdown-label">Hours</div></div>
        <div class="countdown-unit"><span class="countdown-num" id="cd-min">--</span><div class="countdown-label">Mins</div></div>
        <div class="countdown-unit"><span class="countdown-num" id="cd-sec">--</span><div class="countdown-label">Secs</div></div>
      </div>
    </div>`;
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const diff = evDate - Date.now();
    if (diff <= 0) { clearInterval(countdownInterval); return; }
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    if (document.getElementById('cd-days')) {
      document.getElementById('cd-days').textContent = pad(d);
      document.getElementById('cd-hrs').textContent = pad(h);
      document.getElementById('cd-min').textContent = pad(m);
      document.getElementById('cd-sec').textContent = pad(s);
    }
  }, 1000);
}

function renderHomeVideos(videos) {
  const grid = document.getElementById('home-videos-grid');
  if (!videos.length) { grid.innerHTML = '<div class="empty-state">No videos yet. Check back soon!</div>'; return; }
  grid.innerHTML = videos.map(v => videoCardHTML(v)).join('');
  grid.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => openVideo(card.dataset.id, videos));
  });
}

function renderHomeAudio(audios) {
  const list = document.getElementById('home-audio-list');
  if (!audios.length) { list.innerHTML = '<div class="empty-state">No audio yet.</div>'; return; }
  list.innerHTML = audios.map(a => audioCardHTML(a)).join('');
}

// ── Videos ───────────────────────────────────────────
async function loadVideos() {
  const sec = document.getElementById('section-videos');
  if (!document.getElementById('videos-grid')) {
    sec.innerHTML = `<div class="section-header"><h2>🎬 ${t('sermonVideos')}</h2><p>Watch and grow in faith</p></div><div class="content-grid" id="videos-grid"><div class="loading-state">Loading...</div></div>`;
  }
  const grid = document.getElementById('videos-grid');
  grid.innerHTML = '<div class="loading-state">Loading videos...</div>';
  try {
    const videos = await api('GET', '/videos');
    if (!videos.length) { grid.innerHTML = '<div class="empty-state">No sermon videos yet. Check back soon! 🙏</div>'; return; }
    grid.innerHTML = videos.map(v => videoCardHTML(v)).join('');
    grid.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', () => openVideo(card.dataset.id, videos));
    });
  } catch (err) { grid.innerHTML = `<div class="empty-state">${err.message}</div>`; }
}

function videoCardHTML(v) {
  const isYT = v.url && (v.url.includes('youtube') || v.url.includes('youtu.be'));
  const thumb = isYT ? getYTThumb(v.url) : null;
  return `<div class="video-card" data-id="${v.id}">
    <div class="video-thumb">
      ${thumb ? `<img src="${thumb}" alt="${v.title}" style="width:100%;height:100%;object-fit:cover;">` : '<div class="video-thumb-bg">🎬</div>'}
      <div class="video-play-overlay"><div class="play-btn-icon">▶</div></div>
    </div>
    <div class="video-card-body">
      <div class="video-category">${v.category || 'Sermon'}</div>
      <div class="video-card-title">${v.title}</div>
      <div class="video-card-meta"><span>👤 ${v.uploaded_by || 'Admin'}</span><span>· ${timeAgo(v.created_at)}</span></div>
    </div>
  </div>`;
}

function getYTThumb(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function getYTEmbed(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
}

function openVideo(id, videos) {
  const v = (videos || []).find(x => String(x.id) === String(id)) || { title: 'Video', description: '' };
  const modal = document.getElementById('video-modal');
  const player = document.getElementById('video-modal-player');
  document.getElementById('video-modal-title').textContent = v.title;
  document.getElementById('video-modal-desc').textContent = v.description || '';

  if (v.url) {
    const embed = getYTEmbed(v.url);
    if (embed) {
      player.innerHTML = `<iframe src="${embed}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
    } else {
      player.innerHTML = `<video controls autoplay src="${resolveUrl(v.url)}"></video>`;
    }
  } else if (v.filename) {
    player.innerHTML = `<video controls autoplay src="${resolveUrl(v.filename)}"></video>`;
  }

  modal.classList.remove('hidden');
  logHistory('watched', 'video', v.id, v.title);
}

// ── Audio ─────────────────────────────────────────────
async function loadAudio() {
  const sec = document.getElementById('section-audio');
  if (!document.getElementById('audio-list')) {
    sec.innerHTML = `<div class="section-header"><h2>🎵 ${t('audioDevotionals')}</h2><p>Listen to sermons and devotionals</p></div><div class="audio-list full-audio-list" id="audio-list"><div class="loading-state">Loading...</div></div>`;
  }
  const list = document.getElementById('audio-list');
  list.innerHTML = '<div class="loading-state">Loading audio...</div>';
  try {
    const audios = await api('GET', '/audio');
    if (!audios.length) { list.innerHTML = '<div class="empty-state">No audio devotionals yet. 🎵</div>'; return; }
    list.innerHTML = audios.map(a => audioCardHTML(a)).join('');
  } catch (err) { list.innerHTML = `<div class="empty-state">${err.message}</div>`; }
}

function audioCardHTML(a) {
  return `<div class="audio-card">
    <div class="audio-card-icon">🎵</div>
    <div class="audio-card-info" style="flex:1;">
      <div class="audio-card-title">${a.title}</div>
      <div class="audio-card-pastor">🎤 ${a.pastor || 'Unknown'} · ${timeAgo(a.created_at)}</div>
      ${a.filename ? `<div class="audio-player-wrapper" style="margin-top:0.5rem;"><audio controls src="${resolveUrl(a.filename)}" onplay="logHistory('listened','audio',${a.id},'${a.title.replace(/'/g, "\\'")}')"></audio></div>` : ''}
    </div>
  </div>`;
}

// ── Events ───────────────────────────────────────────
async function loadEvents() {
  const sec = document.getElementById('section-events');
  if (!document.getElementById('events-list')) {
    sec.innerHTML = `<div class="section-header"><h2>📅 ${t('churchEvents')}</h2><p>Register for upcoming events</p></div><div class="events-list" id="events-list"><div class="loading-state">Loading...</div></div>`;
  }
  const list = document.getElementById('events-list');
  list.innerHTML = '<div class="loading-state">Loading events...</div>';
  try {
    const events = await api('GET', '/events');
    if (!events.length) { list.innerHTML = '<div class="empty-state">No upcoming events. Stay tuned! 📅</div>'; return; }
    list.innerHTML = events.map(e => eventCardHTML(e)).join('');
  } catch (err) { list.innerHTML = `<div class="empty-state">${err.message}</div>`; }
}

function eventCardHTML(e) {
  const d = new Date(e.event_date);
  const day = d.getDate();
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  const isPast = d < new Date();
  const diffMs = new Date(`${e.event_date}T${e.event_time || '00:00'}`) - Date.now();
  const daysLeft = Math.ceil(diffMs / 86400000);
  const countdown = daysLeft > 0 ? `⏳ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} away` : isPast ? '✅ Completed' : '🔴 Today!';
  return `<div class="event-card">
    <div class="event-date-box"><div class="event-date-day">${day}</div><div class="event-date-month">${month}</div></div>
    <div class="event-card-body">
      <div class="event-card-title">${e.title}</div>
      <div class="event-card-meta">
        ${e.event_time ? `<span>🕐 ${e.event_time}</span>` : ''}
        ${e.location ? `<span>📍 ${e.location}</span>` : ''}
      </div>
      ${e.description ? `<div class="event-card-desc">${e.description}</div>` : ''}
      <div class="event-countdown">${countdown}</div>
      <button class="btn-feature small" style="margin-top:.75rem;" onclick="window.registerEvent(${e.id})">Register for Event</button>
    </div>
  </div>`;
}
window.registerEvent = async (id) => {
  try { const r = await api('POST', `/platform/events/${id}/register`); showToast(r.message || 'Registered!', 'success'); }
  catch (e) { showToast(e.message, 'error'); }
};

// ─── Event Galleries ────────────────────────────────────
async function loadEventGalleries() {
  const sec = document.getElementById('section-event-galleries');
  if (!document.getElementById('event-galleries-list')) {
    sec.innerHTML = `<div class="section-header"><h2>🖼️ Event Galleries</h2><p>View photos and videos from past events</p></div>
                       <div id="event-gallery-viewer" style="display:none; margin-bottom:2rem;">
                          <button class="btn-secondary" onclick="closeGalleryViewer()" style="margin-bottom:1rem;">← Back to Galleries</button>
                          <h3 id="viewer-title"></h3>
                          <div id="viewer-media-grid" class="content-grid feature-grid"></div>
                       </div>
                       <div class="content-grid feature-grid" id="event-galleries-list"><div class="loading-state">Loading...</div></div>`;
  }
  document.getElementById('event-gallery-viewer').style.display = 'none';
  document.getElementById('event-galleries-list').style.display = 'grid';

  const list = document.getElementById('event-galleries-list');
  try {
    const galleries = await api('GET', '/platform/event-galleries');
    if (galleries.length === 0) {
      list.innerHTML = `<div class="empty-state">No galleries available.</div>`;
      return;
    }
    list.innerHTML = galleries.map(g => `
        <div class="card card-hover" onclick="openGallery(${g.id}, '${g.title.replace(/'/g, "\\'")}')" style="cursor:pointer; text-align:center;">
          <div style="font-size:3rem; margin-bottom:1rem;">📁</div>
          <h3>${g.title}</h3>
          <p class="meta">${g.event_date || ''}</p>
        </div>
      `).join('');
    if (window.applyLang) window.applyLang();
  } catch (e) { list.innerHTML = `<div class="error-state">${e.message}</div>`; }
}

window.openGallery = async (id, title) => {
  document.getElementById('event-galleries-list').style.display = 'none';
  const viewer = document.getElementById('event-gallery-viewer');
  viewer.style.display = 'block';
  document.getElementById('viewer-title').innerText = title;
  const grid = document.getElementById('viewer-media-grid');
  grid.innerHTML = '<div class="loading-state">Loading media...</div>';
  try {
    const media = await api('GET', `/platform/event-galleries/${id}/media`);
    if (media.length === 0) {
      grid.innerHTML = '<div class="empty-state">No media in this gallery.</div>';
      return;
    }
    grid.innerHTML = media.map(m => {
      if (m.media_type === 'video') {
        return `<div class="card" style="padding:0; overflow:hidden; position:relative;">
                    <video src="${m.url}" controls style="width:100%; height:200px; object-fit:cover; background:#000;" onplay="viewGalleryMedia(${m.id}, null)"></video>
                    <button style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.5); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;" onclick="likeGalleryMedia(${m.id})">❤️ Like</button>
                  </div>`;
      } else {
        return `<div class="card" style="padding:0; overflow:hidden; position:relative;">
                    <img src="${m.url}" style="width:100%; height:200px; object-fit:cover; cursor:pointer;" onclick="viewGalleryMedia(${m.id}, '${m.url}')">
                    <button style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.5); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;" onclick="likeGalleryMedia(${m.id})">❤️ Like</button>
                  </div>`;
      }
    }).join('');
  } catch (e) { grid.innerHTML = `<div class="error-state">${e.message}</div>`; }
};

window.viewGalleryMedia = async (id, url) => {
  try { await api('POST', `/platform/event-galleries/media/${id}/view`); } catch (e) { }
  if (url) window.open(url, '_blank');
};

window.likeGalleryMedia = async (id) => {
  try {
    await api('POST', `/platform/event-galleries/media/${id}/like`);
    showToast('Liked!', 'success');
  } catch (e) { showToast(e.message, 'error'); }
};

window.closeGalleryViewer = () => {
  document.getElementById('event-gallery-viewer').style.display = 'none';
  document.getElementById('event-galleries-list').style.display = 'grid';
};

// ── Bible ─────────────────────────────────────────────
async function loadBible() {
  const sec = document.getElementById('section-bible');
  if (!document.getElementById('verses-grid')) {
    sec.innerHTML = `<div class="section-header"><h2>📖 ${t('bibleVerses')}</h2><p>Daily wisdom from God's Word ${currentLang === 'ta' ? '(Tamil available)' : ''}</p></div><div class="verses-grid" id="verses-grid"><div class="loading-state">Loading...</div></div>`;
  }
  const grid = document.getElementById('verses-grid');
  grid.innerHTML = '<div class="loading-state">Loading verses...</div>';
  try {
    const verses = await api('GET', '/verses');
    if (!verses.length) { grid.innerHTML = '<div class="empty-state">No verses yet. 📖</div>'; return; }
    grid.innerHTML = verses.map(v => {
      const text = currentLang === 'ta' && v.verse_tamil ? v.verse_tamil : v.verse;
      return `<div class="verse-card" onclick="logHistory('read','verse',${v.id},'${v.reference.replace(/'/g, "\\'")}')">
        <div class="verse-text">${text}</div>
        <div class="verse-reference">— ${v.reference}</div>
      </div>`;
    }).join('');
  } catch (err) { grid.innerHTML = `<div class="empty-state">${err.message}</div>`; }
}

// ── Prayer ───────────────────────────────────────────
async function loadPrayer() {
  const section = document.getElementById('section-prayer');
  if (!section) return;
  // Render layout if not yet
  if (!document.getElementById('prayer-requests-list')) {
    section.innerHTML = `
      <div class="section-header">
        <h2>🙏 ${t('prayerReq')}</h2>
        <p>Submit your requests and pray for one another</p>
      </div>
      <div style="padding:0 2rem 1rem;">
        <!-- Streak Tracker -->
        <div class="streak-bar">
          <div class="streak-item">
            <div class="streak-icon">🙏</div>
            <div class="streak-count" id="prayer-streak-count">0</div>
            <div class="streak-label">${t('prayerStreak')}</div>
          </div>
          <button class="streak-btn" id="mark-prayed-btn">${t('markPrayed')}</button>
        </div>
        <!-- Submit Form -->
        <div class="prayer-form-card">
          <h3 style="margin-bottom:1rem;font-size:1rem;">Submit a Prayer Request</h3>
          <div class="form-group">
            <select id="prayer-category" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:.7rem 1rem;color:var(--text);font-size:.9rem;">
              <option value="General">General</option>
              <option value="Healing">Healing</option>
              <option value="Family">Family</option>
              <option value="Work">Work / Career</option>
              <option value="Finance">Finance</option>
              <option value="Relationships">Relationships</option>
              <option value="Guidance">Guidance</option>
            </select>
          </div>
          <div class="form-group">
            <textarea id="prayer-text" placeholder="Share your prayer request..." rows="4" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:.75rem 1rem;color:var(--text);font-size:.9rem;resize:vertical;"></textarea>
          </div>
          <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem;">
            <label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;color:var(--text-muted);cursor:pointer;">
              <input type="checkbox" id="prayer-anon"> ${t('anonymous')}
            </label>
            <label style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;color:#e74c3c;cursor:pointer;">
              <input type="checkbox" id="prayer-emergency"> 🚨 ${t('emergency')}
            </label>
          </div>
          <button id="submit-prayer-btn" class="btn-auth-submit" style="max-width:200px;">
            <span>${t('submitPrayer')}</span><div class="btn-spinner hidden"></div>
          </button>
        </div>
        <!-- Prayer Requests List -->
        <div style="margin-top:1.5rem;">
          <div class="section-label" style="margin-bottom:1rem;">Community Prayer Requests</div>
          <div id="prayer-requests-list"><div class="loading-state">Loading...</div></div>
        </div>
      </div>`;
    // Events
    document.getElementById('mark-prayed-btn').addEventListener('click', async () => {
      try {
        const res = await api('POST', '/streaks/update', { member_id: currentUser.id, type: 'prayer' });
        document.getElementById('prayer-streak-count').textContent = res.streak;
        showToast(res.streak > 1 ? `🔥 ${res.streak} day prayer streak!` : '🙏 Prayer logged for today!', 'success');
      } catch (e) { showToast(e.message, 'error'); }
    });
    document.getElementById('submit-prayer-btn').addEventListener('click', async () => {
      const request = document.getElementById('prayer-text').value.trim();
      const category = document.getElementById('prayer-category').value;
      const is_anonymous = document.getElementById('prayer-anon').checked;
      const is_emergency = document.getElementById('prayer-emergency').checked;
      if (!request) { showToast('Please enter your prayer request.', 'error'); return; }
      const btn = document.getElementById('submit-prayer-btn');
      setBtnLoading(btn, true);
      try {
        const res = await api('POST', '/prayer', { request, category, is_anonymous, is_emergency });
        showToast(res.message, 'success');
        document.getElementById('prayer-text').value = '';
        fetchPrayerRequests();
      } catch (e) { showToast(e.message, 'error'); }
      finally { setBtnLoading(btn, false); }
    });
  }
  // Load streak
  try {
    const s = await api('GET', `/streaks/${currentUser.id}`);
    const el = document.getElementById('prayer-streak-count');
    if (el) el.textContent = s.prayer_streak || 0;
  } catch (_) { }
  fetchPrayerRequests();
}

async function fetchPrayerRequests() {
  const list = document.getElementById('prayer-requests-list');
  if (!list) return;
  try {
    const items = await api('GET', '/prayer');
    if (!items.length) { list.innerHTML = '<div class="empty-state">No prayer requests yet. Be the first to share! 🙏</div>'; return; }
    list.innerHTML = items.map(p => `
      <div class="prayer-card ${p.is_emergency ? 'prayer-emergency' : ''}">
        <div class="prayer-card-header">
          <span class="prayer-name">${p.is_anonymous ? '🙏 Anonymous' : `🙏 ${p.member_name}`}</span>
          <span class="prayer-category-badge">${p.category}</span>
          ${p.is_emergency ? '<span class="prayer-emergency-badge">🚨 Emergency</span>' : ''}
          ${p.is_answered ? '<span class="prayer-answered-badge">✅ Answered</span>' : ''}
        </div>
        <div class="prayer-text">${p.request}</div>
        ${p.is_answered && p.answered_testimony ? `<div class="prayer-testimony">🎉 Testimony: ${p.answered_testimony}</div>` : ''}
        <div class="prayer-meta">${timeAgo(p.created_at)}</div>
      </div>`).join('');
  } catch (e) { if (list) list.innerHTML = `<div class="empty-state">${e.message}</div>`; }
}

// ── Devotionals ───────────────────────────────────────
async function loadDevotionals() {
  const section = document.getElementById('section-devotional');
  if (!section) return;
  if (!document.getElementById('devotionals-list')) {
    section.innerHTML = `
      <div class="section-header">
        <h2>✝️ ${t('devotional')}</h2>
        <p>Daily spiritual nourishment for your soul</p>
      </div>
      <div style="padding:0 2rem 1.5rem;">
        <div class="streak-bar">
          <div class="streak-item"><div class="streak-icon">✝️</div><div class="streak-count" id="dev-streak-count">0</div><div class="streak-label">${t('devStreak')}</div></div>
          <button class="streak-btn" id="mark-dev-btn">${t('markDev')}</button>
        </div>
        <div id="devotionals-list" class="devotionals-grid"><div class="loading-state">Loading...</div></div>
      </div>`;
    document.getElementById('mark-dev-btn').addEventListener('click', async () => {
      try {
        const res = await api('POST', '/streaks/update', { member_id: currentUser.id, type: 'devotional' });
        document.getElementById('dev-streak-count').textContent = res.streak;
        showToast(res.streak > 1 ? `🔥 ${res.streak} day devotional streak!` : '✝️ Devotional logged!', 'success');
      } catch (e) { showToast(e.message, 'error'); }
    });
  }
  try {
    const s = await api('GET', `/streaks/${currentUser.id}`);
    const el = document.getElementById('dev-streak-count');
    if (el) el.textContent = s.devotional_streak || 0;
  } catch (_) { }
  const list = document.getElementById('devotionals-list');
  try {
    const devs = await api('GET', '/devotionals');
    if (!devs.length) { list.innerHTML = '<div class="empty-state">No devotionals yet. ✝️</div>'; return; }
    list.innerHTML = devs.map(d => `
      <div class="devotional-card" onclick="openDevotional(${d.id})">
        <div class="dev-category-badge">${d.category}</div>
        <h3 class="dev-title">${d.title}</h3>
        <div class="dev-scripture">"${d.scripture}" — ${d.scripture_reference}</div>
        <p class="dev-preview">${d.content.slice(0, 150)}...</p>
        <div class="dev-author">✍️ ${d.author || 'Admin'} · ${timeAgo(d.created_at)}</div>
        <div class="dev-read-btn">Read Devotional →</div>
      </div>`).join('');
    window._devotionals = devs;
  } catch (e) { list.innerHTML = `<div class="empty-state">${e.message}</div>`; }
}

window.openDevotional = function (id) {
  const d = (window._devotionals || []).find(x => x.id === id);
  if (!d) return;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'dev-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="document.getElementById('dev-modal').remove()"></div>
    <div class="modal-content" style="max-width:680px;padding:2rem;">
      <button class="modal-close" onclick="document.getElementById('dev-modal').remove()">✕</button>
      <div class="dev-category-badge" style="margin-bottom:1rem;">${d.category}</div>
      <h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:1rem;">${d.title}</h2>
      <div class="dev-scripture-block">"${d.scripture}"<br><span style="color:var(--gold);font-size:.85rem;">— ${d.scripture_reference}</span></div>
      <div class="dev-content">${d.content.replace(/\n/g, '<br>')}</div>
      ${d.prayer ? `<div class="dev-prayer-block"><div style="font-weight:700;color:var(--gold);margin-bottom:.5rem;">🙏 Prayer</div>${d.prayer}</div>` : ''}
      <div class="dev-author" style="margin-top:1rem;">✍️ ${d.author || 'Admin'}</div>
    </div>`;
  document.body.appendChild(modal);
  logHistory('read', 'devotional', d.id, d.title);
};

// ── Worship ───────────────────────────────────────────
async function loadWorship() {
  const section = document.getElementById('section-worship');
  if (!section) return;
  if (!document.getElementById('worship-songs-list')) {
    section.innerHTML = `
      <div class="section-header">
        <h2>🎤 ${t('worshipSongs')}</h2>
        <p>Lift your voice in praise to the Lord</p>
      </div>
      <div style="padding:0 2rem 2rem;">
        <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1.5rem;">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="English">English</button>
          <button class="filter-btn" data-filter="Tamil">Tamil</button>
          <button class="filter-btn" data-filter="Hymn">Hymns</button>
          <button class="filter-btn" data-filter="Contemporary">Contemporary</button>
        </div>
        <div id="worship-songs-list" class="worship-grid"></div>
      </div>`;
    section.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterWorship(btn.dataset.filter);
      });
    });
  }
  try {
    const songs = await api('GET', '/worship');
    window._worshipSongs = songs;
    renderWorship(songs);
  } catch (e) { showToast(e.message, 'error'); }
}

function filterWorship(filter) {
  const songs = window._worshipSongs || [];
  const filtered = filter === 'all' ? songs : songs.filter(s => s.language === filter || s.category === filter);
  renderWorship(filtered);
}

function renderWorship(songs) {
  const list = document.getElementById('worship-songs-list');
  if (!list) return;
  if (!songs.length) { list.innerHTML = '<div class="empty-state">No songs yet. 🎵</div>'; return; }
  list.innerHTML = songs.map(s => `
    <div class="worship-card" onclick="openLyrics(${s.id})">
      <div class="worship-icon">🎵</div>
      <div class="worship-info">
        <div class="worship-title">${s.title}</div>
        <div class="worship-artist">🎤 ${s.artist || 'Unknown'} · ${s.language} · ${s.category}</div>
      </div>
      <div class="worship-view-btn">View Lyrics →</div>
    </div>`).join('');
}

window.openLyrics = function (id) {
  const s = (window._worshipSongs || []).find(x => x.id === id);
  if (!s) return;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'lyrics-modal';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="document.getElementById('lyrics-modal').remove()"></div>
    <div class="modal-content" style="max-width:600px;padding:2rem;">
      <button class="modal-close" onclick="document.getElementById('lyrics-modal').remove()">✕</button>
      <h2 style="font-family:'Playfair Display',serif;margin-bottom:.5rem;">${s.title}</h2>
      <p style="color:var(--gold);margin-bottom:1.5rem;">🎤 ${s.artist || 'Unknown'} · ${s.language}</p>
      <div style="white-space:pre-line;line-height:2;color:var(--text-muted);font-size:.95rem;">${s.lyrics || 'Lyrics not available.'}</div>
    </div>`;
  document.body.appendChild(modal);
  logHistory('viewed', 'worship', s.id, s.title);
};

// ── Journal ───────────────────────────────────────────
async function loadJournal() {
  const section = document.getElementById('section-journal');
  if (!section) return;
  if (!document.getElementById('journal-entries')) {
    section.innerHTML = `
      <div class="section-header">
        <h2>📔 ${t('myJournal')}</h2>
        <p>Your personal spiritual diary — private and precious</p>
      </div>
      <div style="padding:0 2rem 2rem;">
        <div class="journal-compose">
          <h3 style="margin-bottom:1rem;font-size:1rem;">✍️ New Entry</h3>
          <input type="text" id="journal-title-input" placeholder="Title (optional)" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:.75rem 1rem;color:var(--text);font-size:.9rem;margin-bottom:.75rem;">
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem;">
            ${['Grateful', 'Hopeful', 'Peaceful', 'Struggling', 'Joyful', 'Faithful'].map(m =>
      `<button class="mood-btn" data-mood="${m}">${m}</button>`).join('')}
          </div>
          <textarea id="journal-content-input" placeholder="${t('writeJournal')}" rows="5" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:.75rem 1rem;color:var(--text);font-size:.9rem;resize:vertical;margin-bottom:.75rem;"></textarea>
          <button id="save-journal-btn" class="btn-auth-submit" style="max-width:180px;">
            <span>${t('saveEntry')}</span><div class="btn-spinner hidden"></div>
          </button>
        </div>
        <div style="margin-top:2rem;">
          <div class="section-label" style="margin-bottom:1rem;">My Entries</div>
          <div id="journal-entries" class="journal-list"><div class="loading-state">Loading...</div></div>
        </div>
      </div>`;

    let selectedMood = 'Grateful';
    section.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        section.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMood = btn.dataset.mood;
      });
    });
    section.querySelector('[data-mood="Grateful"]')?.classList.add('active');

    document.getElementById('save-journal-btn').addEventListener('click', async () => {
      const title = document.getElementById('journal-title-input').value.trim();
      const content = document.getElementById('journal-content-input').value.trim();
      if (!content) { showToast('Please write something before saving.', 'error'); return; }
      const btn = document.getElementById('save-journal-btn');
      setBtnLoading(btn, true);
      try {
        await api('POST', '/journal', { member_id: currentUser.id, title, content, mood: selectedMood });
        document.getElementById('journal-title-input').value = '';
        document.getElementById('journal-content-input').value = '';
        showToast('Journal entry saved! 📔', 'success');
        fetchJournalEntries();
      } catch (e) { showToast(e.message, 'error'); }
      finally { setBtnLoading(btn, false); }
    });
  }
  fetchJournalEntries();
}

async function fetchJournalEntries() {
  const list = document.getElementById('journal-entries');
  if (!list) return;
  try {
    const entries = await api('GET', `/journal/${currentUser.id}`);
    if (!entries.length) { list.innerHTML = '<div class="empty-state">No entries yet. Start writing your faith journey! 📔</div>'; return; }
    const moodEmojis = { Grateful: '🙏', Hopeful: '🌟', Peaceful: '☮️', Struggling: '💔', Joyful: '😊', Faithful: '✝️' };
    list.innerHTML = entries.map(e => `
      <div class="journal-entry">
        <div class="journal-entry-header">
          <span class="journal-mood">${moodEmojis[e.mood] || '📝'} ${e.mood}</span>
          <span class="journal-date">${formatDate(e.created_at)}</span>
        </div>
        ${e.title ? `<div class="journal-entry-title">${e.title}</div>` : ''}
        <div class="journal-entry-content">${e.content.replace(/\n/g, '<br>')}</div>
        <button class="journal-delete-btn" onclick="deleteJournal(${e.id}, this)">🗑 Delete</button>
      </div>`).join('');
  } catch (err) { if (list) list.innerHTML = `<div class="empty-state">${err.message}</div>`; }
}

window.deleteJournal = async function (id, btn) {
  if (!confirm('Delete this journal entry?')) return;
  try {
    await api('DELETE', `/journal/${id}`);
    showToast('Entry deleted.', 'info');
    fetchJournalEntries();
  } catch (e) { showToast(e.message, 'error'); }
};

// ── Articles ──────────────────────────────────────────
async function loadArticles() {
  const section = document.getElementById('section-articles');
  if (!section) return;
  if (!document.getElementById('articles-list')) {
    section.innerHTML = `
      <div class="section-header">
        <h2>📰 ${t('christianArticles')}</h2>
        <p>Inspiring reads to strengthen your faith</p>
      </div>
      <div style="padding:0 2rem 2rem;" id="articles-list"><div class="loading-state">Loading...</div></div>`;
  }
  const list = document.getElementById('articles-list');
  try {
    const articles = await api('GET', '/articles');
    if (!articles.length) { list.innerHTML = '<div class="empty-state">No articles yet. Check back soon! 📰</div>'; return; }
    list.innerHTML = `<div class="articles-grid">${articles.map(a => `
      <div class="article-card" onclick="openArticle(${a.id})">
        <div class="article-category-badge">${a.category}</div>
        <h3 class="article-title">${a.title}</h3>
        <p class="article-preview">${a.content.slice(0, 120)}...</p>
        <div class="article-meta">✍️ ${a.author || 'Admin'} · ${timeAgo(a.created_at)}</div>
        <div class="article-read-btn">Read Article →</div>
      </div>`).join('')}</div>`;
    window._articles = articles;
  } catch (e) { list.innerHTML = `<div class="empty-state">${e.message}</div>`; }
}

window.openArticle = function (id) {
  const a = (window._articles || []).find(x => x.id === id);
  if (!a) return;
  const modal = document.createElement('div');
  modal.className = 'modal'; modal.id = 'article-modal';
  modal.innerHTML = `<div class="modal-backdrop" onclick="document.getElementById('article-modal').remove()"></div>
    <div class="modal-content" style="max-width:680px;padding:2rem;max-height:85vh;overflow-y:auto;">
      <button class="modal-close" onclick="document.getElementById('article-modal').remove()">✕</button>
      <div class="article-category-badge" style="margin-bottom:1rem;">${a.category}</div>
      <h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:.75rem;">${a.title}</h2>
      <p style="color:var(--gold);margin-bottom:1.5rem;">✍️ ${a.author || 'Admin'} · ${formatDate(a.created_at)}</p>
      <div style="line-height:1.9;color:var(--text-muted);font-size:.95rem;">${a.content.replace(/\n/g, '<br>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</div>
    </div>`;
  document.body.appendChild(modal);
  logHistory('read', 'article', a.id, a.title);
};

// ── Bible Quiz ────────────────────────────────────────
async function loadQuiz() {
  const section = document.getElementById('section-quiz');
  if (!section) return;
  section.innerHTML = `
    <div class="section-header">
      <h2>🧠 ${t('quiz')}</h2>
      <p>Test your Bible knowledge!</p>
    </div>
    <div style="padding:0 2rem 2rem;">
      <div id="quiz-start-screen" class="quiz-start">
        <div class="quiz-cross">✝</div>
        <h3>Bible Knowledge Quiz</h3>
        <p>Answer questions about the Bible and test your faith knowledge</p>
        <div class="quiz-difficulty-select">
          <label>Difficulty:</label>
          <select id="quiz-difficulty">
            <option value="all">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <button class="btn-auth-submit" style="max-width:200px;margin:0 auto;" onclick="startQuiz()">
          <span>${t('quizStart')}</span>
        </button>
      </div>
      <div id="quiz-play-screen" class="hidden">
        <div class="quiz-progress-bar-wrap">
          <div class="quiz-progress-bar-fill" id="quiz-progress-fill"></div>
        </div>
        <div class="quiz-progress-text" id="quiz-progress-text">Question 1 of 10</div>
        <div class="quiz-question-card">
          <div class="quiz-question" id="quiz-question-text"></div>
          <div class="quiz-options" id="quiz-options"></div>
        </div>
        <button class="btn-auth-submit" style="max-width:160px;margin-top:1rem;" id="quiz-next-btn" onclick="nextQuizQuestion()" disabled>
          <span>${t('quizNext')}</span>
        </button>
      </div>
      <div id="quiz-result-screen" class="hidden quiz-result">
        <div class="quiz-cross">🏆</div>
        <h3 id="quiz-result-title"></h3>
        <div class="quiz-score-display" id="quiz-score-display"></div>
        <p id="quiz-result-msg"></p>
        <button class="btn-auth-submit" style="max-width:200px;margin:1rem auto 0;" onclick="startQuiz()">
          <span>Play Again</span>
        </button>
      </div>
    </div>`;
  try {
    quizQuestions = await api('GET', '/quiz');
  } catch (e) { showToast(e.message, 'error'); }
}

window.startQuiz = async function () {
  let questions = quizQuestions;
  const diff = document.getElementById('quiz-difficulty')?.value;
  if (diff && diff !== 'all') questions = questions.filter(q => q.difficulty === diff);
  if (!questions.length) { showToast('No questions found!', 'error'); return; }
  // Shuffle and take 10
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, Math.min(10, questions.length));
  window._quizSet = shuffled;
  quizIndex = 0; quizScore = 0;
  document.getElementById('quiz-start-screen').classList.add('hidden');
  document.getElementById('quiz-result-screen').classList.add('hidden');
  document.getElementById('quiz-play-screen').classList.remove('hidden');
  showQuizQuestion();
};

function showQuizQuestion() {
  const q = window._quizSet[quizIndex];
  const total = window._quizSet.length;
  document.getElementById('quiz-progress-text').textContent = `Question ${quizIndex + 1} of ${total}`;
  document.getElementById('quiz-progress-fill').style.width = `${((quizIndex) / total) * 100}%`;
  document.getElementById('quiz-question-text').textContent = q.question;
  const opts = [
    { key: 'a', text: q.option_a }, { key: 'b', text: q.option_b },
    { key: 'c', text: q.option_c }, { key: 'd', text: q.option_d }
  ];
  document.getElementById('quiz-options').innerHTML = opts.map(o => `
    <button class="quiz-option-btn" data-key="${o.key}" onclick="selectQuizOption('${o.key}', '${q.correct_answer}', this)">
      <span class="quiz-option-key">${o.key.toUpperCase()}</span> ${o.text}
    </button>`).join('');
  document.getElementById('quiz-next-btn').disabled = true;
  document.getElementById('quiz-next-btn').querySelector('span').textContent =
    quizIndex === window._quizSet.length - 1 ? t('quizFinish') : t('quizNext');
}

window.selectQuizOption = function (selected, correct, btn) {
  if (!document.getElementById('quiz-next-btn') || !document.getElementById('quiz-next-btn').disabled) return;
  const isCorrect = selected === correct;
  if (isCorrect) quizScore++;
  document.querySelectorAll('.quiz-option-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.key === correct) b.classList.add('correct-opt');
    else if (b === btn && !isCorrect) b.classList.add('wrong-opt');
  });
  document.getElementById('quiz-next-btn').disabled = false;
  showToast(isCorrect ? `✅ ${t('correct')}` : `❌ ${t('wrong')} Correct: ${correct.toUpperCase()}`, isCorrect ? 'success' : 'error', 2000);
};

window.nextQuizQuestion = function () {
  quizIndex++;
  if (quizIndex >= window._quizSet.length) {
    showQuizResult();
  } else {
    showQuizQuestion();
  }
};

function showQuizResult() {
  document.getElementById('quiz-play-screen').classList.add('hidden');
  document.getElementById('quiz-result-screen').classList.remove('hidden');
  const total = window._quizSet.length;
  const pct = Math.round((quizScore / total) * 100);
  document.getElementById('quiz-result-title').textContent = pct >= 80 ? '🌟 Excellent!' : pct >= 60 ? '👍 Good Job!' : '📖 Keep Studying!';
  document.getElementById('quiz-score-display').textContent = `${quizScore} / ${total}`;
  document.getElementById('quiz-result-msg').textContent = pct >= 80 ? 'You know your Bible very well! Keep it up, faithful servant.' :
    pct >= 60 ? 'Good knowledge! Keep reading God\'s Word daily.' :
      'No worries! Every day is a chance to learn more about the Bible.';
}

// ── Announcements ─────────────────────────────────────
async function loadAnnouncements() {
  const section = document.getElementById('section-announce');
  if (!section) return;
  if (!document.getElementById('announce-list')) {
    section.innerHTML = `
      <div class="section-header">
        <h2>📢 ${t('announce')}</h2>
        <p>Church announcements and important notices</p>
      </div>
      <div style="padding:0 2rem 2rem;" id="announce-list"><div class="loading-state">Loading...</div></div>`;
  }
  const list = document.getElementById('announce-list');
  try {
    const items = await api('GET', '/announcements');
    if (!items.length) { list.innerHTML = '<div class="empty-state">No announcements yet. 📢</div>'; return; }
    list.innerHTML = items.map(a => `
      <div class="announce-card ${a.is_emergency ? 'announce-emergency' : ''}">
        <div class="announce-header">
          <div>
            <div class="announce-type-badge">${a.is_emergency ? '🚨 Emergency' : `📢 ${a.type}`}</div>
            <div class="announce-title">${a.title}</div>
          </div>
          <div class="announce-date">${timeAgo(a.created_at)}</div>
        </div>
        <div class="announce-content">${a.content}</div>
      </div>`).join('');
  } catch (e) { list.innerHTML = `<div class="empty-state">${e.message}</div>`; }
}

// ── History ───────────────────────────────────────────
async function loadHistory() {
  const section = document.getElementById('section-history');
  if (!section) return;
  if (!document.getElementById('history-list-inner')) {
    section.innerHTML = `
      <div class="section-header">
        <h2>📜 ${t('activityHistory')}</h2>
        <p>Your personal devotional journey record</p>
      </div>
      <div style="padding:0 2rem 2rem;" id="history-list-inner"><div class="loading-state">Loading...</div></div>`;
  }
  const list = document.getElementById('history-list-inner');
  try {
    const items = await api('GET', `/history/${currentUser.id}`);
    if (!items.length) { list.innerHTML = '<div class="empty-state">No activity yet. Start exploring the app! 🙏</div>'; return; }
    const icons = { video: '🎬', audio: '🎵', verse: '📖', devotional: '✝️', worship: '🎤', article: '📰' };
    list.innerHTML = items.map(h => `
      <div class="history-item">
        <div class="history-icon">${icons[h.content_type] || '📌'}</div>
        <div class="history-info">
          <div class="history-title">${h.content_title || 'Content'}</div>
          <div class="history-meta">${h.action} · ${h.content_type} · ${timeAgo(h.timestamp)}</div>
        </div>
      </div>`).join('');
  } catch (e) { list.innerHTML = `<div class="empty-state">${e.message}</div>`; }
}

// ── Log History ───────────────────────────────────────
async function logHistory(action, content_type, content_id, content_title) {
  if (!currentUser || currentUser.role !== 'member') return;
  try {
    await api('POST', '/history', { member_id: currentUser.id, action, content_type, content_id, content_title });
  } catch (_) { }
}

// ═══════════════════════════════════════════════════════
//  ADMIN PANEL
// ═══════════════════════════════════════════════════════
function initAdminPanel() {
  document.getElementById('admin-display-name').textContent = currentUser.name;
  document.getElementById('btn-admin-logout').addEventListener('click', logout);

  // Mobile sidebar
  document.getElementById('admin-menu-toggle').addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.toggle('open');
  });

  // Sidebar nav
  document.querySelectorAll('[data-admin-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchAdminSection(link.dataset.adminSection);
      document.getElementById('admin-sidebar').classList.remove('open');
    });
  });

  // Quick action buttons
  document.querySelectorAll('.qa-btn').forEach(btn => {
    btn.addEventListener('click', () => switchAdminSection(btn.dataset.adminSection));
  });

  // Upload video
  initVideoUpload();
  // Upload audio
  initAudioUpload();
  // Add event
  initAddEvent();
  // Add verse
  initAddVerse();
  // Add devotional
  initAddDevotional();
  // Add announcement
  initAddAnnouncement();
  // Add worship song
  initAddWorship();
  // Add article
  initAddArticle();
  // Add quiz question
  initAddQuiz();

  switchAdminSection('dashboard');
}

function switchAdminSection(section) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const el = document.getElementById(`admin-section-${section}`);
  if (el) el.classList.add('active');
  document.querySelectorAll(`[data-admin-section="${section}"]`).forEach(l => l.classList.add('active'));
  loadAdminSection(section);
}

async function loadAdminSection(section) {
  const loaders = {
    dashboard: loadAdminDashboard,
    'manage-videos': loadAdminVideos,
    'manage-audio': loadAdminAudio,
    'manage-events': loadAdminEvents,
    'manage-verses': loadAdminVerses,
    'manage-devotionals': loadAdminDevotionals,
    'manage-announcements': loadAdminAnnouncements,
    'manage-worship': loadAdminWorship,
    'manage-articles': loadAdminArticles,
    'manage-members': loadAdminMembers,
    'manage-prayer': loadAdminPrayer,
    'manage-quiz': loadAdminQuiz,
    'upload-podcast': loadAdminUploadPodcast,
    'manage-podcasts': loadAdminPodcasts,
    'children-stories': loadAdminChildrenStories,
    'family-groups': loadAdminFamilyGroups,
    'youth-groups': loadAdminYouthGroups,
    'playlists-choir': loadAdminPlaylistsChoir,
    'testimonies': loadAdminTestimonies,
    'faith-community': loadAdminFaithCommunity,
  };
  if (loaders[section]) await loaders[section]();
}

async function loadAdminDashboard() {
  try {
    const [videos, audio, events, verses, devs, announcements, prayer, songs, articles, members] = await Promise.all([
      api('GET', '/videos'), api('GET', '/audio'), api('GET', '/events'), api('GET', '/verses'),
      api('GET', '/devotionals'), api('GET', '/announcements'), api('GET', '/prayer'),
      api('GET', '/worship'), api('GET', '/articles'), api('GET', '/members')
    ]);
    document.getElementById('admin-stat-videos').textContent = videos.length;
    document.getElementById('admin-stat-audio').textContent = audio.length;
    document.getElementById('admin-stat-events').textContent = events.length;
    document.getElementById('admin-stat-verses').textContent = verses.length;
    document.getElementById('admin-stat-members').textContent = members.length;
    if (document.getElementById('admin-stat-devs')) document.getElementById('admin-stat-devs').textContent = devs.length;
    if (document.getElementById('admin-stat-prayer')) document.getElementById('admin-stat-prayer').textContent = prayer.length;
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Video Upload ──────────────────────────────────────
function initVideoUpload() {
  const fileTab = document.getElementById('video-tab-file');
  const urlTab = document.getElementById('video-tab-url');
  const fileArea = document.getElementById('video-file-area');
  const urlArea = document.getElementById('video-url-area');
  if (!fileTab) return;
  fileTab.addEventListener('click', () => { fileTab.classList.add('active'); urlTab.classList.remove('active'); fileArea.classList.remove('hidden'); urlArea.classList.add('hidden'); });
  urlTab.addEventListener('click', () => { urlTab.classList.add('active'); fileTab.classList.remove('active'); urlArea.classList.remove('hidden'); fileArea.classList.add('hidden'); });
  document.getElementById('video-file').addEventListener('change', (e) => {
    const f = e.target.files[0];
    const info = document.getElementById('video-file-info');
    if (f) { info.textContent = `📁 ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`; info.classList.remove('hidden'); }
  });
  document.getElementById('upload-video-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('video-title').value.trim();
    const description = document.getElementById('video-desc').value.trim();
    const category = document.getElementById('video-category').value;
    const url = document.getElementById('video-url').value.trim();
    const file = document.getElementById('video-file').files[0];
    const isFileMode = !urlArea.classList.contains('hidden') === false;
    if (!title) { showMsg('upload-video-msg', 'Title is required.', 'error'); return; }
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      if (file && isFileMode) {
        const fd = new FormData();
        fd.append('title', title); fd.append('description', description); fd.append('category', category);
        fd.append('video', file);
        const prog = document.getElementById('video-upload-progress');
        prog.classList.remove('hidden');
        await uploadWithProgress('/api/videos', fd, 'video-progress-fill', 'video-progress-text');
        prog.classList.add('hidden');
      } else if (url) {
        await api('POST', '/videos', { title, description, category, url });
      } else { showMsg('upload-video-msg', 'Upload a file or provide a URL.', 'error'); return; }
      showMsg('upload-video-msg', '✅ Video uploaded successfully!', 'success');
      e.target.reset();
      document.getElementById('video-file-info').classList.add('hidden');
    } catch (err) { showMsg('upload-video-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

async function uploadWithProgress(url, formData, fillId, textId) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        document.getElementById(fillId).style.width = pct + '%';
        document.getElementById(textId).textContent = `Uploading... ${pct}%`;
      }
    };
    xhr.onload = () => { if (xhr.status < 300) resolve(JSON.parse(xhr.responseText)); else reject(new Error(JSON.parse(xhr.responseText).error)); };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

// ── Audio Upload ──────────────────────────────────────
function initAudioUpload() {
  const el = document.getElementById('audio-file');
  if (!el) return;
  el.addEventListener('change', (e) => {
    const f = e.target.files[0];
    const info = document.getElementById('audio-file-info');
    if (f) { info.textContent = `🎵 ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`; info.classList.remove('hidden'); }
  });
  document.getElementById('upload-audio-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('audio-title').value.trim();
    const pastor = document.getElementById('audio-pastor').value.trim();
    const description = document.getElementById('audio-desc').value.trim();
    const file = document.getElementById('audio-file').files[0];
    if (!title || !file) { showMsg('upload-audio-msg', 'Title and audio file are required.', 'error'); return; }
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('pastor', pastor); fd.append('description', description);
      fd.append('audio', file);
      const prog = document.getElementById('audio-upload-progress');
      prog.classList.remove('hidden');
      await uploadWithProgress('/api/audio', fd, 'audio-progress-fill', 'audio-progress-text');
      prog.classList.add('hidden');
      showMsg('upload-audio-msg', '✅ Audio uploaded successfully!', 'success');
      e.target.reset();
      document.getElementById('audio-file-info').classList.add('hidden');
    } catch (err) { showMsg('upload-audio-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

// ── Add Event ─────────────────────────────────────────
function initAddEvent() {
  const form = document.getElementById('add-event-form');
  if (!form) return;
  // Set min date to today
  const dateInput = document.getElementById('event-date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      const eventRes = await api('POST', '/events', {
        title: document.getElementById('event-title').value.trim(),
        event_date: document.getElementById('event-date').value,
        event_time: document.getElementById('event-time').value,
        location: document.getElementById('event-location').value.trim(),
        description: document.getElementById('event-desc').value.trim()
      });

      if (document.getElementById('event-attach-notes').checked) {
        const notesTitle = document.getElementById('event-notes-title').value.trim();
        const notesContent = document.getElementById('event-notes-content').value.trim();
        const notesLang = document.getElementById('event-notes-lang').value;
        if (notesTitle) {
          await api('POST', '/platform/sermon-notes', {
            title: notesTitle,
            content: notesContent,
            language: notesLang,
            event_id: eventRes.id
          });
        }
      }

      showMsg('add-event-msg', '✅ Event added successfully!', 'success');
      form.reset();
      document.getElementById('event-notes-group').classList.add('hidden');
    } catch (err) { showMsg('add-event-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

// ── Add Verse ─────────────────────────────────────────
function initAddVerse() {
  const form = document.getElementById('add-verse-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      await api('POST', '/verses', {
        verse: document.getElementById('verse-text').value.trim(),
        reference: document.getElementById('verse-reference').value.trim(),
        verse_tamil: document.getElementById('verse-tamil')?.value?.trim() || ''
      });
      showMsg('add-verse-msg', '✅ Verse added!', 'success');
      form.reset();
    } catch (err) { showMsg('add-verse-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

// ── Add Devotional ────────────────────────────────────
function initAddDevotional() {
  const form = document.getElementById('add-devotional-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      await api('POST', '/devotionals', {
        title: document.getElementById('dev-title').value.trim(),
        content: document.getElementById('dev-content').value.trim(),
        scripture: document.getElementById('dev-scripture').value.trim(),
        scripture_reference: document.getElementById('dev-scripture-ref').value.trim(),
        prayer: document.getElementById('dev-prayer').value.trim(),
        category: document.getElementById('dev-category').value,
      });
      showMsg('add-devotional-msg', '✅ Devotional created!', 'success');
      form.reset();
    } catch (err) { showMsg('add-devotional-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

// ── Add Announcement ──────────────────────────────────
function initAddAnnouncement() {
  const form = document.getElementById('add-announcement-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      await api('POST', '/announcements', {
        title: document.getElementById('ann-title').value.trim(),
        content: document.getElementById('ann-content').value.trim(),
        type: document.getElementById('ann-type').value,
        is_emergency: document.getElementById('ann-emergency').checked
      });

      if (document.getElementById('ann-attach-bulletin').checked) {
        const bulTitle = document.getElementById('ann-bulletin-title').value.trim();
        const bulContent = document.getElementById('ann-bulletin-content').value.trim();
        const bulDate = document.getElementById('ann-bulletin-date').value;
        if (bulTitle) {
          await api('POST', '/platform/bulletins', {
            title: bulTitle,
            content: bulContent,
            week_date: bulDate
          });
        }
      }

      showMsg('add-announcement-msg', '✅ Announcement published!', 'success');
      form.reset();
      document.getElementById('ann-bulletin-group').classList.add('hidden');
    } catch (err) { showMsg('add-announcement-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

// ── Add Worship Song ──────────────────────────────────
function initAddWorship() {
  const form = document.getElementById('add-worship-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      await api('POST', '/worship', {
        title: document.getElementById('song-title').value.trim(),
        artist: document.getElementById('song-artist').value.trim(),
        lyrics: document.getElementById('song-lyrics').value.trim(),
        category: document.getElementById('song-category').value,
        language: document.getElementById('song-language').value,
      });
      showMsg('add-worship-msg', '✅ Song added!', 'success');
      form.reset();
    } catch (err) { showMsg('add-worship-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

// ── Add Article ───────────────────────────────────────
function initAddArticle() {
  const form = document.getElementById('add-article-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      await api('POST', '/articles', {
        title: document.getElementById('article-title').value.trim(),
        content: document.getElementById('article-content').value.trim(),
        author: document.getElementById('article-author').value.trim(),
        category: document.getElementById('article-category').value,
      });
      showMsg('add-article-msg', '✅ Article published!', 'success');
      form.reset();
    } catch (err) { showMsg('add-article-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

// ── Add Quiz Question ─────────────────────────────────
function initAddQuiz() {
  const form = document.getElementById('add-quiz-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      await api('POST', '/quiz', {
        question: document.getElementById('quiz-question').value.trim(),
        option_a: document.getElementById('quiz-opt-a').value.trim(),
        option_b: document.getElementById('quiz-opt-b').value.trim(),
        option_c: document.getElementById('quiz-opt-c').value.trim(),
        option_d: document.getElementById('quiz-opt-d').value.trim(),
        correct_answer: document.getElementById('quiz-correct').value,
        category: document.getElementById('quiz-cat').value,
        difficulty: document.getElementById('quiz-diff').value,
      });
      showMsg('add-quiz-msg', '✅ Question added!', 'success');
      form.reset();
    } catch (err) { showMsg('add-quiz-msg', err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });
}

// ── Admin Manage Lists ────────────────────────────────
async function loadAdminVideos() {
  const list = document.getElementById('admin-videos-list');
  if (!list) return;
  const videos = await api('GET', '/videos');
  if (!videos.length) { list.innerHTML = '<div class="empty-state">No videos uploaded yet.</div>'; return; }
  list.innerHTML = videos.map(v => `
    <div class="admin-list-item">
      <div class="ali-icon">🎬</div>
      <div class="ali-info"><div class="ali-title">${v.title}</div><div class="ali-meta">${v.category} · ${timeAgo(v.created_at)}</div></div>
      <button class="ali-delete" onclick="adminDelete('/videos/${v.id}','admin-videos-list',loadAdminVideos)">🗑 Delete</button>
    </div>`).join('');
}

async function loadAdminAudio() {
  const list = document.getElementById('admin-audio-list');
  if (!list) return;
  const audios = await api('GET', '/audio');
  if (!audios.length) { list.innerHTML = '<div class="empty-state">No audio uploaded yet.</div>'; return; }
  list.innerHTML = audios.map(a => `
    <div class="admin-list-item">
      <div class="ali-icon">🎵</div>
      <div class="ali-info"><div class="ali-title">${a.title}</div><div class="ali-meta">🎤 ${a.pastor || 'Unknown'} · ${timeAgo(a.created_at)}</div></div>
      <button class="ali-delete" onclick="adminDelete('/audio/${a.id}','admin-audio-list',loadAdminAudio)">🗑 Delete</button>
    </div>`).join('');
}

async function loadAdminEvents() {
  const list = document.getElementById('admin-events-list');
  if (!list) return;
  const events = await api('GET', '/events');
  if (!events.length) { list.innerHTML = '<div class="empty-state">No events yet.</div>'; return; }
  list.innerHTML = events.map(e => `
    <div class="admin-list-item">
      <div class="ali-icon">📅</div>
      <div class="ali-info"><div class="ali-title">${e.title}</div><div class="ali-meta">${e.event_date}${e.event_time ? ' · ' + e.event_time : ''} · ${e.location || ''}</div></div>
      <button class="ali-delete" onclick="adminDelete('/events/${e.id}','admin-events-list',loadAdminEvents)">🗑 Delete</button>
    </div>`).join('');
}

async function loadAdminVerses() {
  const list = document.getElementById('admin-verses-list');
  if (!list) return;
  const verses = await api('GET', '/verses');
  if (!verses.length) { list.innerHTML = '<div class="empty-state">No verses yet.</div>'; return; }
  list.innerHTML = verses.map(v => `
    <div class="admin-list-item">
      <div class="ali-icon">📖</div>
      <div class="ali-info"><div class="ali-title">${v.reference}</div><div class="ali-meta">${v.verse.slice(0, 80)}...</div></div>
      <button class="ali-delete" onclick="adminDelete('/verses/${v.id}','admin-verses-list',loadAdminVerses)">🗑 Delete</button>
    </div>`).join('');
}

async function loadAdminDevotionals() {
  const list = document.getElementById('admin-devotionals-list');
  if (!list) return;
  const items = await api('GET', '/devotionals');
  if (!items.length) { list.innerHTML = '<div class="empty-state">No devotionals yet.</div>'; return; }
  list.innerHTML = items.map(d => `
    <div class="admin-list-item">
      <div class="ali-icon">✝️</div>
      <div class="ali-info"><div class="ali-title">${d.title}</div><div class="ali-meta">${d.category} · ${timeAgo(d.created_at)}</div></div>
      <button class="ali-delete" onclick="adminDelete('/devotionals/${d.id}','admin-devotionals-list',loadAdminDevotionals)">🗑 Delete</button>
    </div>`).join('');
}

async function loadAdminAnnouncements() {
  const list = document.getElementById('admin-announcements-list');
  if (!list) return;
  const items = await api('GET', '/announcements');
  if (!items.length) { list.innerHTML = '<div class="empty-state">No announcements yet.</div>'; return; }
  list.innerHTML = items.map(a => `
    <div class="admin-list-item">
      <div class="ali-icon">${a.is_emergency ? '🚨' : '📢'}</div>
      <div class="ali-info"><div class="ali-title">${a.title}</div><div class="ali-meta">${a.type} · ${timeAgo(a.created_at)}</div></div>
      <button class="ali-delete" onclick="adminDelete('/announcements/${a.id}','admin-announcements-list',loadAdminAnnouncements)">🗑 Delete</button>
    </div>`).join('');
}

async function loadAdminWorship() {
  const list = document.getElementById('admin-worship-list');
  if (!list) return;
  const items = await api('GET', '/worship');
  if (!items.length) { list.innerHTML = '<div class="empty-state">No songs yet.</div>'; return; }
  list.innerHTML = items.map(s => `
    <div class="admin-list-item">
      <div class="ali-icon">🎵</div>
      <div class="ali-info"><div class="ali-title">${s.title}</div><div class="ali-meta">${s.artist || 'Unknown'} · ${s.language}</div></div>
      <button class="ali-delete" onclick="adminDelete('/worship/${s.id}','admin-worship-list',loadAdminWorship)">🗑 Delete</button>
    </div>`).join('');
}

async function loadAdminArticles() {
  const list = document.getElementById('admin-articles-list');
  if (!list) return;
  const items = await api('GET', '/articles');
  if (!items.length) { list.innerHTML = '<div class="empty-state">No articles yet.</div>'; return; }
  list.innerHTML = items.map(a => `
    <div class="admin-list-item">
      <div class="ali-icon">📰</div>
      <div class="ali-info"><div class="ali-title">${a.title}</div><div class="ali-meta">✍️ ${a.author || 'Admin'} · ${a.category}</div></div>
      <button class="ali-delete" onclick="adminDelete('/articles/${a.id}','admin-articles-list',loadAdminArticles)">🗑 Delete</button>
    </div>`).join('');
}

async function loadAdminMembers() {
  const list = document.getElementById('admin-members-list');
  if (!list) return;
  try {
    const members = await api('GET', '/members');
    if (!members.length) { list.innerHTML = '<div class="empty-state">No members registered yet.</div>'; return; }
    list.innerHTML = members.map(m => `
      <div class="admin-list-item">
        <div class="ali-icon">👤</div>
        <div class="ali-info">
          <div class="ali-title">${m.name}</div>
          <div class="ali-meta">📱 ${m.phone} · Joined ${formatDate(m.created_at)}</div>
        </div>
        <button class="ali-delete" onclick="adminDelete('/members/${m.id}','admin-members-list',loadAdminMembers)">🗑 Remove</button>
      </div>`).join('');
  } catch (e) { list.innerHTML = `<div class="empty-state">${e.message}</div>`; }
}

async function loadAdminPrayer() {
  const list = document.getElementById('admin-prayer-list');
  if (!list) return;
  const items = await api('GET', '/prayer');
  if (!items.length) { list.innerHTML = '<div class="empty-state">No prayer requests yet.</div>'; return; }
  list.innerHTML = items.map(p => `
    <div class="admin-list-item" style="flex-wrap:wrap;gap:.5rem;">
      <div class="ali-icon">${p.is_emergency ? '🚨' : '🙏'}</div>
      <div class="ali-info" style="flex:1;">
        <div class="ali-title">${p.is_anonymous ? 'Anonymous' : p.member_name} — ${p.category}</div>
        <div class="ali-meta">${p.request.slice(0, 100)}${p.request.length > 100 ? '...' : ''}</div>
        ${p.is_answered ? '<span style="color:#2ecc71;font-size:.78rem;">✅ Answered</span>' : ''}
      </div>
      <div style="display:flex;gap:.5rem;flex-shrink:0;">
        ${!p.is_answered ? `<button class="ali-delete" style="background:rgba(46,204,113,.1);border-color:rgba(46,204,113,.3);color:#2ecc71;" onclick="markPrayerAnswered(${p.id})">✅ Answered</button>` : ''}
        <button class="ali-delete" onclick="adminDelete('/prayer/${p.id}','admin-prayer-list',loadAdminPrayer)">🗑</button>
      </div>
    </div>`).join('');
}

window.markPrayerAnswered = async function (id) {
  const testimony = prompt('Enter answered prayer testimony (optional):') || '';
  try {
    await api('PATCH', `/prayer/${id}/answered`, { testimony });
    showToast('Praise God! Marked as answered! 🙏', 'success');
    loadAdminPrayer();
  } catch (e) { showToast(e.message, 'error'); }
};

async function loadAdminQuiz() {
  const list = document.getElementById('admin-quiz-list');
  if (!list) return;
  const items = await api('GET', '/quiz');
  if (!items.length) { list.innerHTML = '<div class="empty-state">No quiz questions yet.</div>'; return; }
  list.innerHTML = items.map(q => `
    <div class="admin-list-item">
      <div class="ali-icon">🧠</div>
      <div class="ali-info">
        <div class="ali-title">${q.question}</div>
        <div class="ali-meta">${q.category} · ${q.difficulty} · Correct: ${q.correct_answer.toUpperCase()}</div>
      </div>
      <button class="ali-delete" onclick="adminDelete('/quiz/${q.id}','admin-quiz-list',loadAdminQuiz)">🗑 Delete</button>
    </div>`).join('');
}

async function adminDelete(path, listId, reloader) {
  if (!confirm('Are you sure you want to delete this?')) return;
  try {
    await api('DELETE', path);
    showToast('Deleted successfully.', 'success');
    reloader();
  } catch (e) { showToast(e.message, 'error'); }
}
window.adminDelete = adminDelete;

function showMsg(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `form-message ${type}`;
  setTimeout(() => { if (el) el.className = 'form-message'; }, 5000);
}

// ── Video Modal ───────────────────────────────────────
function initVideoModal() {
  document.getElementById('video-modal-close').addEventListener('click', closeVideoModal);
  document.getElementById('video-modal-backdrop').addEventListener('click', closeVideoModal);
}
function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  modal.classList.add('hidden');
  document.getElementById('video-modal-player').innerHTML = '';
}

// ═══════════════════════════════════════════════════════
//  EXTRA CSS FOR NEW FEATURES
// ═══════════════════════════════════════════════════════
function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    [data-theme="light"] { --dark:#f0ede8;--dark-2:#e8e3da;--dark-3:#dfd8cc;--dark-card:rgba(255,255,255,0.9);--glass:rgba(0,0,0,0.04);--glass-border:rgba(139,105,20,0.2);--text:#1a1209;--text-muted:rgba(26,18,9,0.65);--text-dim:rgba(26,18,9,0.35); }
    .streak-bar{display:flex;align-items:center;justify-content:space-between;background:rgba(200,153,26,.08);border:1px solid rgba(200,153,26,.2);border-radius:var(--radius);padding:1rem 1.5rem;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;}
    .streak-item{display:flex;align-items:center;gap:.75rem;}
    .streak-icon{font-size:1.8rem;}
    .streak-count{font-size:2rem;font-weight:900;color:var(--gold-light);}
    .streak-label{font-size:.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;}
    .streak-btn{background:linear-gradient(135deg,var(--gold-dark),var(--gold));color:var(--dark);padding:.65rem 1.25rem;border-radius:100px;font-size:.85rem;font-weight:700;transition:var(--transition);}
    .streak-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(200,153,26,.4);}
    .prayer-form-card{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);padding:1.5rem;}
    .prayer-card{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius-sm);padding:1.25rem;margin-bottom:.75rem;transition:var(--transition);}
    .prayer-card:hover{border-color:rgba(200,153,26,.3);}
    .prayer-emergency{border-color:rgba(231,76,60,.3)!important;background:rgba(231,76,60,.05)!important;}
    .prayer-card-header{display:flex;gap:.75rem;flex-wrap:wrap;align-items:center;margin-bottom:.75rem;}
    .prayer-name{font-weight:700;font-size:.9rem;}
    .prayer-category-badge,.prayer-emergency-badge,.prayer-answered-badge{font-size:.72rem;padding:.2rem .6rem;border-radius:100px;font-weight:700;}
    .prayer-category-badge{background:rgba(200,153,26,.12);color:var(--gold-light);border:1px solid rgba(200,153,26,.2);}
    .prayer-emergency-badge{background:rgba(231,76,60,.12);color:#e74c3c;border:1px solid rgba(231,76,60,.2);}
    .prayer-answered-badge{background:rgba(46,204,113,.12);color:#2ecc71;border:1px solid rgba(46,204,113,.2);}
    .prayer-text{color:var(--text-muted);font-size:.9rem;line-height:1.6;margin-bottom:.5rem;}
    .prayer-testimony{color:#2ecc71;font-size:.82rem;font-style:italic;margin-top:.5rem;padding:.5rem .75rem;background:rgba(46,204,113,.08);border-radius:6px;}
    .prayer-meta{font-size:.75rem;color:var(--text-dim);margin-top:.5rem;}
    .devotionals-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem;}
    .devotional-card{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);padding:1.75rem;cursor:pointer;transition:var(--transition);}
    .devotional-card:hover{transform:translateY(-4px);border-color:rgba(200,153,26,.4);box-shadow:var(--shadow-gold);}
    .dev-category-badge{display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);background:rgba(200,153,26,.1);border:1px solid rgba(200,153,26,.2);padding:.2rem .6rem;border-radius:100px;margin-bottom:.75rem;}
    .dev-title{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;margin-bottom:.75rem;}
    .dev-scripture{color:var(--gold-light);font-style:italic;font-size:.85rem;margin-bottom:.75rem;}
    .dev-preview{color:var(--text-muted);font-size:.88rem;line-height:1.6;margin-bottom:.75rem;}
    .dev-author{font-size:.78rem;color:var(--text-dim);}
    .dev-read-btn{margin-top:.75rem;color:var(--gold);font-size:.85rem;font-weight:600;}
    .dev-scripture-block{background:rgba(200,153,26,.08);border-left:3px solid var(--gold);padding:.75rem 1rem;border-radius:0 8px 8px 0;margin-bottom:1.25rem;font-style:italic;color:var(--text-muted);}
    .dev-content{line-height:1.85;color:var(--text-muted);font-size:.95rem;margin-bottom:1.5rem;}
    .dev-prayer-block{background:rgba(200,153,26,.06);border:1px solid rgba(200,153,26,.15);border-radius:var(--radius-sm);padding:1rem;font-style:italic;color:var(--text-muted);}
    .worship-grid{display:flex;flex-direction:column;gap:.75rem;}
    .worship-card{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius-sm);padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem;cursor:pointer;transition:var(--transition);}
    .worship-card:hover{border-color:rgba(200,153,26,.35);transform:translateX(4px);}
    .worship-icon{font-size:1.8rem;}
    .worship-info{flex:1;}
    .worship-title{font-weight:700;font-size:.95rem;color:var(--text);margin-bottom:.2rem;}
    .worship-artist{font-size:.8rem;color:var(--text-muted);}
    .worship-view-btn{font-size:.82rem;color:var(--gold);font-weight:600;flex-shrink:0;}
    .filter-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:var(--text-muted);padding:.4rem 1rem;border-radius:100px;font-size:.82rem;font-weight:600;transition:var(--transition);}
    .filter-btn.active{background:rgba(200,153,26,.15);border-color:rgba(200,153,26,.4);color:var(--gold-light);}
    .journal-compose{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);padding:1.5rem;margin-bottom:1.5rem;}
    .mood-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:var(--text-muted);padding:.35rem .8rem;border-radius:100px;font-size:.8rem;transition:var(--transition);}
    .mood-btn.active{background:rgba(200,153,26,.15);border-color:rgba(200,153,26,.4);color:var(--gold-light);}
    .journal-list{display:flex;flex-direction:column;gap:1rem;}
    .journal-entry{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);padding:1.5rem;transition:var(--transition);}
    .journal-entry:hover{border-color:rgba(200,153,26,.3);}
    .journal-entry-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;}
    .journal-mood{font-size:.82rem;font-weight:600;color:var(--gold-light);}
    .journal-date{font-size:.78rem;color:var(--text-dim);}
    .journal-entry-title{font-weight:700;font-size:1rem;margin-bottom:.5rem;}
    .journal-entry-content{color:var(--text-muted);font-size:.9rem;line-height:1.7;}
    .journal-delete-btn{margin-top:.75rem;background:transparent;border:none;color:var(--text-dim);font-size:.78rem;cursor:pointer;padding:0;}
    .journal-delete-btn:hover{color:#e74c3c;}
    .articles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem;}
    .article-card{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);padding:1.75rem;cursor:pointer;transition:var(--transition);}
    .article-card:hover{transform:translateY(-4px);border-color:rgba(200,153,26,.4);}
    .article-category-badge{display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);background:rgba(200,153,26,.1);border:1px solid rgba(200,153,26,.2);padding:.2rem .6rem;border-radius:100px;margin-bottom:.75rem;}
    .article-title{font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;margin-bottom:.6rem;}
    .article-preview{color:var(--text-muted);font-size:.88rem;line-height:1.5;margin-bottom:.75rem;}
    .article-meta{font-size:.78rem;color:var(--text-dim);margin-bottom:.5rem;}
    .article-read-btn{color:var(--gold);font-size:.85rem;font-weight:600;}
    .announce-card{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);padding:1.5rem;margin-bottom:1rem;transition:var(--transition);}
    .announce-emergency{border-color:rgba(231,76,60,.3)!important;background:rgba(231,76,60,.05)!important;}
    .announce-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.75rem;gap:1rem;}
    .announce-type-badge{font-size:.72rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.4rem;}
    .announce-title{font-size:1.05rem;font-weight:700;}
    .announce-date{font-size:.78rem;color:var(--text-dim);flex-shrink:0;}
    .announce-content{color:var(--text-muted);font-size:.9rem;line-height:1.6;}
    .quiz-start{text-align:center;padding:3rem 2rem;background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);max-width:500px;margin:0 auto;}
    .quiz-cross{font-size:3rem;color:var(--gold);margin-bottom:1rem;display:block;}
    .quiz-start h3{font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:.75rem;}
    .quiz-start p{color:var(--text-muted);margin-bottom:1.5rem;}
    .quiz-difficulty-select{margin-bottom:1.5rem;display:flex;align-items:center;justify-content:center;gap:.75rem;}
    .quiz-difficulty-select select{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.5rem 1rem;color:var(--text);font-size:.9rem;}
    .quiz-progress-bar-wrap{height:6px;background:rgba(255,255,255,.08);border-radius:100px;margin-bottom:.75rem;overflow:hidden;}
    .quiz-progress-bar-fill{height:100%;background:linear-gradient(90deg,var(--gold-dark),var(--gold));border-radius:100px;transition:width .4s;}
    .quiz-progress-text{font-size:.82rem;color:var(--text-muted);margin-bottom:1.5rem;}
    .quiz-question-card{background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);padding:2rem;}
    .quiz-question{font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:700;margin-bottom:1.5rem;line-height:1.5;}
    .quiz-options{display:flex;flex-direction:column;gap:.75rem;}
    .quiz-option-btn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius-sm);padding:.9rem 1.25rem;text-align:left;color:var(--text);font-size:.92rem;display:flex;align-items:center;gap:.75rem;transition:var(--transition);}
    .quiz-option-btn:hover:not(:disabled){background:rgba(200,153,26,.08);border-color:rgba(200,153,26,.3);}
    .quiz-option-btn.correct-opt{background:rgba(46,204,113,.12);border-color:rgba(46,204,113,.4);color:#2ecc71;}
    .quiz-option-btn.wrong-opt{background:rgba(231,76,60,.12);border-color:rgba(231,76,60,.4);color:#e74c3c;}
    .quiz-option-key{font-weight:800;color:var(--gold);min-width:22px;}
    .quiz-result{text-align:center;padding:3rem 2rem;background:var(--dark-card);border:1px solid var(--glass-border);border-radius:var(--radius);max-width:500px;margin:0 auto;}
    .quiz-score-display{font-size:3rem;font-weight:900;color:var(--gold-light);margin:1rem 0;}
    .quiz-result p{color:var(--text-muted);margin-bottom:1rem;}
  `;
  document.head.appendChild(style);
}

// ═══════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════
function boot() {
  injectDynamicStyles();
  applyTheme();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => { });

  // Check existing session
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  if (savedUser && token) {
    try {
      currentUser = JSON.parse(savedUser);
      if (currentUser.role === 'admin') {
        showPage('admin-panel');
        initAdminPanel();
      } else {
        showPage('member-portal');
        initMemberPortal();
      }
      return;
    } catch (_) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  // Fresh start
  showPage('welcome');
  initWelcome();
  initLoginSelect();
  initMemberLogin();
  initAdminLogin();
  initVideoModal();
}

document.addEventListener('DOMContentLoaded', boot);
