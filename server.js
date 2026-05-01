require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Supabase Client ───
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ─── Helper: extract user from Authorization header ───
async function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return user;
}

// ═══════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true
  });

  if (authErr) return res.status(400).json({ error: authErr.message });

  const userId = authData.user.id;

  const { error: profileErr } = await supabase.from('profiles').insert({
    user_id: userId, first_name: firstName, last_name: lastName, role, plan: 'Free'
  });

  if (profileErr) return res.status(400).json({ error: profileErr.message });

  await supabase.from('user_stats').insert({
    user_id: userId, coding_solved: 0, quiz_score_avg: 0,
    interview_score_avg: 0, accuracy: 0, coding_weekly_change: 0,
    quiz_weekly_change: 0, interview_weekly_change: 0, accuracy_weekly_change: 0
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  await supabase.from('progress_data').insert(
    days.map(day => ({ user_id: userId, day, coding_score: 0, quiz_score: 0, interview_score: 0 }))
  );

  await supabase.from('weak_topics').insert([
    { user_id: userId, topic_name: 'Binary Trees', score_percentage: 40, icon: '🌳' },
    { user_id: userId, topic_name: 'Dynamic Programming', score_percentage: 55, icon: '⚡' },
    { user_id: userId, topic_name: 'Operating System', score_percentage: 60, icon: '🖥️' },
    { user_id: userId, topic_name: 'Database Normalization', score_percentage: 65, icon: '🗄️' }
  ]);

  await supabase.from('goals').insert([
    { user_id: userId, title: 'Solve 5 Medium level problems', due_date: new Date().toISOString().split('T')[0], status: 'in_progress', progress_current: 0, progress_total: 5 },
    { user_id: userId, title: 'Attempt DBMS Quiz', due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'not_started', progress_current: 0, progress_total: 1 },
    { user_id: userId, title: 'Interview Practice - OOPs', due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], status: 'not_started', progress_current: 0, progress_total: 1 }
  ]);

  res.json({ message: 'Account created successfully' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
  res.json({ token: data.session.access_token, user: data.user });
});

// ═══════════════════════════════════════════════
//  DASHBOARD DATA ROUTES
// ═══════════════════════════════════════════════

app.get('/api/dashboard/profile', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/api/dashboard/stats', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/api/dashboard/progress', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.from('progress_data').select('*').eq('user_id', user.id).order('id', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/api/dashboard/weak-topics', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.from('weak_topics').select('*').eq('user_id', user.id).order('score_percentage', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/api/dashboard/goals', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.from('goals').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/dashboard/goals', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { title, due_date } = req.body;
  const { data, error } = await supabase.from('goals').insert({
    user_id: user.id, title, due_date, status: 'not_started', progress_current: 0, progress_total: 1
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════
//  QUIZ ROUTES
// ═══════════════════════════════════════════════

// POST /api/quiz/generate — AI question generation via Groq
app.post('/api/quiz/generate', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subject, difficulty } = req.body;

  if (!subject || !difficulty) {
    return res.status(400).json({ error: 'subject and difficulty are required' });
  }

  const subjectFullNames = {
    DSA: 'Data Structures and Algorithms',
    DBMS: 'Database Management Systems',
    OS: 'Operating Systems',
    CN: 'Computer Networks',
    C: 'C Programming',
    CPP: 'C++ Programming',
    Java: 'Java Programming',
    Python: 'Python Programming'
  };

  const difficultyGuide = {
    Easy: 'basic concepts, definitions, simple operations, beginner-level understanding',
    Medium: 'intermediate concepts, problem-solving, application of algorithms, moderate complexity',
    Hard: 'advanced concepts, complex algorithms, edge cases, expert-level tricky questions'
  };

  const subjectFull = subjectFullNames[subject] || subject;
  const diffGuide = difficultyGuide[difficulty] || 'moderate complexity';

  const prompt = `Generate exactly 10 multiple choice questions about ${subjectFull} at ${difficulty} difficulty level.

Difficulty guide for ${difficulty}: ${diffGuide}

STRICT RULES:
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Questions must be unique and not repeated
- For ${difficulty} level: ${diffGuide}
- Make questions technically accurate and relevant to ${subjectFull}

Respond ONLY with a valid JSON array. No explanation, no markdown, no code blocks. Just the raw JSON array like this:
[
  {
    "question": "What is ...?",
    "option_a": "Option 1",
    "option_b": "Option 2",
    "option_c": "Option 3",
    "option_d": "Option 4",
    "correct_option": "A"
  }
]

Generate all 10 questions now:`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a technical quiz generator. You always respond with valid JSON arrays only. Never include markdown, code blocks, or any text outside the JSON array.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', errText);
      return res.status(500).json({ error: 'Groq API error: ' + groqRes.status });
    }

    const groqData = await groqRes.json();
    let content = groqData.choices?.[0]?.message?.content || '';

    // Clean up response — strip any markdown code fences if present
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    // Extract JSON array
    const startIdx = content.indexOf('[');
    const endIdx = content.lastIndexOf(']');
    if (startIdx === -1 || endIdx === -1) {
      throw new Error('No valid JSON array found in response');
    }
    content = content.substring(startIdx, endIdx + 1);

    const questions = JSON.parse(content);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from AI');
    }

    // Validate and sanitize each question
    const validated = questions.slice(0, 10).map((q, i) => ({
      id: `ai_${Date.now()}_${i}`,
      question: q.question || `Question ${i + 1}`,
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: (q.correct_option || 'A').toUpperCase()
    }));

    res.json(validated);

  } catch (err) {
    console.error('Quiz generate error:', err.message);
    res.status(500).json({ error: 'Failed to generate questions: ' + err.message });
  }
});

