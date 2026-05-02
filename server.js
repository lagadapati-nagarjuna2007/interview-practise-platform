require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

app.delete('/api/dashboard/weak-topics/:id', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { error } = await supabase.from('weak_topics').delete().eq('id', id).eq('user_id', user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
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
        max_tokens: 1200
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
  
  // Save to unified assessment_evaluations table for AI suggestions and extract weak topics
  let ai_suggestion = `You scored ${score}/${total} in ${subject} quiz. Keep practicing!`;
  let ai_weak_topics = [];
  
  try {
    let wrongQuestionsText = '';
    if (questions && Array.isArray(questions) && Array.isArray(answers)) {
      questions.forEach((q, i) => {
        if (answers[i] !== q.correct_option) {
          wrongQuestionsText += `- ${q.question}\n`;
        }
      });
    }

    const prompt = `A user scored ${score} out of ${total} (${pct}%) on a technical quiz about ${subject}.
The questions they answered incorrectly (if any) are:
${wrongQuestionsText}

Based on these incorrect questions, identify up to 3 specific sub-topics they need to improve on. If they scored 100%, leave it empty.
Also provide a 1-sentence encouraging AI feedback.
Respond ONLY with a valid JSON object. No markdown, no extra text:
{
  "feedback": "encuraging feedback sentence",
  "weak_topics": ["sub-topic 1", "sub-topic 2"]
}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 200 })
    });
    
    if (groqRes.ok) {
      const groqData = await groqRes.json();
      let content = groqData.choices?.[0]?.message?.content || '';
      content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        const parsed = JSON.parse(content.substring(startIdx, endIdx + 1));
        ai_suggestion = parsed.feedback || ai_suggestion;
        ai_weak_topics = parsed.weak_topics || [];
      }
    }
  } catch (err) { console.error('AI suggestion/weak topics error:', err.message); }

  // Insert AI generated weak topics into DB
  if (ai_weak_topics.length > 0) {
    const iconMap = { DSA: '🌳', DBMS: '🗄️', OS: '🖥️', CN: '🌐', C: '⚙️', CPP: '🔷', Java: '☕', Python: '🐍', Aptitude: '🧮', Verbal: '📝', Reasoning: '🧠' };
    const icon = iconMap[subject] || '📚';
    for (const topic of ai_weak_topics) {
      const { data: existing } = await supabase.from('weak_topics').select('id').eq('user_id', user.id).eq('topic_name', topic).single();
      if (existing) {
        await supabase.from('weak_topics').update({ score_percentage: pct, icon }).eq('id', existing.id);
      } else {
        await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: topic, score_percentage: pct, icon });
      }
    }
  } else if (pct < 60) {
    // Fallback if AI fails to generate specific topics
    const iconMap = { DSA: '🌳', DBMS: '🗄️', OS: '🖥️', CN: '🌐', C: '⚙️', CPP: '🔷', Java: '☕', Python: '🐍', Aptitude: '🧮', Verbal: '📝', Reasoning: '🧠' };
    const { data: existing } = await supabase.from('weak_topics').select('id').eq('user_id', user.id).eq('topic_name', subject).single();
    if (existing) {
      await supabase.from('weak_topics').update({ score_percentage: pct, icon: iconMap[subject] || '📚' }).eq('id', existing.id);
    } else {
      await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: subject, score_percentage: pct, icon: iconMap[subject] || '📚' });
    }
  }

  await supabase.from('assessment_evaluations').insert({
    user_id: user.id,
    module: 'quiz',
    subject: subject,
    score,
    total,
    ai_suggestion,
    details: { answers, difficulty }
  });

  res.json({ success: true, score, total, percentage: pct, result, ai_suggestion });
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

  let syllabusContext = '';
  try {
    const syllabusContent = fs.readFileSync(path.join(__dirname, 'syllabus.txt'), 'utf-8');
    
    // Extract only the relevant section to save tokens and prevent 429 errors
    let targetSection = subject.toUpperCase();
    if (targetSection === 'VERBAL') targetSection = 'VERBAL ABILITY';
    
    const lines = syllabusContent.split('\n');
    let isCapturing = false;
    let sectionLines = [];
    
    for (const line of lines) {
      const trimLine = line.trim();
      if (trimLine === 'APTITUDE' || trimLine === 'VERBAL ABILITY' || trimLine === 'REASONING') {
        if (trimLine === targetSection) isCapturing = true;
        else if (isCapturing) break;
      } else if (isCapturing && !trimLine.startsWith('Tip:')) {
        sectionLines.push(line);
      }
    }
    
    const relevantSyllabus = sectionLines.join('\n').trim();
    if (relevantSyllabus) {
      syllabusContext = `\nPlease ensure the questions generated strictly adhere to the following syllabus for ${subjectFull}:\n${relevantSyllabus}\n`;
    }
  } catch (err) {
    console.error('Could not read syllabus.txt:', err.message);
  }

  const prompt = `Generate exactly 10 multiple choice questions about ${subjectFull} at ${difficulty} difficulty level.

Difficulty guide for ${difficulty}: ${diffGuide}
${syllabusContext}
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
    let apiModel = process.env.GROQ_APTITUDE_MODEL || 'llama-3.3-70b-versatile';
    // If the model is an openrouter model but we are calling Groq, fallback to a valid groq model
    if (apiModel.includes('openai/') || apiModel.includes('gpt-oss')) {
      apiModel = 'llama-3.3-70b-versatile';
    }

    const fetchQuestions = async (retries = 1) => {
      for (let i = 0; i <= retries; i++) {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_APTITUDE_API_KEY || process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: apiModel,
            messages: [
              { role: 'system', content: 'You are a technical quiz generator. You always respond with valid JSON arrays only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1200 // Reduced max_tokens to prevent 429 Rate Limit issues
          })
        });

        if (!groqRes.ok) {
          if (groqRes.status === 429 && i < retries) {
            console.log('Hit 429 Rate Limit, retrying...');
            await new Promise(res => setTimeout(res, 2000)); // wait 2s before retry
            continue;
          }
          const errText = await groqRes.text();
          throw new Error(`Groq API error ${groqRes.status}: ${errText}`);
        }

        const groqData = await groqRes.json();
        return groqData;
      }
    };

    const groqData = await fetchQuestions(1);

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
    console.error('Aptitude generate error:', err.message);
    if (err.message.includes('429')) {
       return res.status(429).json({ error: 'AI Rate Limit Exceeded (429). Please wait a moment and try again.' });
    }
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
  // Save to unified assessment_evaluations table for AI suggestions and extract weak topics
  let ai_suggestion = `You scored ${score}/${total} in ${subject} aptitude test. Keep practicing!`;
  let ai_weak_topics = [];
  
  try {
    let wrongQuestionsText = '';
    if (questions && Array.isArray(questions) && Array.isArray(answers)) {
      questions.forEach((q, i) => {
        if (answers[i] !== q.correct_option) {
          wrongQuestionsText += `- ${q.question}\n`;
        }
      });
    }

    const prompt = `A user scored ${score} out of ${total} (${pct}%) on a ${subject} assessment.
The questions they answered incorrectly (if any) are:
${wrongQuestionsText}

Based on these incorrect questions, identify up to 3 specific sub-topics they need to improve on. If they scored 100%, leave it empty.
Also provide a 1-sentence encouraging AI feedback.
Respond ONLY with a valid JSON object. No markdown, no extra text:
{
  "feedback": "encuraging feedback sentence",
  "weak_topics": ["sub-topic 1", "sub-topic 2"]
}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 200 })
    });
    
    if (groqRes.ok) {
      const groqData = await groqRes.json();
      let content = groqData.choices?.[0]?.message?.content || '';
      content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        const parsed = JSON.parse(content.substring(startIdx, endIdx + 1));
        ai_suggestion = parsed.feedback || ai_suggestion;
        ai_weak_topics = parsed.weak_topics || [];
      }
    }
  } catch (err) { console.error('AI suggestion/weak topics error:', err.message); }

  // Insert AI generated weak topics into DB
  if (ai_weak_topics.length > 0) {
    const iconMap = { Aptitude: '🧮', Verbal: '📝', Reasoning: '🧠' };
    const icon = iconMap[subject] || '📚';
    for (const topic of ai_weak_topics) {
      const { data: existing } = await supabase.from('weak_topics').select('id').eq('user_id', user.id).eq('topic_name', topic).single();
      if (existing) {
        await supabase.from('weak_topics').update({ score_percentage: pct, icon }).eq('id', existing.id);
      } else {
        await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: topic, score_percentage: pct, icon });
      }
    }
  } else if (pct < 60) {
    // Fallback if AI fails to generate specific topics
    const iconMap = { Aptitude: '🧮', Verbal: '📝', Reasoning: '🧠' };
    const { data: existing } = await supabase.from('weak_topics').select('id').eq('user_id', user.id).eq('topic_name', subject).single();
    if (existing) {
      await supabase.from('weak_topics').update({ score_percentage: pct, icon: iconMap[subject] || '📚' }).eq('id', existing.id);
    } else {
      await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: subject, score_percentage: pct, icon: iconMap[subject] || '📚' });
    }
  }

  await supabase.from('assessment_evaluations').insert({
    user_id: user.id,
    module: 'aptitude',
    subject: subject,
    score,
    total,
    ai_suggestion,
    details: { answers, difficulty }
  });

  res.json({ success: true, score, total, percentage: pct, result, ai_suggestion });
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
        max_tokens: 1200
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
  ],
  "weak_topics": ["sub-topic 1", "sub-topic 2"]
}

Also extract up to 3 specific sub-topics they performed poorly on and put them in the "weak_topics" array. If they did well, leave it empty.`;

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
        max_tokens: 1500
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

    // Update weak topics
    const ai_weak_topics = evalResult.weak_topics || [];
    const iconMap = { DSA: '🌳', DBMS: '🗄️', OS: '🖥️', CN: '🌐', C: '⚙️', CPP: '🔷', Java: '☕', Python: '🐍' };
    const icon = iconMap[subject] || '🎤';
    
    if (ai_weak_topics.length > 0) {
      for (const topic of ai_weak_topics) {
        const { data: existing } = await supabase.from('weak_topics').select('id').eq('user_id', user.id).eq('topic_name', topic).single();
        if (existing) {
          await supabase.from('weak_topics').update({ score_percentage: scoreNum, icon }).eq('id', existing.id);
        } else {
          await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: topic, score_percentage: scoreNum, icon });
        }
      }
    } else if (scoreNum < 60) {
      const topicName = `${subject} Interview`;
      const { data: existing } = await supabase
        .from('weak_topics')
        .select('id')
        .eq('user_id', user.id)
        .eq('topic_name', topicName)
        .single();

      if (existing) {
        await supabase.from('weak_topics').update({ score_percentage: scoreNum, icon }).eq('id', existing.id);
      } else {
        await supabase.from('weak_topics').insert({ user_id: user.id, topic_name: topicName, score_percentage: scoreNum, icon });
      }
    }

    // Save evaluation to the unified assessment table
    await supabase.from('assessment_evaluations').insert({
      user_id: user.id,
      module: 'interview',
      subject: subject,
      score: evalResult.totalScore,
      total: evalResult.maxScore,
      ai_suggestion: `AI Interview evaluation completed with score ${evalResult.totalScore}/${evalResult.maxScore}.`,
      details: evalResult.breakdown
    });

    res.json(evalResult);

  } catch (err) {
    console.error('Interview evaluate error:', err.message);
    res.status(500).json({ error: 'Failed to evaluate answers: ' + err.message });
  }
});

