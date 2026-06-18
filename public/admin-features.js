/* Extended admin features */
async function initAdminExtendedForms() {
  injectAdminForm('admin-section-add-devotional', 'Add Devotional', 'add-devotional-form', `
    <div class="form-group"><label>Title *</label><input id="dev-title" required></div>
    <div class="form-group"><label>Title (Tamil)</label><input id="dev-title-ta"></div>
    <div class="form-group"><label>Content *</label><textarea id="dev-content" rows="6" required></textarea></div>
    <div class="form-group"><label>Scripture</label><input id="dev-scripture"></div>
    <div class="form-group"><label>Reference</label><input id="dev-scripture-ref"></div>
    <div class="form-group"><label>Prayer</label><textarea id="dev-prayer" rows="3"></textarea></div>
    <div class="form-group"><label>Category</label><select id="dev-category"><option>General</option><option>Faith</option><option>Prayer</option><option>Tamil</option></select></div>
    <div id="add-devotional-msg" class="form-message"></div>
    <button type="submit" class="btn-admin-submit"><span>Create Devotional</span></button>`);

  injectAdminForm('admin-section-add-announcement', 'Add Announcement', 'add-announcement-form', `
    <div class="form-group"><label>Title *</label><input id="ann-title" required></div>
    <div class="form-group"><label>Content *</label><textarea id="ann-content" rows="5" required></textarea></div>
    <div class="form-group"><label>Type</label><select id="ann-type"><option>General</option><option>Event</option><option>Ministry</option><option>Emergency</option></select></div>
    <div class="form-group"><label><input type="checkbox" id="ann-emergency"> Emergency Alert</label></div>
    <div class="form-group">
        <label><input type="checkbox" id="ann-attach-bulletin" onchange="document.getElementById('ann-bulletin-group').classList.toggle('hidden', !this.checked)"> Attach Weekly Bulletin</label>
    </div>
    <div id="ann-bulletin-group" class="hidden" style="border: 1px dashed var(--gold); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; background: rgba(212, 175, 55, 0.05);">
        <h4 style="color: var(--gold); margin-bottom: 0.5rem;">Weekly Bulletin Details</h4>
        <div class="form-group">
            <label>Bulletin Title</label>
            <input type="text" id="ann-bulletin-title" placeholder="Weekly Bulletin Title">
        </div>
        <div class="form-group">
            <label>Bulletin Content</label>
            <textarea id="ann-bulletin-content" placeholder="Enter bulletin news, announcements, prayer points..." rows="5"></textarea>
        </div>
        <div class="form-group">
            <label>Week Date</label>
            <input type="date" id="ann-bulletin-date">
        </div>
    </div>
    <div id="add-announcement-msg" class="form-message"></div>
    <button type="submit" class="btn-admin-submit"><span>Publish</span></button>`);

  injectAdminForm('admin-section-add-worship', 'Add Worship Song', 'add-worship-form', `
    <div class="form-group"><label>Title *</label><input id="song-title" required></div>
    <div class="form-group"><label>Artist</label><input id="song-artist"></div>
    <div class="form-group"><label>Lyrics</label><textarea id="song-lyrics" rows="8"></textarea></div>
    <div class="form-group"><label>Category</label><select id="song-category"><option>Worship</option><option>Hymn</option><option>Contemporary</option></select></div>
    <div class="form-group"><label>Language</label><select id="song-lang"><option value="en">English</option><option value="ta">Tamil</option></select></div>
    <div id="add-worship-msg" class="form-message"></div>
    <button type="submit" class="btn-admin-submit"><span>Add Song</span></button>`);

  injectAdminForm('admin-section-event-galleries', 'Manage Event Galleries', 'add-event-gallery-form', `
    <div class="form-group"><label>Gallery Title (e.g. Flag Hoisting) *</label><input id="gal-title" required></div>
    <div class="form-group"><label>Event Date</label><input type="date" id="gal-date"></div>
    <div class="form-group"><label>Description</label><textarea id="gal-desc" rows="3"></textarea></div>
    <div id="add-gallery-msg" class="form-message"></div>
    <button type="submit" class="btn-admin-submit" style="margin-bottom:1rem;"><span>Create Gallery</span></button>
    <hr>
    <h3>Existing Galleries</h3>
    <div class="form-group"><label>Select Gallery to Upload Media</label><select id="upload-gal-select"></select></div>
    <div class="form-group"><label>Select Images & Videos</label><input type="file" id="gal-files" multiple accept="image/*,video/*"></div>
    <div id="upload-gal-msg" class="form-message"></div>
    <button type="button" id="btn-upload-gal" class="btn-admin-submit"><span>Upload Media</span></button>
    <div id="admin-galleries-list" style="margin-top:2rem;"></div>
  `);

  injectAdminForm('admin-section-add-article', 'Add Christian Article', 'add-article-form', `
    <div class="form-group"><label>Title *</label><input id="article-title" required></div>
    <div class="form-group"><label>Author</label><input id="article-author"></div>
    <div class="form-group"><label>Content *</label><textarea id="article-content" rows="8" required></textarea></div>
    <div class="form-group"><label>Category</label><select id="article-category"><option>Faith</option><option>Healing</option><option>Family</option></select></div>
    <div id="add-article-msg" class="form-message"></div>
    <button type="submit" class="btn-admin-submit"><span>Publish Article</span></button>`);

  injectAdminForm('admin-section-add-quiz', 'Add Quiz Question', 'add-quiz-form', `
    <div class="form-group"><label>Question *</label><textarea id="quiz-question" rows="2" required></textarea></div>
    <div class="form-row"><div class="form-group"><label>A</label><input id="quiz-opt-a" required></div><div class="form-group"><label>B</label><input id="quiz-opt-b" required></div></div>
    <div class="form-row"><div class="form-group"><label>C</label><input id="quiz-opt-c" required></div><div class="form-group"><label>D</label><input id="quiz-opt-d" required></div></div>
    <div class="form-group"><label>Correct Answer</label><select id="quiz-correct"><option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option></select></div>
    <div class="form-group"><label>Category</label><input id="quiz-cat" value="General"></div>
    <div class="form-group"><label>Difficulty</label><select id="quiz-diff"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
    <div id="add-quiz-msg" class="form-message"></div>
    <button type="submit" class="btn-admin-submit"><span>Add Question</span></button>`);

  injectAdminList('admin-section-manage-devotionals', 'Manage Devotionals', 'admin-devotionals-list');
  injectAdminList('admin-section-manage-announcements', 'Manage Announcements', 'admin-announcements-list');
  injectAdminList('admin-section-manage-prayer', 'Prayer Requests', 'admin-prayer-list');
  injectAdminList('admin-section-manage-worship', 'Manage Worship Songs', 'admin-worship-list');
  injectAdminList('admin-section-manage-articles', 'Manage Articles', 'admin-articles-list');
  injectAdminList('admin-section-manage-quiz', 'Manage Quiz', 'admin-quiz-list');
  injectAdminList('admin-section-manage-members', 'Manage Members', 'admin-members-list');

  document.getElementById('admin-section-platform-manage').innerHTML = `
    <div class="admin-section-header"><h2>⚡ Platform Features</h2><p>Manage courses, prayer groups, newsletters, and more</p></div>
    <div class="admin-form">
      <h3>Add Course</h3>
      <input id="pf-course-title" placeholder="Course title" class="feature-input">
      <textarea id="pf-course-desc" placeholder="Description" rows="2" class="feature-input"></textarea>
      <button class="btn-admin-submit" onclick="adminAddCourse()">Add Course</button>
      <hr style="margin:1.5rem 0;border-color:var(--glass-border);">
      <h3>Add Newsletter</h3>
      <input id="pf-nl-title" placeholder="Newsletter title" class="feature-input">
      <textarea id="pf-nl-content" placeholder="Content" rows="4" class="feature-input"></textarea>
      <button class="btn-admin-submit" onclick="adminAddNewsletter()">Publish Newsletter</button>
      <hr style="margin:1.5rem 0;border-color:var(--glass-border);">
      <h3>Add Daily Challenge</h3>
      <input id="pf-chal-title" placeholder="Challenge title" class="feature-input">
      <textarea id="pf-chal-desc" placeholder="Description" rows="2" class="feature-input"></textarea>
      <button class="btn-admin-submit" onclick="adminAddChallenge()">Add Challenge</button>
      <hr style="margin:1.5rem 0;border-color:var(--glass-border);">
      <h3>Add Prayer Group</h3>
      <input id="pf-pg-name" placeholder="Group name" class="feature-input">
      <textarea id="pf-pg-desc" placeholder="Description" rows="2" class="feature-input"></textarea>
      <input id="pf-pg-leader" placeholder="Leader name" class="feature-input">
      <button class="btn-admin-submit" onclick="adminAddPrayerGroup()">Create Group</button>
    </div>`;

  document.getElementById('admin-section-send-notification').innerHTML = `
    <div class="admin-section-header"><h2>🔔 Send Notification</h2><p>Push alerts to all members or a specific member</p></div>
    <div class="admin-form">
      <input id="notif-title" placeholder="Notification title" class="feature-input">
      <textarea id="notif-message" placeholder="Message content" rows="3" class="feature-input"></textarea>
      <input id="notif-member-id" placeholder="Member ID (leave blank for all)" class="feature-input">
      <button class="btn-admin-submit" onclick="adminSendNotification()">Send Notification</button>
    </div>`;

  initEventGalleryAdmin();
}

