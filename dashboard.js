// ═══════════════════════════════════════════
//  InterviewOS Dashboard – Client Logic
// ═══════════════════════════════════════════

const API = '';  // same origin
const token = localStorage.getItem('ios_token');

// Redirect to login if no token
if (!token) {
  window.location.href = 'login.html';
}

// ─── Helpers ───
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

async function apiFetch(endpoint) {
  try {
    const res = await fetch(`${API}${endpoint}`, { headers: authHeaders() });
    if (res.status === 401) { localStorage.removeItem('ios_token'); window.location.href = 'login.html'; return null; }
    return await res.json();
  } catch (e) { console.error('API error:', e); return null; }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Load Profile ───
async function loadProfile() {
  const profile = await apiFetch('/api/dashboard/profile');
  if (!profile || profile.error) return;

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();

  document.getElementById('greetingTitle').textContent = `Hello, ${profile.first_name}! 👋`;
  document.getElementById('sidebarName').textContent = fullName;
  document.getElementById('sidebarPlan').innerHTML = `${profile.plan} Plan 🔥`;
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('headerAvatar').textContent = initials;
}

// ─── Load Stats ───
async function loadStats() {
  const stats = await apiFetch('/api/dashboard/stats');
  if (!stats || stats.error) return;

  document.getElementById('statCoding').textContent = stats.coding_solved;
  document.getElementById('statQuiz').textContent = `${stats.quiz_score_avg}%`;
  document.getElementById('statInterview').textContent = `${stats.interview_score_avg}%`;
  document.getElementById('statAccuracy').textContent = `${stats.accuracy}%`;

  document.getElementById('statCodingChange').textContent = `↑ ${stats.coding_weekly_change}`;
  document.getElementById('statQuizChange').textContent = `↑ ${stats.quiz_weekly_change}%`;
  document.getElementById('statInterviewChange').textContent = `↑ ${stats.interview_weekly_change}%`;
  document.getElementById('statAccuracyChange').textContent = `↑ ${stats.accuracy_weekly_change}%`;

  // Overall progress label
  const avg = (stats.quiz_score_avg + stats.interview_score_avg + stats.accuracy) / 3;
  let label = 'Getting Started';
  if (avg >= 80) label = 'Excellent';
  else if (avg >= 60) label = 'Good';
  else if (avg >= 40) label = 'Fair';
  document.getElementById('statOverall').textContent = label;
}

// ─── Load Progress Chart ───
let progressChart = null;
async function loadProgress() {
  const data = await apiFetch('/api/dashboard/progress');
  if (!data || data.error) return;

  const labels = data.map(d => d.day);
  const coding = data.map(d => d.coding_score);
  const quiz = data.map(d => d.quiz_score);
  const interview = data.map(d => d.interview_score);

  const ctx = document.getElementById('progressChart').getContext('2d');

  if (progressChart) progressChart.destroy();

  progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Coding',
          data: coding,
          borderColor: '#6C4FE8',
          backgroundColor: 'rgba(108,79,232,0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#6C4FE8',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Quiz',
          data: quiz,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16,185,129,0.06)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Interview',
          data: interview,
          borderColor: '#F97316',
          backgroundColor: 'rgba(249,115,22,0.06)',
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#F97316',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: '#F3F4F6' },
          ticks: { font: { size: 11, family: 'Inter' }, color: '#9CA3AF' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'Inter' }, color: '#9CA3AF' }
        }
      }
    }
  });
}

// ─── Load Weak Topics ───
async function loadWeakTopics() {
  const data = await apiFetch('/api/dashboard/weak-topics');
  if (!data || data.error) return;

  const container = document.getElementById('weakTopicsList');
  const colors = ['t1', 't2', 't3', 't4'];

  container.innerHTML = data.map((t, i) => `
    <div class="topic-item">
      <div class="topic-icon ${colors[i % 4]}">${t.icon || '📘'}</div>
      <div class="topic-info">
        <div class="topic-name">${t.topic_name}</div>
        <div class="topic-bar">
          <div class="topic-bar-fill ${colors[i % 4]}" style="width: ${t.score_percentage}%"></div>
        </div>
      </div>
      <div class="topic-percent">${t.score_percentage}%</div>
    </div>
  `).join('');
}

// ─── Load Goals ───
async function loadGoals() {
  const data = await apiFetch('/api/dashboard/goals');
  if (!data || data.error) return;

  const container = document.getElementById('goalsList');

  container.innerHTML = data.slice(0, 3).map(g => {
    const isComplete = g.status === 'completed';
    const isDone = g.progress_current >= g.progress_total && g.progress_total > 0;
    const checkClass = (isComplete || isDone) ? 'completed' : 'pending';
    const metaText = isComplete ? 'Completed' :
      g.status === 'in_progress' ? `${g.progress_current}/${g.progress_total} completed` : 'Not started';

    return `
      <div class="goal-item">
        <div class="goal-check ${checkClass}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="goal-info">
          <div class="goal-title">${g.title}</div>
          <div class="goal-meta">⏱ ${metaText}</div>
        </div>
        <div class="goal-date">${formatDate(g.due_date)}</div>
      </div>
    `;
  }).join('');
}

// ─── Add Goal Modal ───
document.getElementById('addGoalBtn').addEventListener('click', () => {
  document.getElementById('goalModal').classList.add('active');
  document.getElementById('goalTitleInput').value = '';
  document.getElementById('goalDateInput').value = '';
});

document.getElementById('goalModalCancel').addEventListener('click', () => {
  document.getElementById('goalModal').classList.remove('active');
});

document.getElementById('goalModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById('goalModal').classList.remove('active');
  }
});

document.getElementById('goalModalSubmit').addEventListener('click', async () => {
  const title = document.getElementById('goalTitleInput').value.trim();
  const due_date = document.getElementById('goalDateInput').value;

  if (!title || !due_date) { showToast('Please fill in all fields'); return; }

  try {
    const res = await fetch(`${API}/api/dashboard/goals`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title, due_date })
    });
    const data = await res.json();
    if (data.error) { showToast(data.error); return; }

    document.getElementById('goalModal').classList.remove('active');
    showToast('Goal added successfully! 🎯');
    loadGoals();
  } catch (e) {
    showToast('Failed to add goal');
  }
});

// ─── Feature Card Buttons ───
document.getElementById('btnStartQuiz').addEventListener('click', () => {
  window.location.href = 'quiz.html';
});

document.getElementById('btnStartCoding').addEventListener('click', () => {
  showToast('Coding section coming soon! 🚀');
});

document.getElementById('btnStartInterview').addEventListener('click', () => {
  showToast('Interview section coming soon! 🎙️');
});

// ─── Nav item click highlight ───
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});

// ─── Init ───
async function init() {
  await Promise.all([
    loadProfile(),
    loadStats(),
    loadProgress(),
    loadWeakTopics(),
    loadGoals()
  ]);
}

init();