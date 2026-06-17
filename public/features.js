/* Extended member features — St Antony Church Platform */
const ExtendedFeatures = {};

function pf(method, path, body) {
  return api(method, '/platform' + path, body);
}

function sectionHeader(title, subtitle) {
  return `<div class="section-header"><h2>${title}</h2><p>${subtitle || ''}</p></div><div class="section-body">`;
}

function cardGrid(items, renderFn) {
  if (!items.length) return '<div class="empty-state">No content yet.</div>';
  return `<div class="content-grid feature-grid">${items.map(renderFn).join('')}</div>`;
}

function listCards(items, renderFn) {
  if (!items.length) return '<div class="empty-state">No content yet.</div>';
  return items.map(renderFn).join('');
}

// ─── Verse of the Day ────────────────────────────────
ExtendedFeatures['verse-day'] = async function() {
  const sec = document.getElementById('section-verse-day');
  sec.innerHTML = sectionHeader('📜 Verse of the Day', 'Today\'s scripture for meditation') + '<div id="vod-content"><div class="loading-state">Loading...</div></div></div>';
  try {
    const v = await pf('GET', '/verse-of-day');
    const text = currentLang === 'ta' && v.verse_tamil ? v.verse_tamil : v.verse;
    document.getElementById('vod-content').innerHTML = `
      <div class="verse-of-day-card">
        <div class="verse-text large">${text || 'Loading...'}</div>
        <div class="verse-reference">— ${v.reference || ''}</div>
      </div>`;
  } catch (e) { document.getElementById('vod-content').innerHTML = `<div class="empty-state">${e.message}</div>`; }
};

// ─── Reading Plans ───────────────────────────────────
ExtendedFeatures['reading-plans'] = async function() {
  const sec = document.getElementById('section-reading-plans');
  sec.innerHTML = sectionHeader('📚 Bible Reading Plans', '30-day, 90-day, and 1-year plans') + '<div id="rp-list"><div class="loading-state">Loading...</div></div></div>';
  try {
    const [plans, progress] = await Promise.all([
      pf('GET', '/reading-plans'),
      pf('GET', `/reading-plans/progress/${currentUser.id}`)
    ]);
    const progMap = Object.fromEntries(progress.map(p => [p.plan_id, p]));
    document.getElementById('rp-list').innerHTML = cardGrid(plans, p => {
      const prog = progMap[p.id];
      const pct = prog ? Math.round((prog.current_day / p.duration_days) * 100) : 0;
      return `<div class="feature-card">
        <div class="fc-badge">${p.duration_days} days · ${p.language === 'ta' ? 'Tamil' : 'English'}</div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        ${prog ? `<div class="progress-bar-wrap"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><span>Day ${prog.current_day} of ${p.duration_days}</span></div>
          <button class="btn-feature" onclick="window.advanceReadingPlan(${p.id})">Mark Today Complete ✓</button>` :
          `<button class="btn-feature" onclick="window.startReadingPlan(${p.id})">Start Plan →</button>`}
      </div>`;
    });
  } catch (e) { document.getElementById('rp-list').innerHTML = `<div class="empty-state">${e.message}</div>`; }
};
window.startReadingPlan = async (id) => { await pf('POST', `/reading-plans/${id}/start`); showToast('Reading plan started!', 'success'); ExtendedFeatures['reading-plans'](); };
window.advanceReadingPlan = async (id) => { const r = await pf('POST', '/reading-plans/progress/advance', { plan_id: id }); showToast(r.completed ? '🎉 Plan completed!' : `Day ${r.current_day} complete!`, 'success'); ExtendedFeatures['reading-plans'](); };

// ─── Podcasts ────────────────────────────────────────
ExtendedFeatures.podcasts = async function() {
  const sec = document.getElementById('section-podcasts');
  sec.innerHTML = sectionHeader('🎙️ Christian Podcasts', 'Listen and grow in faith') + '<div id="pod-list"><div class="loading-state">Loading...</div></div></div>';
  try {
    const items = await pf('GET', '/podcasts');
    const filtered = items.filter(p => currentLang === 'ta' ? p.language === 'ta' : true);
    document.getElementById('pod-list').innerHTML = listCards(filtered.length ? filtered : items, p => `
      <div class="audio-card-item">
        <div class="ac-icon">🎙️</div>
        <div class="ac-info"><div class="ac-title">${p.title}</div><div class="ac-meta">${p.pastor || 'Podcast'} · ${p.language}</div><p>${p.description || ''}</p></div>
        ${p.url || p.filename ? `<audio controls src="${p.url || '/uploads/' + p.filename}" style="width:100%;margin-top:.5rem;"></audio>` : ''}
      </div>`);
  } catch (e) { document.getElementById('pod-list').innerHTML = `<div class="empty-state">${e.message}</div>`; }
};

