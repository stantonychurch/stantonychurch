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
    <label><input type="checkbox" id="ann-emergency"> Emergency Alert</label>
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
        await api('POST', '/event-galleries', {
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
        const res = await fetch('/api/event-galleries/' + galleryId + '/media', {
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
    const galleries = await api('GET', '/event-galleries');
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
    await api('DELETE', `/event-galleries/${id}`);
    showToast('Gallery deleted', 'success');
    loadEventGalleriesAdmin();
  } catch (err) { showToast(err.message, 'error'); }
};

const origSwitchAdminSection = window.switchAdminSection;
window.switchAdminSection = function(id) {
  if (origSwitchAdminSection) origSwitchAdminSection(id);
  if (id === 'event-galleries') loadEventGalleriesAdmin();
  if (id === 'social-analytics') loadSocialAnalyticsAdmin();
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

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initAdminExtendedForms, 100);
});