// GET /api/quiz/questions/:subject — Legacy: from DB
app.get('/api/quiz/questions/:subject', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subject } = req.params;
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, question, option_a, option_b, option_c, option_d, correct_option')
    .eq('subject', subject);

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: 'No questions found for subject: ' + subject });

  const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 30);
  res.json(shuffled);
});

// POST /api/quiz/submit
app.post('/api/quiz/submit', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subject, difficulty, answers, questions, score, total } = req.body;

  const { data: result, error: saveErr } = await supabase
    .from('quiz_results')
    .insert({
      user_id: user.id,
      subject: difficulty ? `${subject} (${difficulty})` : subject,
      score,
      total,
      answers,
      submitted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (saveErr) return res.status(500).json({ error: saveErr.message });

  const { data: allResults } = await supabase
    .from('quiz_results')
    .select('score, total')
    .eq('user_id', user.id);

  if (allResults && allResults.length > 0) {
    const avgScore = allResults.reduce((sum, r) => sum + Math.round((r.score / r.total) * 100), 0) / allResults.length;
    await supabase.from('user_stats').update({ quiz_score_avg: Math.round(avgScore) }).eq('user_id', user.id);
  }

  const pct = Math.round((score / total) * 100);
  if (pct < 60) {
    const { data: existing } = await supabase.from('weak_topics').select('id').eq('user_id', user.id).eq('topic_name', subject).single();
    const iconMap = { DSA: '🌳', DBMS: '🗄️', OS: '🖥️', CN: '🌐', C: '⚙️', CPP: '🔷', Java: '☕', Python: '🐍', Aptitude: '🧮', Verbal: '📝', Reasoning: '🧠' };
    if (existing) {
      await supabase.from('weak_topics').update({ score_percentage: pct, icon: iconMap[subject] || '📚' }).eq('id', existing.id);
    } else {
      await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: subject, score_percentage: pct, icon: iconMap[subject] || '📚' });
    }
  }

  res.json({ success: true, score, total, percentage: pct, result });
});