function initEventGalleryAdmin() {
  const form = document.getElementById('add-event-gallery-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('POST', '/platform/event-galleries', {
          title: document.getElementById('gal-title').value.trim(),
          event_date: document.getElementById('gal-date').value,
          description: document.getElementById('gal-desc').value.trim()
        });
        showToast('Event Gallery Created!', 'success');
        form.reset();
        loadEventGalleriesAdmin();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  const uploadBtn = document.getElementById('btn-upload-gal');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const galleryId = document.getElementById('upload-gal-select').value;
      const filesInput = document.getElementById('gal-files');
      if (!galleryId || filesInput.files.length === 0) {
        showToast('Please select a gallery and files', 'error');
        return;
      }
      
      const formData = new FormData();
      for (const file of filesInput.files) {
        formData.append('files', file);
      }
      
      uploadBtn.classList.add('loading');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/platform/event-galleries/' + galleryId + '/media', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token },
          body: formData
        });
        if (!res.ok) throw new Error(await res.text());
        showToast('Media uploaded successfully!', 'success');
        filesInput.value = '';
        loadEventGalleriesAdmin();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        uploadBtn.classList.remove('loading');
      }
    });
  }
}

window.loadEventGalleriesAdmin = async () => {
  try {
    const galleries = await api('GET', '/platform/event-galleries');
    const select = document.getElementById('upload-gal-select');
    if (select) {
      select.innerHTML = galleries.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
    }
    const list = document.getElementById('admin-galleries-list');
    if (list) {
      list.innerHTML = galleries.map(g => `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${g.title}</strong>
            <p style="margin:0;font-size:0.9rem;color:var(--text-light);">${g.event_date || 'No Date'}</p>
          </div>
          <button class="btn-icon" style="color:#d32f2f;" onclick="deleteGallery(${g.id})">🗑️</button>
        </div>
      `).join('');
    }
  } catch (err) { console.error(err); }
};

window.deleteGallery = async (id) => {
  if (!confirm('Delete this gallery and all its media?')) return;
  try {
    await api('DELETE', `/platform/event-galleries/${id}`);
    showToast('Gallery deleted', 'success');
    loadEventGalleriesAdmin();
  } catch (err) { showToast(err.message, 'error'); }
};

const origSwitchAdminSection = window.switchAdminSection;
window.switchAdminSection = function(id) {
  if (origSwitchAdminSection) origSwitchAdminSection(id);
  if (id === 'event-galleries') loadEventGalleriesAdmin();
  if (id === 'social-analytics') loadSocialAnalyticsAdmin();
  if (id === 'upload-podcast') loadAdminUploadPodcast();
  if (id === 'manage-podcasts') loadAdminPodcasts();
  if (id === 'children-stories') loadAdminChildrenStories();
  if (id === 'family-groups') loadAdminFamilyGroups();
  if (id === 'youth-groups') loadAdminYouthGroups();
  if (id === 'playlists-choir') loadAdminPlaylistsChoir();
  if (id === 'testimonies') loadAdminTestimonies();
  if (id === 'faith-community') loadAdminFaithCommunity();
};

window.loadSocialAnalyticsAdmin = async () => {
  try {
    const res = await api('GET', '/admin/analytics');
    const { likes, views } = res;
    
    document.getElementById('stat-total-likes').textContent = likes.length;
    document.getElementById('stat-total-views').textContent = views.length;
    
    const list = document.getElementById('analytics-activity-list');
    if (!list) return;
    
    let html = '';
    likes.slice(0, 10).forEach(l => {
      html += `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; border-left: 4px solid var(--gold);">
          <strong>❤️ ${l.member_name}</strong> liked a ${l.media_type}
          <div style="font-size:0.8rem; color:var(--text-light); margin-top:4px;">${new Date(l.created_at).toLocaleString()}</div>
        </div>
      `;
    });
    views.slice(0, 10).forEach(v => {
      html += `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; border-left: 4px solid #4da6ff;">
          <strong>👁️ ${v.member_name}</strong> viewed a ${v.media_type}
          <div style="font-size:0.8rem; color:var(--text-light); margin-top:4px;">${new Date(v.viewed_at).toLocaleString()}</div>
        </div>
      `;
    });
    
    if (html === '') html = '<p style="color:var(--text-light);text-align:center;">No engagement activity yet.</p>';
    list.innerHTML = html;
  } catch (err) {
    console.error('Failed to load analytics', err);
  }
};