// ─── Testimonies ─────────────────────────────────────
ExtendedFeatures.testimonies = async function() {
  const sec = document.getElementById('section-testimonies');
  sec.innerHTML = sectionHeader('💬 Personal Testimonies', 'Share how God has worked in your life') + `
    <div class="feature-form-card">
      <input id="test-title" placeholder="Testimony title" class="feature-input">
      <textarea id="test-content" placeholder="Share your testimony..." rows="4" class="feature-input"></textarea>
      <button class="btn-feature" id="submit-testimony">Share Testimony</button>
    </div>
    <div id="test-list"><div class="loading-state">Loading...</div></div></div>`;
  document.getElementById('submit-testimony').onclick = async () => {
    const title = document.getElementById('test-title').value.trim();
    const content = document.getElementById('test-content').value.trim();
    if (!title || !content) return showToast('Title and content required', 'error');
    await pf('POST', '/testimonies', { title, content });
    showToast('Testimony shared!', 'success');
    ExtendedFeatures.testimonies();
  };
  try {
    const items = await pf('GET', '/testimonies');
    document.getElementById('test-list').innerHTML = listCards(items, t => `
      <div class="feature-card"><h3>${t.title}</h3><p>${t.content}</p><div class="fc-meta">— ${t.member_name} · ${timeAgo(t.created_at)}</div></div>`);
  } catch (e) { document.getElementById('test-list').innerHTML = `<div class="empty-state">${e.message}</div>`; }
};

// ─── Scripture Memorization ──────────────────────────
ExtendedFeatures.memorization = async function() {
  const sec = document.getElementById('section-memorization');
  sec.innerHTML = sectionHeader('🧠 Scripture Memorization', 'Track verses you are learning') + `
    <div class="feature-form-card">
      <textarea id="mem-verse" placeholder="Verse text" rows="2" class="feature-input"></textarea>
      <input id="mem-ref" placeholder="Reference (e.g. John 3:16)" class="feature-input">
      <button class="btn-feature" id="add-mem">Add Verse</button>
    </div>
    <div id="mem-list"><div class="loading-state">Loading...</div></div></div>`;
  document.getElementById('add-mem').onclick = async () => {
    await pf('POST', '/memorization', { verse: document.getElementById('mem-verse').value.trim(), reference: document.getElementById('mem-ref').value.trim() });
    showToast('Verse added!', 'success'); ExtendedFeatures.memorization();
  };
  try {
    const items = await pf('GET', `/memorization/${currentUser.id}`);
    document.getElementById('mem-list').innerHTML = listCards(items, m => `
      <div class="feature-card ${m.mastered ? 'mastered-card' : ''}">
        <div class="verse-text">${m.verse}</div>
        <div class="verse-reference">— ${m.reference}</div>
        ${!m.mastered ? `<button class="btn-feature small" onclick="window.masterVerse(${m.id})">Mark Mastered ✓</button>` : '<span class="badge-success">✅ Mastered</span>'}
      </div>`);
  } catch (e) { document.getElementById('mem-list').innerHTML = `<div class="empty-state">${e.message}</div>`; }
};
window.masterVerse = async (id) => { await pf('PATCH', `/memorization/${id}/master`); showToast('Well done!', 'success'); ExtendedFeatures.memorization(); };

// ─── Bible Courses ───────────────────────────────────
ExtendedFeatures.courses = async function() {
  const sec = document.getElementById('section-courses');
  sec.innerHTML = sectionHeader('🎓 Bible Study Courses', 'Discipleship, leadership, and Sunday school') + '<div id="course-list"><div class="loading-state">Loading...</div></div><div id="cert-list"></div></div>';
  try {
    const [courses, certs] = await Promise.all([pf('GET', '/courses'), pf('GET', `/certificates/${currentUser.id}`)]);
    document.getElementById('course-list').innerHTML = cardGrid(courses.filter(c => currentLang === 'ta' ? c.language === 'ta' : true).length ? courses.filter(c => currentLang === 'ta' ? c.language === 'ta' : true) : courses, c => `
      <div class="feature-card"><div class="fc-badge">${c.category} · ${c.lesson_count} lessons</div><h3>${c.title}</h3><p>${c.description}</p>
      <button class="btn-feature" onclick="window.openCourse(${c.id}, '${c.title.replace(/'/g, "\\'")}')">Start Course →</button></div>`);
    if (certs.length) document.getElementById('cert-list').innerHTML = `<h3 style="margin:1.5rem 0 1rem;">🏆 Your Certificates</h3>` + listCards(certs, c => `
      <div class="cert-card"><div>🎓 ${c.course_title}</div><div class="fc-meta">Code: ${c.cert_code} · ${formatDate(c.issued_at)}</div></div>`);
  } catch (e) { document.getElementById('course-list').innerHTML = `<div class="empty-state">${e.message}</div>`; }
};
window.openCourse = async (id, title) => {
  const lessons = await pf('GET', `/courses/${id}/lessons`);
  const sec = document.getElementById('section-courses');
  sec.innerHTML = sectionHeader(`🎓 ${title}`, 'Complete each lesson') + listCards(lessons, (l, i) => `
    <div class="feature-card"><h3>Lesson ${l.order_num}: ${l.title}</h3><p>${l.content}</p>
    ${i === lessons.length - 1 ? `<button class="btn-feature" onclick="window.completeLesson(${id})">Complete Lesson ✓</button>` : ''}</div>`) + '</div>';
};
window.completeLesson = async (id) => {
  const r = await pf('POST', `/courses/${id}/progress`);
  showToast(r.message || 'Progress saved!', r.completed ? 'success' : 'info');
  ExtendedFeatures.courses();
};

