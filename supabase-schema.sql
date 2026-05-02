-- ═══════════════════════════════════════════════════════════
--  InterviewOS — Supabase Database Schema
--  Run this SQL in your Supabase SQL Editor (Dashboard > SQL)
-- ═══════════════════════════════════════════════════════════

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  role        TEXT DEFAULT 'Student',
  plan        TEXT DEFAULT 'Free',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. User stats (dashboard summary cards)
CREATE TABLE IF NOT EXISTS user_stats (
  id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id                   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coding_solved             INT DEFAULT 0,
  quiz_score_avg            INT DEFAULT 0,
  interview_score_avg       INT DEFAULT 0,
  accuracy                  INT DEFAULT 0,
  coding_weekly_change      INT DEFAULT 0,
  quiz_weekly_change        INT DEFAULT 0,
  interview_weekly_change   INT DEFAULT 0,
  accuracy_weekly_change    INT DEFAULT 0,
  updated_at                TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Weekly progress data (for the line chart)
CREATE TABLE IF NOT EXISTS progress_data (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day             TEXT NOT NULL,  -- Mon, Tue, Wed, Thu, Fri, Sat, Sun
  coding_score    INT DEFAULT 0,
  quiz_score      INT DEFAULT 0,
  interview_score INT DEFAULT 0
);

-- 4. Weak topics
CREATE TABLE IF NOT EXISTS weak_topics (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_name        TEXT NOT NULL,
  score_percentage  INT DEFAULT 0,
  icon              TEXT DEFAULT '📘'
);

-- 5. Goals
CREATE TABLE IF NOT EXISTS goals (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  due_date          DATE,
  status            TEXT DEFAULT 'not_started',  -- not_started, in_progress, completed
  progress_current  INT DEFAULT 0,
  progress_total    INT DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ═══ Row Level Security (RLS) ═══

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weak_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- User stats policies
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert stats" ON user_stats
  FOR INSERT WITH CHECK (true);

-- Progress data policies
CREATE POLICY "Users can view own progress" ON progress_data
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress_data
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert progress" ON progress_data
  FOR INSERT WITH CHECK (true);

-- Weak topics policies
CREATE POLICY "Users can view own weak topics" ON weak_topics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert weak topics" ON weak_topics
  FOR INSERT WITH CHECK (true);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert goals" ON goals
  FOR INSERT WITH CHECK (true);
-- ═══════════════════════════════════════════════
--  QUIZ TABLES — Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id              SERIAL PRIMARY KEY,
  subject         VARCHAR(20) NOT NULL,   -- 'DSA','DBMS','OS','CN','C','CPP','Java','Python'
  question        TEXT NOT NULL,
  option_a        TEXT NOT NULL,
  option_b        TEXT NOT NULL,
  option_c        TEXT NOT NULL,
  option_d        TEXT NOT NULL,
  correct_option  CHAR(1) NOT NULL        -- 'A', 'B', 'C', or 'D'
);

-- 2. Quiz Results Table
CREATE TABLE IF NOT EXISTS quiz_results (
  id              SERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject         VARCHAR(20),
  score           INT NOT NULL DEFAULT 0,
  total           INT NOT NULL DEFAULT 30,
  answers         JSONB,                  -- array of user answers
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_subject ON quiz_questions(subject);

-- 3. AI Assessment Evaluations Table (Unified marks & AI suggestions for all modules)
CREATE TABLE IF NOT EXISTS assessment_evaluations (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module          VARCHAR(50) NOT NULL, -- 'interview', 'quiz', 'aptitude', 'verbal', 'reasoning', 'coding'
  subject         VARCHAR(100),
  score           INT NOT NULL DEFAULT 0,
  total           INT NOT NULL DEFAULT 0,
  ai_suggestion   TEXT, -- The AI generated feedback/suggestions
  details         JSONB, -- Detailed breakdown, answers, or code
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for assessment_evaluations
ALTER TABLE assessment_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assessment evaluations" ON assessment_evaluations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessment evaluations" ON assessment_evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can insert assessment evaluations" ON assessment_evaluations
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_assessment_evaluations_user ON assessment_evaluations(user_id);