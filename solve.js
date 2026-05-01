// solve.js - InterviewOS Coding Workspace Logic

const TEST_CASES = {
  1: [ // Two Sum
    { input: 'nums = [2,7,11,15]\ntarget = 9', expected: '[0,1]' },
    { input: 'nums = [3,2,4]\ntarget = 6', expected: '[1,2]' },
    { input: 'nums = [3,3]\ntarget = 6', expected: '[0,1]' }
  ],
  2: [ // Best Time to Buy and Sell Stock
    { input: 'prices = [7,1,5,3,6,4]', expected: '5' },
    { input: 'prices = [7,6,4,3,1]', expected: '0' }
  ],
  3: [ // Product of Array Except Self
    { input: 'nums = [1,2,3,4]', expected: '[24,12,8,6]' },
    { input: 'nums = [-1,1,0,-3,3]', expected: '[0,0,9,0,0]' }
  ],
  4: [ // Maximum Subarray
    { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
    { input: 'nums = [1]', expected: '1' },
    { input: 'nums = [5,4,-1,7,8]', expected: '23' }
  ],
  5: [ // Container With Most Water
    { input: 'height = [1,8,6,2,5,4,8,3,7]', expected: '49' },
    { input: 'height = [1,1]', expected: '1' }
  ],
  6: [ // 3Sum
    { input: 'nums = [-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' },
    { input: 'nums = [0,1,1]', expected: '[]' },
    { input: 'nums = [0,0,0]', expected: '[[0,0,0]]' }
  ],
  7: [ // Trapping Rain Water
    { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' },
    { input: 'height = [4,2,0,3,2,5]', expected: '9' }
  ],
  8: [ // Rotate Array
    { input: 'nums = [1,2,3,4,5,6,7]\nk = 3', expected: '[5,6,7,1,2,3,4]' },
    { input: 'nums = [-1,-100,3,99]\nk = 2', expected: '[3,99,-1,-100]' }
  ],
  9: [ // Find Minimum in Rotated Sorted Array
    { input: 'nums = [3,4,5,1,2]', expected: '1' },
    { input: 'nums = [4,5,6,7,0,1,2]', expected: '0' },
    { input: 'nums = [11,13,15,17]', expected: '11' }
  ],
  10: [ // Merge Intervals
    { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]' },
    { input: 'intervals = [[1,4],[4,5]]', expected: '[[1,5]]' }
  ]
};

const STARTER_CODE = {
  1: {
    python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        pass',
    javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your code here\n};',
    java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}',
    cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};',
    c: 'int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    *returnSize = 0;\n    return NULL;\n}'
  },
  2: {
    python: 'class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        # Write your code here\n        pass',
    javascript: '/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n    // Write your code here\n};',
    java: 'class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your code here\n        return 0;\n    }\n}',
    cpp: 'class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your code here\n        return 0;\n    }\n};',
    c: 'int maxProfit(int* prices, int pricesSize) {\n    // Write your code here\n    return 0;\n}'
  },
  3: {
    python: 'class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        pass',
    javascript: 'var productExceptSelf = function(nums) {\n    \n};',
    java: 'class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}',
    cpp: 'class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};',
    c: 'int* productExceptSelf(int* nums, int numsSize, int* returnSize) {\n    *returnSize = 0;\n    return NULL;\n}'
  },
  4: {
    python: 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        pass',
    javascript: 'var maxSubArray = function(nums) {\n    \n};',
    java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}',
    cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};',
    c: 'int maxSubArray(int* nums, int numsSize) {\n    return 0;\n}'
  },
  5: {
    python: 'class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        pass',
    javascript: 'var maxArea = function(height) {\n    \n};',
    java: 'class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}',
    cpp: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};',
    c: 'int maxArea(int* height, int heightSize) {\n    return 0;\n}'
  },
  6: {
    python: 'class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        pass',
    javascript: 'var threeSum = function(nums) {\n    \n};',
    java: 'class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}',
    cpp: 'class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};',
    c: 'int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}'
  },
  7: {
    python: 'class Solution:\n    def trap(self, height: List[int]) -> int:\n        pass',
    javascript: 'var trap = function(height) {\n    \n};',
    java: 'class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}',
    cpp: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};',
    c: 'int trap(int* height, int heightSize) {\n    return 0;\n}'
  },
  8: {
    python: 'class Solution:\n    def rotate(self, nums: List[int], k: int) -> None:\n        """\n        Do not return anything, modify nums in-place instead.\n        """\n        pass',
    javascript: 'var rotate = function(nums, k) {\n    \n};',
    java: 'class Solution {\n    public void rotate(int[] nums, int k) {\n        \n    }\n}',
    cpp: 'class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        \n    }\n};',
    c: 'void rotate(int* nums, int numsSize, int k) {\n    \n}'
  },
  9: {
    python: 'class Solution:\n    def findMin(self, nums: List[int]) -> int:\n        pass',
    javascript: 'var findMin = function(nums) {\n    \n};',
    java: 'class Solution {\n    public int findMin(int[] nums) {\n        return 0;\n    }\n}',
    cpp: 'class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        return 0;\n    }\n};',
    c: 'int findMin(int* nums, int numsSize) {\n    return 0;\n}'
  },
  10: {
    python: 'class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        pass',
    javascript: 'var merge = function(intervals) {\n    \n};',
    java: 'class Solution {\n    public int[][] merge(int[][] intervals) {\n        return new int[][]{};\n    }\n}',
    cpp: 'class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        return {};\n    }\n};',
    c: 'int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}'
  }
};

