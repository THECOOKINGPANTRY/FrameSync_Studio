// Clean state array (No default projects)
let projects = JSON.parse(localStorage.getItem('framesync_projects')) || [];
let revisions = JSON.parse(localStorage.getItem('framesync_revisions')) || [];

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  renderPipeline();
  renderRevisions();
  setupEventListeners();
});

// Navigation Handling
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const targetView = document.getElementById(`view-${tab.dataset.tab}`);
      if (targetView) targetView.classList.add('active');
      
      document.getElementById('page-title').textContent = tab.textContent.trim();
    });
  });
}

// Render Pipeline Kanban Cards
function renderPipeline() {
  const stages = ['scripted', 'editing', 'review', 'approved'];
  
  stages.forEach(s => {
    const container = document.getElementById(`cards-${s}`);
    const countBadge = document.getElementById(`count-${s}`);
    if (container) container.innerHTML = '';
    if (countBadge) countBadge.textContent = '0';
  });

  const stageCounts = { scripted: 0, editing: 0, review: 0, approved: 0 };

  projects.forEach(p => {
    const stageKey = p.stage.toLowerCase();
    const container = document.getElementById(`cards-${stageKey}`);
    
    if (container) {
      stageCounts[stageKey]++;
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-title">${escapeHtml(p.title)}</div>
        <div class="project-meta">
          <span>${escapeHtml(p.client)}</span>
          <span>Due: ${escapeHtml(p.date)}</span>
        </div>
      `;
      container.appendChild(card);
    }
  });

  // Render empty state notices if zero items exist in a column
  stages.forEach(s => {
    const container = document.getElementById(`cards-${s}`);
    const countBadge = document.getElementById(`count-${s}`);
    
    if (countBadge) countBadge.textContent = stageCounts[s];
    
    if (container && stageCounts[s] === 0) {
      container.innerHTML = `<div class="empty-state">No active cards</div>`;
    }
  });

  const metricCount = document.getElementById('metric-active-count');
  if (metricCount) metricCount.textContent = projects.length;

  saveState();
}

// Render Timecode Revisions
function renderRevisions() {
  const list = document.getElementById('revision-list');
  const countBadge = document.getElementById('revision-count');
  if (!list) return;
  list.innerHTML = '';

  if (countBadge) countBadge.textContent = `${revisions.length} Notes`;

  if (revisions.length === 0) {
    list.innerHTML = `<div class="empty-state">No revision notes pinned</div>`;
    return;
  }

  revisions.forEach(r => {
    const item = document.createElement('li');
    item.className = 'revision-item';
    item.innerHTML = `
      <span class="tc-tag">${escapeHtml(r.tc)}</span>
      <span>${escapeHtml(r.text)}</span>
    `;
    list.appendChild(item);
  });

  saveState();
}

// Modal & Event Listeners
function setupEventListeners() {
  const modal = document.getElementById('modal-project');
  
  document.getElementById('open-project-modal')?.addEventListener('click', () => {
    modal.style.display = 'flex';
  });
  
  document.getElementById('btn-cancel-project')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.getElementById('btn-save-project')?.addEventListener('click', () => {
    const title = document.getElementById('p-title').value.trim();
    const client = document.getElementById('p-client').value.trim();
    const date = document.getElementById('p-date').value;

    if (title && client) {
      projects.push({
        id: Date.now(),
        title,
        client,
        stage: 'Scripted',
        date: date || 'TBD'
      });
      renderPipeline();
      modal.style.display = 'none';
      document.getElementById('p-title').value = '';
      document.getElementById('p-client').value = '';
      document.getElementById('p-date').value = '';
    }
  });

  document.getElementById('btn-add-rev')?.addEventListener('click', () => {
    const tc = document.getElementById('rev-tc').value.trim() || '00:00';
    const text = document.getElementById('rev-text').value.trim();

    if (text) {
      revisions.push({ tc, text });
      renderRevisions();
      document.getElementById('rev-text').value = '';
    }
  });

  document.getElementById('btn-clear-data')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all workspace data?')) {
      projects = [];
      revisions = [];
      localStorage.clear();
      renderPipeline();
      renderRevisions();
    }
  });
}

function saveState() {
  localStorage.setItem('framesync_projects', JSON.stringify(projects));
  localStorage.setItem('framesync_revisions', JSON.stringify(revisions));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}
