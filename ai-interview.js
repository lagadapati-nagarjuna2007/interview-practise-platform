// ═══════════════════════════════════════
//  DATA
// ═══════════════════════════════════════
const PROG_LANGS = [
  'C','C++','Java','Python','JavaScript','TypeScript','Go','Rust','Kotlin','Swift',
  'PHP','Ruby','R','MATLAB','Scala','Dart','Perl','Haskell','Lua','Shell/Bash',
  'Assembly','Objective-C','C#','Visual Basic','Groovy','Clojure','Elixir','F#','Julia','COBOL','DBMS','CN'
];

const FRONTEND_TECHS = [
  'HTML','CSS','JavaScript','TypeScript','React','Angular','Vue.js','Svelte',
  'Next.js','Nuxt.js','Bootstrap','Tailwind CSS','Sass/SCSS','jQuery',
  'Webpack','Vite','Redux','GraphQL (client)','Flutter (Web)','Ionic',
  'Ember.js','Backbone.js','Lit','Alpine.js','Astro'
];

const BACKEND_TECHS = [
  'Node.js','Express.js','Django','Flask','FastAPI','Spring Boot','Laravel',
  'Ruby on Rails','ASP.NET Core','NestJS','Go (Gin/Fiber)','PHP (raw)',
  'Firebase','Supabase','MongoDB','PostgreSQL','MySQL','SQLite','Redis',
  'Cassandra','GraphQL (server)','REST API','gRPC','RabbitMQ','Kafka',
  'Docker','Kubernetes','AWS','Azure','Google Cloud'
];

const HR_QUESTIONS = [
  // Self-Introduction
  { q:'Tell me about yourself.', cat:'Self-Introduction' },
  { q:'Walk me through your resume.', cat:'Self-Introduction' },
  { q:'What makes you different from others?', cat:'Self-Introduction' },
  { q:'How would your friends describe you?', cat:'Self-Introduction' },
  // Strengths & Weaknesses
  { q:'What are your strengths?', cat:'Strengths & Weaknesses' },
  { q:'What is your biggest weakness?', cat:'Strengths & Weaknesses' },
  { q:'What skill are you improving right now?', cat:'Strengths & Weaknesses' },
  // Career & Goals
  { q:'Why do you want this job?', cat:'Career & Goals' },
  { q:'Where do you see yourself in 5 years?', cat:'Career & Goals' },
  { q:'Why did you choose this field?', cat:'Career & Goals' },
  // Company-Based
  { q:'Why should we hire you?', cat:'Company-Based' },
  { q:'How can you contribute here?', cat:'Company-Based' },
  // Behavioral
  { q:'Tell me about a challenge you faced and how you solved it.', cat:'Behavioral' },
  { q:'Tell me about a time you failed. What did you learn?', cat:'Behavioral' },
  { q:'Describe a difficult situation and how you handled it.', cat:'Behavioral' },
  // Teamwork
  { q:'How do you work in a team?', cat:'Teamwork' },
  { q:'Have you ever handled a team conflict? How?', cat:'Teamwork' },
  { q:'What role do you usually play in a team?', cat:'Teamwork' },
  // Pressure
  { q:'How do you handle pressure and tight deadlines?', cat:'Pressure' },
  { q:'How do you manage stress during critical situations?', cat:'Pressure' },
  { q:'How do you prioritize tasks when everything is urgent?', cat:'Pressure' },
  // Problem-Solving
  { q:'Describe a complex problem you solved. What was your approach?', cat:'Problem-Solving' },
  { q:'How do you handle unexpected issues in a project?', cat:'Problem-Solving' },
  // Closing
  { q:'Do you have any questions for us?', cat:'Closing' },
  { q:'Are you willing to relocate or work remotely?', cat:'Closing' }
];

// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
const API = '';
const token = localStorage.getItem('ios_token');
if (!token) window.location.href = 'login.html';

let selLangs     = new Set();
let selFrontend  = new Set();
let selBackend   = new Set();

let allQuestions = [];   // [{question, type, category}]  type: lang|project|hr
let answers      = [];   // [{question,type,category,answer,skipped,score,feedback}]
let currentIdx   = 0;
let currentTranscript = '';
let isListening      = false;
let mediaRecorder    = null;
let audioChunks      = [];

