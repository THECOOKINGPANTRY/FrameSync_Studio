// FrameSync Studio Data Store
let projects = JSON.parse(localStorage.getItem('framesync_projects')) || [
  { id: 1, title: 'YouTube Tech Review #42', client: 'Tech Studio', stage: 'Scripted', date: '2026-10-05' },
  { id: 2, title: 'Brand Launch Commercial Cut', client: 'Apex Agency', stage: 'Editing', date: '2026-10-02' },
  { id: 3, title: 'Podcast Episode 12 Highlight Reel', client: 'Creator Hub', stage: 'Review', date: '2026-09-30' }
];

let revisions = [
  { tc: '00:42', text: 'Trim 3 frames off the intro transition sound effect.' },
  { tc: '01:14', text: 'Color balance green shift on B-Cam footage.' }
];

// Initialize Navigation & UI
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
    if (container) container.innerHTML = '';
  });

  projects.forEach(p => {
    const containerKey = p.stage.toLowerCase();
    const container = document.getElementById(`cards-${containerKey}`);
    
    if (container) {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-title">${p.title}</div>
        <div class="project-meta">
          <span>${p.client}</span>
          <span>Due: ${p.date}</span>
        </div>
      `;
      container.appendChild(card);
    }
  });

  saveProjects();
}

// Render Revisions
function renderRevisions() {
  const list = document.getElementById('revision-list');
  if (!list) return;
  list.innerHTML = '';

  revisions.forEach(r => {
    const item = document.createElement('li');
    item.className = 'revision-item';
    item.innerHTML = `
      <span class="tc-tag">${r.tc}</span>
      <span>${r.text}</span>
    `;
    list.appendChild(item);
  });
}

// Modal & Event Listeners
function setupEventListeners() {
  const modal = document.getElementById('modal-project');
  document.getElementById('open-project-modal')?.addEventListener('click', () => modal.style.display = 'flex');
  document.getElementById('btn-cancel-project')?.addEventListener('click', () => modal.style.display = 'none');

  document.getElementById('btn-save-project')?.addEventListener('click', () => {
    const title = document.getElementById('p-title').value;
    const client = document.getElementById('p-client').value;
    const date = document.getElementById('p-date').value;

    if (title && client) {
      projects.push({ id: Date.now(), title, client, stage: 'Scripted', date: date || 'N/A' });
      renderPipeline();
      modal.style.display = 'none';
      document.getElementById('p-title').value = '';
      document.getElementById('p-client').value = '';
    }
  });

  document.getElementById('btn-add-rev')?.addEventListener('click', () => {
    const tc = document.getElementById('rev-tc').value || '00:00';
    const text = document.getElementById('rev-text').value;

    if (text) {
      revisions.push({ tc, text });
      renderRevisions();
      document.getElementById('rev-text').value = '';
    }
  });
}

function saveProjects() {
  localStorage.setItem('framesync_projects', JSON.stringify(projects));
}