function injectAdminForm(sectionId, title, formId, fields) {
  document.getElementById(sectionId).innerHTML = `
    <div class="admin-section-header"><h2>${title}</h2></div>
    <form id="${formId}" class="admin-form">${fields}</form>`;
}

function injectAdminList(sectionId, title, listId) {
  document.getElementById(sectionId).innerHTML = `
    <div class="admin-section-header"><h2>${title}</h2></div>
    <div class="admin-content-list" id="${listId}"></div>`;
}

window.adminAddCourse = async () => {
  await api('POST', '/platform/courses', { title: document.getElementById('pf-course-title').value, description: document.getElementById('pf-course-desc').value });
  showToast('Course added!', 'success');
};
window.adminAddNewsletter = async () => {
  await api('POST', '/platform/newsletters', { title: document.getElementById('pf-nl-title').value, content: document.getElementById('pf-nl-content').value });
  showToast('Newsletter published!', 'success');
};
window.adminAddChallenge = async () => {
  await api('POST', '/platform/challenges', { title: document.getElementById('pf-chal-title').value, description: document.getElementById('pf-chal-desc').value });
  showToast('Challenge added!', 'success');
};
window.adminAddPrayerGroup = async () => {
  await api('POST', '/platform/prayer-groups', { name: document.getElementById('pf-pg-name').value, description: document.getElementById('pf-pg-desc').value, leader_name: document.getElementById('pf-pg-leader').value });
  showToast('Prayer group created!', 'success');
};
window.adminSendNotification = async () => {
  const member_id = document.getElementById('notif-member-id').value.trim();
  await api('POST', '/platform/notifications', {
    title: document.getElementById('notif-title').value,
    message: document.getElementById('notif-message').value,
    member_id: member_id ? parseInt(member_id) : null
  });
  showToast('Notification sent!', 'success');
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(document.getElementById('notif-title').value, { body: document.getElementById('notif-message').value });
  }
};

/* --- Podcasts --- */
window.loadAdminUploadPodcast = () => {
  const sec = document.getElementById('admin-section-upload-podcast');
  sec.innerHTML = `
    <div class="admin-section-header"><h2>🎙️ Upload Podcast</h2><p>Add a new podcast episode to the platform</p></div>
    <form id="upload-podcast-form" class="admin-form" enctype="multipart/form-data">
      <div class="form-group"><label>Podcast Title *</label><input id="pod-title" placeholder="e.g. Episode 10: Grace" required></div>
      <div class="form-group"><label>Host / Speaker *</label><input id="pod-pastor" placeholder="e.g. Father Antony" required></div>
      <div class="form-group"><label>Description</label><textarea id="pod-desc" rows="3" placeholder="Brief description..."></textarea></div>
      <div class="form-group">
        <label>Language</label>
        <select id="pod-lang"><option value="en">English</option><option value="ta">Tamil</option></select>
      </div>
      <div class="form-group">
        <label>Audio File *</label>
        <input type="file" id="pod-file" accept="audio/*" required>
      </div>
      <div class="upload-progress hidden" id="pod-upload-progress">
        <div class="progress-bar"><div class="progress-fill" id="pod-progress-fill" style="width:0%;"></div></div>
        <span id="pod-progress-text">Uploading...</span>
      </div>
      <div id="upload-podcast-msg" class="form-message"></div>
      <button type="submit" class="btn-admin-submit"><span>Upload Podcast</span></button>
    </form>`;

  const form = document.getElementById('upload-podcast-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    const msgDiv = document.getElementById('upload-podcast-msg');
    msgDiv.className = 'form-message'; msgDiv.innerHTML = '';
    
    try {
      const file = document.getElementById('pod-file').files[0];
      if (!file) throw new Error('Audio file is required');
      
      const fd = new FormData();
      fd.append('title', document.getElementById('pod-title').value.trim());
      fd.append('pastor', document.getElementById('pod-pastor').value.trim());
      fd.append('description', document.getElementById('pod-desc').value.trim());
      fd.append('language', document.getElementById('pod-lang').value);
      fd.append('audio', file);
      
      const prog = document.getElementById('pod-upload-progress');
      prog.classList.remove('hidden');
      
      await uploadWithProgress('/api/platform/podcasts', fd, 'pod-progress-fill', 'pod-progress-text');
      prog.classList.add('hidden');
      showToast('Podcast uploaded successfully!', 'success');
      form.reset();
    } catch (err) {
      msgDiv.className = 'form-message error';
      msgDiv.textContent = err.message;
      showToast(err.message, 'error');
    } finally {
      setBtnLoading(btn, false);
    }
  });
};