// GET /api/quiz/results
app.get('/api/quiz/results', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.from('quiz_results').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════
//  APTITUDE ROUTES
// ═══════════════════════════════════════════════

app.post('/api/aptitude/generate', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subject, difficulty } = req.body;
  if (!subject || !difficulty) return res.status(400).json({ error: 'subject and difficulty are required' });

  const subjectFullNames = {
    Aptitude: 'Quantitative Aptitude (Number System, Arithmetic, Algebra, Geometry, Data Interpretation)',
    Verbal: 'Verbal Ability (Vocabulary, Grammar, Reading Comprehension, Sentence Skills)',
    Reasoning: 'Logical/Analytical Reasoning (Logical Reasoning, Analytical Reasoning, Non-Verbal, Data Sufficiency)'
  };

  const difficultyGuide = {
    Easy: 'basic concepts, simple operations, beginner-level',
    Medium: 'intermediate concepts, problem-solving, moderate complexity',
    Hard: 'advanced concepts, complex tricky questions, time-consuming'
  };

  const subjectFull = subjectFullNames[subject] || subject;
  const diffGuide = difficultyGuide[difficulty] || 'moderate complexity';

  const prompt = `Generate exactly 10 multiple choice questions about ${subjectFull} at ${difficulty} difficulty level.

Difficulty guide for ${difficulty}: ${diffGuide}

STRICT RULES:
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Questions must be unique and not repeated
- For ${difficulty} level: ${diffGuide}
- Make questions logically accurate and relevant to ${subjectFull}

Respond ONLY with a valid JSON array. No explanation, no markdown, no code blocks. Just the raw JSON array like this:
[
  {
    "question": "What is ...?",
    "option_a": "Option 1",
    "option_b": "Option 2",
    "option_c": "Option 3",
    "option_d": "Option 4",
    "correct_option": "A"
  }
]

Generate all 10 questions now:`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_APTITUDE_API_KEY || process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_APTITUDE_MODEL || 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: 'You are a technical quiz generator. You always respond with valid JSON arrays only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!groqRes.ok) return res.status(500).json({ error: 'Groq API error: ' + groqRes.status });

    const groqData = await groqRes.json();
    let content = groqData.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    const startIdx = content.indexOf('[');
    const endIdx = content.lastIndexOf(']');
    if (startIdx === -1 || endIdx === -1) throw new Error('No valid JSON array found');
    content = content.substring(startIdx, endIdx + 1);

    const questions = JSON.parse(content);
    if (!Array.isArray(questions) || questions.length === 0) throw new Error('Invalid questions format');

    const validated = questions.slice(0, 10).map((q, i) => ({
      id: `apt_${Date.now()}_${i}`,
      question: q.question || `Question ${i + 1}`,
      option_a: q.option_a || '', option_b: q.option_b || '', option_c: q.option_c || '', option_d: q.option_d || '',
      correct_option: (q.correct_option || 'A').toUpperCase()
    }));

    res.json(validated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate questions: ' + err.message });
  }
});

app.post('/api/aptitude/submit', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subject, difficulty, answers, questions, score, total } = req.body;

  const { data: result, error: saveErr } = await supabase
    .from('quiz_results')
    .insert({
      user_id: user.id,
      subject: difficulty ? `${subject} (${difficulty})` : subject,
      score,
      total,
      answers,
      submitted_at: new Date().toISOString()
    }).select().single();

  if (saveErr) return res.status(500).json({ error: saveErr.message });

  const pct = Math.round((score / total) * 100);
  if (pct < 60) {
    const { data: existing } = await supabase.from('weak_topics').select('id').eq('user_id', user.id).eq('topic_name', subject).single();
    const iconMap = { Aptitude: '🧮', Verbal: '📝', Reasoning: '🧠' };
    if (existing) {
      await supabase.from('weak_topics').update({ score_percentage: pct, icon: iconMap[subject] || '📚' }).eq('id', existing.id);
    } else {
      await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: subject, score_percentage: pct, icon: iconMap[subject] || '📚' });
    }
  }

  res.json({ success: true, score, total, percentage: pct, result });
});