// ═══════════════════════════════════════
//  PROFILE
// ═══════════════════════════════════════
(async () => {
  try {
    const r = await fetch('/api/dashboard/profile', { headers:{ Authorization:`Bearer ${token}` } });
    const p = await r.json();
    if (p.first_name) {
      document.getElementById('sidebarName').textContent = `${p.first_name} ${p.last_name}`;
      document.getElementById('sidebarAvatar').textContent = `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();
      document.getElementById('sidebarPlan').textContent = `${p.plan} Plan 🔥`;
    }
  } catch(e){}
})();

// ═══════════════════════════════════════
//  BUILD CHIP GRIDS
// ═══════════════════════════════════════
function buildGrid(containerId, items, selSet, previewId, nextBtnId) {
  const g = document.getElementById(containerId);
  g.innerHTML = items.map(item => `
    <div class="chip" data-val="${item}" onclick="toggleChip(this,'${containerId}','${previewId}','${nextBtnId}')">${item}</div>
  `).join('');
}

function toggleChip(el, gridId, previewId, nextBtnId) {
  el.classList.toggle('selected');
  updatePreview(gridId, previewId, nextBtnId);
}

function updatePreview(gridId, previewId, nextBtnId) {
  const selected = [...document.querySelectorAll(`#${gridId} .chip.selected`)].map(c => c.dataset.val);
  const prev = document.getElementById(previewId);
  if (selected.length === 0) {
    prev.innerHTML = '<span style="color:var(--text-muted);font-style:italic;font-size:13px;">Your selections will appear here...</span>';
  } else {
    prev.innerHTML = selected.map(s => `<span class="preview-chip">${s}</span>`).join('');
  }
  document.getElementById(nextBtnId).disabled = selected.length === 0;
}

buildGrid('langGrid',     PROG_LANGS,      selLangs,    'langPreview',     'step1Next');
buildGrid('frontendGrid', FRONTEND_TECHS,  selFrontend, 'frontendPreview', 'step2Next');
buildGrid('backendGrid',  BACKEND_TECHS,   selBackend,  'backendPreview',  'step3Next');

// Check microphone access on load
navigator.mediaDevices?.getUserMedia({ audio: true })
  .then(stream => { stream.getTracks().forEach(t => t.stop()); })
  .catch(() => { document.getElementById('nospeechBanner').classList.add('visible'); });

// ═══════════════════════════════════════
//  STEP NAVIGATION
// ═══════════════════════════════════════
function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const num = document.getElementById(`sn${i}`);
    const lbl = document.getElementById(`sl${i}`);
    if (!num) continue;
    if (i < n)  { num.className='step-num done';   lbl.className='step-label done';   if(i<=3) document.getElementById(`line${i}`).className='step-line done'; }
    else if (i===n) { num.className='step-num active'; lbl.className='step-label active'; }
    else        { num.className='step-num';        lbl.className='step-label'; }
  }
}

function goStep1() {
  hide('step2'); hide('step3'); show('step1'); setStep(1);
}
function goStep2() {
  // collect step1 selections
  selLangs = new Set([...document.querySelectorAll('#langGrid .chip.selected')].map(c=>c.dataset.val));
  hide('step1'); hide('step3'); show('step2'); setStep(2);
}
function goStep3() {
  selFrontend = new Set([...document.querySelectorAll('#frontendGrid .chip.selected')].map(c=>c.dataset.val));
  hide('step2'); show('step3'); setStep(3);
}

function show(id) { document.getElementById(id).style.display=''; }
function hide(id) { document.getElementById(id).style.display='none'; }

// ═══════════════════════════════════════
//  START INTERVIEW — generate questions
// ═══════════════════════════════════════
async function startInterview() {
  selBackend = new Set([...document.querySelectorAll('#backendGrid .chip.selected')].map(c=>c.dataset.val));

  hide('step3');
  show('interviewWrap');
  document.getElementById('interviewWrap').classList.add('visible');
  show('loadingQs');
  setStep(4);

  // build sidebar tags
  buildTags('stackLangs',    [...selLangs],    'purple');
  buildTags('stackFrontend', [...selFrontend], 'blue');
  buildTags('stackBackend',  [...selBackend],  'green');

  try {
    document.getElementById('loadMsg').textContent = 'Generating language questions...';
    const langQs = await fetchLangQuestions();

    document.getElementById('loadMsg').textContent = 'Generating project questions...';
    const projQs = await fetchProjectQuestions();

    document.getElementById('loadMsg').textContent = 'Selecting HR questions...';
    const hrQs = pickHRQuestions();

    allQuestions = [
      ...langQs.map(q => ({ question:q.question, type:'lang',    category:q.category||'Language' })),
      ...projQs.map(q => ({ question:q.question, type:'project', category:q.category||'Project'  })),
      ...hrQs.map(q  => ({ question:q.question,  type:'hr',      category:q.category||'HR'       }))
    ];

    answers = allQuestions.map(q => ({ ...q, answer:'', skipped:false, score:0, feedback:'' }));

    hide('loadingQs');
    show('interviewMain');
    loadQuestion(0);

  } catch(err) {
    console.error(err);
    document.getElementById('loadMsg').textContent = '❌ Failed to generate questions. ' + err.message;
  }
}

function buildTags(containerId, items, colorClass) {
  document.getElementById(containerId).innerHTML =
    items.map(i=>`<span class="tag ${colorClass}">${i}</span>`).join('') || '<span style="font-size:12px;color:var(--text-muted);">—</span>';
}

// ── Groq: language questions ──
async function fetchLangQuestions() {
  const langList = [...selLangs].join(', ');
  const res = await fetch('/api/ai-interview/lang-questions', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
    body: JSON.stringify({ languages: [...selLangs] })
  });
  if (!res.ok) throw new Error('Lang question API failed');
  return await res.json();
}