// ─── Prayer Groups ───────────────────────────────────
ExtendedFeatures['prayer-groups'] = async function() {
  const sec = document.getElementById('section-prayer-groups');
  sec.innerHTML = sectionHeader('👥 Prayer Groups', 'Join a community of intercessors') + '<div id="pg-list"><div class="loading-state">Loading...</div></div></div>';
  try {
    const groups = await pf('GET', '/prayer-groups');
    document.getElementById('pg-list').innerHTML = cardGrid(groups, g => `
      <div class="feature-card"><h3>${g.name}</h3><p>${g.description}</p><div class="fc-meta">Leader: ${g.leader_name} · ${g.member_count} members</div>
      <button class="btn-feature" onclick="window.joinPrayerGroup(${g.id})">Join Group</button></div>`);
  } catch (e) { document.getElementById('pg-list').innerHTML = `<div class="empty-state">${e.message}</div>`; }
};
window.joinPrayerGroup = async (id) => { await pf('POST', `/prayer-groups/${id}/join`); showToast('Joined prayer group!', 'success'); };

// ─── Prayer Reminders ────────────────────────────────
ExtendedFeatures['prayer-reminders'] = async function() {
  const sec = document.getElementById('section-prayer-reminders');
  sec.innerHTML = sectionHeader('⏰ Prayer Reminders', 'Set daily prayer alerts') + `
    <div class="feature-form-card">
      <input type="time" id="rem-time" class="feature-input">
      <input id="rem-msg" placeholder="Reminder message" class="feature-input" value="Time to pray 🙏">
      <button class="btn-feature" id="add-rem">Add Reminder</button>
    </div>
    <div id="rem-list"></div></div>`;
  document.getElementById('add-rem').onclick = async () => {
    await pf('POST', '/prayer-reminders', { reminder_time: document.getElementById('rem-time').value, message: document.getElementById('rem-msg').value });
    showToast('Reminder set! Enable browser notifications for alerts.', 'success');
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    ExtendedFeatures['prayer-reminders']();
  };
  const items = await pf('GET', `/prayer-reminders/${currentUser.id}`);
  document.getElementById('rem-list').innerHTML = listCards(items, r => `
    <div class="feature-card inline-flex"><span>⏰ ${r.reminder_time} — ${r.message}</span>
    <button class="btn-delete-small" onclick="window.deleteReminder(${r.id})">Delete</button></div>`);
};
window.deleteReminder = async (id) => { await pf('DELETE', `/prayer-reminders/${id}`); ExtendedFeatures['prayer-reminders'](); };

// ─── Fasting Tracker ─────────────────────────────────
ExtendedFeatures.fasting = async function() {
  const sec = document.getElementById('section-fasting');
  sec.innerHTML = sectionHeader('🍞 Fasting Tracker', 'Record your fasting journey') + `
    <div class="feature-form-card">
      <div class="form-row"><input type="date" id="fast-start" class="feature-input"><input type="date" id="fast-end" class="feature-input"></div>
      <input id="fast-purpose" placeholder="Purpose of fast" class="feature-input">
      <textarea id="fast-notes" placeholder="Notes..." rows="2" class="feature-input"></textarea>
      <button class="btn-feature" id="add-fast">Log Fast</button>
    </div>
    <div id="fast-list"><div class="loading-state">Loading...</div></div></div>`;
  document.getElementById('add-fast').onclick = async () => {
    await pf('POST', '/fasting', { start_date: document.getElementById('fast-start').value, end_date: document.getElementById('fast-end').value, purpose: document.getElementById('fast-purpose').value, notes: document.getElementById('fast-notes').value });
    showToast('Fast logged!', 'success'); ExtendedFeatures.fasting();
  };
  const items = await pf('GET', `/fasting/${currentUser.id}`);
  document.getElementById('fast-list').innerHTML = listCards(items, f => `
    <div class="feature-card"><h3>${f.purpose || 'Fasting'}</h3><div class="fc-meta">${f.start_date}${f.end_date ? ' → ' + f.end_date : ''}</div><p>${f.notes || ''}</p></div>`);
};