// ═══════════════════════════════════════════════
//  INTERVIEW ROUTES
// ═══════════════════════════════════════════════

// POST /api/interview/questions — AI question generation via Groq
app.post('/api/interview/questions', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subject, difficulty } = req.body;
  if (!subject || !difficulty) {
    return res.status(400).json({ error: 'subject and difficulty are required' });
  }

  const subjectFullNames = {
    DSA: 'Data Structures and Algorithms',
    DBMS: 'Database Management Systems',
    OS: 'Operating Systems',
    CN: 'Computer Networks',
    C: 'C Programming',
    CPP: 'C++ Programming',
    Java: 'Java Programming',
    Python: 'Python Programming'
  };

  const difficultyGuide = {
    Easy: 'basic conceptual questions, definitions, simple explanations, beginner understanding',
    Medium: 'intermediate concepts, application of knowledge, real-world scenarios, moderate depth',
    Hard: 'advanced concepts, tricky edge cases, deep technical details, expert-level questions'
  };

  const subjectFull = subjectFullNames[subject] || subject;
  const diffGuide = difficultyGuide[difficulty] || 'moderate depth';

  // Generate 10 questions: ~3 easy, ~4 medium, ~3 hard spread within the chosen difficulty tier
  const prompt = `Generate exactly 10 interview questions for a technical interview on ${subjectFull} at ${difficulty} level.

Difficulty guide: ${diffGuide}

RULES:
- Questions must be open-ended (no MCQ) — the candidate types a written answer
- Questions should test conceptual understanding, not just definitions
- Each question must have a "category" label (e.g. "Trees", "Concurrency", "Normalization")
- Each question must have a "difficulty" field: exactly "${difficulty}"
- Questions must be unique, diverse, and interview-realistic
- For ${subjectFull}: mix of theory, comparison, scenario-based questions

Respond ONLY with a valid JSON array. No explanation, no markdown, no code blocks. Raw JSON only:
[
  {
    "question": "Explain how a hash table handles collisions. What are the trade-offs?",
    "category": "Hashing",
    "difficulty": "${difficulty}"
  }
]

Generate all 10 questions now:`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a senior technical interviewer. You generate realistic, thoughtful interview questions. Always respond with valid JSON arrays only, no markdown, no extra text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(500).json({ error: 'Groq API error: ' + groqRes.status });
    }

    const groqData = await groqRes.json();
    let content = groqData.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    const startIdx = content.indexOf('[');
    const endIdx = content.lastIndexOf(']');
    if (startIdx === -1 || endIdx === -1) throw new Error('No valid JSON array found');
    content = content.substring(startIdx, endIdx + 1);

    const rawQuestions = JSON.parse(content);
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) throw new Error('Invalid questions format');

    const validated = rawQuestions.slice(0, 10).map((q, i) => ({
      id: `iq_${Date.now()}_${i}`,
      question: q.question || `Question ${i + 1}`,
      category: q.category || subject,
      difficulty: q.difficulty || difficulty
    }));

    res.json(validated);

  } catch (err) {
    console.error('Interview questions error:', err.message);
    res.status(500).json({ error: 'Failed to generate questions: ' + err.message });
  }
});