// ── Groq: project questions ──
async function fetchProjectQuestions() {
  const res = await fetch('/api/ai-interview/project-questions', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
    body: JSON.stringify({ frontend:[...selFrontend], backend:[...selBackend], languages:[...selLangs] })
  });
  if (!res.ok) throw new Error('Project question API failed');
  return await res.json();
}

// ── HR: pick 10 randomly ──
function pickHRQuestions() {
  const shuffled = [...HR_QUESTIONS].sort(()=>Math.random()-.5);
  const picked = [];
  const catCount = {};
  for (const q of shuffled) {
    catCount[q.cat] = (catCount[q.cat]||0);
    if (catCount[q.cat] < 2) { picked.push({ question:q.q, category:q.cat }); catCount[q.cat]++; }
    if (picked.length >= 10) break;
  }
  while (picked.length < 10) picked.push({ question: shuffled[picked.length].q, category: shuffled[picked.length].cat });
  return picked.slice(0,10);
}

// ═══════════════════════════════════════
//  INTERVIEW FLOW
// ═══════════════════════════════════════
function loadQuestion(idx) {
  currentIdx = idx;
  currentTranscript = '';
  const q = allQuestions[idx];
  const total = allQuestions.length;

  document.getElementById('qCounter').textContent = `Q ${idx+1} / ${total}`;
  document.getElementById('qProgressFill').style.width = `${((idx+1)/total)*100}%`;
  document.getElementById('questionText').textContent = q.question;

  const badge = document.getElementById('qTypeBadge');
  if (q.type==='lang')    { badge.textContent='Language';  badge.className='q-type-badge lang'; }
  else if(q.type==='project'){ badge.textContent='Project'; badge.className='q-type-badge project'; }
  else                    { badge.textContent='HR Round';  badge.className='q-type-badge hr'; }

  // clear transcript
  document.getElementById('transcriptPlaceholder').style.display='';
  document.getElementById('transcriptText').style.display='none';
  document.getElementById('transcriptText').textContent='';
  document.getElementById('transcriptWrap').classList.remove('listening');

  setStatus('idle','Press Start Speaking to begin');
  document.getElementById('nextBtn').disabled = true;
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled  = true;
  document.getElementById('skipBtn').disabled  = false;

  updateSectionProgress(idx);
}

function updateSectionProgress(idx) {
  const langDone  = answers.slice(0,10).filter(a=>a.answer||a.skipped).length;
  const projDone  = answers.slice(10,20).filter(a=>a.answer||a.skipped).length;
  const hrDone    = answers.slice(20,30).filter(a=>a.answer||a.skipped).length;
  document.getElementById('spLang').textContent    = `${Math.min(langDone,10)}/10`;
  document.getElementById('spProj').textContent    = `${Math.min(projDone,10)}/10`;
  document.getElementById('spHR').textContent      = `${Math.min(hrDone,10)}/10`;
  document.getElementById('spLangBar').style.width = `${Math.min(langDone,10)*10}%`;
  document.getElementById('spProjBar').style.width = `${Math.min(projDone,10)*10}%`;
  document.getElementById('spHRBar').style.width   = `${Math.min(hrDone,10)*10}%`;
}

function setStatus(state, label) {
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot' + (state==='listening'?' listening':(state==='done'?' done':(state==='error'?' error':'')));
  document.getElementById('statusLabel').textContent = label;
  const wave = document.getElementById('waveAnim');
  state==='listening' ? wave.classList.add('visible') : wave.classList.remove('visible');
}

