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
app.use(express.static(path.join(__dirname, 'public')));

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

  // 1. Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authErr) return res.status(400).json({ error: authErr.message });

  const userId = authData.user.id;

  // 2. Create profile row
  const { error: profileErr } = await supabase.from('profiles').insert({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    role: role,
    plan: 'Free'
  });

  if (profileErr) return res.status(400).json({ error: profileErr.message });

  // 3. Seed default stats
  await supabase.from('user_stats').insert({
    user_id: userId,
    coding_solved: 0,
    quiz_score_avg: 0,
    interview_score_avg: 0,
    accuracy: 0,
    coding_weekly_change: 0,
    quiz_weekly_change: 0,
    interview_weekly_change: 0,
    accuracy_weekly_change: 0
  });

  // 4. Seed default weekly progress
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const progressRows = days.map(day => ({
    user_id: userId,
    day,
    coding_score: 0,
    quiz_score: 0,
    interview_score: 0
  }));
  await supabase.from('progress_data').insert(progressRows);

  // 5. Seed sample weak topics
  await supabase.from('weak_topics').insert([
    { user_id: userId, topic_name: 'Binary Trees', score_percentage: 40, icon: '🌳' },
    { user_id: userId, topic_name: 'Dynamic Programming', score_percentage: 55, icon: '⚡' },
    { user_id: userId, topic_name: 'Operating System', score_percentage: 60, icon: '🖥️' },
    { user_id: userId, topic_name: 'Database Normalization', score_percentage: 65, icon: '🗄️' }
  ]);

  // 6. Seed sample goals
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

  res.json({
    token: data.session.access_token,
    user: data.user
  });
});

// ═══════════════════════════════════════════════
//  DASHBOARD DATA ROUTES
// ═══════════════════════════════════════════════

// GET /api/dashboard/profile
app.get('/api/dashboard/profile', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/dashboard/stats
app.get('/api/dashboard/stats', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/dashboard/progress
app.get('/api/dashboard/progress', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('progress_data')
    .select('*')
    .eq('user_id', user.id)
    .order('id', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/dashboard/weak-topics
app.get('/api/dashboard/weak-topics', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('weak_topics')
    .select('*')
    .eq('user_id', user.id)
    .order('score_percentage', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/dashboard/goals
app.get('/api/dashboard/goals', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /api/dashboard/goals
app.post('/api/dashboard/goals', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, due_date } = req.body;

  const { data, error } = await supabase.from('goals').insert({
    user_id: user.id,
    title,
    due_date,
    status: 'not_started',
    progress_current: 0,
    progress_total: 1
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ─── Fallback: serve index ───
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.listen(PORT, async () => {
  console.log(`🚀 InterviewOS server running at http://localhost:${PORT}`);

  // ─── Test Supabase Connection ───
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Supabase connection FAILED: ${error.message}`);
    } else {
      console.log(`✅ Successfully connected to Supabase!`);
      console.log(`   📦 Database: ${process.env.SUPABASE_URL}`);
      console.log(`   📋 Tables are ready`);
    }
  } catch (err) {
    console.log(`❌ Supabase connection FAILED: ${err.message}`);
    console.log(`   💡 Check your .env file — make sure SUPABASE_URL and keys are correct`);
  }
});