// ─── Prayer Calendar ─────────────────────────────────
ExtendedFeatures['prayer-calendar'] = async function() {
  const sec = document.getElementById('section-prayer-calendar');
  sec.innerHTML = sectionHeader('📅 Prayer Calendar', 'Church prayer events and vigils') + '<div id="pc-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/prayer-calendar');
  document.getElementById('pc-list').innerHTML = listCards(items, e => `
    <div class="event-card"><div class="event-date-box"><div class="event-date-day">${e.event_date.split('-')[2]}</div></div>
    <div class="event-card-body"><div class="event-card-title">${e.title}</div><div class="event-card-meta">${e.event_type} · ${e.event_date}</div><p>${e.description || ''}</p></div></div>`);
};

// ─── Worship Playlists ───────────────────────────────
ExtendedFeatures.playlists = async function() {
  const sec = document.getElementById('section-playlists');
  sec.innerHTML = sectionHeader('🎵 Worship Playlists', 'Curated worship sets') + '<div id="pl-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/worship-playlists');
  document.getElementById('pl-list').innerHTML = listCards(items, p => `
    <div class="feature-card"><h3>${p.title}</h3><p>${p.description}</p>
    ${(p.songs || []).map(s => `<div class="worship-card"><span>🎵</span> ${s?.title || ''} — ${s?.artist || ''}</div>`).join('')}</div>`);
};

// ─── Choir Materials ─────────────────────────────────
ExtendedFeatures.choir = async function() {
  const sec = document.getElementById('section-choir');
  sec.innerHTML = sectionHeader('🎼 Choir Practice Materials', 'Sheet music and practice resources') + '<div id="choir-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/choir-materials');
  document.getElementById('choir-list').innerHTML = listCards(items, c => `
    <div class="feature-card"><h3>${c.title}</h3><p>${c.description || ''}</p>
    ${c.url ? `<a href="${c.url}" target="_blank" class="btn-feature small">Download / View</a>` : c.filename ? `<a href="/uploads/${c.filename}" class="btn-feature small">Download</a>` : ''}</div>`);
};

// ─── Song Requests ─────────────────────────────────────
ExtendedFeatures['song-requests'] = async function() {
  const sec = document.getElementById('section-song-requests');
  sec.innerHTML = sectionHeader('🎶 Song Requests', 'Request a song for worship') + `
    <div class="feature-form-card">
      <input id="sr-title" placeholder="Song title" class="feature-input">
      <input id="sr-occasion" placeholder="Occasion (optional)" class="feature-input">
      <button class="btn-feature" id="submit-sr">Submit Request</button>
    </div>
    <div id="sr-list"></div></div>`;
  document.getElementById('submit-sr').onclick = async () => {
    await pf('POST', '/song-requests', { song_title: document.getElementById('sr-title').value, occasion: document.getElementById('sr-occasion').value });
    showToast('Song request submitted!', 'success'); ExtendedFeatures['song-requests']();
  };
  const items = await pf('GET', '/song-requests');
  document.getElementById('sr-list').innerHTML = listCards(items.filter(i => i.member_id === currentUser.id || i.status === 'approved'), i => `
    <div class="feature-card"><strong>${i.song_title}</strong> · ${i.occasion || 'General'} · Status: ${i.status}</div>`);
};

// ─── Service Schedule ────────────────────────────────
ExtendedFeatures.services = async function() {
  const sec = document.getElementById('section-services');
  sec.innerHTML = sectionHeader('⛪ Service Schedules', 'Weekly worship times and online streaming') + '<div id="svc-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/service-schedules');
  document.getElementById('svc-list').innerHTML = listCards(items, s => `
    <div class="feature-card"><h3>${s.service_type}</h3>
    <div class="fc-meta">📅 ${s.day_of_week} · 🕐 ${s.service_time} · 📍 ${s.location || 'Church'}</div>
    <p>${s.description || ''}</p>
    ${s.stream_url ? `<a href="${s.stream_url}" target="_blank" class="btn-feature small">🔴 Watch Live</a>` : '<span class="fc-meta">Online streaming available during service</span>'}
    </div>`);
};