// ═══════════════════════════════════════
//  WHISPER SPEECH-TO-TEXT (via server)
// ═══════════════════════════════════════
async function startListening() {
  if (isListening) return;

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    showToast('Microphone access denied. Please allow mic access.');
    setStatus('error', 'Microphone access denied.');
    return;
  }

  // pick best supported format
  const mimeType = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4']
    .find(m => MediaRecorder.isTypeSupported(m)) || '';

  audioChunks  = [];
  mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstart = () => {
    isListening = true;
    setStatus('listening', 'Recording... speak your answer clearly');
    document.getElementById('transcriptWrap').classList.add('listening');
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled  = false;
    document.getElementById('skipBtn').disabled  = true;
    document.getElementById('nextBtn').disabled  = true;
    // show live timer
    startRecordingTimer();
  };

  mediaRecorder.onstop = async () => {
    // stop all mic tracks
    stream.getTracks().forEach(t => t.stop());
    stopRecordingTimer();
    isListening = false;
    document.getElementById('transcriptWrap').classList.remove('listening');

    if (audioChunks.length === 0) {
      setStatus('idle', 'No audio recorded. Try again.');
      document.getElementById('startBtn').disabled = false;
      document.getElementById('stopBtn').disabled  = true;
      document.getElementById('skipBtn').disabled  = false;
      return;
    }

    // send to Whisper
    setStatus('listening', '⏳ Transcribing with Whisper AI...');
    document.getElementById('stopBtn').disabled  = true;
    document.getElementById('startBtn').disabled = true;

    const ext  = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
    const blob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });

    try {
      const formData = new FormData();
      formData.append('audio', blob, `answer.${ext}`);

      const res = await fetch('/api/ai-interview/transcribe', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const transcript = (data.transcript || '').trim();

      if (transcript) {
        currentTranscript = transcript;
        document.getElementById('transcriptPlaceholder').style.display = 'none';
        document.getElementById('transcriptText').style.display = '';
        document.getElementById('transcriptText').textContent  = transcript;

        // auto-skip detection
        const lower = transcript.toLowerCase();
        if (lower.includes("i don't know") || lower.includes("i dont know") ||
            lower.includes("don't know")   || lower.includes("skip") ||
            lower.includes("next question")) {
          skipQuestion(); return;
        }

        setStatus('done', 'Answer recorded ✓ Click Next Question to continue.');
        document.getElementById('nextBtn').disabled  = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('skipBtn').disabled  = false;
      } else {
        setStatus('idle', 'Could not hear you clearly. Try again.');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('skipBtn').disabled  = false;
      }
    } catch (err) {
      console.error('Whisper error:', err);
      setStatus('error', 'Transcription failed: ' + err.message);
      document.getElementById('startBtn').disabled = false;
      document.getElementById('skipBtn').disabled  = false;
    }
  };

  mediaRecorder.start(500); // collect chunks every 500ms
}

// ── Recording timer (visual feedback) ──
let recTimerInterval = null;
let recSeconds       = 0;
function startRecordingTimer() {
  recSeconds = 0;
  recTimerInterval = setInterval(() => {
    recSeconds++;
    const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
    const s = String(recSeconds % 60).padStart(2, '0');
    document.getElementById('statusLabel').textContent = `🔴 Recording ${m}:${s} — speak your answer`;
  }, 1000);
}
function stopRecordingTimer() {
  clearInterval(recTimerInterval);
  recTimerInterval = null;
}

function stopListening() {
  if (!isListening || !mediaRecorder) return;
  try { mediaRecorder.stop(); } catch(e) {}
}

function goNextQuestion(skipped) {
  stopListening();
  const ans = skipped ? '' : currentTranscript.trim();
  answers[currentIdx].answer  = ans;
  answers[currentIdx].skipped = skipped || !ans;

  if (currentIdx + 1 >= allQuestions.length) {
    submitForEval();
  } else {
    loadQuestion(currentIdx + 1);
  }
}

function skipQuestion() {
  stopListening();
  answers[currentIdx].answer  = '';
  answers[currentIdx].skipped = true;
  if (currentIdx + 1 >= allQuestions.length) {
    submitForEval();
  } else {
    loadQuestion(currentIdx + 1);
  }
}