window.loadAdminPodcasts = async () => {
  const sec = document.getElementById('admin-section-manage-podcasts');
  sec.innerHTML = `
    <div class="admin-section-header"><h2>🎧 Manage Podcasts</h2><p>View and delete podcasts</p></div>
    <div class="admin-content-list" id="admin-podcasts-list"><div class="loading-state">Loading...</div></div>`;
  const list = document.getElementById('admin-podcasts-list');
  try {
    const podcasts = await api('GET', '/platform/podcasts');
    if (podcasts.length === 0) {
      list.innerHTML = '<div class="empty-state">No podcasts uploaded yet.</div>';
      return;
    }
    list.innerHTML = podcasts.map(p => `
      <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid var(--gold);">
        <div>
          <strong>${p.title}</strong>
          <p style="margin:0;font-size:0.9rem;color:var(--text-light);">Host: ${p.pastor} | Lang: ${p.language}</p>
        </div>
        <button class="btn-icon" style="color:#d32f2f;" onclick="deletePodcast(${p.id})">🗑️</button>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = `<div class="error-state">${err.message}</div>`;
  }
};

window.deletePodcast = async (id) => {
  if (!confirm('Delete this podcast?')) return;
  try {
    await api('DELETE', '/platform/podcasts/' + id);
    showToast('Podcast deleted successfully', 'success');
    loadAdminPodcasts();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/* --- Children Stories --- */
window.loadAdminChildrenStories = async () => {
  const sec = document.getElementById('admin-section-children-stories');
  sec.innerHTML = `
    <div class="admin-section-header"><h2>📚 Children Stories</h2><p>Upload stories and view completions report</p></div>
    <div class="admin-form-split" style="display:grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <h3>Upload Story</h3>
        <form id="upload-story-form" class="admin-form" enctype="multipart/form-data">
          <div class="form-group"><label>Story Title *</label><input id="cs-title" placeholder="e.g. David & Goliath" required></div>
          <div class="form-group"><label>Story content / script *</label><textarea id="cs-content" rows="6" placeholder="Enter story text..." required></textarea></div>
          <div class="form-group"><label>Age Group *</label><input id="cs-age" placeholder="e.g. 5-8 years" required></div>
          <div class="form-group"><label>Language</label><select id="cs-lang"><option value="en">English</option><option value="ta">Tamil</option></select></div>
          <div class="form-group">
            <label>Video URL (Optional, YouTube/Vimeo direct link)</label>
            <input type="url" id="cs-video-url" placeholder="https://youtube.com/...">
          </div>
          <div class="form-group">
            <label>Or Upload Video File (Optional)</label>
            <input type="file" id="cs-file" accept="video/*">
          </div>
          <div class="upload-progress hidden" id="cs-upload-progress">
            <div class="progress-bar"><div class="progress-fill" id="cs-progress-fill" style="width:0%;"></div></div>
            <span id="cs-progress-text">Uploading...</span>
          </div>
          <div id="upload-story-msg" class="form-message"></div>
          <button type="submit" class="btn-admin-submit"><span>Upload Story</span></button>
        </form>
      </div>
      <div>
        <h3>Leaderboard / Completions Report</h3>
        <div id="cs-leaderboard" class="admin-content-list" style="max-height: 400px; overflow-y: auto;"><div class="loading-state">Loading completions...</div></div>
        <h3 style="margin-top:2rem;">Existing Stories</h3>
        <div id="cs-stories-list" class="admin-content-list" style="max-height: 300px; overflow-y: auto;"><div class="loading-state">Loading stories...</div></div>
      </div>
    </div>`;

  const form = document.getElementById('upload-story-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    const msgDiv = document.getElementById('upload-story-msg');
    msgDiv.className = 'form-message'; msgDiv.innerHTML = '';
    
    try {
      const file = document.getElementById('cs-file').files[0];
      const videoUrl = document.getElementById('cs-video-url').value.trim();
      
      const fd = new FormData();
      fd.append('title', document.getElementById('cs-title').value.trim());
      fd.append('content', document.getElementById('cs-content').value.trim());
      fd.append('age_group', document.getElementById('cs-age').value.trim());
      fd.append('language', document.getElementById('cs-lang').value);
      if (videoUrl) fd.append('video_url', videoUrl);
      if (file) fd.append('video', file);
      
      const prog = document.getElementById('cs-upload-progress');
      if (file) prog.classList.remove('hidden');
      
      if (file) {
        await uploadWithProgress('/api/platform/children-stories', fd, 'cs-progress-fill', 'cs-progress-text');
      } else {
        await api('POST', '/platform/children-stories', {
          title: document.getElementById('cs-title').value.trim(),
          content: document.getElementById('cs-content').value.trim(),
          age_group: document.getElementById('cs-age').value.trim(),
          language: document.getElementById('cs-lang').value,
          video_url: videoUrl
        });
      }
      prog.classList.add('hidden');
      showToast('Children story uploaded!', 'success');
      form.reset();
      loadCsStoriesAndCompletions();
    } catch (err) {
      msgDiv.className = 'form-message error';
      msgDiv.textContent = err.message;
      showToast(err.message, 'error');
    } finally {
      setBtnLoading(btn, false);
    }
  });

  loadCsStoriesAndCompletions();
};

window.loadCsStoriesAndCompletions = async () => {
  const storyList = document.getElementById('cs-stories-list');
  const leadList = document.getElementById('cs-leaderboard');
  if (!storyList || !leadList) return;
  
  try {
    const stories = await api('GET', '/platform/children-stories');
    if (stories.length === 0) {
      storyList.innerHTML = '<div class="empty-state">No stories uploaded.</div>';
    } else {
      storyList.innerHTML = stories.map(s => `
        <div style="background:var(--surface); padding:0.8rem; border-radius:8px; margin-bottom:0.8rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${s.title}</strong>
            <p style="margin:0;font-size:0.8rem;color:var(--text-light);">Age: ${s.age_group} | Lang: ${s.language}</p>
          </div>
          <button class="btn-icon" style="color:#d32f2f;" onclick="deleteCsStory(${s.id})">🗑️</button>
        </div>`).join('');
    }
  } catch (err) { storyList.innerHTML = `<div class="error-state">${err.message}</div>`; }

  try {
    const completions = await api('GET', '/platform/children-stories/report/completions');
    if (completions.length === 0) {
      leadList.innerHTML = '<div class="empty-state">No completions logged yet.</div>';
    } else {
      leadList.innerHTML = `
        <table class="admin-table" style="width:100%; border-collapse:collapse; font-size:0.9rem;">
          <thead>
            <tr style="border-bottom:1px solid var(--glass-border); text-align:left;">
              <th style="padding:5px;">Child</th>
              <th style="padding:5px;">Class</th>
              <th style="padding:5px;">Story</th>
              <th style="padding:5px;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${completions.map(c => `
              <tr style="border-bottom:1px solid var(--glass-border);">
                <td style="padding:5px;"><strong>${c.child_name}</strong><br><span style="font-size:0.75rem;color:var(--text-light);">${c.dob || ''}</span></td>
                <td style="padding:5px;">${c.class}</td>
                <td style="padding:5px;">${c.story_title}</td>
                <td style="padding:5px; font-size:0.75rem; color:var(--text-light);">${new Date(c.completed_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
    }
  } catch (err) { leadList.innerHTML = `<div class="error-state">${err.message}</div>`; }
};

window.deleteCsStory = async (id) => {
  if (!confirm('Delete this children story?')) return;
  try {
    await api('DELETE', '/platform/children-stories/' + id);
    showToast('Story deleted', 'success');
    loadCsStoriesAndCompletions();
  } catch (err) { showToast(err.message, 'error'); }
};

/* --- Family Groups --- */
window.loadAdminFamilyGroups = async () => {
  const sec = document.getElementById('admin-section-family-groups');
  sec.innerHTML = `
    <div class="admin-section-header"><h2>👨‍👩‍👧 Family Groups</h2><p>List and moderate private family connections</p></div>
    <div class="admin-form-split" style="display:grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <h3>Family Groups List</h3>
        <div id="family-groups-list" class="admin-content-list"><div class="loading-state">Loading families...</div></div>
      </div>
      <div id="family-detail-panel" style="border: 1px dashed var(--glass-border); padding: 1.5rem; border-radius: 8px; background: rgba(255,255,255,0.02);">
        <p style="color:var(--text-light); text-align:center; margin-top:3rem;">Select a family group to open its feed and broadcast alerts</p>
      </div>
    </div>`;

  const list = document.getElementById('family-groups-list');
  try {
    const families = await api('GET', '/platform/family/all');
    if (families.length === 0) {
      list.innerHTML = '<div class="empty-state">No family groups created yet.</div>';
      return;
    }
    list.innerHTML = families.map(f => `
      <div class="card card-hover" style="margin-bottom:1rem; cursor:pointer;" onclick="openFamilyDetail(${f.id}, '${f.family_name.replace(/'/g, "\\'")}', '${f.qr_code_id}')">
        <strong>${f.family_name}</strong>
        <p style="margin:0;font-size:0.85rem;color:var(--text-light);">Invite Code: ${f.qr_code_id}</p>
        <span style="font-size:0.75rem;color:var(--text-light);">Created: ${new Date(f.created_at).toLocaleDateString()}</span>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = `<div class="error-state">${err.message}</div>`;
  }
};

window.openFamilyDetail = async (id, name, qrCode) => {
  const panel = document.getElementById('family-detail-panel');
  panel.innerHTML = `
    <h3 style="color:var(--gold); display:flex; justify-content:space-between; align-items:center;">
      <span>👨‍👩‍👧 ${name}</span>
      <span style="font-size:0.8rem; background:rgba(212,175,55,0.1); padding:3px 8px; border-radius:4px; font-weight:normal;">Invite: ${qrCode}</span>
    </h3>
    
    <div style="margin-top:1.5rem; margin-bottom:1.5rem; border:1px solid var(--glass-border); padding:1rem; border-radius:6px; background:rgba(0,0,0,0.15);">
      <h4>📢 Broadcast Notification to Members</h4>
      <div class="form-group" style="margin-top:0.5rem;">
        <input type="text" id="family-alert-msg" placeholder="Enter alert message to family members..." class="feature-input" style="width:100%; box-sizing:border-box;">
      </div>
      <button class="btn-admin-submit" onclick="sendFamilyAlert(${id})" style="margin-top:0.5rem; padding:6px 12px; font-size:0.9rem;"><span>Send Alert</span></button>
    </div>
    
    <h4>📸 Moderation Feed (Private family posts)</h4>
    <div id="family-feed-list" class="admin-content-list" style="max-height: 400px; overflow-y: auto; margin-top:0.5rem;"><div class="loading-state">Loading posts...</div></div>`;

  loadFamilyFeed(id);
};

window.loadFamilyFeed = async (id) => {
  const feed = document.getElementById('family-feed-list');
  if (!feed) return;
  try {
    const posts = await api('GET', `/platform/family/${id}/posts`);
    if (posts.length === 0) {
      feed.innerHTML = '<div class="empty-state">No posts in this family group yet.</div>';
      return;
    }
    feed.innerHTML = posts.map(p => {
      let mediaHtml = '';
      if (p.media_url) {
        if (p.media_type === 'video') {
          mediaHtml = `<video src="${p.media_url}" controls style="max-width:100%; max-height:180px; border-radius:6px; margin-top:0.5rem; background:#000;"></video>`;
        } else {
          mediaHtml = `<img src="${p.media_url}" style="max-width:100%; max-height:180px; object-fit:contain; border-radius:6px; margin-top:0.5rem;">`;
        }
      }
      return `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:0.8rem; position:relative; border:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <strong>${p.member_name}</strong>
              <span style="font-size:0.75rem; color:var(--text-light); margin-left:8px;">${timeAgo(p.created_at)}</span>
            </div>
            <button class="btn-icon" style="color:#d32f2f; font-size:0.8rem; padding:2px;" onclick="deleteFamilyPost(${p.id}, ${id})">🗑️ Delete</button>
          </div>
          <p style="margin:0.5rem 0 0 0; white-space:pre-wrap;">${p.content || ''}</p>
          ${mediaHtml}
        </div>`;
    }).join('');
  } catch (err) {
    feed.innerHTML = `<div class="error-state">${err.message}</div>`;
  }
};

window.sendFamilyAlert = async (id) => {
  const input = document.getElementById('family-alert-msg');
  const msg = input.value.trim();
  if (!msg) { showToast('Message cannot be empty', 'error'); return; }
  try {
    await api('POST', `/platform/family/${id}/message`, { message: msg });
    showToast('Alert broadcasted to family members!', 'success');
    input.value = '';
  } catch (err) { showToast(err.message, 'error'); }
};

window.deleteFamilyPost = async (postId, familyId) => {
  if (!confirm('Delete this family post permanently for moderation?')) return;
  try {
    await api('DELETE', `/platform/family/posts/${postId}`);
    showToast('Post deleted', 'success');
    loadFamilyFeed(familyId);
  } catch (err) { showToast(err.message, 'error'); }
};

/* --- Youth Groups --- */
window.loadAdminYouthGroups = async () => {
  const sec = document.getElementById('admin-section-youth-groups');
  sec.innerHTML = `
    <div class="admin-section-header"><h2>🧒 Youth Groups</h2><p>Create groups, manage members, broadcast text/media</p></div>
    <div class="admin-form-split" style="display:grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <h3>Create Youth Group</h3>
        <form id="create-yg-form" class="admin-form" style="margin-bottom:2rem;">
          <div class="form-group"><label>Youth Group Name *</label><input id="yg-create-name" placeholder="e.g. Youth Choir, Senior Youth" required></div>
          <button type="submit" class="btn-admin-submit"><span>Create Group</span></button>
        </form>
        
        <h3>Pending Membership Approvals</h3>
        <div id="yg-pending-list" class="admin-content-list"><div class="loading-state">Loading pending requests...</div></div>
      </div>
      <div>
        <h3>Youth Groups list</h3>
        <div id="youth-groups-list" class="admin-content-list" style="margin-bottom:2rem;"><div class="loading-state">Loading groups...</div></div>
        
        <div id="youth-detail-panel" style="border: 1px dashed var(--glass-border); padding: 1.5rem; border-radius: 8px; background: rgba(255,255,255,0.02); display:none;">
          <!-- Loaded dynamically -->
        </div>
      </div>
    </div>`;

  const form = document.getElementById('create-yg-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      const name = document.getElementById('yg-create-name').value.trim();
      await api('POST', '/platform/youth/create', { group_name: name });
      showToast('Youth Group created successfully!', 'success');
      form.reset();
      loadYgData();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });

  loadYgData();
};

window.loadYgData = async () => {
  const pendingList = document.getElementById('yg-pending-list');
  const groupList = document.getElementById('youth-groups-list');
  if (!pendingList || !groupList) return;
  
  // Pending Approvals
  try {
    const pending = await api('GET', '/platform/youth/pending');
    if (pending.length === 0) {
      pendingList.innerHTML = '<div class="empty-state">No pending membership approvals.</div>';
    } else {
      pendingList.innerHTML = pending.map(p => `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid #4da6ff;">
          <div>
            <strong>${p.member_name}</strong> (${p.member_phone})
            <p style="margin:0;font-size:0.8rem;color:var(--text-light);">Requested group: ${p.group_name}</p>
          </div>
          <button class="btn-admin-submit" onclick="approveYouthMember(${p.youth_member_id})" style="padding:4px 10px; font-size:0.8rem;"><span>Approve</span></button>
        </div>`).join('');
    }
  } catch (err) { pendingList.innerHTML = `<div class="error-state">${err.message}</div>`; }

  // Groups list
  try {
    const groups = await api('GET', '/platform/youth/all');
    if (groups.length === 0) {
      groupList.innerHTML = '<div class="empty-state">No youth groups created.</div>';
    } else {
      groupList.innerHTML = groups.map(g => `
        <div class="card card-hover" style="margin-bottom:0.8rem; cursor:pointer;" onclick="openYouthDetail(${g.id}, '${g.group_name.replace(/'/g, "\\'")}', '${g.qr_code_id}')">
          <strong>${g.group_name}</strong>
          <p style="margin:0;font-size:0.8rem;color:var(--text-light);">Invite Code: ${g.qr_code_id}</p>
        </div>`).join('');
    }
  } catch (err) { groupList.innerHTML = `<div class="error-state">${err.message}</div>`; }
};

window.approveYouthMember = async (id) => {
  try {
    await api('POST', '/platform/youth/approve', { youth_member_id: id });
    showToast('Member approved successfully!', 'success');
    loadYgData();
  } catch (err) { showToast(err.message, 'error'); }
};

window.openYouthDetail = async (id, name, qrCode) => {
  const panel = document.getElementById('youth-detail-panel');
  panel.style.display = 'block';
  panel.innerHTML = `
    <h3 style="color:var(--gold); display:flex; justify-content:space-between; align-items:center;">
      <span>🧒 ${name}</span>
      <span style="font-size:0.8rem; background:rgba(212,175,55,0.1); padding:3px 8px; border-radius:4px; font-weight:normal;">Invite: ${qrCode}</span>
    </h3>
    
    <div style="margin-top:1.5rem; margin-bottom:1.5rem; border:1px solid var(--glass-border); padding:1rem; border-radius:6px; background:rgba(0,0,0,0.15);">
      <h4>📢 Broadcast Message/Media to Feed</h4>
      <form id="yg-broadcast-form" enctype="multipart/form-data" style="margin-top:0.5rem;">
        <div class="form-group">
          <textarea id="yg-broadcast-text" placeholder="Write message to group..." rows="3" class="feature-input" style="width:100%; box-sizing:border-box;"></textarea>
        </div>
        <div class="form-group" style="margin-top:0.5rem;">
          <label style="font-size:0.85rem; color:var(--text-light);">Upload Photo/Video/Audio Attachment</label>
          <input type="file" id="yg-broadcast-file" accept="image/*,video/*,audio/*" style="display:block; margin-top:4px;">
        </div>
        <div class="upload-progress hidden" id="yg-broadcast-progress" style="margin-top:0.5rem;">
          <div class="progress-bar"><div class="progress-fill" id="yg-progress-fill" style="width:0%;"></div></div>
          <span id="yg-progress-text">Uploading...</span>
        </div>
        <div id="yg-broadcast-msg" class="form-message"></div>
        <button type="submit" class="btn-admin-submit" style="margin-top:0.5rem; padding:6px 12px; font-size:0.9rem;"><span>Broadcast Post</span></button>
      </form>
    </div>
    
    <h4>📸 Active Youth Feed</h4>
    <div id="youth-feed-list" class="admin-content-list" style="max-height: 300px; overflow-y: auto; margin-top:0.5rem;"><div class="loading-state">Loading posts...</div></div>`;

  const bForm = document.getElementById('yg-broadcast-form');
  bForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = bForm.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    const msgDiv = document.getElementById('yg-broadcast-msg');
    msgDiv.className = 'form-message'; msgDiv.innerHTML = '';
    
    try {
      const text = document.getElementById('yg-broadcast-text').value.trim();
      const file = document.getElementById('yg-broadcast-file').files[0];
      if (!text && !file) throw new Error('Message content or file attachment is required.');
      
      const fd = new FormData();
      if (text) fd.append('content', text);
      if (file) fd.append('media', file);
      
      const prog = document.getElementById('yg-broadcast-progress');
      if (file) prog.classList.remove('hidden');
      
      if (file) {
        await uploadWithProgress(`/api/platform/youth/${id}/post`, fd, 'yg-progress-fill', 'yg-progress-text');
      } else {
        await api('POST', `/platform/youth/${id}/post`, { content: text });
      }
      prog.classList.add('hidden');
      showToast('Post broadcasted successfully!', 'success');
      bForm.reset();
      loadYouthFeed(id);
    } catch (err) {
      msgDiv.className = 'form-message error';
      msgDiv.textContent = err.message;
      showToast(err.message, 'error');
    } finally {
      setBtnLoading(btn, false);
    }
  });

  loadYouthFeed(id);
};

window.loadYouthFeed = async (id) => {
  const feed = document.getElementById('youth-feed-list');
  if (!feed) return;
  try {
    const posts = await api('GET', `/platform/youth/${id}/posts`);
    if (posts.length === 0) {
      feed.innerHTML = '<div class="empty-state">No broadcast posts in this group yet.</div>';
      return;
    }
    feed.innerHTML = posts.map(p => {
      let mediaHtml = '';
      if (p.media_url) {
        if (p.media_type === 'video') {
          mediaHtml = `<video src="${p.media_url}" controls style="max-width:100%; max-height:180px; border-radius:6px; margin-top:0.5rem; background:#000;"></video>`;
        } else if (p.media_type === 'audio') {
          mediaHtml = `<audio src="${p.media_url}" controls style="width:100%; margin-top:0.5rem;"></audio>`;
        } else {
          mediaHtml = `<img src="${p.media_url}" style="max-width:100%; max-height:180px; object-fit:contain; border-radius:6px; margin-top:0.5rem;">`;
        }
      }
      return `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:0.8rem; border:1px solid rgba(255,255,255,0.05);">
          <div>
            <strong>${p.member_name || 'Admin'}</strong>
            <span style="font-size:0.75rem; color:var(--text-light); margin-left:8px;">${timeAgo(p.created_at)}</span>
          </div>
          <p style="margin:0.5rem 0 0 0; white-space:pre-wrap;">${p.content || ''}</p>
          ${mediaHtml}
        </div>`;
    }).join('');
  } catch (err) { feed.innerHTML = `<div class="error-state">${err.message}</div>`; }
};

/* --- Playlists & Choir --- */
window.loadAdminPlaylistsChoir = async () => {
  const sec = document.getElementById('admin-section-playlists-choir');
  sec.innerHTML = `
    <div class="admin-section-header"><h2>🎼 Playlists & Choir Materials</h2><p>Manage worship playlists and practice sheets</p></div>
    <div class="admin-form-split" style="display:grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <h3>Create Playlist</h3>
        <form id="create-pl-form" class="admin-form" style="margin-bottom:2rem;">
          <div class="form-group"><label>Playlist Name *</label><input id="pl-title" placeholder="e.g. Sunday Morning Worship" required></div>
          <div class="form-group"><label>Songs List *</label><textarea id="pl-songs" rows="4" placeholder="Enter song names or text content..." required></textarea></div>
          <button type="submit" class="btn-admin-submit"><span>Create Playlist</span></button>
        </form>
        
        <h3>Upload Choir Material</h3>
        <form id="upload-choir-form" class="admin-form" enctype="multipart/form-data">
          <div class="form-group"><label>Material Title *</label><input id="choir-title" placeholder="e.g. Ave Maria practice sheet" required></div>
          <div class="form-group">
            <label>Material Type *</label>
            <select id="choir-type"><option value="sheet">PDF Practice Sheet</option><option value="audio">Audio Guide</option><option value="video">Video Guide</option><option value="image">Image sheet</option></select>
          </div>
          <div class="form-group">
            <label>Select File *</label>
            <input type="file" id="choir-file" required>
          </div>
          <div class="upload-progress hidden" id="choir-upload-progress">
            <div class="progress-bar"><div class="progress-fill" id="choir-progress-fill" style="width:0%;"></div></div>
            <span id="choir-progress-text">Uploading...</span>
          </div>
          <div id="upload-choir-msg" class="form-message"></div>
          <button type="submit" class="btn-admin-submit"><span>Upload Choir Material</span></button>
        </form>
      </div>
      <div>
        <h3>Active Playlists</h3>
        <div id="admin-playlists-list" class="admin-content-list" style="margin-bottom:2rem;"><div class="loading-state">Loading playlists...</div></div>
        
        <h3>Uploaded Choir Materials</h3>
        <div id="admin-choir-list" class="admin-content-list"><div class="loading-state">Loading choir materials...</div></div>
      </div>
    </div>`;

  // Playlist Form Submit
  const plForm = document.getElementById('create-pl-form');
  plForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = plForm.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    try {
      const title = document.getElementById('pl-title').value.trim();
      const songs = document.getElementById('pl-songs').value.trim();
      await api('POST', '/platform/playlists', { title, songs });
      showToast('Playlist created!', 'success');
      plForm.reset();
      loadWorshipChoirData();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setBtnLoading(btn, false); }
  });

  // Choir Form Submit
  const choirForm = document.getElementById('upload-choir-form');
  choirForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = choirForm.querySelector('.btn-admin-submit');
    setBtnLoading(btn, true);
    const msgDiv = document.getElementById('upload-choir-msg');
    msgDiv.className = 'form-message'; msgDiv.innerHTML = '';
    
    try {
      const file = document.getElementById('choir-file').files[0];
      if (!file) throw new Error('File is required.');
      
      const fd = new FormData();
      fd.append('title', document.getElementById('choir-title').value.trim());
      fd.append('type', document.getElementById('choir-type').value);
      fd.append('file', file);
      
      const prog = document.getElementById('choir-upload-progress');
      prog.classList.remove('hidden');
      
      await uploadWithProgress('/api/platform/choir-materials', fd, 'choir-progress-fill', 'choir-progress-text');
      prog.classList.add('hidden');
      showToast('Choir practice material uploaded!', 'success');
      choirForm.reset();
      loadWorshipChoirData();
    } catch (err) {
      msgDiv.className = 'form-message error';
      msgDiv.textContent = err.message;
      showToast(err.message, 'error');
    } finally {
      setBtnLoading(btn, false);
    }
  });

  loadWorshipChoirData();
};

window.loadWorshipChoirData = async () => {
  const plList = document.getElementById('admin-playlists-list');
  const choirList = document.getElementById('admin-choir-list');
  if (!plList || !choirList) return;
  
  // Load Playlists
  try {
    const playlists = await api('GET', '/platform/playlists');
    if (playlists.length === 0) {
      plList.innerHTML = '<div class="empty-state">No playlists created yet.</div>';
    } else {
      plList.innerHTML = playlists.map(p => `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${p.title}</strong>
            <p style="margin:0;font-size:0.8rem;color:var(--text-light); white-space:pre-line;">${p.songs}</p>
          </div>
          <button class="btn-icon" style="color:#d32f2f;" onclick="deletePlaylist(${p.id})">🗑️</button>
        </div>`).join('');
    }
  } catch (err) { plList.innerHTML = `<div class="error-state">${err.message}</div>`; }

  // Load Choir Materials
  try {
    const choir = await api('GET', '/platform/choir-materials');
    if (choir.length === 0) {
      choirList.innerHTML = '<div class="empty-state">No choir practice materials uploaded.</div>';
    } else {
      choirList.innerHTML = choir.map(c => `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${c.title}</strong>
            <p style="margin:0;font-size:0.8rem;color:var(--text-light);">Type: ${c.type} | File: <a href="${c.url}" target="_blank" style="color:var(--gold);">View File</a></p>
          </div>
          <button class="btn-icon" style="color:#d32f2f;" onclick="deleteChoirMaterial(${c.id})">🗑️</button>
        </div>`).join('');
    }
  } catch (err) { choirList.innerHTML = `<div class="error-state">${err.message}</div>`; }
};

window.deletePlaylist = async (id) => {
  if (!confirm('Delete this playlist?')) return;
  try {
    await api('DELETE', '/platform/playlists/' + id);
    showToast('Playlist deleted', 'success');
    loadWorshipChoirData();
  } catch (err) { showToast(err.message, 'error'); }
};

window.deleteChoirMaterial = async (id) => {
  if (!confirm('Delete this choir practice material?')) return;
  try {
    await api('DELETE', '/platform/choir-materials/' + id);
    showToast('Choir material deleted', 'success');
    loadWorshipChoirData();
  } catch (err) { showToast(err.message, 'error'); }
};

/* --- Testimonies --- */
window.loadAdminTestimonies = async () => {
  const sec = document.getElementById('admin-section-testimonies');
  sec.innerHTML = `
    <div class="admin-section-header"><h2>💬 Testimonies</h2><p>View, approve, and moderate testimonies submitted by members</p></div>
    <div class="admin-content-list" id="admin-testimonies-list"><div class="loading-state">Loading testimonies...</div></div>`;
  const list = document.getElementById('admin-testimonies-list');
  try {
    const testimonies = await api('GET', '/platform/testimonies');
    if (testimonies.length === 0) {
      list.innerHTML = '<div class="empty-state">No testimonies submitted yet.</div>';
      return;
    }
    list.innerHTML = testimonies.map(t => `
      <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; position:relative; border-left: 4px solid var(--gold);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>Submitted by: ${t.member_name || 'Anonymous'}</strong>
          <span style="font-size:0.8rem; color:var(--text-light);">${new Date(t.created_at).toLocaleDateString()}</span>
        </div>
        <p style="margin:0.5rem 0; white-space:pre-wrap;">${t.content}</p>
        <div style="text-align:right;">
          <button class="btn-secondary" style="background:#d32f2f; color:white; border:none; padding:4px 8px; font-size:0.8rem;" onclick="deleteTestimony(${t.id})">Delete Testimony</button>
        </div>
      </div>`).join('');
  } catch (err) { list.innerHTML = `<div class="error-state">${err.message}</div>`; }
};

window.deleteTestimony = async (id) => {
  if (!confirm('Delete this testimony permanently?')) return;
  try {
    await api('DELETE', '/platform/testimonies/' + id);
    showToast('Testimony deleted', 'success');
    loadAdminTestimonies();
  } catch (err) { showToast(err.message, 'error'); }
};

/* --- Faith & Community --- */
window.loadAdminFaithCommunity = async () => {
  const sec = document.getElementById('admin-section-faith-community');
  sec.innerHTML = `
    <div class="admin-section-header"><h2>⛪ Faith & Community</h2><p>Manage prayer groups and daily challenges</p></div>
    <div class="admin-form-split" style="display:grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <div>
        <h3>Add Prayer Group</h3>
        <div class="admin-form" style="margin-bottom:2rem;">
          <div class="form-group"><label>Group Name *</label><input id="fc-pg-name" placeholder="e.g. Monday Prayer Circle" required></div>
          <div class="form-group"><label>Description *</label><textarea id="fc-pg-desc" rows="2" placeholder="e.g. Small group praying for sick members" required></textarea></div>
          <div class="form-group"><label>Leader Name *</label><input id="fc-pg-leader" placeholder="e.g. John Doe" required></div>
          <button class="btn-admin-submit" onclick="fcAddPrayerGroup()"><span>Create Prayer Group</span></button>
        </div>
        
        <h3>Add Daily Challenge</h3>
        <div class="admin-form">
          <div class="form-group"><label>Challenge Title *</label><input id="fc-chal-title" placeholder="e.g. Pray for Neighbors" required></div>
          <div class="form-group"><label>Description *</label><textarea id="fc-chal-desc" rows="3" placeholder="e.g. Take 5 minutes to pray for three neighbors by name today" required></textarea></div>
          <div class="form-group"><label>Challenge Date</label><input type="date" id="fc-chal-date"></div>
          <button class="btn-admin-submit" onclick="fcAddChallenge()"><span>Add Challenge</span></button>
        </div>
      </div>
      
      <div>
        <h3>Active Prayer Groups</h3>
        <div id="fc-prayer-groups-list" class="admin-content-list" style="margin-bottom:2rem;"><div class="loading-state">Loading groups...</div></div>
        
        <h3>Daily Challenges</h3>
        <div id="fc-challenges-list" class="admin-content-list"><div class="loading-state">Loading challenges...</div></div>
      </div>
    </div>`;

  loadFCData();
};

window.loadFCData = async () => {
  const pgList = document.getElementById('fc-prayer-groups-list');
  const chalList = document.getElementById('fc-challenges-list');
  if (!pgList || !chalList) return;
  
  // Prayer Groups list
  try {
    const groups = await api('GET', '/platform/prayer-groups');
    if (groups.length === 0) {
      pgList.innerHTML = '<div class="empty-state">No prayer groups created.</div>';
    } else {
      pgList.innerHTML = groups.map(g => `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; border-left:4px solid var(--gold);">
          <strong>${g.name}</strong>
          <p style="margin:0;font-size:0.85rem;color:var(--text-light);">${g.description}</p>
          <span style="font-size:0.75rem;color:var(--text-light);">Leader: ${g.leader_name} | Members: ${g.member_count || 0}</span>
        </div>`).join('');
    }
  } catch (err) { pgList.innerHTML = `<div class="error-state">${err.message}</div>`; }

  // Challenges list
  try {
    const chals = await api('GET', '/challenges');
    if (chals.length === 0) {
      chalList.innerHTML = '<div class="empty-state">No challenges active today.</div>';
    } else {
      chalList.innerHTML = chals.map(c => `
        <div style="background:var(--surface); padding:1rem; border-radius:8px; margin-bottom:1rem; border-left:4px solid #4da6ff;">
          <strong>${c.title}</strong>
          <p style="margin:0;font-size:0.85rem;color:var(--text-light);">${c.description}</p>
          <span style="font-size:0.75rem;color:var(--text-light);">Date: ${formatDate(c.challenge_date)}</span>
        </div>`).join('');
    }
  } catch (err) { chalList.innerHTML = `<div class="error-state">${err.message}</div>`; }
};

window.fcAddPrayerGroup = async () => {
  const name = document.getElementById('fc-pg-name').value.trim();
  const desc = document.getElementById('fc-pg-desc').value.trim();
  const leader = document.getElementById('fc-pg-leader').value.trim();
  if (!name || !desc || !leader) { showToast('Please fill all fields', 'error'); return; }
  try {
    await api('POST', '/platform/prayer-groups', { name, description: desc, leader_name: leader });
    showToast('Prayer group created!', 'success');
    document.getElementById('fc-pg-name').value = '';
    document.getElementById('fc-pg-desc').value = '';
    document.getElementById('fc-pg-leader').value = '';
    loadFCData();
  } catch (err) { showToast(err.message, 'error'); }
};

window.fcAddChallenge = async () => {
  const title = document.getElementById('fc-chal-title').value.trim();
  const desc = document.getElementById('fc-chal-desc').value.trim();
  const date = document.getElementById('fc-chal-date').value;
  if (!title || !desc) { showToast('Please fill all fields', 'error'); return; }
  try {
    await api('POST', '/platform/challenges', { title, description: desc, challenge_date: date || null });
    showToast('Daily Challenge added!', 'success');
    document.getElementById('fc-chal-title').value = '';
    document.getElementById('fc-chal-desc').value = '';
    document.getElementById('fc-chal-date').value = '';
    loadFCData();
  } catch (err) { showToast(err.message, 'error'); }
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initAdminExtendedForms, 100);
});
