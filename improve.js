// ════════════════════════════════════════════
//  InterviewOS — improve.js
//  AI Roadmap + NVIDIA-powered Weak Topic Quiz
// ════════════════════════════════════════════

const API = '';
const token = localStorage.getItem('ios_token');
if (!token) window.location.href = 'login.html';

let weakTopics = [];
let quizQuestions = [];
let currentQ = 0;
let userAnswers = [];   // { selected, correct, skipped }
let timerInterval = null;
let timeLeft = 90;      // 1.5 minutes per question
let selectedOption = null;

// ─── Screen Switch ───
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── Auth Headers ───
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// ════════════════════════════════════════════
//  INIT: Load Profile + Roadmap
// ════════════════════════════════════════════
async function init() {
  // Load sidebar profile
  try {
    const res = await fetch(`${API}/api/dashboard/profile`, { headers: authHeaders() });
    const p = await res.json();
    if (p && p.first_name) {
      document.getElementById('sidebarName').textContent = `${p.first_name} ${p.last_name}`;
      document.getElementById('sidebarAvatar').textContent = `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();
      document.getElementById('sidebarPlan').textContent = `${p.plan} Plan 🔥`;
    }
  } catch (e) {}

  // Load roadmap
  await loadRoadmap();
}

// ════════════════════════════════════════════
//  ROADMAP: Fetch from server (NVIDIA AI)
// ════════════════════════════════════════════
async function loadRoadmap() {
  showScreen('screen-loading');
  try {
    const res = await fetch(`${API}/api/improve/roadmap`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load roadmap');
    const data = await res.json();

    weakTopics = data.weakTopics || [];
    renderRoadmap(data);
    showScreen('screen-roadmap');

  } catch (err) {
    console.error('Roadmap error:', err);
    // Show error inline
    showScreen('screen-roadmap');
    document.getElementById('aiAnalysisText').textContent = '❌ Failed to load AI roadmap. Please try again.';
    document.getElementById('weakTopicsPills').innerHTML = '<p style="color:#6B7280;font-size:14px;">Could not load weak topics.</p>';
  }
}

// ─── Render Roadmap ───
function renderRoadmap(data) {
  // Weak Topic Pills
  const pillsEl = document.getElementById('weakTopicsPills');
  if (!weakTopics.length) {
    pillsEl.innerHTML = '<p style="color:#10B981;font-size:14px;font-weight:600;">🎉 No weak topics found! You\'re doing great!</p>';
  } else {
    pillsEl.innerHTML = weakTopics.map(t => `
      <span class="weak-topic-pill">
        ${t.icon || '📘'} ${t.topic_name}
        <span class="pill-pct">${t.score_percentage}%</span>
      </span>
    `).join('');
  }

  // AI Analysis Text
  document.getElementById('aiAnalysisText').textContent = data.analysis || 'AI analysis not available.';

  // Roadmap Steps
  const stepsEl = document.getElementById('roadmapSteps');
  const steps = data.steps || [];
  const weekClasses = ['week1', 'week2', 'week3', 'week4'];
  stepsEl.innerHTML = steps.map((step, i) => `
    <div class="roadmap-step">
      <div class="step-left">
        <div class="step-num">${i + 1}</div>
        <div class="step-line"></div>
      </div>
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-desc">${step.description}</div>
        <span class="step-tag ${weekClasses[i % 4]}">${step.timeline || `Week ${i + 1}`}</span>
      </div>
    </div>
  `).join('');

  // Quiz CTA Topics
  const ctaTopicsEl = document.getElementById('quizCtaTopics');
  ctaTopicsEl.innerHTML = weakTopics.slice(0, 5).map(t =>
    `<span class="quiz-cta-topic">${t.icon || '📘'} ${t.topic_name}</span>`
  ).join('');
}

// ════════════════════════════════════════════
//  START QUIZ: NVIDIA AI generates questions
// ════════════════════════════════════════════
document.getElementById('btnStartQuiz').addEventListener('click', async () => {
  if (!weakTopics.length) {
    alert('No weak topics found! Complete some quizzes/interviews first.');
    return;
  }
  await startAIQuiz();
});

async function startAIQuiz() {
  showScreen('screen-quiz-loading');
  try {
    const topicNames = weakTopics.map(t => t.topic_name);
    const res = await fetch(`${API}/api/improve/quiz`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ topics: topicNames })
    });

    if (!res.ok) throw new Error('Failed to generate quiz');
    const data = await res.json();
    quizQuestions = data.questions || [];

    if (!quizQuestions.length) throw new Error('No questions generated');

    currentQ = 0;
    userAnswers = new Array(quizQuestions.length).fill(null);
    selectedOption = null;

    showScreen('screen-quiz');
    loadQuizQuestion(currentQ);

  } catch (err) {
    console.error('Quiz error:', err);
    alert('Failed to generate AI quiz: ' + err.message);
    showScreen('screen-roadmap');
  }
}

// ─── Load Quiz Question ───
function loadQuizQuestion(index) {
  const q = quizQuestions[index];
  if (!q) return;

  // Progress
  const pct = (index / quizQuestions.length) * 100;
  document.getElementById('quizProgressFill').style.width = pct + '%';
  document.getElementById('quizQLabel').textContent = `Question ${index + 1} of ${quizQuestions.length}`;
  document.getElementById('quizQNum').textContent = `Q${index + 1}`;
  document.getElementById('quizTopicBadge').textContent = q.topic || 'Weak Topic';
  document.getElementById('quizQText').textContent = q.question;

  // Options
  const optionsEl = document.getElementById('quizOptions');
  const opts = ['A', 'B', 'C', 'D'];
  const optKeys = ['option_a', 'option_b', 'option_c', 'option_d'];
  optionsEl.innerHTML = opts.map((letter, i) => `
    <div class="quiz-option" data-opt="${letter}">
      <div class="opt-letter">${letter}</div>
      ${q[optKeys[i]] || ''}
    </div>
  `).join('');

  // Attach click handlers
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => selectOption(opt.dataset.opt));
  });

  const btnPrev = document.getElementById('btnQuizPrev');
  if (btnPrev) btnPrev.disabled = (index === 0);

  const pastAns = userAnswers[index];
  if (pastAns && pastAns.selected) {
    selectOption(pastAns.selected);
  } else {
    selectedOption = null;
    document.getElementById('btnQuizNext').disabled = true;
  }

  // Timer
  resetQuizTimer();
}

// ─── Option Selection ───
function selectOption(letter) {
  selectedOption = letter;
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.opt === letter);
  });
  document.getElementById('btnQuizNext').disabled = false;
}

// ─── Timer ───
function resetQuizTimer() {
  clearInterval(timerInterval);
  timeLeft = 90;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      saveQuizAnswer(true);
      nextQuizQuestion();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const el = document.getElementById('quizTimer');
  el.textContent = `⏱ ${mins}:${secs.toString().padStart(2, '0')}`;
  el.className = 'quiz-timer';
  if (timeLeft <= 15) el.classList.add('danger');
  else if (timeLeft <= 30) el.classList.add('warning');
}

// ─── Save Answer ───
function saveQuizAnswer(skipped = false) {
  const q = quizQuestions[currentQ];
  if (!q) return;
  userAnswers[currentQ] = {
    question: q.question,
    topic: q.topic || 'Topic',
    selected: skipped ? null : selectedOption,
    correct: q.correct_option,
    option_a: q.option_a, option_b: q.option_b,
    option_c: q.option_c, option_d: q.option_d,
    skipped
  };
}

// ─── Next / Finish ───
document.getElementById('btnQuizNext').addEventListener('click', () => {
  clearInterval(timerInterval);
  saveQuizAnswer(false);
  nextQuizQuestion();
});

document.getElementById('btnQuizSkip').addEventListener('click', () => {
  clearInterval(timerInterval);
  saveQuizAnswer(true);
  nextQuizQuestion();
});

document.getElementById('btnQuizQuit').addEventListener('click', () => {
  if (confirm('Are you sure you want to quit the quiz? Your progress will be lost.')) {
    clearInterval(timerInterval);
    showScreen('screen-roadmap');
  }
});

document.getElementById('btnQuizPrev')?.addEventListener('click', () => {
  clearInterval(timerInterval);
  saveQuizAnswer(false);
  prevQuizQuestion();
});

function prevQuizQuestion() {
  if (currentQ > 0) {
    currentQ--;
    loadQuizQuestion(currentQ);
  }
}

function nextQuizQuestion() {
  currentQ++;
  if (currentQ >= quizQuestions.length) {
    showResults();
  } else {
    loadQuizQuestion(currentQ);
  }
}

// ════════════════════════════════════════════
//  RESULTS
// ════════════════════════════════════════════
function showResults() {
  clearInterval(timerInterval);
  showScreen('screen-results');

  let correct = 0;
  userAnswers.forEach(a => {
    if (a && !a.skipped && a.selected === a.correct) correct++;
  });

  const total = quizQuestions.length;

  // Score
  document.getElementById('resultBigScore').innerHTML = `${correct}<span>/${total}</span>`;

  // Title
  const pct = Math.round((correct / total) * 100);
  let title, subtitle;
  if (pct >= 80) { title = '🎉 Excellent Work!'; subtitle = `You scored ${correct}/${total}. Great improvement on your weak topics!`; }
  else if (pct >= 60) { title = '👍 Good Progress!'; subtitle = `You scored ${correct}/${total}. Keep practicing and you\'ll master these topics!`; }
  else if (pct >= 40) { title = '📚 Keep Practicing!'; subtitle = `You scored ${correct}/${total}. Review the topics below and try again.`; }
  else { title = '💪 Don\'t Give Up!'; subtitle = `You scored ${correct}/${total}. These are tough topics — keep working at them!`; }

  document.getElementById('resultTitle').textContent = title;
  document.getElementById('resultSubtitle').textContent = subtitle;

  // Breakdown
  const breakdownEl = document.getElementById('resultBreakdown');
  const optMap = { A: 'option_a', B: 'option_b', C: 'option_c', D: 'option_d' };
  breakdownEl.innerHTML = userAnswers.map((a, i) => {
    if (!a) return ''; // Safely handle null answers
    let cardClass = 'result-q-card';
    let badge = '';
    if (a.skipped || !a.selected) { cardClass += ' skip-card'; badge = '<span class="rq-badge skip">Skipped</span>'; }
    else if (a.selected === a.correct) { cardClass += ' correct-card'; badge = '<span class="rq-badge correct">✓ Correct</span>'; }
    else { cardClass += ' wrong-card'; badge = '<span class="rq-badge wrong">✗ Wrong</span>'; }

    const correctAns = a[optMap[a.correct]] || a.correct;
    const yourAns = a.selected ? (a[optMap[a.selected]] || a.selected) : '—';

    return `
      <div class="${cardClass}" style="animation-delay:${i * 0.05}s">
        <div class="rq-header">
          <div class="rq-q">Q${i+1}. ${a.question}</div>
          ${badge}
        </div>
        <div class="rq-answer">
          <strong>Correct:</strong> ${a.correct}. ${correctAns}
          ${!a.skipped && a.selected !== a.correct ? ` &nbsp;|&nbsp; <strong>Your answer:</strong> ${a.selected}. ${yourAns}` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ─── Retry ───
document.getElementById('btnRetryQuiz').addEventListener('click', async () => {
  await startAIQuiz();
});

// ─── Dashboard ───
document.getElementById('btnGoDashboard').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// ─── Boot ───
init();