// ─── Sermon Notes ────────────────────────────────────
ExtendedFeatures['sermon-notes'] = async function() {
  const sec = document.getElementById('section-sermon-notes');
  sec.innerHTML = sectionHeader('📝 Sermon Notes', 'Download and review sermon notes') + '<div id="sn-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/sermon-notes');
  const filtered = items.filter(n => currentLang === 'ta' ? n.language === 'ta' : true);
  document.getElementById('sn-list').innerHTML = listCards(filtered.length ? filtered : items, n => `
    <div class="feature-card"><h3>${n.title}</h3><pre class="sermon-notes-content">${n.content}</pre>
    ${n.filename ? `<a href="/uploads/${n.filename}" class="btn-feature small">Download PDF</a>` : ''}</div>`);
};

// ─── Church Bulletin ─────────────────────────────────
ExtendedFeatures.bulletins = async function() {
  const sec = document.getElementById('section-bulletins');
  sec.innerHTML = sectionHeader('📋 Church Bulletin', 'Weekly church news and updates') + '<div id="bull-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/bulletins');
  document.getElementById('bull-list').innerHTML = listCards(items, b => `
    <div class="announce-card"><div class="announce-title">${b.title}</div><div class="announce-date">Week of ${b.week_date || formatDate(b.created_at)}</div>
    <div class="announce-content">${b.content}</div></div>`);
};

// ─── Family Features ─────────────────────────────────
ExtendedFeatures['family-connections'] = async function() {
  const sec = document.getElementById('section-family-connections');
  sec.innerHTML = sectionHeader('👨‍👩‍👧 Family Groups', 'Create or join your family group') + `
    <div class="feature-form-card" style="margin-bottom:20px;">
      <h4>Create New Family</h4>
      <input id="create-family-name" placeholder="Family Name (e.g. The Smith Family)" class="feature-input">
      <button class="btn-feature" id="btn-create-family">Create Family</button>
    </div>
    <div class="feature-form-card" style="margin-bottom:20px;">
      <h4>Join Existing Family</h4>
      <input id="join-family-code" placeholder="Enter Invite Code" class="feature-input">
      <button class="btn-feature" id="btn-join-family">Join Family</button>
    </div>
    <h3>Your Family Groups</h3>
    <div id="family-groups-list"><div class="loading-state">Loading...</div></div>
  </div>`;
  
  document.getElementById('btn-create-family').onclick = async () => {
    const name = document.getElementById('create-family-name').value.trim();
    if(!name) return showToast('Please enter a family name', 'error');
    try {
        await pf('POST', '/family/create', { family_name: name });
        showToast('Family created!', 'success');
        ExtendedFeatures['family-connections']();
    } catch(e) { showToast(e.message, 'error'); }
  };
  
  document.getElementById('btn-join-family').onclick = async () => {
    const code = document.getElementById('join-family-code').value.trim();
    if(!code) return showToast('Please enter an invite code', 'error');
    try {
        await pf('POST', '/family/join', { qr_code_id: code });
        showToast('Joined family!', 'success');
        ExtendedFeatures['family-connections']();
    } catch(e) { showToast(e.message, 'error'); }
  };
  
  try {
    const families = await pf('GET', '/family/my');
    document.getElementById('family-groups-list').innerHTML = listCards(families, f => `
      <div class="feature-card">
        <h3>${f.family_name}</h3>
        <p>Invite Code: <strong>${f.qr_code_id}</strong></p>
        <button class="btn-feature" onclick="window.startFamilyPrayer(${f.id})">🙏 Start Family Prayer</button>
        <button class="btn-delete-small" onclick="window.leaveFamily(${f.id})" style="margin-top:10px;">Leave/Delete Group</button>
      </div>`);
  } catch(e) { document.getElementById('family-groups-list').innerHTML = `<div class="empty-state">${e.message}</div>`; }
};

window.leaveFamily = async (id) => {
    if(!confirm("Are you sure you want to leave this family group?")) return;
    await pf('DELETE', `/family/${id}/leave`);
    showToast('Left family group.', 'info');
    ExtendedFeatures['family-connections']();
};

window.startFamilyPrayer = async (id) => {
    try {
        await pf('POST', `/family/${id}/candles/start`);
        showToast('Prayer started!', 'success');
        
        // Show Mother Mary Full Screen
        const overlay = document.createElement('div');
        overlay.id = 'prayer-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'black';
        overlay.style.backgroundImage = 'url("mother_mary_1781690553176.png")';
        overlay.style.backgroundSize = 'cover';
        overlay.style.backgroundPosition = 'center';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'flex-end';
        overlay.style.paddingBottom = '10vh';
        
        const text = document.createElement('h1');
        text.innerText = 'Family Prayer in Progress...';
        text.style.color = 'white';
        text.style.textShadow = '2px 2px 4px black';
        text.style.fontFamily = "'Playfair Display', serif";
        text.style.marginBottom = '2rem';
        
        const btn = document.createElement('button');
        btn.innerText = 'Complete Prayer';
        btn.className = 'btn-feature';
        btn.style.fontSize = '1.2rem';
        btn.style.padding = '15px 30px';
        btn.onclick = async () => {
            await pf('POST', `/family/${id}/candles/complete`, { minutes: 15 });
            document.body.removeChild(overlay);
            showToast('Prayer completed! Candle earned.', 'success');
            ExtendedFeatures['family-connections']();
        };
        
        overlay.appendChild(text);
        overlay.appendChild(btn);
        document.body.appendChild(overlay);
        
    } catch(e) {
        showToast(e.message, 'error');
    }
};

