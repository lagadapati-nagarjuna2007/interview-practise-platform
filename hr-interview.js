// ════════════════════════════════════════════
//  InterviewOS — hr-interview.js
//  HR Mock Interview: Question Bank + AI Mock
//  Model: nvidia/nemotron-3-super-120b-a12b (via server)
// ════════════════════════════════════════════

const API = '';  // same-origin

let questions   = [];   // 10 questions chosen by AI
let currentQ    = 0;
let answers     = [];   // { question, category, userAnswer, skipped, timedOut }
let timerInterval = null;
let timeLeft    = 180;  // 3 minutes
let token       = null;

// ─── HR Question Bank (from HR_Mock_Interview_Questions.txt) ───
const HR_QUESTIONS = [
  {
    category: 'Self-Introduction',
    icon: '👤',
    color: 'cat-purple',
    questions: [
      'Tell me about yourself.',
      'Walk me through your resume.',
      'Introduce yourself in 2 minutes.',
      'What makes you different from others?',
      'How would your friends describe you?'
    ],
    examples: ['Tell me about yourself', 'Walk me through your academic journey']
  },
  {
    category: 'Strengths & Weaknesses',
    icon: '💪',
    color: 'cat-blue',
    questions: [
      'What are your strengths?',
      'What is your biggest weakness?',
      'How do your strengths help you?',
      'What skill are you improving right now?',
      'What is one habit you want to change?'
    ],
    examples: ['What is your biggest strength?', 'What weakness are you working on?']
  },
  {
    category: 'Career & Goals',
    icon: '🎯',
    color: 'cat-green',
    questions: [
      'Why do you want this job?',
      'Why should we hire you?',
      'Where do you see yourself in 5 years?',
      'What are your career goals?',
      'Why did you choose this field?'
    ],
    examples: ['Why software engineering?', 'What are your long-term goals?']
  },
  {
    category: 'Company-Based',
    icon: '🏢',
    color: 'cat-orange',
    questions: [
      'What do you know about our company?',
      'Why do you want to join our company?',
      'Why this role?',
      'What interests you about our work?',
      'How can you contribute here?'
    ],
    examples: ['Why do you want to join Google?', 'What do you know about Infosys?']
  },
  {
    category: 'Behavioral Questions',
    icon: '🧠',
    color: 'cat-red',
    questions: [
      'Tell me about a challenge you faced.',
      'Tell me about a failure.',
      'Tell me about a success.',
      'Describe a difficult situation.',
      'Tell me about a time you solved a problem.'
    ],
    examples: ['Describe your toughest project', 'Tell me about a mistake']
  },
  {
    category: 'Teamwork Questions',
    icon: '🤝',
    color: 'cat-teal',
    questions: [
      'How do you work in a team?',
      'Have you handled team conflict?',
      'What role do you play in a team?',
      'How do you handle disagreements?',
      'How do you support teammates?'
    ],
    examples: ['Describe team conflict', 'How do you handle difficult teammates?']
  },
  {
    category: 'Pressure Questions',
    icon: '⏱️',
    color: 'cat-yellow',
    questions: [
      'How do you handle pressure?',
      'Can you work under deadlines?',
      'How do you manage stress?',
      'What if you fail?',
      'How do you prioritize work?'
    ],
    examples: ['Missed deadline situation', 'Handling stress in exams/projects']
  },
  {
    category: 'Problem-Solving Questions',
    icon: '🔧',
    color: 'cat-pink',
    questions: [
      'Describe a problem you solved.',
      'How do you approach difficult tasks?',
      'What is your decision-making process?',
      'How do you handle unexpected issues?'
    ],
    examples: ['Bug in project at last minute', 'Project deployment issue']
  },
  {
    category: 'Closing Questions',
    icon: '🏁',
    color: 'cat-indigo',
    questions: [
      'Do you have any questions for us?',
      'When can you join?',
      'Are you willing to relocate?',
      'What salary do you expect?'
    ],
    examples: ['Any questions for us?', 'Expected salary?']
  }
];

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

