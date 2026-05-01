// ════════════════════════════════════════════
//  InterviewOS — interview.js
//  Frontend: subject select, timer, Q flow, evaluation
// ════════════════════════════════════════════

const API = '';  // same-origin

let selectedSubject = null;
let selectedDifficulty = null;
let questions = [];
let currentQ = 0;
let answers = [];          // { question, userAnswer, skipped }
let timerInterval = null;
let timeLeft = 180;        // 3 minutes in seconds
let token = null;

// ─── Auth Guard ───
function getToken() {
  const t = localStorage.getItem('ios_token');
  if (!t) { window.location.href = 'login.html'; return null; }
  return t;
}

// ─── Screen Switch ───
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── Subject Selection ───
document.querySelectorAll('.subject-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.subject-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedSubject = card.dataset.subject;

    const row = document.getElementById('difficulty-row');
    row.style.display = 'flex';

    // reset difficulty
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
    selectedDifficulty = null;
    document.getElementById('btn-start').disabled = true;
  });
});

// ─── Difficulty Selection ───
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDifficulty = btn.dataset.diff;
    document.getElementById('btn-start').disabled = false;
  });
});

// ─── Start Interview ───
document.getElementById('btn-start').addEventListener('click', async () => {
  token = getToken();
  if (!token) return;
  if (!selectedSubject || !selectedDifficulty) return;

  showScreen('screen-loading');

  // Update loading text
  const subjectNames = {
    DSA:'DSA', DBMS:'DBMS', OS:'Operating Systems', CN:'Computer Networks',
    C:'C Programming', CPP:'C++', Java:'Java', Python:'Python'
  };
  document.querySelector('#loading-subject-text strong').textContent =
    `${subjectNames[selectedSubject]} (${selectedDifficulty})`;

  try {
    const res = await fetch(`${API}/api/interview/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subject: selectedSubject, difficulty: selectedDifficulty })
    });

    if (!res.ok) throw new Error('Failed to fetch questions');
    questions = await res.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions received');
    }

    // Init state
    currentQ = 0;
    answers = [];
    startInterview();

  } catch (err) {
    alert('Error generating questions: ' + err.message);
    showScreen('screen-select');
  }
});

// ─── Start Interview Screen ───
function startInterview() {
  // Set topbar labels
  const subjectNames = {
    DSA:'DSA', DBMS:'DBMS', OS:'Operating Systems', CN:'Computer Networks',
    C:'C Programming', CPP:'C++', Java:'Java', Python:'Python'
  };
  document.getElementById('itb-subject-label').textContent = subjectNames[selectedSubject];

  const diffBadge = document.getElementById('itb-diff-label');
  diffBadge.textContent = selectedDifficulty;
  diffBadge.className = 'itb-diff ' + selectedDifficulty.toLowerCase();

  showScreen('screen-interview');
  loadQuestion(currentQ);
}

// ─── Load Question ───
function loadQuestion(index) {
  const q = questions[index];
  if (!q) return;

  // Update progress
  const pct = (index / questions.length) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = `Question ${index + 1} of ${questions.length}`;

  // Q meta
  document.getElementById('q-number').textContent = `Q${index + 1}`;

  const diffBadge = document.getElementById('q-diff-badge');
  diffBadge.textContent = q.difficulty || selectedDifficulty;
  diffBadge.className = 'q-difficulty-badge ' + (q.difficulty || selectedDifficulty).toLowerCase();

  document.getElementById('q-category').textContent = q.category || selectedSubject;

  // Q text
  document.getElementById('q-text').textContent = q.question;

  // Clear answer
  const textarea = document.getElementById('answer-input');
  textarea.value = '';
  document.getElementById('word-count').textContent = '0 words';
  textarea.focus();

  // Start timer
  resetTimer();
}

// ─── Word Count ───
document.getElementById('answer-input').addEventListener('input', function () {
  const words = this.value.trim() === '' ? 0 : this.value.trim().split(/\s+/).length;
  document.getElementById('word-count').textContent = `${words} word${words !== 1 ? 's' : ''}`;
});

// ─── Timer ───
function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 180;
  updateTimerDisplay();
  timerInterval = setInterval(tickTimer, 1000);
}

function tickTimer() {
  timeLeft--;
  updateTimerDisplay();

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    autoSubmitAnswer();
  }
}

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  document.getElementById('timer-display').textContent =
    `${mins}:${secs.toString().padStart(2, '0')}`;

  const box = document.getElementById('timer-box');
  box.className = 'timer-box';
  if (timeLeft <= 30) box.classList.add('danger');
  else if (timeLeft <= 60) box.classList.add('warning');
}

// ─── Auto Submit when timer ends ───
function autoSubmitAnswer() {
  saveAnswer(true);
  nextQuestion();
}

// ─── Submit Answer Button ───
document.getElementById('btn-submit-ans').addEventListener('click', () => {
  clearInterval(timerInterval);
  saveAnswer(false);
  nextQuestion();
});

// ─── Skip Button ───
document.getElementById('btn-skip').addEventListener('click', () => {
  clearInterval(timerInterval);
  answers.push({
    question: questions[currentQ].question,
    userAnswer: '',
    skipped: true,
    category: questions[currentQ].category || selectedSubject,
    difficulty: questions[currentQ].difficulty || selectedDifficulty
  });
  nextQuestion();
});

// ─── Save Answer ───
function saveAnswer(timedOut) {
  const ans = document.getElementById('answer-input').value.trim();
  answers.push({
    question: questions[currentQ].question,
    userAnswer: ans,
    skipped: false,
    timedOut,
    category: questions[currentQ].category || selectedSubject,
    difficulty: questions[currentQ].difficulty || selectedDifficulty
  });
}

// ─── Next Question or Evaluate ───
function nextQuestion() {
  currentQ++;
  if (currentQ >= questions.length) {
    startEvaluation();
  } else {
    loadQuestion(currentQ);
  }
}

// ─── Evaluation Screen ───
async function startEvaluation() {
  clearInterval(timerInterval);
  showScreen('screen-evaluating');

  // Animate steps
  const steps = ['estep1','estep2','estep3','estep4'];
  let stepIdx = 0;

  const stepInterval = setInterval(() => {
    if (stepIdx > 0) {
      document.getElementById(steps[stepIdx - 1]).className = 'eval-step done';
    }
    if (stepIdx < steps.length) {
      document.getElementById(steps[stepIdx]).className = 'eval-step active';
      stepIdx++;
    } else {
      clearInterval(stepInterval);
    }
  }, 1200);

  try {
    const res = await fetch(`${API}/api/interview/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subject: selectedSubject,
        difficulty: selectedDifficulty,
        answers
      })
    });

    if (!res.ok) throw new Error('Evaluation failed');
    const evalData = await res.json();

    clearInterval(stepInterval);
    steps.forEach(s => document.getElementById(s).className = 'eval-step done');

    setTimeout(() => showResults(evalData), 600);

  } catch (err) {
    clearInterval(stepInterval);
    alert('Evaluation error: ' + err.message);
    showScreen('screen-select');
  }
}