// ═══════════════════════════════════════════════
//  UNIFIED ASSESSMENTS & AI FEEDBACK
// ═══════════════════════════════════════════════

// POST /api/assessments/submit — Generic save and AI feedback endpoint
app.post('/api/assessments/submit', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { module, subject, score, total, details } = req.body;
  if (!module) return res.status(400).json({ error: 'module is required' });

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  let ai_suggestion = '';

  // Generate personalized AI feedback
  try {
    const prompt = `A student just completed a ${module} assessment on ${subject || 'general topics'}.
They scored ${score} out of ${total} (${percentage}%).
Provide a brief, encouraging 2-sentence AI feedback analyzing their performance and suggesting exactly what to focus on next.`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an AI learning coach. Provide concise, encouraging, and actionable feedback.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 150
      })
    });

    if (groqRes.ok) {
      const groqData = await groqRes.json();
      ai_suggestion = groqData.choices?.[0]?.message?.content || 'Keep practicing to improve your skills!';
    } else {
      ai_suggestion = 'Keep practicing to improve your skills!';
    }
  } catch (err) {
    console.error('AI suggestion error:', err.message);
    ai_suggestion = 'Keep practicing to improve your skills!';
  }

  const { data, error } = await supabase.from('assessment_evaluations').insert({
    user_id: user.id,
    module,
    subject,
    score,
    total,
    ai_suggestion,
    details: details || {}
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/assessments/history
app.get('/api/assessments/history', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('assessment_evaluations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
// ═══════════════════════════════════════════════
//  IMPROVE ME — AI ROADMAP + NVIDIA QUIZ ROUTES
//  Add these routes to server.js BEFORE the
//  "Fallback" comment (before the last app.get('/'))
// ═══════════════════════════════════════════════

// ─── NVIDIA AI Helper ───
async function callNvidiaAI(messages, maxTokens = 1024) {
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'nvidia/llama-3.3-nemotron-super-49b-v1',
      messages,
      temperature: 0.6,
      max_tokens: maxTokens,
      stream: false
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('NVIDIA AI error: ' + err);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── GET /api/improve/roadmap ───
// Fetches user's weak topics from DB → sends to NVIDIA AI → returns roadmap
app.get('/api/improve/roadmap', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // 1. Fetch weak topics from Supabase
  const { data: weakTopics, error } = await supabase
    .from('weak_topics')
    .select('*')
    .eq('user_id', user.id)
    .order('score_percentage', { ascending: true })
    .limit(6);

  if (error) return res.status(500).json({ error: error.message });

  if (!weakTopics || weakTopics.length === 0) {
    return res.json({
      weakTopics: [],
      analysis: 'Great job! No weak topics detected. Keep practicing to maintain your performance.',
      steps: [
        { title: 'Maintain Your Streak', description: 'Continue daily practice across all subjects to stay sharp.', timeline: 'Ongoing' },
        { title: 'Attempt Hard Level Quizzes', description: 'Challenge yourself with hard difficulty questions to push your limits.', timeline: 'This Week' },
        { title: 'Try Mock Interviews', description: 'Practice mock interviews to build confidence for real interviews.', timeline: 'Next Week' }
      ]
    });
  }

  // 2. Build prompt for NVIDIA AI
  const topicList = weakTopics.map(t => `- ${t.topic_name} (score: ${t.score_percentage}%)`).join('\n');

  const prompt = `You are an expert technical interview coach. A student has the following weak topics based on their quiz, interview, and aptitude performance:

${topicList}

Based on these weak topics, provide:
1. A 2-sentence honest analysis of their current situation
2. A step-by-step 4-week improvement roadmap with specific actionable steps

Respond ONLY with valid JSON. No markdown, no extra text:
{
  "analysis": "2 sentence analysis here",
  "steps": [
    { "title": "Step title", "description": "Detailed actionable description", "timeline": "Week 1" },
    { "title": "Step title", "description": "Detailed actionable description", "timeline": "Week 2" },
    { "title": "Step title", "description": "Detailed actionable description", "timeline": "Week 3" },
    { "title": "Step title", "description": "Detailed actionable description", "timeline": "Week 4" }
  ]
}`;

  try {
    let content = await callNvidiaAI([
      { role: 'system', content: 'You are an expert interview preparation coach. Always respond with valid JSON only.' },
      { role: 'user', content: prompt }
    ], 800);

    // Clean JSON
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) throw new Error('No valid JSON from AI');
    const aiData = JSON.parse(content.substring(startIdx, endIdx + 1));

    res.json({
      weakTopics,
      analysis: aiData.analysis || 'Focus on your weak topics to improve overall performance.',
      steps: aiData.steps || []
    });

  } catch (err) {
    console.error('NVIDIA roadmap error:', err.message);
    // Fallback roadmap if AI fails
    res.json({
      weakTopics,
      analysis: `You have ${weakTopics.length} weak topic(s) to improve. Focus on the areas with the lowest scores first for maximum impact.`,
      steps: weakTopics.slice(0, 4).map((t, i) => ({
        title: `Improve: ${t.topic_name}`,
        description: `Your current score is ${t.score_percentage}%. Practice 5-10 questions daily on this topic and review concepts thoroughly.`,
        timeline: `Week ${i + 1}`
      }))
    });
  }
});

// ─── POST /api/improve/quiz ───
// Takes weak topic names → NVIDIA AI generates 10 targeted MCQ questions
app.post('/api/improve/quiz', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { topics } = req.body;
  if (!topics || !Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: 'topics array is required' });
  }

  const topicList = topics.slice(0, 6).join(', ');

  const prompt = `You are a technical quiz generator. Generate exactly 10 multiple choice questions to help a student improve on these weak topics: ${topicList}

Rules:
- Distribute questions across all the given topics
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Make questions moderately challenging but educational
- Each question must include a "topic" field indicating which weak topic it tests

Respond ONLY with a valid JSON array. No markdown, no extra text:
[
  {
    "question": "Question text here?",
    "topic": "Which weak topic this tests",
    "option_a": "Option 1",
    "option_b": "Option 2",
    "option_c": "Option 3",
    "option_d": "Option 4",
    "correct_option": "A"
  }
]

Generate all 10 questions now:`;

  try {
    let content = await callNvidiaAI([
      { role: 'system', content: 'You are a technical quiz generator. Always respond with a valid JSON array only. No markdown, no extra text.' },
      { role: 'user', content: prompt }
    ], 1500);

    // Clean JSON
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const startIdx = content.indexOf('[');
    const endIdx = content.lastIndexOf(']');
    if (startIdx === -1 || endIdx === -1) throw new Error('No valid JSON array from AI');
    const questions = JSON.parse(content.substring(startIdx, endIdx + 1));

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from NVIDIA AI');
    }

    // Validate and sanitize
    const validated = questions.slice(0, 10).map((q, i) => ({
      id: `nvidia_${Date.now()}_${i}`,
      question: q.question || `Question ${i + 1}`,
      topic: q.topic || topics[i % topics.length],
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: (q.correct_option || 'A').toUpperCase()
    }));

    res.json({ questions: validated });

  } catch (err) {
    console.error('NVIDIA quiz error:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz: ' + err.message });
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