// POST /api/interview/evaluate — AI evaluation of written answers
app.post('/api/interview/evaluate', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { subject, difficulty, answers } = req.body;
  if (!subject || !difficulty || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'subject, difficulty, and answers array are required' });
  }

  const subjectFullNames = {
    DSA: 'Data Structures and Algorithms',
    DBMS: 'Database Management Systems',
    OS: 'Operating Systems',
    CN: 'Computer Networks',
    C: 'C Programming',
    CPP: 'C++ Programming',
    Java: 'Java Programming',
    Python: 'Python Programming'
  };

  const subjectFull = subjectFullNames[subject] || subject;

  // Build the evaluation prompt
  const answersText = answers.map((a, i) => {
    if (a.skipped || !a.userAnswer || a.userAnswer.trim() === '') {
      return `Q${i + 1}: ${a.question}\nAnswer: [SKIPPED / NO ANSWER]`;
    }
    return `Q${i + 1}: ${a.question}\nAnswer: ${a.userAnswer}`;
  }).join('\n\n');

  const prompt = `You are a senior ${subjectFull} interviewer evaluating a candidate's written interview answers.

Subject: ${subjectFull}
Difficulty: ${difficulty}

Evaluate each of the following 10 answers and give:
1. A score from 0 to 10 (10 = perfect, 0 = skipped/completely wrong)
2. Brief constructive feedback (2-3 sentences max)

Scoring guide:
- 9-10: Complete, accurate, shows deep understanding
- 7-8: Mostly correct, minor gaps
- 5-6: Partially correct, key points missing
- 3-4: Shows some understanding but significant errors
- 1-2: Very poor, mostly wrong
- 0: Skipped or blank

${answersText}

Respond ONLY with a valid JSON object. No markdown, no extra text:
{
  "totalScore": <number 0-10, average of all scores rounded>,
  "maxScore": 10,
  "breakdown": [
    {
      "question": "<question text>",
      "userAnswer": "<user answer or empty>",
      "score": <0-10>,
      "feedback": "<2-3 sentence feedback>",
      "skipped": <true/false>
    }
  ]
}`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a strict but fair technical interviewer. Evaluate answers honestly. Always respond with valid JSON only, no markdown, no extra text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 3000
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(500).json({ error: 'Groq API error: ' + groqRes.status });
    }

    const groqData = await groqRes.json();
    let content = groqData.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) throw new Error('No valid JSON found');
    content = content.substring(startIdx, endIdx + 1);

    const evalResult = JSON.parse(content);

    // Save to DB — update interview_score_avg
    const scoreNum = Math.round((evalResult.totalScore / 10) * 100);
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('interview_score_avg')
      .eq('user_id', user.id)
      .single();

    const newAvg = currentStats
      ? Math.round((currentStats.interview_score_avg + scoreNum) / 2)
      : scoreNum;

    await supabase
      .from('user_stats')
      .update({ interview_score_avg: newAvg })
      .eq('user_id', user.id);

    // Update weak topics if score < 60%
    if (scoreNum < 60) {
      const iconMap = { DSA: '🌳', DBMS: '🗄️', OS: '🖥️', CN: '🌐', C: '⚙️', CPP: '🔷', Java: '☕', Python: '🐍' };
      const topicName = `${subject} Interview`;
      const { data: existing } = await supabase
        .from('weak_topics')
        .select('id')
        .eq('user_id', user.id)
        .eq('topic_name', topicName)
        .single();

      if (existing) {
        await supabase.from('weak_topics').update({ score_percentage: scoreNum, icon: iconMap[subject] || '🎤' }).eq('id', existing.id);
      } else {
        await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: topicName, score_percentage: scoreNum, icon: iconMap[subject] || '🎤' });
      }
    }

    res.json(evalResult);

  } catch (err) {
    console.error('Interview evaluate error:', err.message);
    res.status(500).json({ error: 'Failed to evaluate answers: ' + err.message });
  }
});

// ─── Fallback ───
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

app.listen(PORT, async () => {
  console.log(`🚀 InterviewOS server running at http://localhost:${PORT}`);
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) console.log(`❌ Supabase connection FAILED: ${error.message}`);
    else console.log(`✅ Connected to Supabase | ✅ Groq AI quiz generation ready`);
  } catch (err) {
    console.log(`❌ Supabase connection FAILED: ${err.message}`);
  }
});