// ═══════════════════════════════════════════════
//  quiz.js — InterviewOS Quiz Engine
//  30 Questions · 1 min/question · Auto-submit
// ═══════════════════════════════════════════════

const TIME_PER_QUESTION = 60; // seconds

let questions     = [];
let currentIndex  = 0;
let answers       = [];       // stores 'A','B','C','D' or null
let selectedSubject = '';
let timerInterval = null;
let timeLeft      = TIME_PER_QUESTION;
let quizStartTime = null;

// ─── Auth token from localStorage ───
function getToken() {
  return localStorage.getItem('ios_token') || '';
}

// ─── On Page Load ───
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  loadPastResults();
  setupDashboardButton();
});

// ─── Enable "Start Quiz" button on dashboard ───
function setupDashboardButton() {
  // This runs if quiz.js is loaded on dashboard page
  const btn = document.getElementById('btnStartQuiz');
  if (btn) {
    btn.addEventListener('click', () => {
      window.location.href = 'quiz.html';
    });
  }
}

// ─── Load sidebar user info ───
async function loadUserProfile() {
  try {
    const res = await fetch('/api/dashboard/profile', {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if (!res.ok) return;
    const data = await res.json();
    const name = (data.first_name || '') + ' ' + (data.last_name || '');
    const initials = ((data.first_name || 'U')[0] + (data.last_name || 'S')[0]).toUpperCase();

    const el = document.getElementById('sidebarName');
    const av1 = document.getElementById('sidebarAvatar');
    const av2 = document.getElementById('headerAvatar');
    if (el)  el.textContent  = name.trim() || 'User';
    if (av1) av1.textContent = initials;
    if (av2) av2.textContent = initials;
  } catch (e) { /* silent */ }
}

// ─── Load past quiz results ───
async function loadPastResults() {
  try {
    const res = await fetch('/api/quiz/results', {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if (!res.ok) return;
    const data = await res.json();
    renderPastResults(data);
  } catch (e) { /* silent */ }
}

function renderPastResults(results) {
  const container = document.getElementById('pastResults');
  if (!container) return;

  if (!results || results.length === 0) {
    container.innerHTML = '<div class="quiz-empty-msg">No quiz attempts yet. Start your first quiz above!</div>';
    return;
  }

  const rows = results.slice(0, 10).map(r => {
    const pct = Math.round((r.score / r.total) * 100);
    const cls = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low';
    const date = new Date(r.submitted_at).toLocaleDateString('en-IN', {
      day:'2-digit', month:'short', year:'numeric'
    });
    return `
      <tr>
        <td>${r.subject}</td>
        <td><span class="score-badge ${cls}">${r.score} / ${r.total}</span></td>
        <td>${pct}%</td>
        <td>${date}</td>
        <td>${getGradeLabel(pct)}</td>
      </tr>`;
  }).join('');

  container.innerHTML = `
    <table class="quiz-past-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Score</th>
          <th>Percentage</th>
          <th>Date</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ─── START QUIZ ───
async function startQuiz(subject) {
  selectedSubject = subject;

  // Show loading
  showScreen('screenQuiz');
  document.getElementById('quizSubjectBadge').textContent = subject;
  document.getElementById('qText').textContent = 'Loading questions...';
  document.getElementById('qOptions').innerHTML = '<div class="quiz-loading"><div class="quiz-spinner"></div><span>Fetching questions...</span></div>';

  try {
    const res = await fetch(`/api/quiz/questions/${encodeURIComponent(subject)}`, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });

    if (!res.ok) throw new Error('Failed to load questions');
    questions = await res.json();

    if (!questions || questions.length === 0) {
      showToast('No questions found for ' + subject + '. Please add questions to the database.', 'error');
      showScreen('screenSelect');
      return;
    }

    // Initialize state
    answers      = new Array(questions.length).fill(null);
    currentIndex = 0;
    quizStartTime = Date.now();

    // Build question dots
    buildDots();
    showQuestion(0);

  } catch (err) {
    showToast('Error loading questions: ' + err.message, 'error');
    showScreen('screenSelect');
  }
}

// ─── Build Question Dots ───
function buildDots() {
  const row = document.getElementById('quizDotsRow');
  row.innerHTML = '';
  questions.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'quiz-dot' + (i === 0 ? ' current' : '');
    dot.textContent = i + 1;
    dot.title = 'Question ' + (i + 1);
    dot.onclick = () => jumpToQuestion(i);
    row.appendChild(dot);
  });
}

// ─── Show Question ───
function showQuestion(index) {
  clearInterval(timerInterval);
  currentIndex = index;
  const q = questions[index];

  // Update progress
  const pct = ((index + 1) / questions.length) * 100;
  document.getElementById('quizProgressFill').style.width = pct + '%';
  document.getElementById('qProgress').textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById('qNumber').textContent = `Q${index + 1}`;
  document.getElementById('qText').textContent = q.question;

  // Update dots
  updateDots();

  // Render options
  const opts = document.getElementById('qOptions');
  const keys = ['A', 'B', 'C', 'D'];
  const optTexts = [q.option_a, q.option_b, q.option_c, q.option_d];

  opts.innerHTML = keys.map((k, i) => `
    <button class="quiz-option ${answers[index] === k ? 'selected' : ''}"
            onclick="selectOption('${k}', this)"
            id="opt_${k}">
      <span class="quiz-option-key">${k}</span>
      <span>${optTexts[i] || ''}</span>
    </button>
  `).join('');

  // Nav buttons
  document.getElementById('btnPrev').disabled = (index === 0);
  document.getElementById('btnNext').textContent = (index === questions.length - 1) ? 'Submit Quiz ✓' : 'Next →';

  // Start timer
  startTimer(index);
}

// ─── Timer ───
function startTimer(questionIndex) {
  timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      // Auto-skip: mark as null (skipped due to timeout)
      if (answers[questionIndex] === null) {
        answers[questionIndex] = null; // already null = skipped
      }
      showToast("⏰ Time's up! Moving to next question.", 'warn');

      setTimeout(() => {
        if (questionIndex < questions.length - 1) {
          showQuestion(questionIndex + 1);
        } else {
          submitQuiz();
        }
      }, 800);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  const wrap = document.getElementById('quizTimer');
  if (!el) return;

  el.textContent = timeLeft;

  wrap.className = 'quiz-timer';
  if (timeLeft <= 10) wrap.classList.add('danger');
  else if (timeLeft <= 20) wrap.classList.add('warning');
}

// ─── Select Option ───
function selectOption(key, btnEl) {
  // Deselect all
  document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
  answers[currentIndex] = key;
  updateDots();
}

// ─── Update Dots ───
function updateDots() {
  const dots = document.querySelectorAll('.quiz-dot');
  dots.forEach((dot, i) => {
    dot.className = 'quiz-dot';
    if (i === currentIndex) dot.classList.add('current');
    else if (answers[i] !== null) dot.classList.add('answered');
    // If we passed it without answering
    else if (i < currentIndex && answers[i] === null) dot.classList.add('skipped');
  });
}

// ─── Navigation ───
function nextQuestion() {
  clearInterval(timerInterval);
  if (currentIndex < questions.length - 1) {
    showQuestion(currentIndex + 1);
  } else {
    submitQuiz();
  }
}

function prevQuestion() {
  clearInterval(timerInterval);
  if (currentIndex > 0) {
    showQuestion(currentIndex - 1);
  }
}

function skipQuestion() {
  clearInterval(timerInterval);
  // Leave answer as null
  if (currentIndex < questions.length - 1) {
    showQuestion(currentIndex + 1);
  } else {
    submitQuiz();
  }
}

function jumpToQuestion(index) {
  clearInterval(timerInterval);
  showQuestion(index);
}

// ─── SUBMIT QUIZ ───
async function submitQuiz() {
  clearInterval(timerInterval);

  // Calculate score locally first for display
  let correct = 0, wrong = 0, skipped = 0;
  questions.forEach((q, i) => {
    if (answers[i] === null) skipped++;
    else if (answers[i] === q.correct_option) correct++;
    else wrong++;
  });

  // Save to server
  try {
    await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({
        subject: selectedSubject,
        answers,
        questions,
        score: correct,
        total: questions.length
      })
    });
  } catch (e) { /* continue even if save fails */ }

  showResult(correct, wrong, skipped);
}

// ─── SHOW RESULT ───
function showResult(correct, wrong, skipped) {
  showScreen('screenResult');

  const total   = questions.length;
  const pct     = Math.round((correct / total) * 100);
  const grade   = getGradeLabel(pct);
  const emoji   = pct >= 80 ? '🏆' : pct >= 60 ? '🎉' : pct >= 40 ? '👍' : '📚';

  document.getElementById('resultEmoji').textContent   = emoji;
  document.getElementById('resultTitle').textContent   = pct >= 60 ? 'Great Performance!' : 'Quiz Complete!';
  document.getElementById('resultSubject').textContent = selectedSubject;
  document.getElementById('scoreVal').textContent      = correct;
  document.getElementById('resCorrect').textContent    = correct;
  document.getElementById('resWrong').textContent      = wrong;
  document.getElementById('resSkipped').textContent    = skipped;
  document.getElementById('resPercent').textContent    = pct + '%';
  document.getElementById('resultGrade').textContent   = grade;

  // Animate circle
  const circumference = 2 * Math.PI * 52; // ≈ 326.7
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => {
    const circle = document.getElementById('scoreCircle');
    if (circle) {
      circle.style.transition = 'stroke-dashoffset 1s ease';
      circle.style.strokeDashoffset = offset;
      // Color based on score
      if (pct >= 70) circle.style.stroke = '#10B981';
      else if (pct >= 40) circle.style.stroke = '#F97316';
      else circle.style.stroke = '#EF4444';
    }
  }, 200);
}

function getGradeLabel(pct) {
  if (pct >= 90) return '🏆 Outstanding — A+';
  if (pct >= 80) return '🥇 Excellent — A';
  if (pct >= 70) return '🥈 Very Good — B+';
  if (pct >= 60) return '✅ Good — B';
  if (pct >= 50) return '👍 Average — C';
  if (pct >= 40) return '📖 Below Average — D';
  return '📚 Needs Improvement — F';
}

// ─── Review Answers ───
function reviewAnswers() {
  const section = document.getElementById('reviewSection');
  const list    = document.getElementById('reviewList');

  if (section.style.display === 'block') {
    section.style.display = 'none';
    return;
  }

  list.innerHTML = questions.map((q, i) => {
    const userAns   = answers[i];
    const correct   = q.correct_option;
    const optMap    = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    let userTag = '';

    if (userAns === null) {
      userTag = `<span class="review-ans-tag skipped">⏭️ Skipped</span>`;
    } else if (userAns === correct) {
      userTag = `<span class="review-ans-tag your-correct">✅ Your answer: ${userAns}. ${optMap[userAns]}</span>`;
    } else {
      userTag = `<span class="review-ans-tag your-wrong">❌ Your answer: ${userAns}. ${optMap[userAns]}</span>
                 <span class="review-ans-tag correct-ans">✅ Correct: ${correct}. ${optMap[correct]}</span>`;
    }

    return `
      <div class="review-item">
        <div class="review-q-num">Question ${i + 1}</div>
        <div class="review-q-text">${q.question}</div>
        <div class="review-answer-row">${userTag}</div>
      </div>`;
  }).join('');

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Retake / Go Home ───
function retakeQuiz() {
  document.getElementById('reviewSection').style.display = 'none';
  startQuiz(selectedSubject);
}

function goHome() {
  window.location.href = 'dashboard.html';
}

// ─── Quit ───
function confirmQuit() {
  document.getElementById('quitModal').style.display = 'flex';
}

function closeQuit() {
  document.getElementById('quitModal').style.display = 'none';
}

function quitQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quitModal').style.display = 'none';
  showScreen('screenSelect');
  loadPastResults();
}

// ─── Screen Switcher ───
function showScreen(id) {
  ['screenSelect', 'screenQuiz', 'screenResult'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = (s === id) ? 'block' : 'none';
  });
}

// ─── Toast ───
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show';
  if (type === 'error') t.style.background = '#EF4444';
  else if (type === 'warn') t.style.background = '#F97316';
  else t.style.background = '#10B981';
  setTimeout(() => t.classList.remove('show'), 3000);
}