// ─── Show Results ───
function showResults(evalData) {
  showScreen('screen-results');

  const totalScore = evalData.totalScore || 0;
  const maxScore = evalData.maxScore || 10;

  // Score circle
  document.getElementById('score-number').textContent = totalScore;
  const deg = Math.round((totalScore / maxScore) * 360);
  const color = totalScore >= 7 ? '#6C4FE8' : totalScore >= 4 ? '#eab308' : '#ef4444';
  document.getElementById('score-circle').style.background =
    `conic-gradient(${color} ${deg}deg, #E5E7EB ${deg}deg)`;

  // Title & subtitle
  let title, subtitle;
  if (totalScore >= 8) {
    title = '🎉 Excellent Performance!';
    subtitle = `You scored ${totalScore}/${maxScore}. Outstanding work! You have strong command of ${selectedSubject}.`;
  } else if (totalScore >= 6) {
    title = '👍 Good Job!';
    subtitle = `You scored ${totalScore}/${maxScore}. Solid performance. A bit more practice will make you interview-ready!`;
  } else if (totalScore >= 4) {
    title = '📚 Keep Practicing!';
    subtitle = `You scored ${totalScore}/${maxScore}. There's room to improve. Focus on the weak areas highlighted below.`;
  } else {
    title = '💪 Don\'t Give Up!';
    subtitle = `You scored ${totalScore}/${maxScore}. Keep studying and try again. Every attempt makes you better!`;
  }

  document.getElementById('result-title').textContent = title;
  document.getElementById('result-subtitle').textContent = subtitle;
  document.getElementById('res-subject').textContent = selectedSubject;
  document.getElementById('res-diff').textContent = selectedDifficulty;

  // Breakdown
  const breakdown = document.getElementById('results-breakdown');
  breakdown.innerHTML = '';

  (evalData.breakdown || []).forEach((item, i) => {
    const score = item.score ?? 0;
    const isSkipped = item.skipped;

    let scoreClass = 'high';
    if (isSkipped) scoreClass = 'skip';
    else if (score < 4) scoreClass = 'low';
    else if (score < 7) scoreClass = 'mid';

    let cardClass = 'breakdown-card';
    if (isSkipped) cardClass += ' skipped';
    else if (score >= 7) cardClass += ' score-high';
    else if (score >= 4) cardClass += ' score-mid';
    else cardClass += ' score-low';

    const card = document.createElement('div');
    card.className = cardClass;
    card.style.animationDelay = `${i * 0.06}s`;

    const userAnsText = item.userAnswer
      ? `<div class="bc-user-ans">Your answer: "${item.userAnswer.substring(0, 150)}${item.userAnswer.length > 150 ? '...' : ''}"</div>`
      : '';

    card.innerHTML = `
      <div class="bc-header">
        <div class="bc-q">Q${i + 1}. ${item.question}</div>
        <div class="bc-score ${scoreClass}">${isSkipped ? 'Skip' : score + '/10'}</div>
      </div>
      <div class="bc-feedback">${item.feedback || (isSkipped ? 'Question was skipped.' : 'No feedback available.')}</div>
      ${userAnsText}
    `;
    breakdown.appendChild(card);
  });
}

// ─── Retry Button ───
document.getElementById('btn-retry').addEventListener('click', () => {
  questions = [];
  currentQ = 0;
  answers = [];
  selectedSubject = null;
  selectedDifficulty = null;
  document.querySelectorAll('.subject-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('difficulty-row').style.display = 'none';
  document.getElementById('btn-start').disabled = true;
  showScreen('screen-select');
});

// ─── Dashboard Button ───
document.getElementById('btn-dashboard').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// ─── Init ───
(function init() {
  getToken();
  // Load profile for sidebar
  fetch('/api/dashboard/profile', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('ios_token')}` }
  }).then(r => r.json()).then(p => {
    if (p && p.first_name) {
      document.getElementById('sidebarName').textContent = `${p.first_name} ${p.last_name}`;
      document.getElementById('sidebarAvatar').textContent = `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();
      document.getElementById('sidebarPlan').textContent = `${p.plan} Plan 🔥`;
    }
  }).catch(() => {});
  showScreen('screen-select');
})();