// ─── Toast ───
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── Build Question Bank UI ───
function buildQuestionBank() {
  const container = document.getElementById('hr-categories');
  container.innerHTML = '';

  HR_QUESTIONS.forEach((cat, idx) => {
    const card = document.createElement('div');
    card.className = 'hr-category-card';
    card.innerHTML = `
      <div class="hr-category-header" onclick="toggleCategory(${idx})">
        <div class="hr-cat-left">
          <div class="hr-cat-icon ${cat.color}">${cat.icon}</div>
          <div>
            <div class="hr-cat-name">${cat.category}</div>
            <div class="hr-cat-count">${cat.questions.length} questions</div>
          </div>
        </div>
        <svg class="hr-cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="hr-category-body">
        <ul class="hr-q-list">
          ${cat.questions.map(q => `<li>${q}</li>`).join('')}
        </ul>
        <div class="hr-q-examples">
          <div class="hr-q-examples-label">Example prompts</div>
          <ul>${cat.examples.map(e => `<li>${e}</li>`).join('')}</ul>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleCategory(idx) {
  const cards = document.querySelectorAll('.hr-category-card');
  cards[idx].classList.toggle('open');
}

// ─── Start Mock Interview ───
document.getElementById('btn-start-mock').addEventListener('click', async () => {
  token = getToken();
  if (!token) return;
  showScreen('screen-loading');
  await generateHRQuestions();
});

// ─── Generate 10 HR Questions via server (NVIDIA AI) ───
async function generateHRQuestions() {
  try {
    const res = await fetch(`${API}/api/hr-interview/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ questionBank: HR_QUESTIONS })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate questions');
    }

    questions = await res.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions received');
    }

    currentQ = 0;
    answers = new Array(questions.length).fill(null);
    startInterview();

  } catch (err) {
    console.error('HR question generation error:', err.message);
    showToast('Error: ' + err.message);
    showScreen('screen-home');
  }
}

// ─── Start Interview Screen ───
function startInterview() {
  showScreen('screen-interview');
  loadQuestion(currentQ);
}