ExtendedFeatures['family-prayer'] = async function() {
  const sec = document.getElementById('section-family-prayer');
  sec.innerHTML = sectionHeader('🙏 Family Prayer Requests', 'Pray together as a family') + `
    <div class="feature-form-card">
      <input id="fp-name" placeholder="Family name" class="feature-input">
      <textarea id="fp-req" placeholder="Family prayer request..." rows="3" class="feature-input"></textarea>
      <button class="btn-feature" id="submit-fp">Submit</button>
    </div><div id="fp-list"></div></div>`;
  document.getElementById('submit-fp').onclick = async () => {
    await pf('POST', '/family-prayers', { family_name: document.getElementById('fp-name').value, request: document.getElementById('fp-req').value });
    showToast('Family prayer submitted!', 'success'); ExtendedFeatures['family-prayer']();
  };
  const items = await pf('GET', '/family-prayers');
  document.getElementById('fp-list').innerHTML = listCards(items, i => `<div class="prayer-card"><strong>${i.family_name || 'Family'}</strong><p>${i.request}</p></div>`);
};

ExtendedFeatures['family-devotional'] = async function() {
  const sec = document.getElementById('section-family-devotional');
  sec.innerHTML = sectionHeader('👨‍👩‍👧 Family Devotional Plans', 'Grow in faith together') + '<div id="fd-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/family-devotionals');
  document.getElementById('fd-list').innerHTML = listCards(items, d => `
    <div class="feature-card"><h3>${d.title}</h3><div class="fc-meta">${d.duration_days} days · ${d.language}</div><pre>${d.content}</pre></div>`);
};

ExtendedFeatures.children = async function() {
  const sec = document.getElementById('section-children');
  sec.innerHTML = sectionHeader('📚 Children\'s Bible Stories', 'Stories for young hearts') + '<div id="child-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/children-stories');
  const filtered = items.filter(s => currentLang === 'ta' ? s.language === 'ta' : true);
  document.getElementById('child-list').innerHTML = listCards(filtered.length ? filtered : items, s => `
    <div class="feature-card children-card"><div class="fc-badge">Ages ${s.age_group}</div><h3>${s.title}</h3><p>${s.content}</p></div>`);
};

ExtendedFeatures.youth = async function() {
  const sec = document.getElementById('section-youth');
  sec.innerHTML = sectionHeader('🧒 Youth Corner', 'Content for youth and young adults') + '<div id="youth-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/youth-corner');
  document.getElementById('youth-list').innerHTML = listCards(items, y => `<div class="feature-card"><div class="fc-badge">${y.category}</div><h3>${y.title}</h3><p>${y.content}</p></div>`);
};

ExtendedFeatures.parenting = async function() {
  const sec = document.getElementById('section-parenting');
  sec.innerHTML = sectionHeader('👶 Parenting Resources', 'Raising children in faith') + '<div id="par-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/parenting');
  document.getElementById('par-list').innerHTML = listCards(items, p => `<div class="feature-card"><div class="fc-badge">${p.category}</div><h3>${p.title}</h3><p>${p.content}</p></div>`);
};

// ─── Community ───────────────────────────────────────
ExtendedFeatures.directory = async function() {
  const sec = document.getElementById('section-directory');
  sec.innerHTML = sectionHeader('👥 Member Directory', 'Connect with church members') + '<div id="dir-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/directory');
  document.getElementById('dir-list').innerHTML = cardGrid(items, m => `
    <div class="feature-card"><h3>${m.name}</h3><div class="fc-meta">📱 ${m.phone}</div>${m.bio ? `<p>${m.bio}</p>` : ''}${m.birthday ? `<div class="fc-meta">🎂 ${m.birthday}</div>` : ''}</div>`);
};

ExtendedFeatures.ministry = async function() {
  const sec = document.getElementById('section-ministry');
  sec.innerHTML = sectionHeader('⛪ Ministry Groups', 'Serve in church ministries') + '<div id="min-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/ministry-groups');
  document.getElementById('min-list').innerHTML = cardGrid(items, g => `
    <div class="feature-card"><h3>${g.name}</h3><p>${g.description}</p><div class="fc-meta">Leader: ${g.leader_name} · ${g.member_count} members</div>
    <button class="btn-feature" onclick="window.joinMinistry(${g.id})">Join Ministry</button></div>`);
};
window.joinMinistry = async (id) => { await pf('POST', `/ministry-groups/${id}/join`); showToast('Joined ministry!', 'success'); };