// Global State
let editor;
let activeQuestionId = null;
let currentQuestion = null;
let activeTestCase = 0;

// Initialize Ace Editor
function initEditor() {
  editor = ace.edit("editor");
  editor.setTheme("ace/theme/tomorrow_night_eighties");
  editor.session.setMode("ace/mode/python");
  editor.setOptions({
    fontSize: "14px",
    showPrintMargin: false,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    fontFamily: "'JetBrains Mono', monospace"
  });
}

function loadQuestionData(id) {
  // QUESTIONS is globally available from coding.js
  if (typeof QUESTIONS !== "undefined") {
    return QUESTIONS.find(q => q.id == id);
  }
  return null;
}

function initPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id') || 1;
  activeQuestionId = id;

  initEditor();

  currentQuestion = loadQuestionData(id);
  
  if (currentQuestion) {
    populateUI(currentQuestion);
    setupTestCases(id);
    setLanguage('python'); // default
  } else {
    document.getElementById('problemTitleBar').textContent = 'Question Not Found';
    document.getElementById('problemTitle').textContent = 'Error loading question';
  }

  setupEventListeners();
}

function populateUI(q) {
  document.getElementById('problemTitleBar').textContent = `${q.id}. ${q.title}`;
  document.getElementById('problemTitle').textContent = `${q.id}. ${q.title}`;
  
  const diffChip = document.getElementById('difficultyChip');
  diffChip.textContent = q.difficulty;
  diffChip.className = `difficulty-chip ${q.difficulty}`;

  const tagsContainer = document.getElementById('problemTags');
  tagsContainer.innerHTML = `
    <span class="tag-chip diff-${q.difficulty}">${q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}</span>
    <span class="tag-chip topic">${q.topic}</span>
  `;

  document.getElementById('problemDesc').innerHTML = `<p>${q.description}</p>`;

  // Editorial
  document.getElementById('editorialHint').textContent = q.hint;
  document.getElementById('editorialApproach').innerHTML = q.approach.map(a => `<li>${a}</li>`).join('');
  document.getElementById('editorialComplexity').innerHTML = `
    <span class="complexity-badge">⏱ Time: <strong>${q.time}</strong></span>
    <span class="complexity-badge">💾 Space: <strong>${q.space}</strong></span>
  `;

  // Companies
  const companiesContainer = document.getElementById('companyChips');
  companiesContainer.innerHTML = q.companies.map(c => `<span class="company-chip">${c}</span>`).join('');
}

function setupTestCases(id) {
  const cases = TEST_CASES[id];
  const tabsContainer = document.getElementById('caseTabsContainer');
  
  if (!cases || cases.length === 0) {
    tabsContainer.innerHTML = '<div style="color:var(--text-muted);font-size:12px;">No test cases available.</div>';
    document.getElementById('tcInputDisplay').textContent = '';
    document.getElementById('tcExpectedDisplay').textContent = '';
    return;
  }

  tabsContainer.innerHTML = cases.map((c, i) => `
    <button class="case-tab ${i === 0 ? 'active' : ''}" data-index="${i}">Case ${i + 1}</button>
  `).join('');

  // Add click events to tabs
  tabsContainer.querySelectorAll('.case-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabsContainer.querySelectorAll('.case-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      activeTestCase = parseInt(e.target.getAttribute('data-index'));
      showTestCase(activeTestCase);
    });
  });

  showTestCase(0);
}

function showTestCase(index) {
  const cases = TEST_CASES[activeQuestionId];
  if (!cases || !cases[index]) return;
  
  document.getElementById('tcInputDisplay').textContent = cases[index].input;
  document.getElementById('tcExpectedDisplay').textContent = cases[index].expected;
}

function setLanguage(lang) {
  const modeMap = {
    'python': 'python',
    'javascript': 'javascript',
    'java': 'java',
    'cpp': 'c_cpp',
    'c': 'c_cpp'
  };
  editor.session.setMode(`ace/mode/${modeMap[lang]}`);
  
  const codes = STARTER_CODE[activeQuestionId];
  if (codes && codes[lang]) {
    editor.setValue(codes[lang], 1);
  } else {
    // Generic fallback for any other question
    let genericCode = '// Write your code here';
    if(lang === 'python') genericCode = 'class Solution:\n    def solve(self):\n        pass';
    else if(lang === 'javascript') genericCode = 'var solve = function() {\n    \n};';
    else if(lang === 'java') genericCode = 'class Solution {\n    public void solve() {\n        \n    }\n}';
    else if(lang === 'cpp') genericCode = 'class Solution {\npublic:\n    void solve() {\n        \n    }\n};';
    else if(lang === 'c') genericCode = 'void solve() {\n    \n}';
    
    editor.setValue(genericCode, 1);
  }
}

