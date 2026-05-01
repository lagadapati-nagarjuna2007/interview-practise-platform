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

-- ═══════════════════════════════════════════════
--  SAMPLE QUESTIONS — 5 per subject (add more!)
--  You need at least 30 per subject for full quiz
-- ═══════════════════════════════════════════════

-- DSA
INSERT INTO quiz_questions (subject, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('DSA', 'What is the time complexity of binary search?', 'O(n)', 'O(log n)', 'O(n log n)', 'O(1)', 'B'),
('DSA', 'Which data structure uses LIFO order?', 'Queue', 'Array', 'Stack', 'Linked List', 'C'),
('DSA', 'What is the worst-case time complexity of QuickSort?', 'O(n)', 'O(n log n)', 'O(n²)', 'O(log n)', 'C'),
('DSA', 'Which traversal visits nodes in order: Left, Root, Right?', 'Pre-order', 'In-order', 'Post-order', 'Level-order', 'B'),
('DSA', 'What is the space complexity of merge sort?', 'O(1)', 'O(log n)', 'O(n)', 'O(n²)', 'C'),
('DSA', 'In a min-heap, the root contains which value?', 'Maximum value', 'Minimum value', 'Middle value', 'Random value', 'B'),
('DSA', 'Which algorithm is used for finding shortest path?', 'DFS', 'BFS only', 'Dijkstra', 'QuickSort', 'C'),
('DSA', 'What does BFS use internally?', 'Stack', 'Queue', 'Heap', 'Array', 'B'),
('DSA', 'A complete binary tree with n leaves has how many nodes?', 'n', '2n-1', '2n', 'n+1', 'B'),
('DSA', 'Which sorting algorithm has best average-case performance?', 'Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort', 'C');

-- DBMS
INSERT INTO quiz_questions (subject, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('DBMS', 'What does ACID stand for in databases?', 'Atomicity, Consistency, Isolation, Durability', 'Access, Control, Index, Data', 'Accuracy, Concurrency, Integrity, Durability', 'Atomicity, Concurrency, Isolation, Data', 'A'),
('DBMS', 'Which normal form removes partial dependencies?', '1NF', '2NF', '3NF', 'BCNF', 'B'),
('DBMS', 'What is a foreign key?', 'Primary key of same table', 'Key that links to another table primary key', 'Unique key', 'Composite key', 'B'),
('DBMS', 'Which SQL command is used to remove a table?', 'DELETE', 'REMOVE', 'DROP', 'TRUNCATE', 'C'),
('DBMS', 'What is a deadlock in DBMS?', 'Slow query', 'Two transactions waiting for each other indefinitely', 'Database crash', 'Index failure', 'B'),
('DBMS', 'Which join returns all rows from both tables?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'D'),
('DBMS', 'What is an index in a database?', 'A copy of the database', 'A data structure to speed up retrieval', 'A type of constraint', 'A stored procedure', 'B'),
('DBMS', 'Which command saves a transaction permanently?', 'SAVE', 'ROLLBACK', 'COMMIT', 'END', 'C'),
('DBMS', 'What is normalization?', 'Speeding up queries', 'Removing data redundancy', 'Adding more tables', 'Encrypting data', 'B'),
('DBMS', 'In ER diagram, what shape represents an entity?', 'Diamond', 'Oval', 'Rectangle', 'Triangle', 'C');

-- OS
INSERT INTO quiz_questions (subject, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('OS', 'What is a process in an OS?', 'A program on disk', 'A program in execution', 'A file', 'A CPU register', 'B'),
('OS', 'Which scheduling algorithm gives minimum average waiting time?', 'FCFS', 'SJF', 'Round Robin', 'Priority', 'B'),
('OS', 'What is thrashing?', 'CPU overuse', 'Excessive paging causing low CPU utilization', 'Memory leak', 'Disk crash', 'B'),
('OS', 'What is a semaphore used for?', 'Memory allocation', 'Process synchronization', 'File handling', 'CPU scheduling', 'B'),
('OS', 'Which memory allocation strategy leaves smallest hole?', 'First Fit', 'Best Fit', 'Worst Fit', 'Next Fit', 'B'),
('OS', 'What is virtual memory?', 'RAM only', 'Cache memory', 'Extension of physical memory using disk', 'ROM', 'C'),
('OS', 'What is a context switch?', 'Changing user', 'Saving and loading process state', 'Opening a file', 'Network switch', 'B'),
('OS', 'Banker''s algorithm is used to avoid:', 'Starvation', 'Deadlock', 'Thrashing', 'Fragmentation', 'B'),
('OS', 'What is demand paging?', 'Loading all pages at once', 'Loading pages only when needed', 'Removing pages', 'Page replacement', 'B'),
('OS', 'Which is NOT a process state?', 'Running', 'Waiting', 'Suspended', 'Compiling', 'D');

-- CN
INSERT INTO quiz_questions (subject, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('CN', 'Which layer of OSI handles routing?', 'Physical', 'Data Link', 'Network', 'Transport', 'C'),
('CN', 'What does DNS stand for?', 'Data Network System', 'Domain Name System', 'Dynamic Network Service', 'Data Name Server', 'B'),
('CN', 'Which protocol is used for email sending?', 'HTTP', 'FTP', 'SMTP', 'POP3', 'C'),
('CN', 'What is the default port for HTTP?', '21', '22', '80', '443', 'C'),
('CN', 'TCP is a __ protocol.', 'Connectionless', 'Connection-oriented', 'Broadcast', 'Multicast', 'B'),
('CN', 'What does IP stand for?', 'Internet Protocol', 'Internal Process', 'Interconnect Port', 'Internet Port', 'A'),
('CN', 'Which topology has a central hub?', 'Bus', 'Ring', 'Star', 'Mesh', 'C'),
('CN', 'What is the purpose of ARP?', 'Assigns IP addresses', 'Maps IP to MAC address', 'Resolves domain names', 'Routes packets', 'B'),
('CN', 'Which layer is responsible for end-to-end delivery?', 'Network', 'Transport', 'Session', 'Application', 'B'),
('CN', 'What is a subnet mask used for?', 'Encrypting data', 'Identifying network and host portions', 'Routing between ISPs', 'Assigning MAC addresses', 'B');

-- C Programming
INSERT INTO quiz_questions (subject, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('C', 'What is the size of int in C on a 32-bit system?', '2 bytes', '4 bytes', '8 bytes', '1 byte', 'B'),
('C', 'Which operator is used to get address of a variable?', '*', '&', '#', '@', 'B'),
('C', 'What does malloc() return on failure?', '0', '-1', 'NULL', 'false', 'C'),
('C', 'Which header file is required for printf?', 'stdlib.h', 'string.h', 'stdio.h', 'math.h', 'C'),
('C', 'What is a pointer?', 'A variable that stores data', 'A variable that stores address', 'A function', 'A data type', 'B'),
('C', 'Which keyword is used to define a constant in C?', 'constant', 'const', 'define', 'Both B and C', 'D'),
('C', 'What is the output of sizeof(char)?', '2', '4', '1', '8', 'C'),
('C', 'Which loop is always executed at least once?', 'for', 'while', 'do-while', 'None', 'C'),
('C', 'What is a structure in C?', 'Function group', 'Collection of different data types', 'Array of pointers', 'Linked list', 'B'),
('C', 'What does the break statement do?', 'Exits function', 'Exits loop or switch', 'Skips iteration', 'None', 'B');

-- C++
INSERT INTO quiz_questions (subject, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('CPP', 'What is encapsulation in C++?', 'Inheriting properties', 'Hiding data within a class', 'Function overloading', 'Multiple inheritance', 'B'),
('CPP', 'Which keyword is used to inherit a class in C++?', 'extends', 'implements', 'inherits', ':', 'D'),
('CPP', 'What is a constructor?', 'Function that destroys objects', 'Function called automatically when object is created', 'Static function', 'Virtual function', 'B'),
('CPP', 'What is polymorphism?', 'Multiple classes', 'One interface, multiple implementations', 'Data hiding', 'Memory management', 'B'),
('CPP', 'Which operator is used for dynamic memory in C++?', 'malloc', 'alloc', 'new', 'create', 'C'),
('CPP', 'What is the purpose of virtual function?', 'Faster execution', 'Achieving runtime polymorphism', 'Memory saving', 'Static binding', 'B'),
('CPP', 'What is a destructor?', 'Called when program starts', 'Called when object goes out of scope', 'Called for arrays only', 'Not available in C++', 'B'),
('CPP', 'What is function overloading?', 'Two functions in different classes', 'Same name, different parameters', 'Virtual functions', 'Template function', 'B'),
('CPP', 'Which access specifier allows access only within the class?', 'public', 'protected', 'private', 'internal', 'C'),
('CPP', 'What does STL stand for?', 'Standard Type Library', 'Standard Template Library', 'Static Template List', 'Structure Type Library', 'B');

-- Java
INSERT INTO quiz_questions (subject, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('Java', 'Which keyword is used to prevent method overriding in Java?', 'static', 'abstract', 'final', 'private', 'C'),
('Java', 'What is JVM?', 'Java Visual Machine', 'Java Virtual Machine', 'Java Variable Manager', 'Java Version Manager', 'B'),
('Java', 'Which collection maintains insertion order?', 'HashSet', 'TreeSet', 'LinkedList', 'HashMap', 'C'),
('Java', 'What is the parent class of all classes in Java?', 'Class', 'Super', 'Object', 'Base', 'C'),
('Java', 'Which exception is thrown for dividing by zero?', 'NullPointerException', 'ArithmeticException', 'ArrayIndexOutOfBoundsException', 'ClassCastException', 'B'),
('Java', 'What does the static keyword mean?', 'Object-level member', 'Class-level member shared by all instances', 'Private member', 'Final member', 'B'),
('Java', 'Which interface is implemented for thread creation?', 'Runnable', 'Callable', 'Thread', 'Both A and B', 'D'),
('Java', 'What is autoboxing in Java?', 'Automatic conversion of object to primitive', 'Automatic conversion of primitive to wrapper object', 'Garbage collection', 'Type casting', 'B'),
('Java', 'Which keyword is used to implement an interface?', 'extends', 'implements', 'inherits', 'uses', 'B'),
('Java', 'What is the size of boolean in Java?', '1 bit', '1 byte', '2 bytes', 'JVM dependent', 'D');

-- Python
INSERT INTO quiz_questions (subject, question, option_a, option_b, option_c, option_d, correct_option) VALUES
('Python', 'Which of these is a mutable data type in Python?', 'tuple', 'string', 'list', 'int', 'C'),
('Python', 'What is the output of type(3.14)?', '<class int>', '<class float>', '<class double>', '<class number>', 'B'),
('Python', 'Which keyword is used to define a function?', 'function', 'func', 'def', 'define', 'C'),
('Python', 'What does PEP 8 refer to?', 'Python version 8', 'Python Enhancement Proposal for style guide', 'Python Error Protocol', 'Package installer', 'B'),
('Python', 'How do you start a comment in Python?', '//', '/* */', '#', '--', 'C'),
('Python', 'What is a lambda function?', 'Named function', 'Anonymous function', 'Class method', 'Module function', 'B'),
('Python', 'Which method adds an element to the end of a list?', 'add()', 'insert()', 'append()', 'push()', 'C'),
('Python', 'What is __init__ in Python?', 'Module initializer', 'Constructor of a class', 'Main function', 'Destructor', 'B'),
('Python', 'Which of these is used for exception handling?', 'try-except', 'if-else', 'for-while', 'do-catch', 'A'),
('Python', 'What does len([1,2,3]) return?', '2', '3', '4', 'Error', 'B');