ExtendedFeatures.volunteers = async function() {
  const sec = document.getElementById('section-volunteers');
  sec.innerHTML = sectionHeader('🤲 Volunteer Opportunities', 'Serve your church community') + '<div id="vol-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/volunteers');
  document.getElementById('vol-list').innerHTML = cardGrid(items, v => `
    <div class="feature-card"><h3>${v.title}</h3><p>${v.description}</p><div class="fc-meta">${v.signed_up}/${v.slots} signed up</div>
    <button class="btn-feature" onclick="window.signVolunteer(${v.id})">Sign Up</button></div>`);
};
window.signVolunteer = async (id) => { await pf('POST', `/volunteers/${id}/signup`); showToast('Signed up to volunteer!', 'success'); ExtendedFeatures.volunteers(); };

ExtendedFeatures.birthdays = async function() {
  const sec = document.getElementById('section-birthdays');
  sec.innerHTML = sectionHeader('🎂 Birthday Wishes', 'Celebrate church family birthdays') + `
    <div id="bday-list"><div class="loading-state">Loading...</div></div>
    <div class="feature-form-card" style="margin-top:1rem;">
      <select id="bday-to" class="feature-input"></select>
      <textarea id="bday-msg" placeholder="Birthday message..." rows="2" class="feature-input"></textarea>
      <button class="btn-feature" id="send-bday">Send Wish 🎂</button>
    </div></div>`;
  const [members, wishes] = await Promise.all([pf('GET', '/birthdays'), pf('GET', '/birthday-wishes')]);
  const sel = document.getElementById('bday-to');
  sel.innerHTML = members.map(m => `<option value="${m.id}">${m.name}${m.birthday ? ' (' + m.birthday + ')' : ''}</option>`).join('');
  document.getElementById('bday-list').innerHTML = listCards(members, m => `
    <div class="feature-card">🎂 <strong>${m.name}</strong>${m.birthday ? ` — ${m.birthday}` : ''}</div>`) +
    (wishes.length ? `<h4 style="margin:1rem 0 .5rem;">Recent Wishes</h4>` + listCards(wishes.slice(0, 10), w => `
      <div class="feature-card"><strong>${w.from_name}</strong> → ${w.to_name}: "${w.message}"</div>`) : '');
  document.getElementById('send-bday').onclick = async () => {
    const opt = sel.options[sel.selectedIndex];
    await pf('POST', '/birthday-wishes', { to_member_id: sel.value, to_name: opt.text.split(' (')[0], message: document.getElementById('bday-msg').value });
    showToast('Birthday wish sent! 🎂', 'success');
  };
};

ExtendedFeatures.chats = async function() {
  const sec = document.getElementById('section-chats');
  sec.innerHTML = sectionHeader('💬 Group Chats', 'Connect with church members') + '<div id="chat-rooms"></div><div id="chat-messages" class="chat-box"></div></div>';
  const chats = await pf('GET', '/chats');
  document.getElementById('chat-rooms').innerHTML = chats.map(c => `
    <button class="filter-btn ${window._activeChat === c.id ? 'active' : ''}" onclick="window.openChat(${c.id}, '${c.name.replace(/'/g, "\\'")}')">${c.name}</button>`).join(' ');
  if (chats.length && !window._activeChat) window.openChat(chats[0].id, chats[0].name);
};
window.openChat = async (id, name) => {
  window._activeChat = id;
  const msgs = await pf('GET', `/chats/${id}/messages`);
  document.getElementById('chat-messages').innerHTML = `
    <h4>${name}</h4>
    <div class="chat-messages-list">${msgs.reverse().map(m => `<div class="chat-msg"><strong>${m.member_name}</strong>: ${m.message} <span class="fc-meta">${timeAgo(m.created_at)}</span></div>`).join('')}</div>
    <div class="chat-input-row"><input id="chat-input" placeholder="Type a message..." class="feature-input"><button class="btn-feature" onclick="window.sendChatMsg(${id})">Send</button></div>`;
};
window.sendChatMsg = async (id) => {
  const msg = document.getElementById('chat-input').value.trim();
  if (!msg) return;
  await pf('POST', `/chats/${id}/messages`, { message: msg });
  window.openChat(id, '');
};

// ─── Communication ───────────────────────────────────
ExtendedFeatures.newsletters = async function() {
  const sec = document.getElementById('section-newsletters');
  sec.innerHTML = sectionHeader('📧 Church Newsletter', 'Monthly updates from St Antony Church') + '<div id="nl-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', '/newsletters');
  document.getElementById('nl-list').innerHTML = listCards(items, n => `
    <div class="announce-card"><div class="announce-title">${n.title}</div><div class="announce-date">${formatDate(n.published_at)}</div><div class="announce-content">${n.content}</div></div>`);
};