// ─── Load Question ───
function loadQuestion(index) {
  const q = questions[index];
  if (!q) return;

  const pct = (index / questions.length) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent = `Question ${index + 1} of ${questions.length}`;

  document.getElementById('q-number').textContent = `Q${index + 1}`;
  document.getElementById('q-category').textContent = q.category || 'HR Question';
  document.getElementById('q-text').textContent = q.question;

  const textarea = document.getElementById('answer-input');
  const existing = answers[index];
  textarea.value = (existing && !existing.skipped) ? (existing.userAnswer || '') : '';

  const words = textarea.value.trim() === '' ? 0 : textarea.value.trim().split(/\s+/).length;
  document.getElementById('word-count').textContent = `${words} word${words !== 1 ? 's' : ''}`;

  document.getElementById('btn-prev').disabled = (index === 0);
  textarea.focus();
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

function autoSubmitAnswer() {
  saveAnswer(true);
  nextQuestion();
}

// ─── Quit ───
document.getElementById('btn-quit').addEventListener('click', () => {
  if (confirm('Quit the HR interview? Your progress will be lost.')) {
    clearInterval(timerInterval);
    showScreen('screen-home');
  }
});

// ─── Previous ───
document.getElementById('btn-prev').addEventListener('click', () => {
  clearInterval(timerInterval);
  saveAnswer(false);
  if (currentQ > 0) {
    currentQ--;
    loadQuestion(currentQ);
  }
});

// ─── Submit & Next ───
document.getElementById('btn-submit-ans').addEventListener('click', () => {
  clearInterval(timerInterval);
  saveAnswer(false);
  nextQuestion();
});

// ─── Skip ───
document.getElementById('btn-skip').addEventListener('click', () => {
  clearInterval(timerInterval);
  answers[currentQ] = {
    question: questions[currentQ].question,
    category: questions[currentQ].category,
    userAnswer: '',
    skipped: true
  };
  nextQuestion();
});

// ─── Save Answer ───
function saveAnswer(timedOut) {
  const ans = document.getElementById('answer-input').value.trim();
  answers[currentQ] = {
    question: questions[currentQ].question,
    category: questions[currentQ].category,
    userAnswer: ans,
    skipped: false,
    timedOut
  };
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

  const steps = ['estep1','estep2','estep3','estep4'];
  let stepIdx = 0;
  const stepInterval = setInterval(() => {
    if (stepIdx > 0) document.getElementById(steps[stepIdx - 1]).className = 'eval-step done';
    if (stepIdx < steps.length) {
      document.getElementById(steps[stepIdx]).className = 'eval-step active';
      stepIdx++;
    } else {
      clearInterval(stepInterval);
    }
  }, 1200);

  try {
    const res = await fetch(`${API}/api/hr-interview/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Evaluation failed');
    }

    const evalData = await res.json();
    clearInterval(stepInterval);
    steps.forEach(s => document.getElementById(s).className = 'eval-step done');
    setTimeout(() => showResults(evalData), 600);

  } catch (err) {
    clearInterval(stepInterval);
    console.error('Evaluation error:', err.message);
    showToast('Evaluation error: ' + err.message);
    showScreen('screen-home');
  }
}

// ─── Show Results ───
function showResults(evalData) {
  showScreen('screen-results');

  const totalScore = evalData.totalScore || 0;
  const maxScore   = evalData.maxScore || 10;

  document.getElementById('score-number').textContent = totalScore;
  const deg   = Math.round((totalScore / maxScore) * 360);
  const color = totalScore >= 7 ? '#6C4FE8' : totalScore >= 4 ? '#eab308' : '#ef4444';
  document.getElementById('score-circle').style.background =
    `conic-gradient(${color} ${deg}deg, #E5E7EB ${deg}deg)`;

  let title, subtitle;
  if (totalScore >= 8) {
    title    = '🎉 Excellent HR Performance!';
    subtitle = `You scored ${totalScore}/${maxScore}. Outstanding communication and confidence! You are HR interview ready.`;
  } else if (totalScore >= 6) {
    title    = '👍 Good Job!';
    subtitle = `You scored ${totalScore}/${maxScore}. Solid HR skills. A bit more practice on behavioral questions will make you interview-ready!`;
  } else if (totalScore >= 4) {
    title    = '📚 Keep Practicing!';
    subtitle = `You scored ${totalScore}/${maxScore}. Focus on structuring answers using the STAR method for behavioral questions.`;
  } else {
    title    = '💪 Don\'t Give Up!';
    subtitle = `You scored ${totalScore}/${maxScore}. Review the HR question bank and practice speaking your answers aloud before typing.`;
  }

  document.getElementById('result-title').textContent   = title;
  document.getElementById('result-subtitle').textContent = subtitle;
  document.getElementById('res-score-tag').textContent  = `Score: ${totalScore}/${maxScore}`;

  const breakdown = document.getElementById('results-breakdown');
  breakdown.innerHTML = '';

  (evalData.breakdown || []).forEach((item, i) => {
    const score     = item.score ?? 0;
    const isSkipped = item.skipped;

    let scoreClass = 'high';
    if (isSkipped)      scoreClass = 'skip';
    else if (score < 4) scoreClass = 'low';
    else if (score < 7) scoreClass = 'mid';

    let cardClass = 'breakdown-card';
    if (isSkipped)       cardClass += ' skipped';
    else if (score >= 7) cardClass += ' score-high';
    else if (score >= 4) cardClass += ' score-mid';
    else                 cardClass += ' score-low';

    const card = document.createElement('div');
    card.className = cardClass;
    card.style.animationDelay = `${i * 0.06}s`;

    const userAnsText = item.userAnswer
      ? `<div class="bc-user-ans">Your answer: "${item.userAnswer.substring(0, 160)}${item.userAnswer.length > 160 ? '...' : ''}"</div>`
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

// ─── Retry ───
document.getElementById('btn-retry').addEventListener('click', () => {
  questions  = [];
  currentQ   = 0;
  answers    = [];
  showScreen('screen-home');
});

// ─── Dashboard ───
document.getElementById('btn-dashboard').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// ─── Init ───
(function init() {
  token = getToken();
  if (!token) return;

  // Load sidebar profile
  fetch('/api/dashboard/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()).then(p => {
    if (p && p.first_name) {
      document.getElementById('sidebarName').textContent = `${p.first_name} ${p.last_name}`;
      document.getElementById('sidebarAvatar').textContent = `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();
      document.getElementById('sidebarPlan').textContent = `${p.plan} Plan 🔥`;
    }
  }).catch(() => {});

  buildQuestionBank();
  showScreen('screen-home');
})();