// ═══════════════════════════════════════
//  EVALUATION
// ═══════════════════════════════════════
async function submitForEval() {
  document.getElementById('evalOverlay').classList.add('active');
  try {
    const res = await fetch('/api/ai-interview/evaluate', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify({ answers })
    });
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    // merge scores back
    if (result.breakdown && Array.isArray(result.breakdown)) {
      result.breakdown.forEach((b,i) => {
        if (answers[i]) { answers[i].score=b.score; answers[i].feedback=b.feedback; }
      });
    }
    showResults(result);
  } catch(err) {
    console.error(err);
    showResults(null);
  } finally {
    document.getElementById('evalOverlay').classList.remove('active');
  }
}

// ═══════════════════════════════════════
//  RESULTS
// ═══════════════════════════════════════
function showResults(evalData) {
  hide('interviewWrap');
  document.getElementById('interviewWrap').classList.remove('visible');

  const answered = answers.filter(a=>!a.skipped&&a.answer).length;
  const skipped  = answers.filter(a=>a.skipped||!a.answer).length;
  const totalScore = evalData ? Math.round(evalData.totalScore) : Math.round(answers.reduce((s,a)=>s+a.score,0)/answers.length*10)/10;
  const pct = Math.round((totalScore / 10)*100);

  document.getElementById('rTotalScore').textContent = totalScore;
  document.getElementById('rHeadline').textContent =
    pct>=80?'Excellent Performance! 🎉':pct>=60?'Good Job! 👍':pct>=40?'Keep Practising 💪':'Need More Practice 📚';
  document.getElementById('rSubline').textContent =
    `You answered ${answered} of ${allQuestions.length} questions. Score: ${totalScore}/10 (${pct}%)`;

  document.getElementById('rStats').innerHTML = `
    <div class="r-stat"><div class="r-stat-val">${answered}</div><div class="r-stat-lbl">Answered</div></div>
    <div class="r-stat"><div class="r-stat-val">${skipped}</div><div class="r-stat-lbl">Skipped</div></div>
    <div class="r-stat"><div class="r-stat-val">${totalScore}/10</div><div class="r-stat-lbl">AI Score</div></div>
    <div class="r-stat"><div class="r-stat-val">${pct}%</div><div class="r-stat-lbl">Accuracy</div></div>
  `;

  const typeLabel = { lang:'Language', project:'Project', hr:'HR Round' };
  const typeClass = { lang:'lang',    project:'project', hr:'hr' };

  document.getElementById('rList').innerHTML = answers.map((a,i) => {
    const stars = '★'.repeat(Math.round(a.score||0)) + '☆'.repeat(10-Math.round(a.score||0));
    return `
      <div class="result-item ${a.skipped||!a.answer?'skipped':'answered'}">
        <div class="result-item-header">
          <span class="result-q-num">Q${i+1}</span>
          <span class="q-type-badge ${typeClass[a.type]||'lang'}">${typeLabel[a.type]||a.type}</span>
          <span class="result-status ${a.skipped||!a.answer?'skipped':'answered'}">${a.skipped||!a.answer?'Skipped':'Answered'}</span>
        </div>
        <div class="result-q-text">${a.question}</div>
        ${a.answer?`<div class="result-answer">💬 ${a.answer}</div>`:''}
        <div class="score-badge-row">
          <div class="ai-score">
            <span class="ai-score-stars">${stars.slice(0,10)}</span>
            <span class="ai-score-num">${a.score||0}/10</span>
          </div>
        </div>
        ${a.feedback?`<div class="ai-feedback">🤖 ${a.feedback}</div>`:''}
      </div>
    `;
  }).join('');

  document.getElementById('resultsWrap').classList.add('visible');
  document.getElementById('stepBar').style.display = 'none';
}

function restartAll() {
  selLangs.clear(); selFrontend.clear(); selBackend.clear();
  allQuestions=[]; answers=[]; currentIdx=0;
  [...document.querySelectorAll('.chip')].forEach(c=>c.classList.remove('selected'));
  [...document.querySelectorAll('.selected-preview')].forEach(p=>{
    p.innerHTML='<span style="color:var(--text-muted);font-style:italic;font-size:13px;">Your selections will appear here...</span>';
  });
  document.getElementById('step1Next').disabled=true;
  document.getElementById('step2Next').disabled=true;
  document.getElementById('step3Next').disabled=true;
  document.getElementById('resultsWrap').classList.remove('visible');
  document.getElementById('interviewWrap').style.display='none';
  document.getElementById('interviewWrap').classList.remove('visible');
  document.getElementById('stepBar').style.display='';
  show('step1'); hide('step2'); hide('step3');
  setStep(1);
}

function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}