ExtendedFeatures.notifications = async function() {
  const sec = document.getElementById('section-notifications');
  sec.innerHTML = sectionHeader('🔔 Notifications', 'Church alerts and updates') + '<div id="notif-list"><div class="loading-state">Loading...</div></div></div>';
  const items = await pf('GET', `/notifications/${currentUser.id}`);
  document.getElementById('notif-list').innerHTML = listCards(items, n => `
    <div class="feature-card ${n.is_read ? '' : 'unread-notif'}" onclick="window.markNotifRead(${n.id})">
      <strong>${n.title}</strong><p>${n.message}</p><div class="fc-meta">${timeAgo(n.created_at)}</div></div>`);
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};
window.markNotifRead = async (id) => { await pf('PATCH', `/notifications/${id}/read`); ExtendedFeatures.notifications(); };

// ─── Daily Challenges ──────────────────────────────────
ExtendedFeatures.challenges = async function() {
  const sec = document.getElementById('section-challenges');
  sec.innerHTML = sectionHeader('🏆 Daily Christian Challenges', 'Grow your faith every day') + '<div id="chal-list"><div class="loading-state">Loading...</div></div></div>';
  const [challenges, completed] = await Promise.all([pf('GET', '/challenges'), pf('GET', `/challenges/completed/${currentUser.id}`)]);
  const doneIds = new Set(completed.map(c => c.challenge_id));
  document.getElementById('chal-list').innerHTML = listCards(challenges, c => `
    <div class="feature-card ${doneIds.has(c.id) ? 'mastered-card' : ''}">
      <div class="fc-badge">${c.category}</div><h3>${c.title}</h3><p>${c.description}</p>
      ${doneIds.has(c.id) ? '<span class="badge-success">✅ Completed Today</span>' : `<button class="btn-feature" onclick="window.completeChallenge(${c.id})">Mark Complete ✓</button>`}
    </div>`);
};
window.completeChallenge = async (id) => { await pf('POST', `/challenges/${id}/complete`); showToast('Challenge completed! 🏆', 'success'); ExtendedFeatures.challenges(); };

// ─── AI Bible Chatbot ────────────────────────────────
ExtendedFeatures['ai-chat'] = async function() {
  const sec = document.getElementById('section-ai-chat');
  sec.innerHTML = sectionHeader('🤖 AI Bible Chatbot', 'Ask questions about faith and scripture') + `
    <div class="ai-chat-box">
      <div id="ai-messages" class="chat-messages-list"><div class="chat-msg bot">✝️ Hello! Ask me about faith, prayer, love, forgiveness, salvation, or any Bible topic.</div></div>
      <div class="chat-input-row">
        <input id="ai-input" placeholder="Ask a Bible question..." class="feature-input">
        <button class="btn-feature" id="ai-send">Ask</button>
      </div>
      <div class="ai-suggestions">
        ${['What does the Bible say about love?', 'How should I pray?', 'Tell me about faith', 'What is salvation?'].map(q =>
          `<button class="filter-btn" onclick="document.getElementById('ai-input').value='${q}';document.getElementById('ai-send').click()">${q}</button>`).join('')}
      </div>
    </div></div>`;
  document.getElementById('ai-send').onclick = async () => {
    const q = document.getElementById('ai-input').value.trim();
    if (!q) return;
    const box = document.getElementById('ai-messages');
    box.innerHTML += `<div class="chat-msg user"><strong>You:</strong> ${q}</div>`;
    document.getElementById('ai-input').value = '';
    try {
      const r = await pf('POST', '/ai-chat', { question: q });
      box.innerHTML += `<div class="chat-msg bot"><strong>✝️ Bible Assistant:</strong><br>${r.answer.replace(/\n/g, '<br>')}</div>`;
      box.scrollTop = box.scrollHeight;
    } catch (e) { showToast(e.message, 'error'); }
  };
  document.getElementById('ai-input').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('ai-send').click(); });
};

// ─── Offline Cache ─────────────────────────────────────
window.cacheForOffline = async function() {
  try {
    const [devotionals, verses] = await Promise.all([api('GET', '/devotionals'), api('GET', '/verses')]);
    localStorage.setItem('offline_devotionals', JSON.stringify(devotionals));
    localStorage.setItem('offline_verses', JSON.stringify(verses));
    localStorage.setItem('offline_cached_at', new Date().toISOString());
    showToast('Devotionals & verses saved for offline reading! 📥', 'success');
  } catch (e) { showToast('Could not cache content', 'error'); }
};

window.ExtendedFeatures = ExtendedFeatures;