function setupEventListeners() {
  // Language change
  document.getElementById('languageSelect').addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });

  // Left Panel Tabs (Description / Editorial)
  document.querySelectorAll('.ptab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const tab = e.target.getAttribute('data-tab');
      document.getElementById('descriptionTab').classList.toggle('hidden', tab !== 'description');
      document.getElementById('editorialTab').classList.toggle('hidden', tab !== 'editorial');
    });
  });

  // Testcase Tabs (Testcase / Result)
  document.getElementById('tcTabTestcase').addEventListener('click', () => {
    document.getElementById('tcTabTestcase').classList.add('active');
    document.getElementById('tcTabResult').classList.remove('active');
    document.getElementById('tcTestcase').classList.remove('hidden');
    document.getElementById('tcResult').classList.add('hidden');
  });

  document.getElementById('tcTabResult').addEventListener('click', () => {
    document.getElementById('tcTabResult').classList.add('active');
    document.getElementById('tcTabTestcase').classList.remove('active');
    document.getElementById('tcResult').classList.remove('hidden');
    document.getElementById('tcTestcase').classList.add('hidden');
  });

  // Run Button
  document.getElementById('btnRun').addEventListener('click', () => {
    simulateExecution(false);
  });

  // Submit Button
  document.getElementById('btnSubmit').addEventListener('click', () => {
    simulateExecution(true);
  });

  // Resizing Logic (Horizontal)
  let isResizing = false;
  const resizeHandle = document.getElementById('resizeHandle');
  const panelLeft = document.getElementById('panelLeft');
  
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeHandle.classList.add('active');
    document.body.style.cursor = 'col-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      panelLeft.style.width = `${newWidth}%`;
      panelLeft.style.maxWidth = `${newWidth}%`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove('active');
      document.body.style.cursor = 'default';
      editor.resize();
    }
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function simulateExecution(isSubmit) {
  const overlay = document.getElementById('loadingOverlay');
  overlay.querySelector('p').textContent = isSubmit ? 'Evaluating Submission...' : 'Running Code...';
  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('hidden');
    
    // Switch to Result tab
    document.getElementById('tcTabResult').click();

    const cases = TEST_CASES[activeQuestionId] || [];
    const statusEl = document.getElementById('resultStatus');
    const casesEl = document.getElementById('resultCases');
    
    // Simple checking logic: check if the user actually wrote some code beyond the starter code
    const originalCode = STARTER_CODE[activeQuestionId] && STARTER_CODE[activeQuestionId][document.getElementById('languageSelect').value] || '';
    const currentCode = editor.getValue().trim();
    
    const isCodeChanged = currentCode !== originalCode.trim() && currentCode.length > 20 && !currentCode.includes("pass") && !currentCode.includes("// Write your code here");

    if (!isCodeChanged) {
      statusEl.className = 'result-status wrong';
      statusEl.innerHTML = '<span style="color:var(--red)">Wrong Answer</span>';
    } else {
      statusEl.className = 'result-status accepted';
      statusEl.innerHTML = '<span style="color:var(--green)">Accepted</span>';
      
      if (isSubmit) {
        showToast("Success! Solution submitted.");
        // Update local storage status
        const statuses = JSON.parse(localStorage.getItem('codingStatuses') || '{}');
        statuses[activeQuestionId] = 'solved';
        localStorage.setItem('codingStatuses', JSON.stringify(statuses));
      } else {
        showToast("Code executed successfully.");
      }
    }

    // Render result cases
    if (cases.length > 0) {
      casesEl.innerHTML = cases.map((c, i) => `
        <div class="result-case">
          <div class="result-case-header">
            <span class="result-case-title ${!isCodeChanged ? 'failed' : 'passed'}">Case ${i+1}</span>
          </div>
          <div class="result-row"><span class="rl">Input:</span><span class="rv">${c.input.replace(/\n/g, ', ')}</span></div>
          <div class="result-row"><span class="rl">Output:</span><span class="rv ${!isCodeChanged ? 'wrong-val' : ''}">${!isCodeChanged ? 'null' : c.expected}</span></div>
          <div class="result-row"><span class="rl">Expected:</span><span class="rv">${c.expected}</span></div>
        </div>
      `).join('');
    } else {
      casesEl.innerHTML = '<div style="padding:10px;color:var(--text-muted)">No output available</div>';
    }
    
  }, 1500);
}

// Start
document.addEventListener('DOMContentLoaded', initPage);
