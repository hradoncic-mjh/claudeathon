
/* ═══════════════════════════════════════════════════════════════
   WORD SEARCH QUIZ — All-in-one JavaScript
   ═══════════════════════════════════════════════════════════════ */

// ─── Utility ───
function $(id) { return document.getElementById(id); }
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function showToast(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.className = 'toast', 2200);
}
function formatTime(sec) {
  if (sec == null || sec < 0) return '--:--';
  const m = Math.floor(sec / 60), s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}

// ─── Sample Data ───
const SAMPLE_GAME = {
  quizId: 'vet-science-001',
  title: 'Veterinary Science Quiz',
  category: 'Veterinary Medicine',
  gridSize: 15,
  globalTimer: 300,
  questionTimer: 60,
  streakBonus: 25,
  debug: true,
  questions: [
    { question: 'What highly contagious viral disease in dogs causes coughing, fever, and nasal discharge?', answer: 'DISTEMPER' },
    { question: 'What disease caused by a virus is fatal in mammals and transmitted through saliva?', answer: 'RABIES' },
    { question: 'What external parasite commonly infests dogs and cats and can transmit disease?', answer: 'TICK' },
    { question: 'What is the medical term for the surgical removal of an animal\'s reproductive organs?', answer: 'SPAY' },
    { question: 'What organ filters toxins from the blood in animals?', answer: 'LIVER' },
    { question: 'What is the term for a young cat?', answer: 'KITTEN' },
    { question: 'What intestinal worms are one of the most common parasites found in puppies?', answer: 'ROUNDWORM' }
  ]
};

// ─── App Controller ───
const App = {
  currentConfig: null,
  currentCollection: null,
  currentCategory: null,
  globalDebugMode: false,

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
    if (id === 'start-screen') {
      this.init();
      // Reset session tracking when returning to menu
      AchievementsManager.resetConsecutiveQuizzes();
      AchievementsManager.resetSession();
    }
  },

  playSample() {
    // Use the embedded sample collection if available
    if (typeof SAMPLE_COLLECTION !== 'undefined') {
      App.currentCollection = SAMPLE_COLLECTION;
      App.showCollection();
      showToast('Sample collection loaded!', 'success');
    } else {
      // Fallback to single quiz
      App.currentConfig = SAMPLE_GAME;
      Game.start(SAMPLE_GAME);
    }
  },

  showCreator() {
    Creator.init();
    App.showScreen('creator-screen');
  },

  init() {
    // Show resume button if a saved game exists
    const saved = localStorage.getItem('wordsearch_saved_game');
    $('resume-btn').style.display = saved ? '' : 'none';
    
    // Load saved theme
    const savedTheme = localStorage.getItem('wordsearch_theme') || 'modern-polished';
    this.changeTheme(savedTheme, false);
    
    // Load saved global debug mode
    const savedDebug = localStorage.getItem('wordsearch_global_debug') === 'true';
    this.globalDebugMode = savedDebug;
    const debugToggle = $('global-debug-toggle');
    if (debugToggle) {
      debugToggle.checked = savedDebug;
    }
    
    // Update achievement badge
    const progress = AchievementsManager.getProgress();
    const badge = $('achievement-badge');
    if (badge) {
      badge.textContent = `${progress.unlocked}/${progress.total}`;
      badge.style.cssText = `
        display: inline-block;
        background: ${progress.unlocked > 0 ? 'rgba(0,230,118,.15)' : 'rgba(255,255,255,.1)'};
        color: ${progress.unlocked > 0 ? '#00e676' : '#8899a6'};
        padding: 2px 8px;
        border-radius: 12px;
        font-size: .75rem;
        font-weight: 700;
      `;
    }
  },

  toggleGlobalDebug(enabled) {
    this.globalDebugMode = enabled;
    localStorage.setItem('wordsearch_global_debug', enabled);
    
    if (enabled) {
      showToast('Global debug mode enabled - answers will be shown', 'success');
    } else {
      showToast('Global debug mode disabled', 'success');
    }
  },

  changeTheme(themeName, showNotification = true) {
    const stylesheet = $('theme-stylesheet');
    const selector = $('theme-selector');
    
    if (stylesheet) {
      stylesheet.href = `./${themeName}.css`;
    }
    
    if (selector) {
      selector.value = themeName;
    }
    
    // Save theme preference
    localStorage.setItem('wordsearch_theme', themeName);
    
    // Track theme usage for achievement
    const themeDisplayNames = {
      'modern-polished': 'Modern Polished',
      'clean-light': 'Clean Light',
      'sunset-warm': 'Sunset Warm',
      'forest-green': 'Forest Green'
    };
    AchievementsManager.trackThemeUsed(themeDisplayNames[themeName] || themeName);
    
    if (showNotification) {
      showToast(`Theme changed to ${themeDisplayNames[themeName]}!`, 'success');
    }
  },

  loadGame() {
    $('file-input').click();
  },

  loadCollection() {
    $('collection-input').click();
  },

  handleCollectionLoad(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const collection = JSON.parse(ev.target.result);
        
        // Validate collection structure
        if (typeof collection !== 'object' || Array.isArray(collection)) {
          throw new Error('Invalid collection format');
        }
        
        let totalQuizzes = 0;
        Object.keys(collection).forEach(category => {
          if (!Array.isArray(collection[category])) {
            throw new Error(`Category "${category}" must contain an array of quizzes`);
          }
          totalQuizzes += collection[category].length;
        });
        
        if (totalQuizzes === 0) {
          throw new Error('Collection contains no quizzes');
        }
        
        App.currentCollection = collection;
        App.showCollection();
        showToast('Quiz collection loaded!', 'success');
      } catch(err) {
        showToast('Invalid collection file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  showCollection() {
    if (!this.currentCollection) {
      showToast('No collection loaded', 'error');
      return;
    }

    const categories = Object.keys(this.currentCollection);
    const container = $('categories-container');
    
    let html = '';
    categories.forEach(category => {
      const quizCount = this.currentCollection[category].length;
      html += `
        <div class="quiz-card" onclick="App.showQuizList('${esc(category)}')">
          <div class="quiz-card-icon">📚</div>
          <div class="quiz-card-title">${esc(category)}</div>
          <div class="quiz-card-info">${quizCount} quiz${quizCount !== 1 ? 'zes' : ''}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    $('collection-title').textContent = `${categories.length} categories available`;
    this.showScreen('collection-screen');
  },

  showQuizList(category) {
    this.currentCategory = category;
    const quizzes = this.currentCollection[category];
    const container = $('quizzes-container');
    
    let html = '';
    quizzes.forEach((quiz, index) => {
      const questionCount = quiz.questions.length;
      html += `
        <div class="quiz-card" onclick="App.playQuizFromCollection(${index})">
          <div class="quiz-card-icon">📝</div>
          <div class="quiz-card-title">${esc(quiz.title)}</div>
          <div class="quiz-card-info">
            ${questionCount} questions • Grid: ${quiz.gridSize}x${quiz.gridSize}
            ${quiz.globalTimer ? `<br>⏱️ ${Math.floor(quiz.globalTimer / 60)} min` : ''}
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    $('category-name').textContent = category;
    $('quiz-list-subtitle').textContent = `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} in this category`;
    this.showScreen('quiz-list-screen');
  },

  playQuizFromCollection(index) {
    const quiz = this.currentCollection[this.currentCategory][index];
    this.currentConfig = quiz;
    Game.start(quiz);
  },

  resumeSaved() {
    const saved = localStorage.getItem('wordsearch_saved_game');
    if (!saved) { showToast('No saved game found', 'error'); return; }
    try {
      App.currentConfig = JSON.parse(saved);
      Game.start(App.currentConfig);
      showToast('Resumed saved game!', 'success');
    } catch(e) {
      showToast('Saved game is corrupted', 'error');
    }
  },

  handleFileLoad(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const config = JSON.parse(ev.target.result);
        if (!config.questions || !config.questions.length) throw new Error('No questions');
        if (!config.gridSize) config.gridSize = 15;
        
        // Generate quizId if not present
        if (!config.quizId) {
          const title = config.title || 'Word Search Quiz';
          config.quizId = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30) + '-' + Date.now().toString(36);
        }
        
        App.currentConfig = config;
        Game.start(config);
        showToast('Game loaded!', 'success');
      } catch(err) {
        showToast('Invalid game file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  endGame() {
    TimerManager.stopAll();
    EndScreen.show(false); // false = not completed naturally
  },

  replayGame() {
    if (App.currentConfig) Game.start(App.currentConfig);
  },

  showLeaderboards() {
    const all = JSON.parse(localStorage.getItem(LeaderboardManager.STORAGE_KEY) || '{}');
    const container = $('all-leaderboards-container');
    
    if (Object.keys(all).length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#8899a6;padding:60px 20px">No leaderboards yet. Play some games first!</p>';
    } else {
      let html = '';
      Object.keys(all).forEach(quizId => {
        const board = all[quizId];
        if (board.length === 0) return;
        
        // Try to get quiz title from the first entry's stats or use quizId
        const quizTitle = quizId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        html += `
          <div class="form-section" style="margin-bottom:30px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
              <h3 style="margin:0">${esc(quizTitle)}</h3>
              <button class="btn btn-danger btn-small" onclick="App.clearLeaderboard('${quizId}')">Clear</button>
            </div>
            <table class="breakdown-table">
              <thead>
                <tr>
                  <th style="width:60px">Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        board.slice(0, 5).forEach((entry, i) => {
          const date = new Date(entry.date);
          const dateStr = date.toLocaleDateString();
          html += `
            <tr>
              <td><strong>${i + 1}</strong></td>
              <td>${esc(entry.name)}</td>
              <td>${entry.score}</td>
              <td>${entry.stats.found}/${entry.stats.totalQ} (${entry.stats.accuracy}%)</td>
              <td>${dateStr}</td>
            </tr>
          `;
        });
        
        html += `
              </tbody>
            </table>
          </div>
        `;
      });
      container.innerHTML = html;
    }
    
    this.showScreen('leaderboards-screen');
  },

  clearLeaderboard(quizId) {
    if (confirm('Are you sure you want to clear this leaderboard?')) {
      LeaderboardManager.clearLeaderboard(quizId);
      showToast('Leaderboard cleared!', 'success');
      this.showLeaderboards(); // Refresh the display
    }
  },

  showAchievements() {
    const unlocked = AchievementsManager.getUnlocked();
    const progress = AchievementsManager.getProgress();
    
    $('achievement-progress-text').textContent = `${progress.unlocked}/${progress.total}`;
    $('achievement-progress-subtitle').textContent = `${progress.percentage}% Complete`;
    $('achievement-progress-bar').style.width = progress.percentage + '%';

    this.currentAchievementFilter = 'all';
    this.renderAchievements();
    this.showScreen('achievements-screen');
  },

  currentAchievementFilter: 'all',

  filterAchievements(filter) {
    this.currentAchievementFilter = filter;
    
    // Update button states
    ['all', 'unlocked', 'locked'].forEach(f => {
      const btn = $('filter-' + f);
      if (f === filter) {
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
      }
    });
    
    this.renderAchievements();
  },

  renderAchievements() {
    const container = $('achievements-container');
    const unlocked = AchievementsManager.getUnlocked();
    const achievements = AchievementsManager.ACHIEVEMENTS;
    
    // Group by category
    const categories = {};
    Object.values(achievements).forEach(ach => {
      if (!categories[ach.category]) categories[ach.category] = [];
      categories[ach.category].push(ach);
    });

    let html = '';
    Object.keys(categories).sort().forEach(category => {
      const achList = categories[category];
      const categoryHtml = achList.map(ach => {
        const isUnlocked = !!unlocked[ach.id];
        
        // Filter logic
        if (this.currentAchievementFilter === 'unlocked' && !isUnlocked) return '';
        if (this.currentAchievementFilter === 'locked' && isUnlocked) return '';

        const unlockedDate = isUnlocked ? new Date(unlocked[ach.id].unlockedAt).toLocaleDateString() : '';
        
        return `
          <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon-large">${ach.icon}</div>
            <div class="achievement-details">
              <div class="achievement-name">${ach.name}</div>
              <div class="achievement-description">${ach.description}</div>
              ${isUnlocked ? `<div class="achievement-date">Unlocked: ${unlockedDate}</div>` : ''}
            </div>
            ${isUnlocked ? '<div class="achievement-checkmark">✓</div>' : '<div class="achievement-lock">🔒</div>'}
          </div>
        `;
      }).filter(Boolean).join('');

      if (categoryHtml) {
        html += `
          <div class="form-section">
            <h3 style="margin-bottom:20px;color:#8899a6">${category}</h3>
            <div class="achievements-grid">
              ${categoryHtml}
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = html || '<p style="text-align:center;color:#8899a6;padding:60px 20px">No achievements match this filter.</p>';
  },

  resetAchievements() {
    if (confirm('Are you sure you want to reset ALL achievements and stats? This cannot be undone!')) {
      localStorage.removeItem(AchievementsManager.STORAGE_KEY);
      localStorage.removeItem(AchievementsManager.STATS_KEY);
      showToast('All achievements reset!', 'success');
      this.showAchievements();
      this.init(); // Update badge
    }
  }
};

// ─── Creator Mode ───
const Creator = {
  rowCount: 0,
  mode: 'single', // 'single' or 'collection'
  collection: {}, // { "Category Name": [quiz1, quiz2, ...] }
  currentCategory: null,
  editingQuizIndex: -1,

  init() {
    $('cr-questions').innerHTML = '';
    this.rowCount = 0;
    this.mode = 'single';
    this.collection = {};
    this.currentCategory = null;
    this.editingQuizIndex = -1;
    
    for (let i = 0; i < 3; i++) this.addRow();
    this.setMode('single');
  },

  setMode(mode) {
    this.mode = mode;
    
    // Update button states
    if (mode === 'single') {
      $('mode-single').classList.remove('btn-secondary');
      $('mode-single').classList.add('btn-primary');
      $('mode-collection').classList.remove('btn-primary');
      $('mode-collection').classList.add('btn-secondary');
      $('collection-management').style.display = 'none';
      $('current-category-display').style.display = 'none';
      $('creator-save-collection-btn').style.display = 'none';
      $('creator-download-btn').textContent = 'Download Quiz JSON';
    } else {
      $('mode-collection').classList.remove('btn-secondary');
      $('mode-collection').classList.add('btn-primary');
      $('mode-single').classList.remove('btn-primary');
      $('mode-single').classList.add('btn-secondary');
      $('collection-management').style.display = 'block';
      $('creator-download-btn').textContent = 'Download Collection JSON';
      this.renderCategories();
    }
  },

  addCategory() {
    const name = $('new-category-name').value.trim();
    if (!name) {
      showToast('Enter a category name', 'error');
      return;
    }
    
    if (this.collection[name]) {
      showToast('Category already exists', 'error');
      return;
    }
    
    this.collection[name] = [];
    $('new-category-name').value = '';
    this.renderCategories();
    showToast(`Category "${name}" added!`, 'success');
  },

  renderCategories() {
    const container = $('categories-list');
    const categories = Object.keys(this.collection);
    
    if (categories.length === 0) {
      container.innerHTML = '<p style="color:#8899a6;text-align:center;padding:20px">No categories yet. Add one above!</p>';
      return;
    }
    
    let html = '<div class="quiz-selection-grid" style="margin-top:16px">';
    categories.forEach(category => {
      const quizCount = this.collection[category].length;
      html += `
        <div class="quiz-card">
          <div class="quiz-card-icon">📚</div>
          <div class="quiz-card-title">${esc(category)}</div>
          <div class="quiz-card-info">${quizCount} quiz${quizCount !== 1 ? 'zes' : ''}</div>
          <div style="display:flex;gap:8px;margin-top:12px;justify-content:center">
            <button class="btn btn-small btn-secondary" onclick="Creator.editCategory('${esc(category)}')">Edit Quizzes</button>
            <button class="btn btn-small btn-danger" onclick="Creator.deleteCategory('${esc(category)}')">Delete</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  },

  editCategory(categoryName) {
    this.currentCategory = categoryName;
    $('collection-management').style.display = 'none';
    $('current-category-display').style.display = 'block';
    $('current-category-name').textContent = categoryName;
    $('creator-save-collection-btn').style.display = 'inline-flex';
    
    // Show list of quizzes in this category
    this.showCategoryQuizzes();
  },

  showCategoryQuizzes() {
    const quizzes = this.collection[this.currentCategory];
    
    // Add a section to show existing quizzes
    let existingSection = $('existing-quizzes-section');
    if (!existingSection) {
      existingSection = document.createElement('div');
      existingSection.id = 'existing-quizzes-section';
      existingSection.className = 'form-section';
      const settingsSection = document.querySelector('.form-section');
      settingsSection.parentNode.insertBefore(existingSection, settingsSection);
    }
    
    if (quizzes.length === 0) {
      existingSection.innerHTML = '<h3>Quizzes in this Category</h3><p style="color:#8899a6;text-align:center;padding:20px">No quizzes yet. Create one below!</p>';
    } else {
      let html = '<h3>Quizzes in this Category</h3><div class="quiz-selection-grid" style="margin-top:16px">';
      quizzes.forEach((quiz, index) => {
        html += `
          <div class="quiz-card">
            <div class="quiz-card-icon">📝</div>
            <div class="quiz-card-title">${esc(quiz.title)}</div>
            <div class="quiz-card-info">${quiz.questions.length} questions • ${quiz.gridSize}x${quiz.gridSize}</div>
            <div style="display:flex;gap:8px;margin-top:12px;justify-content:center">
              <button class="btn btn-small btn-secondary" onclick="Creator.editQuiz(${index})">Edit</button>
              <button class="btn btn-small btn-danger" onclick="Creator.deleteQuiz(${index})">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
      existingSection.innerHTML = html;
    }
    
    existingSection.style.display = 'block';
  },

  editQuiz(index) {
    const quiz = this.collection[this.currentCategory][index];
    this.editingQuizIndex = index;
    
    // Load quiz data into form
    $('cr-title').value = quiz.title;
    $('cr-category').value = quiz.category || this.currentCategory;
    $('cr-gridsize').value = quiz.gridSize;
    $('cr-global-timer').value = quiz.globalTimer || 0;
    $('cr-question-timer').value = quiz.questionTimer || 0;
    $('cr-streak-bonus').value = quiz.streakBonus || 0;
    $('cr-debug').value = quiz.debug ? '1' : '0';
    
    // Load questions
    $('cr-questions').innerHTML = '';
    this.rowCount = 0;
    quiz.questions.forEach(q => {
      this.addRow(q.question, q.answer);
    });
    
    showToast('Quiz loaded for editing', 'success');
  },

  deleteQuiz(index) {
    if (confirm('Delete this quiz?')) {
      this.collection[this.currentCategory].splice(index, 1);
      this.showCategoryQuizzes();
      showToast('Quiz deleted', 'success');
    }
  },

  exitCategoryEdit() {
    this.currentCategory = null;
    this.editingQuizIndex = -1;
    $('collection-management').style.display = 'block';
    $('current-category-display').style.display = 'none';
    $('creator-save-collection-btn').style.display = 'none';
    
    const existingSection = $('existing-quizzes-section');
    if (existingSection) {
      existingSection.style.display = 'none';
    }
    
    // Clear form
    $('cr-title').value = 'My Word Search Quiz';
    $('cr-category').value = '';
    $('cr-questions').innerHTML = '';
    this.rowCount = 0;
    for (let i = 0; i < 3; i++) this.addRow();
    
    this.renderCategories();
  },

  deleteCategory(categoryName) {
    const quizCount = this.collection[categoryName].length;
    if (confirm(`Delete category "${categoryName}" and all ${quizCount} quiz${quizCount !== 1 ? 'zes' : ''}?`)) {
      delete this.collection[categoryName];
      this.renderCategories();
      showToast('Category deleted', 'success');
    }
  },

  saveToCollection() {
    if (!this.currentCategory) {
      showToast('No category selected', 'error');
      return;
    }
    
    const config = this.getConfig();
    if (!config) return;
    
    // Ensure category matches
    config.category = this.currentCategory;
    
    if (this.editingQuizIndex >= 0) {
      // Update existing quiz
      this.collection[this.currentCategory][this.editingQuizIndex] = config;
      showToast('Quiz updated!', 'success');
    } else {
      // Add new quiz
      this.collection[this.currentCategory].push(config);
      showToast('Quiz added to collection!', 'success');
    }
    
    this.editingQuizIndex = -1;
    
    // Clear form
    $('cr-title').value = 'My Word Search Quiz';
    $('cr-questions').innerHTML = '';
    this.rowCount = 0;
    for (let i = 0; i < 3; i++) this.addRow();
    
    this.showCategoryQuizzes();
  },

  addRow(q = '', a = '') {
    this.rowCount++;
    const div = document.createElement('div');
    div.className = 'question-row';
    div.id = 'cr-row-' + this.rowCount;
    div.innerHTML = `
      <div class="form-field"><label>Question ${this.rowCount}</label><input type="text" placeholder="Enter question..." value="${q}"></div>
      <div class="form-field"><label>Answer</label><input type="text" placeholder="ANSWER" value="${a}" style="text-transform:uppercase"></div>
      <button class="btn btn-danger btn-small" onclick="Creator.removeRow('cr-row-${this.rowCount}')">X</button>
    `;
    $('cr-questions').appendChild(div);
  },

  removeRow(id) {
    const el = $(id);
    if (el && $('cr-questions').children.length > 1) el.remove();
  },

  getConfig() {
    const rows = $('cr-questions').querySelectorAll('.question-row');
    const questions = [];
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const q = inputs[0].value.trim();
      const a = inputs[1].value.trim().toUpperCase().replace(/\s+/g, '');
      if (q && a) questions.push({ question: q, answer: a });
    });
    if (!questions.length) { showToast('Add at least one question!', 'error'); return null; }
    const gridSize = parseInt($('cr-gridsize').value) || 15;
    const longest = Math.max(...questions.map(q => q.answer.length));
    if (gridSize < longest) {
      showToast(`Grid size must be at least ${longest} for your longest answer`, 'error');
      return null;
    }
    
    // Generate quiz ID from title + timestamp
    const title = $('cr-title').value || 'Word Search Quiz';
    const quizId = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 30) + '-' + Date.now().toString(36);
    
    return {
      quizId,
      title,
      category: $('cr-category').value || '',
      gridSize: Math.max(10, Math.min(30, gridSize)),
      globalTimer: parseInt($('cr-global-timer').value) || 0,
      questionTimer: parseInt($('cr-question-timer').value) || 0,
      streakBonus: parseInt($('cr-streak-bonus').value) || 0,
      debug: $('cr-debug').value === '1',
      questions
    };
  },

  playGame() {
    const config = this.getConfig();
    if (!config) return;
    App.currentConfig = config;
    Game.start(config);
  },

  saveLocal() {
    const config = this.getConfig();
    if (!config) return;
    localStorage.setItem('wordsearch_saved_game', JSON.stringify(config));
    showToast('Saved to browser!', 'success');
  },

  downloadJSON() {
    if (this.mode === 'collection') {
      // Download collection
      if (Object.keys(this.collection).length === 0) {
        showToast('Collection is empty!', 'error');
        return;
      }
      
      const blob = new Blob([JSON.stringify(this.collection, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'quiz-collection.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      showToast('Collection downloaded!', 'success');
    } else {
      // Download single quiz
      const config = this.getConfig();
      if (!config) return;
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (config.title.replace(/\s+/g, '_') || 'game') + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      showToast('Downloaded!', 'success');
    }
  }
};

// ─── Grid Generator ───
const GridGenerator = {
  DIRS: [
    [0,1],[0,-1],[1,0],[-1,0],  // →←↓↑
    [-1,1],[1,1],[1,-1],[-1,-1] // ↗↘↙↖
  ],

  generate(size, words) {
    const sorted = words.slice().sort((a, b) => b.length - a.length);

    for (let attempt = 0; attempt < 50; attempt++) {
      const grid = Array.from({ length: size }, () => Array(size).fill(null));
      const placements = {};
      let allPlaced = true;

      for (const word of sorted) {
        const placed = this.placeWord(grid, size, word);
        if (placed) {
          placements[word] = placed;
        } else {
          allPlaced = false;
          break;
        }
      }

      if (allPlaced) {
        // Fill empty cells with random letters
        for (let r = 0; r < size; r++)
          for (let c = 0; c < size; c++)
            if (grid[r][c] === null)
              grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        return { grid, placements };
      }
    }

    // Fallback: place what we can
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const placements = {};
    for (const word of sorted) {
      const placed = this.placeWord(grid, size, word);
      placements[word] = placed || { cells: [], dir: [0,1], start: [0,0] };
    }
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] === null)
          grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return { grid, placements };
  },

  placeWord(grid, size, word) {
    const dirs = this.DIRS.slice().sort(() => Math.random() - 0.5);
    const positions = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        positions.push([r, c]);
    positions.sort(() => Math.random() - 0.5);

    for (const [dr, dc] of dirs) {
      for (const [sr, sc] of positions) {
        if (this.canPlace(grid, size, word, sr, sc, dr, dc)) {
          const cells = [];
          for (let i = 0; i < word.length; i++) {
            const r = sr + dr * i, c = sc + dc * i;
            grid[r][c] = word[i];
            cells.push([r, c]);
          }
          return { cells, dir: [dr, dc], start: [sr, sc] };
        }
      }
    }
    return null;
  },

  canPlace(grid, size, word, sr, sc, dr, dc) {
    for (let i = 0; i < word.length; i++) {
      const r = sr + dr * i, c = sc + dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size) return false;
      if (grid[r][c] !== null && grid[r][c] !== word[i]) return false;
    }
    return true;
  }
};

// ─── Game State ───
const GameState = {
  config: null,
  grid: null,
  placements: null,
  gridSize: 0,
  currentQ: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  questionsData: [],
  startTime: 0,
  paused: false,
  wrongSelections: 0
};

// ─── Game ───
const Game = {
  start(config) {
    // Sanitize answers: uppercase, no spaces
    config.questions.forEach(q => {
      q.answer = q.answer.toUpperCase().replace(/[^A-Z]/g, '');
    });
    config.gridSize = Math.max(config.gridSize || 15, Math.max(...config.questions.map(q => q.answer.length)));

    // Apply global debug mode if enabled
    if (App.globalDebugMode) {
      config.debug = true;
    }

    GameState.config = config;
    GameState.gridSize = config.gridSize;
    GameState.currentQ = 0;
    GameState.score = 0;
    GameState.streak = 0;
    GameState.bestStreak = 0;
    GameState.startTime = Date.now();
    GameState.paused = false;
    GameState.wrongSelections = 0;

    const words = config.questions.map(q => q.answer);
    const result = GridGenerator.generate(config.gridSize, words);
    GameState.grid = result.grid;
    GameState.placements = result.placements;
    GameState.questionsData = config.questions.map(q => ({
      question: q.question,
      answer: q.answer,
      found: false,
      revealed: false,
      hintsUsed: 0,
      hintPenalty: 0,
      streakBonus: 0,
      points: 0,
      startTime: 0
    }));

    $('game-title').textContent = config.title;
    App.showScreen('game-screen');
    GridUI.render();
    TimerManager.init(config);
    QuestionManager.showQuestion(0);
    this.updateProgress();
    ScoreManager.updateDisplay();

    // Build found words list
    this.renderWordList();
  },

  renderWordList() {
    const list = $('found-words-list');
    list.innerHTML = '';
    GameState.config.questions.forEach((q, i) => {
      const div = document.createElement('div');
      div.className = 'found-word-item pending';
      div.id = 'word-item-' + i;
      div.innerHTML = `<span>Word ${i + 1}</span><span>${q.answer.length} letters</span>`;
      list.appendChild(div);
    });
  },

  updateProgress() {
    const total = GameState.config.questions.length;
    const done = GameState.questionsData.filter(q => q.found || q.revealed).length;
    $('progress-bar').style.width = (done / total * 100) + '%';
    $('question-counter').textContent = (GameState.currentQ + 1) + '/' + total;
  }
};

// ─── Grid UI ───
const GridUI = {
  selecting: false,
  dragged: false,
  startCell: null,
  clickStart: null, // for click-click mode
  currentCells: [],
  cellElements: [],

  render() {
    const grid = $('word-grid');
    const size = GameState.gridSize;
    grid.style.gridTemplateColumns = `repeat(${size}, 32px)`;
    grid.innerHTML = '';
    this.cellElements = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.textContent = GameState.grid[r][c];
        cell.dataset.row = r;
        cell.dataset.col = c;
        grid.appendChild(cell);
        if (!this.cellElements[r]) this.cellElements[r] = [];
        this.cellElements[r][c] = cell;
      }
    }

    // Mouse events
    grid.onmousedown = e => this.onMouseDown(e);
    grid.onmousemove = e => this.onMouseMove(e);
    document.onmouseup = e => this.onMouseUp(e);

    // Touch events
    grid.ontouchstart = e => { e.preventDefault(); this.onMouseDown(this.touchToMouse(e)); };
    grid.ontouchmove = e => { e.preventDefault(); this.onMouseMove(this.touchToMouse(e)); };
    grid.ontouchend = e => { e.preventDefault(); this.onMouseUp(e); };

    // Responsive cell sizing
    this.adjustCellSize();
    window.onresize = () => this.adjustCellSize();
  },

  adjustCellSize() {
    const container = document.querySelector('.grid-container');
    if (!container) return;
    const maxW = container.clientWidth - 4; // border
    const size = GameState.gridSize;
    let cellSize = Math.floor(maxW / size);
    cellSize = Math.max(18, Math.min(32, cellSize));
    const grid = $('word-grid');
    grid.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    grid.querySelectorAll('.grid-cell').forEach(c => {
      c.style.width = cellSize + 'px';
      c.style.height = cellSize + 'px';
      c.style.fontSize = Math.max(0.55, cellSize / 38) + 'rem';
    });
  },

  touchToMouse(e) {
    const touch = e.touches[0];
    return { target: document.elementFromPoint(touch.clientX, touch.clientY) };
  },

  getCellFromEvent(e) {
    const el = e.target;
    if (!el || !el.classList.contains('grid-cell')) return null;
    return { row: parseInt(el.dataset.row), col: parseInt(el.dataset.col) };
  },

  onMouseDown(e) {
    if (GameState.paused) return;
    const cell = this.getCellFromEvent(e);
    if (!cell) return;
    this.selecting = true;
    this.dragged = false;
    this.startCell = cell;
    this.currentCells = [cell];
    this.highlightSelection();
  },

  onMouseMove(e) {
    if (!this.selecting || !this.startCell) return;
    const cell = this.getCellFromEvent(e);
    if (!cell) return;
    // If mouse moved to a different cell, this is a drag
    if (cell.row !== this.startCell.row || cell.col !== this.startCell.col) {
      this.dragged = true;
    }
    const line = this.getLine(this.startCell, cell);
    if (line.length > 0) {
      this.currentCells = line;
      this.highlightSelection();
    }
  },

  onMouseUp(e) {
    if (!this.selecting) return;
    this.selecting = false;

    if (this.dragged) {
      // Drag mode: check selection immediately
      const selected = this.getSelectedWord();
      this.clearHighlight();
      if (selected.length > 0) {
        this.checkSelection(selected, this.currentCells);
      }
      this.startCell = null;
      this.clickStart = null;
      this.currentCells = [];
    } else {
      // Click mode: first click sets start, second click sets end
      const cell = this.getCellFromEvent(e);
      if (!cell) { this.clearHighlight(); this.clickStart = null; return; }

      if (!this.clickStart) {
        // First click — keep it highlighted, store as click start
        this.clickStart = cell;
        this.currentCells = [cell];
        this.highlightSelection();
      } else {
        // Second click — form line from clickStart to this cell
        const line = this.getLine(this.clickStart, cell);
        if (line.length > 0) {
          this.currentCells = line;
          const selected = this.getSelectedWord();
          this.clearHighlight();
          this.checkSelection(selected, this.currentCells);
        } else {
          this.clearHighlight();
        }
        this.clickStart = null;
        this.currentCells = [];
      }
      this.startCell = null;
    }
  },

  getLine(start, end) {
    const dr = Math.sign(end.row - start.row);
    const dc = Math.sign(end.col - start.col);
    const dRow = Math.abs(end.row - start.row);
    const dCol = Math.abs(end.col - start.col);

    // Must be a straight line (horizontal, vertical, or 45° diagonal)
    if (dRow !== 0 && dCol !== 0 && dRow !== dCol) return [];
    const len = Math.max(dRow, dCol) + 1;

    const cells = [];
    for (let i = 0; i < len; i++) {
      cells.push({ row: start.row + dr * i, col: start.col + dc * i });
    }
    return cells;
  },

  getSelectedWord() {
    return this.currentCells.map(c => GameState.grid[c.row][c.col]).join('');
  },

  highlightSelection() {
    // Clear previous selection highlights (not found/revealed)
    for (let r = 0; r < GameState.gridSize; r++)
      for (let c = 0; c < GameState.gridSize; c++) {
        const el = this.cellElements[r][c];
        el.classList.remove('selected');
      }
    this.currentCells.forEach(c => {
      this.cellElements[c.row][c.col].classList.add('selected');
    });
  },

  clearHighlight() {
    for (let r = 0; r < GameState.gridSize; r++)
      for (let c = 0; c < GameState.gridSize; c++)
        this.cellElements[r][c].classList.remove('selected');
  },

  checkSelection(word, cells) {
    const currentAnswer = GameState.config.questions[GameState.currentQ].answer;
    const reversed = word.split('').reverse().join('');

    if (word === currentAnswer || reversed === currentAnswer) {
      this.markFound(cells, 'found');
      QuestionManager.onCorrect();
    } else if (cells.length > 1) {
      this.flashWrong(cells);
    }
  },

  flashWrong(cells) {
    GameState.wrongSelections++;
    AchievementsManager.trackWrongSelection();
    cells.forEach(c => this.cellElements[c.row][c.col].classList.add('wrong'));
    setTimeout(() => {
      cells.forEach(c => this.cellElements[c.row][c.col].classList.remove('wrong'));
    }, 400);
  },

  markFound(cells, className) {
    cells.forEach(c => {
      this.cellElements[c.row][c.col].classList.add(className);
      this.cellElements[c.row][c.col].classList.remove('hint-highlight');
    });
  },

  revealWord(answer) {
    const placement = GameState.placements[answer];
    if (placement) {
      this.markFound(placement.cells.map(([r,c]) => ({row:r,col:c})), 'revealed');
    }
  },

  highlightWord(answer) {
    // Remove previous hint highlights
    document.querySelectorAll('.hint-highlight').forEach(el => el.classList.remove('hint-highlight'));
    const placement = GameState.placements[answer];
    if (placement) {
      placement.cells.forEach(([r, c]) => {
        this.cellElements[r][c].classList.add('hint-highlight');
      });
    }
  },

  clearHintHighlight() {
    document.querySelectorAll('.hint-highlight').forEach(el => el.classList.remove('hint-highlight'));
  },

  clearDebugHint() {
    document.querySelectorAll('.debug-hint').forEach(el => el.classList.remove('debug-hint'));
  }
};

// ─── Question Manager ───
const QuestionManager = {
  showQuestion(index) {
    GameState.currentQ = index;
    const qData = GameState.config.questions[index];
    const stateData = GameState.questionsData[index];
    stateData.startTime = Date.now();

    $('question-number').textContent = 'Question ' + (index + 1);
    $('question-text').textContent = qData.question;
    $('question-text').classList.remove('strikethrough');
    $('answer-info').textContent = `Word to find: ${qData.answer.length} letters`;
    $('next-btn').disabled = true;
    $('next-btn').textContent = 'Next Question';

    // Debug panel
    GridUI.clearDebugHint();
    const dbg = $('debug-panel');
    if (GameState.config.debug) {
      dbg.style.display = '';
      $('debug-answer').textContent = 'Answer: ' + qData.answer;
      const placement = GameState.placements[qData.answer];
      if (placement) {
        placement.cells.forEach(([r, c]) => {
          GridUI.cellElements[r][c].classList.add('debug-hint');
        });
      }
    } else {
      dbg.style.display = 'none';
    }

    HintManager.reset();
    GridUI.clearHintHighlight();
    TimerManager.resumeGlobal();
    TimerManager.startQuestionTimer();
    Game.updateProgress();
  },

  onCorrect() {
    const idx = GameState.currentQ;
    const stateData = GameState.questionsData[idx];
    stateData.found = true;
    stateData.points = Math.max(0, 100 - stateData.hintPenalty);

    // Streak tracking
    GameState.streak++;
    if (GameState.streak > GameState.bestStreak) GameState.bestStreak = GameState.streak;
    const streakBonus = GameState.config.streakBonus || 0;
    const streakPts = GameState.streak >= 2 ? streakBonus * (GameState.streak - 1) : 0;
    stateData.streakBonus = streakPts;
    stateData.points += streakPts;

    GameState.score += stateData.points;
    ScoreManager.updateDisplay();

    $('next-btn').disabled = false;
    GridUI.clearHintHighlight();
    TimerManager.stopQuestionTimer();
    TimerManager.pauseGlobal();

    // Update word list
    const item = $('word-item-' + idx);
    item.className = 'found-word-item found';
    item.innerHTML = `<span>${esc(stateData.answer)}</span><span>+${stateData.points}</span>`;

    let msg = 'Correct! +' + stateData.points + ' points';
    if (streakPts > 0) msg += ' (streak x' + GameState.streak + '! +' + streakPts + ' bonus)';
    showToast(msg, 'success');
    Game.updateProgress();

    // Auto-advance if last question
    if (idx === GameState.config.questions.length - 1) {
      $('next-btn').textContent = 'Finish Game';
    }
  },

  onTimeout() {
    const idx = GameState.currentQ;
    const stateData = GameState.questionsData[idx];
    stateData.found = false;
    stateData.revealed = true;
    stateData.points = 0;
    stateData.streakBonus = 0;
    GameState.streak = 0;

    $('question-text').classList.add('strikethrough');
    $('next-btn').disabled = false;
    GridUI.revealWord(stateData.answer);
    GridUI.clearHintHighlight();
    TimerManager.pauseGlobal();

    // Update word list
    const item = $('word-item-' + idx);
    item.className = 'found-word-item missed';
    item.innerHTML = `<span>${esc(stateData.answer)}</span><span>0</span>`;

    showToast('Time\'s up! Answer revealed.', 'error');
    Game.updateProgress();

    if (idx === GameState.config.questions.length - 1) {
      $('next-btn').textContent = 'Finish Game';
    }
  },

  next() {
    const nextIdx = GameState.currentQ + 1;
    if (nextIdx >= GameState.config.questions.length) {
      // Quiz completed naturally - all questions answered
      TimerManager.stopAll();
      EndScreen.show(true); // true = completed naturally
    } else {
      $('next-btn').textContent = 'Next Question';
      this.showQuestion(nextIdx);
    }
  }
};

// ─── Hint Manager ───
const HintManager = {
  currentLevel: 0, // 0 = no hints used, 1-3

  reset() {
    this.currentLevel = 0;
    $('hint-btn-1').disabled = false;
    $('hint-btn-1').classList.remove('used');
    $('hint-btn-2').disabled = true;
    $('hint-btn-2').classList.remove('used');
    $('hint-btn-3').disabled = true;
    $('hint-btn-3').classList.remove('used');
  },

  useHint(level) {
    if (level !== this.currentLevel + 1) return;
    const qData = GameState.questionsData[GameState.currentQ];
    if (qData.found || qData.revealed) return;

    const answer = GameState.config.questions[GameState.currentQ].answer;
    const penalties = [0, 10, 25, 50];

    qData.hintsUsed = level;
    qData.hintPenalty += penalties[level];
    this.currentLevel = level;

    // Mark button as used
    $('hint-btn-' + level).classList.add('used');
    $('hint-btn-' + level).disabled = true;

    // Enable next hint button
    if (level < 3) {
      $('hint-btn-' + (level + 1)).disabled = false;
    }

    // Apply hint effect
    switch (level) {
      case 1:
        $('answer-info').textContent = `First letter: ${answer[0]} | Length: ${answer.length} letters`;
        showToast(`Hint 1: Starts with "${answer[0]}", ${answer.length} letters`, '');
        break;
      case 2:
        $('answer-info').textContent = `First: ${answer[0]} | Last: ${answer[answer.length-1]} | Length: ${answer.length}`;
        showToast(`Hint 2: ${answer[0]}..${answer[answer.length-1]}, ${answer.length} letters`, '');
        break;
      case 3:
        GridUI.highlightWord(answer);
        showToast('Hint 3: Word highlighted in grid!', '');
        break;
    }

    ScoreManager.updateDisplay();
  }
};

// ─── Timer Manager ───
const TimerManager = {
  globalInterval: null,
  questionInterval: null,
  globalRemaining: 0,
  questionRemaining: 0,
  hasGlobal: false,
  hasQuestion: false,

  init(config) {
    this.stopAll();
    this.hasGlobal = config.globalTimer > 0;
    this.hasQuestion = config.questionTimer > 0;
    this.globalRemaining = config.globalTimer;
    this.questionRemaining = config.questionTimer;

    $('stat-global-timer').style.display = this.hasGlobal ? '' : 'none';
    $('stat-q-timer').style.display = this.hasQuestion ? '' : 'none';


    if (this.hasGlobal) {
      this.updateGlobalDisplay();
      this.globalInterval = setInterval(() => this.tickGlobal(), 1000);
    }
  },

  startQuestionTimer() {
    if (!this.hasQuestion) return;
    clearInterval(this.questionInterval);
    this.questionRemaining = GameState.config.questionTimer;
    this.updateQuestionDisplay();
    this.questionInterval = setInterval(() => this.tickQuestion(), 1000);
  },

  stopQuestionTimer() {
    clearInterval(this.questionInterval);
  },

  pauseGlobal() {
    if (!this.hasGlobal) return;
    clearInterval(this.globalInterval);
    this.globalInterval = null;
  },

  resumeGlobal() {
    if (!this.hasGlobal || this.globalInterval) return;
    this.globalInterval = setInterval(() => this.tickGlobal(), 1000);
  },

  stopAll() {
    clearInterval(this.globalInterval);
    clearInterval(this.questionInterval);
    this.globalInterval = null;
    this.questionInterval = null;
  },

  tickGlobal() {
    if (GameState.paused) return;
    this.globalRemaining--;
    this.updateGlobalDisplay();
    if (this.globalRemaining <= 0) {
      this.stopAll();
      showToast('Global timer expired!', 'error');
      App.endGame();
    }
  },

  tickQuestion() {
    if (GameState.paused) return;
    this.questionRemaining--;
    this.updateQuestionDisplay();
    if (this.questionRemaining <= 0) {
      this.stopQuestionTimer();
      QuestionManager.onTimeout();
    }
  },

  updateGlobalDisplay() {
    const el = $('global-timer-display');
    el.textContent = formatTime(this.globalRemaining);
    el.classList.toggle('urgent', this.globalRemaining <= 30);
  },

  updateQuestionDisplay() {
    const el = $('q-timer-display');
    el.textContent = formatTime(this.questionRemaining);
    el.classList.toggle('urgent', this.questionRemaining <= 10);
  },

  togglePause() {
    GameState.paused = !GameState.paused;
  }
};

// ─── Score Manager ───
const ScoreManager = {
  updateDisplay() {
    $('score-display').textContent = GameState.score;
  },

  calculateFinal() {
    const base = GameState.score;
    const elapsed = Math.round((Date.now() - GameState.startTime) / 1000);
    const globalLimit = GameState.config.globalTimer;

    // Time multiplier: based on how fast you finished relative to the global timer
    // 100% time left → 2.0x, 50% → 1.5x, 0% or no timer → 1.0x
    let multiplier = 1.0;
    if (globalLimit > 0) {
      const pctRemaining = Math.max(0, (globalLimit - elapsed) / globalLimit);
      multiplier = 1.0 + pctRemaining; // ranges from 1.0x to 2.0x
    }

    const total = Math.round(base * multiplier);
    return { base, multiplier, total };
  }
};

// ─── Achievements Manager ───
const AchievementsManager = {
  STORAGE_KEY: 'wordsearch_achievements',
  STATS_KEY: 'wordsearch_stats',

  // Define all achievements
  ACHIEVEMENTS: {
    // Completion Milestones
    'first-steps': { 
      id: 'first-steps', 
      name: 'First Steps', 
      icon: '🎓', 
      description: 'Complete your first quiz',
      category: 'Completion'
    },
    'quiz-master': { 
      id: 'quiz-master', 
      name: 'Quiz Master', 
      icon: '🏆', 
      description: 'Complete 5 quizzes',
      category: 'Completion'
    },
    'quiz-legend': { 
      id: 'quiz-legend', 
      name: 'Quiz Legend', 
      icon: '🌟', 
      description: 'Complete 10 quizzes',
      category: 'Completion'
    },
    'quiz-champion': { 
      id: 'quiz-champion', 
      name: 'Quiz Champion', 
      icon: '💎', 
      description: 'Complete 25 quizzes',
      category: 'Completion'
    },
    'perfect-score': { 
      id: 'perfect-score', 
      name: 'Perfect Score', 
      icon: '🎯', 
      description: 'Complete a quiz with 100% accuracy',
      category: 'Completion'
    },
    'hot-streak': { 
      id: 'hot-streak', 
      name: 'Hot Streak', 
      icon: '🔥', 
      description: 'Complete 3 quizzes in a row',
      category: 'Completion'
    },

    // Speed Achievements
    'speed-reader': { 
      id: 'speed-reader', 
      name: 'Speed Reader', 
      icon: '⚡', 
      description: 'Complete a quiz in under 90 seconds',
      category: 'Speed'
    },
    'lightning-fast': { 
      id: 'lightning-fast', 
      name: 'Lightning Fast', 
      icon: '🚀', 
      description: 'Complete a quiz in under 60 seconds',
      category: 'Speed'
    },
    'speedrunner': { 
      id: 'speedrunner', 
      name: 'Speedrunner', 
      icon: '💨', 
      description: 'Complete a quiz in under 45 seconds',
      category: 'Speed'
    },
    'time-trial-master': { 
      id: 'time-trial-master', 
      name: 'Time Trial Master', 
      icon: '⏱️', 
      description: 'Complete 5 timed quizzes without expiring',
      category: 'Speed'
    },

    // Skill-Based
    'no-hints-needed': { 
      id: 'no-hints-needed', 
      name: 'No Hints Needed', 
      icon: '🧠', 
      description: 'Complete a quiz without using any hints',
      category: 'Skill'
    },
    'self-sufficient': { 
      id: 'self-sufficient', 
      name: 'Self-Sufficient', 
      icon: '🎓', 
      description: 'Complete 5 quizzes without hints',
      category: 'Skill'
    },
    'eagle-eye': { 
      id: 'eagle-eye', 
      name: 'Eagle Eye', 
      icon: '🔍', 
      description: 'Find all words in a 20x20 or larger grid',
      category: 'Skill'
    },
    'sharpshooter': { 
      id: 'sharpshooter', 
      name: 'Sharpshooter', 
      icon: '🎯', 
      description: 'Complete a quiz with no wrong selections',
      category: 'Skill'
    },
    'streak-king': { 
      id: 'streak-king', 
      name: 'Streak King', 
      icon: '🌊', 
      description: 'Achieve a 5-word streak',
      category: 'Skill'
    },
    'on-fire': { 
      id: 'on-fire', 
      name: 'On Fire', 
      icon: '🔥', 
      description: 'Achieve a 10-word streak',
      category: 'Skill'
    },

    // Challenge Achievements
    'under-pressure': { 
      id: 'under-pressure', 
      name: 'Under Pressure', 
      icon: '😰', 
      description: 'Complete a quiz with less than 10 seconds remaining',
      category: 'Challenge'
    },
    'risk-taker': { 
      id: 'risk-taker', 
      name: 'Risk Taker', 
      icon: '🎲', 
      description: 'Complete a quiz using all 3 hint levels',
      category: 'Challenge'
    },
    'category-expert': { 
      id: 'category-expert', 
      name: 'Category Expert', 
      icon: '📚', 
      description: 'Complete all quizzes in one category',
      category: 'Challenge'
    },
    'jack-of-all-trades': { 
      id: 'jack-of-all-trades', 
      name: 'Jack of All Trades', 
      icon: '🌈', 
      description: 'Complete quizzes from 5 different categories',
      category: 'Challenge'
    },
    'theme-collector': { 
      id: 'theme-collector', 
      name: 'Theme Collector', 
      icon: '🎨', 
      description: 'Try all 4 color themes',
      category: 'Challenge'
    },

    // Score-Based
    'millennium-club': { 
      id: 'mill-club', 
      name: 'Millennium Club', 
      icon: '💯', 
      description: 'Score 1000+ points in a single quiz',
      category: 'Score'
    },
    'high-roller': { 
      id: 'high-roller', 
      name: 'High Roller', 
      icon: '🏅', 
      description: 'Score 2000+ points in a single quiz',
      category: 'Score'
    },
    'top-of-the-class': { 
      id: 'top-of-the-class', 
      name: 'Top of the Class', 
      icon: '👑', 
      description: 'Reach #1 on any leaderboard',
      category: 'Score'
    },
    'consistent-winner': { 
      id: 'consistent-winner', 
      name: 'Consistent Winner', 
      icon: '🥇', 
      description: 'Hold #1 on 3 different leaderboards',
      category: 'Score'
    },

    // Collection/Variety
    'explorer': { 
      id: 'explorer', 
      name: 'Explorer', 
      icon: '🗺️', 
      description: 'Try 3 different custom quizzes',
      category: 'Collection'
    },
    'versatile': { 
      id: 'versatile', 
      name: 'Versatile', 
      icon: '🎲', 
      description: 'Complete quizzes of 5 different grid sizes',
      category: 'Collection'
    },
    'bookworm': { 
      id: 'bookworm', 
      name: 'Bookworm', 
      icon: '📖', 
      description: 'Find 100 total words across all quizzes',
      category: 'Collection'
    },

    // Endurance
    'marathon-runner': { 
      id: 'marathon-runner', 
      name: 'Marathon Runner', 
      icon: '🎮', 
      description: 'Play for 30 minutes straight',
      category: 'Endurance'
    },
    'night-owl': { 
      id: 'night-owl', 
      name: 'Night Owl', 
      icon: '🌙', 
      description: 'Complete a quiz after midnight',
      category: 'Endurance'
    },
    'early-bird': { 
      id: 'early-bird', 
      name: 'Early Bird', 
      icon: '☀️', 
      description: 'Complete a quiz before 6 AM',
      category: 'Endurance'
    },
    'daily-dedication': { 
      id: 'daily-dedication', 
      name: 'Daily Dedication', 
      icon: '📅', 
      description: 'Play on 7 consecutive days',
      category: 'Endurance'
    },

    // Fun/Easter Eggs
    'second-thoughts': { 
      id: 'second-thoughts', 
      name: 'Second Thoughts', 
      icon: '🤔', 
      description: 'Use a hint after already finding the word',
      category: 'Fun'
    },
    'wisdom-seeker': { 
      id: 'wisdom-seeker', 
      name: 'Wisdom Seeker', 
      icon: '🦉', 
      description: 'Read all instructions',
      category: 'Fun'
    }
  },

  getUnlocked() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
  },

  getStats() {
    return JSON.parse(localStorage.getItem(this.STATS_KEY) || JSON.stringify({
      quizzesCompleted: 0,
      consecutiveQuizzes: 0,
      lastPlayDate: null,
      consecutiveDays: 0,
      lastDayPlayed: null,
      totalWordsFound: 0,
      quizzesWithoutHints: 0,
      timedQuizzesCompleted: 0,
      uniqueCategories: [],
      uniqueQuizIds: [],
      uniqueGridSizes: [],
      themesUsed: [],
      wrongSelections: 0,
      instructionsRead: false,
      sessionStartTime: null,
      topLeaderboardPositions: {}
    }));
  },

  saveStats(stats) {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  },

  unlock(achievementId) {
    const unlocked = this.getUnlocked();
    if (unlocked[achievementId]) return false; // Already unlocked
    
    unlocked[achievementId] = {
      unlockedAt: new Date().toISOString(),
      achievement: this.ACHIEVEMENTS[achievementId]
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unlocked));
    return true;
  },

  checkAchievements(gameResult) {
    const stats = this.getStats();
    const newUnlocks = [];

    // Update stats based on game result
    stats.quizzesCompleted++;
    stats.totalWordsFound += gameResult.wordsFound;
    
    if (gameResult.hintsUsed === 0) stats.quizzesWithoutHints++;
    if (gameResult.hasTimer) stats.timedQuizzesCompleted++;
    
    if (!stats.uniqueCategories.includes(gameResult.category) && gameResult.category) {
      stats.uniqueCategories.push(gameResult.category);
    }
    if (!stats.uniqueQuizIds.includes(gameResult.quizId)) {
      stats.uniqueQuizIds.push(gameResult.quizId);
    }
    if (!stats.uniqueGridSizes.includes(gameResult.gridSize)) {
      stats.uniqueGridSizes.push(gameResult.gridSize);
    }

    // Track consecutive quizzes
    stats.consecutiveQuizzes++;

    // Track daily play
    const today = new Date().toDateString();
    if (stats.lastDayPlayed !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (stats.lastDayPlayed === yesterday) {
        stats.consecutiveDays++;
      } else {
        stats.consecutiveDays = 1;
      }
      stats.lastDayPlayed = today;
    }

    // Session tracking
    if (!stats.sessionStartTime) {
      stats.sessionStartTime = Date.now();
    }

    this.saveStats(stats);

    // Check all achievements
    // Completion Milestones
    if (stats.quizzesCompleted >= 1 && this.unlock('first-steps')) newUnlocks.push('first-steps');
    if (stats.quizzesCompleted >= 5 && this.unlock('quiz-master')) newUnlocks.push('quiz-master');
    if (stats.quizzesCompleted >= 10 && this.unlock('quiz-legend')) newUnlocks.push('quiz-legend');
    if (stats.quizzesCompleted >= 25 && this.unlock('quiz-champion')) newUnlocks.push('quiz-champion');
    if (gameResult.accuracy === 100 && this.unlock('perfect-score')) newUnlocks.push('perfect-score');
    if (stats.consecutiveQuizzes >= 3 && this.unlock('hot-streak')) newUnlocks.push('hot-streak');

    // Speed Achievements
    if (gameResult.timeElapsed <= 90 && this.unlock('speed-reader')) newUnlocks.push('speed-reader');
    if (gameResult.timeElapsed <= 60 && this.unlock('lightning-fast')) newUnlocks.push('lightning-fast');
    if (gameResult.timeElapsed <= 45 && this.unlock('speedrunner')) newUnlocks.push('speedrunner');
    if (stats.timedQuizzesCompleted >= 5 && this.unlock('time-trial-master')) newUnlocks.push('time-trial-master');

    // Skill-Based
    if (gameResult.hintsUsed === 0 && this.unlock('no-hints-needed')) newUnlocks.push('no-hints-needed');
    if (stats.quizzesWithoutHints >= 5 && this.unlock('self-sufficient')) newUnlocks.push('self-sufficient');
    if (gameResult.gridSize >= 20 && gameResult.wordsFound === gameResult.totalWords && this.unlock('eagle-eye')) newUnlocks.push('eagle-eye');
    if (gameResult.wrongSelections === 0 && this.unlock('sharpshooter')) newUnlocks.push('sharpshooter');
    if (gameResult.bestStreak >= 5 && this.unlock('streak-king')) newUnlocks.push('streak-king');
    if (gameResult.bestStreak >= 10 && this.unlock('on-fire')) newUnlocks.push('on-fire');

    // Challenge Achievements
    if (gameResult.timeRemaining > 0 && gameResult.timeRemaining < 10 && this.unlock('under-pressure')) newUnlocks.push('under-pressure');
    if (gameResult.hintsUsed >= 3 && this.unlock('risk-taker')) newUnlocks.push('risk-taker');
    if (stats.uniqueCategories.length >= 5 && this.unlock('jack-of-all-trades')) newUnlocks.push('jack-of-all-trades');

    // Score-Based
    if (gameResult.score >= 1000 && this.unlock('mill-club')) newUnlocks.push('mill-club');
    if (gameResult.score >= 2000 && this.unlock('high-roller')) newUnlocks.push('high-roller');
    if (gameResult.isTopLeaderboard && this.unlock('top-of-the-class')) newUnlocks.push('top-of-the-class');
    
    // Check consistent winner
    const topPositions = Object.keys(stats.topLeaderboardPositions || {}).filter(qid => stats.topLeaderboardPositions[qid] === 1);
    if (topPositions.length >= 3 && this.unlock('consistent-winner')) newUnlocks.push('consistent-winner');

    // Collection/Variety
    if (stats.uniqueQuizIds.length >= 3 && this.unlock('explorer')) newUnlocks.push('explorer');
    if (stats.uniqueGridSizes.length >= 5 && this.unlock('versatile')) newUnlocks.push('versatile');
    if (stats.totalWordsFound >= 100 && this.unlock('bookworm')) newUnlocks.push('bookworm');

    // Endurance
    const sessionDuration = (Date.now() - stats.sessionStartTime) / 1000 / 60;
    if (sessionDuration >= 30 && this.unlock('marathon-runner')) newUnlocks.push('marathon-runner');
    
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6 && this.unlock('early-bird')) newUnlocks.push('early-bird');
    if (hour === 0 && this.unlock('night-owl')) newUnlocks.push('night-owl');
    if (stats.consecutiveDays >= 7 && this.unlock('daily-dedication')) newUnlocks.push('daily-dedication');

    // Fun
    if (stats.instructionsRead && this.unlock('wisdom-seeker')) newUnlocks.push('wisdom-seeker');

    return newUnlocks;
  },

  showUnlockNotification(achievementIds) {
    if (!achievementIds || achievementIds.length === 0) return;

    achievementIds.forEach((id, index) => {
      const achievement = this.ACHIEVEMENTS[id];
      if (!achievement) return;

      setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-info">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
          </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => notification.remove(), 300);
        }, 4000);
      }, index * 4500); // Stagger by 4.5 seconds each
    });
  },

  trackWrongSelection() {
    const stats = this.getStats();
    stats.wrongSelections = (stats.wrongSelections || 0) + 1;
    this.saveStats(stats);
  },

  trackInstructionsRead() {
    const stats = this.getStats();
    stats.instructionsRead = true;
    this.saveStats(stats);
  },

  trackThemeUsed(themeName) {
    const stats = this.getStats();
    if (!stats.themesUsed) stats.themesUsed = [];
    if (!stats.themesUsed.includes(themeName)) {
      stats.themesUsed.push(themeName);
      this.saveStats(stats);
      if (stats.themesUsed.length >= 4 && this.unlock('theme-collector')) {
        this.showUnlockNotification(['theme-collector']);
      }
    }
  },

  updateLeaderboardPosition(quizId, position) {
    const stats = this.getStats();
    if (!stats.topLeaderboardPositions) stats.topLeaderboardPositions = {};
    stats.topLeaderboardPositions[quizId] = position;
    this.saveStats(stats);
  },

  resetConsecutiveQuizzes() {
    const stats = this.getStats();
    stats.consecutiveQuizzes = 0;
    this.saveStats(stats);
  },

  resetSession() {
    const stats = this.getStats();
    stats.sessionStartTime = null;
    this.saveStats(stats);
  },

  getProgress() {
    const unlocked = this.getUnlocked();
    const total = Object.keys(this.ACHIEVEMENTS).length;
    const unlockedCount = Object.keys(unlocked).length;
    return {
      total,
      unlocked: unlockedCount,
      percentage: Math.round((unlockedCount / total) * 100)
    };
  }
};

// ─── Leaderboard Manager ───
const LeaderboardManager = {
  STORAGE_KEY: 'wordsearch_leaderboards',

  getLeaderboard(quizId) {
    const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return all[quizId] || [];
  },

  addScore(quizId, playerName, score, stats) {
    const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    if (!all[quizId]) all[quizId] = [];
    
    all[quizId].push({
      name: playerName.trim() || 'Anonymous',
      score: score,
      date: new Date().toISOString(),
      stats: stats
    });
    
    // Sort by score descending and keep top 10
    all[quizId].sort((a, b) => b.score - a.score);
    all[quizId] = all[quizId].slice(0, 10);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    
    return all[quizId];
  },

  isTopScore(quizId, score) {
    const board = this.getLeaderboard(quizId);
    if (board.length < 5) return true;
    return score > board[4].score;
  },

  clearLeaderboard(quizId) {
    const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    delete all[quizId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }
};

// ─── End Screen ───
const EndScreen = {
  show(completedNaturally = false) {
    App.showScreen('end-screen');

    const finalScore = ScoreManager.calculateFinal();
    
    // If quiz was ended early, score is ZERO
    const displayScore = completedNaturally ? finalScore.total : 0;
    $('final-score').textContent = displayScore;

    const totalQ = GameState.questionsData.length;
    const found = GameState.questionsData.filter(q => q.found).length;
    const totalHints = GameState.questionsData.reduce((s, q) => s + q.hintsUsed, 0);
    const maxHintLevel = Math.max(...GameState.questionsData.map(q => q.hintsUsed), 0);
    const elapsed = Math.round((Date.now() - GameState.startTime) / 1000);
    const wrongSelections = GameState.wrongSelections || 0;

    $('results-grid').innerHTML = `
      <div class="result-card"><div class="r-value">${found}/${totalQ}</div><div class="r-label">Words Found</div></div>
      <div class="result-card"><div class="r-value">${totalQ ? Math.round(found/totalQ*100) : 0}%</div><div class="r-label">Accuracy</div></div>
      <div class="result-card"><div class="r-value">${totalHints}</div><div class="r-label">Hints Used</div></div>
      <div class="result-card"><div class="r-value">${GameState.bestStreak}</div><div class="r-label">Best Streak</div></div>
      <div class="result-card"><div class="r-value">${formatTime(elapsed)}</div><div class="r-label">Time Taken</div></div>
      <div class="result-card"><div class="r-value">${finalScore.multiplier.toFixed(1)}x</div><div class="r-label">Time Multiplier</div></div>
      ${finalScore.base !== finalScore.total ? `<div class="result-card"><div class="r-value">${finalScore.base}</div><div class="r-label">Base Score</div></div>` : ''}
      ${!completedNaturally ? `<div class="result-card" style="grid-column: 1 / -1;"><div style="color:#ff5252;font-size:1rem;font-weight:600;">⚠️ Quiz ended early - No score or leaderboard submission</div></div>` : ''}
    `;

    const tbody = $('breakdown-body');
    tbody.innerHTML = '';
    GameState.questionsData.forEach((q, i) => {
      const tr = document.createElement('tr');
      tr.className = q.found ? 'correct' : 'missed';
      const qText = GameState.config.questions[i].question;
      tr.innerHTML = `
        <td>${i+1}. ${esc(qText.length > 60 ? qText.substring(0, 60) + '...' : qText)}</td>
        <td>${esc(q.answer)}</td>
        <td>${q.hintsUsed}</td>
        <td>${q.streakBonus ? '+' + q.streakBonus : '-'}</td>
        <td>${q.points}</td>
      `;
      tbody.appendChild(tr);
    });

    // Only check for achievements if quiz was completed naturally (not ended early)
    let newAchievements = [];
    if (completedNaturally) {
      const gameResult = {
        quizId: GameState.config.quizId,
        category: GameState.config.category,
        gridSize: GameState.config.gridSize,
        score: finalScore.total,
        accuracy: totalQ ? Math.round(found/totalQ*100) : 0,
        wordsFound: found,
        totalWords: totalQ,
        hintsUsed: maxHintLevel,
        bestStreak: GameState.bestStreak,
        timeElapsed: elapsed,
        timeRemaining: TimerManager.globalRemaining,
        hasTimer: GameState.config.globalTimer > 0,
        wrongSelections: wrongSelections,
        isTopLeaderboard: false // Will be updated after leaderboard check
      };

      newAchievements = AchievementsManager.checkAchievements(gameResult);
    }

    // Show leaderboard section (pass the actual finalScore for leaderboard check, but it won't be submitted if not completed)
    this.showLeaderboard(finalScore, { found, totalQ, totalHints, elapsed }, completedNaturally, newAchievements);
  },

  showLeaderboard(finalScore, stats, completedNaturally, newAchievements) {
    const quizId = GameState.config.quizId;
    if (!quizId) {
      $('leaderboard-section').style.display = 'none';
      // Still show achievements even without leaderboard
      if (newAchievements.length > 0) {
        AchievementsManager.showUnlockNotification(newAchievements);
      }
      return;
    }

    $('leaderboard-section').style.display = 'block';
    $('leaderboard-quiz-title').textContent = GameState.config.title;
    
    // Reset view all button
    const board = LeaderboardManager.getLeaderboard(quizId);
    $('view-all-btn').style.display = board.length > 5 ? '' : 'none';

    // Only allow leaderboard submission if quiz was completed naturally
    if (completedNaturally) {
      // Check if this is a top 5 score
      const isTopScore = LeaderboardManager.isTopScore(quizId, finalScore.total);
      
      if (isTopScore) {
        $('name-entry-section').style.display = 'block';
        $('player-name-input').value = '';
        $('player-name-input').focus();
      } else {
        $('name-entry-section').style.display = 'none';
      }
    } else {
      // Quiz ended early - no leaderboard submission allowed
      $('name-entry-section').style.display = 'none';
    }

    this.updateLeaderboardDisplay(quizId);

    // Check leaderboard position for achievements (only if completed naturally)
    if (completedNaturally) {
      const position = this.getLeaderboardPosition(quizId, finalScore.total);
      if (position === 1) {
        AchievementsManager.updateLeaderboardPosition(quizId, 1);
        // Recheck for top leaderboard achievement
        const totalQ = GameState.questionsData.length;
        const found = GameState.questionsData.filter(q => q.found).length;
        const maxHintLevel = Math.max(...GameState.questionsData.map(q => q.hintsUsed), 0);
        const elapsed = Math.round((Date.now() - GameState.startTime) / 1000);
        const wrongSelections = GameState.wrongSelections || 0;
        
        const gameResult = {
          quizId: GameState.config.quizId,
          category: GameState.config.category,
          gridSize: GameState.config.gridSize,
          score: finalScore.total,
          accuracy: totalQ ? Math.round(found/totalQ*100) : 0,
          wordsFound: found,
          totalWords: totalQ,
          hintsUsed: maxHintLevel,
          bestStreak: GameState.bestStreak,
          timeElapsed: elapsed,
          timeRemaining: TimerManager.globalRemaining,
          hasTimer: GameState.config.globalTimer > 0,
          wrongSelections: wrongSelections,
          isTopLeaderboard: true
        };
        
        const additionalAchievements = AchievementsManager.checkAchievements(gameResult);
        newAchievements.push(...additionalAchievements);
      }
    }

    // Show achievement notifications
    if (newAchievements.length > 0) {
      setTimeout(() => {
        AchievementsManager.showUnlockNotification(newAchievements);
      }, 500);
    }
  },

  getLeaderboardPosition(quizId, score) {
    const board = LeaderboardManager.getLeaderboard(quizId);
    // Position is index + 1 where this score would be inserted
    let position = 1;
    for (const entry of board) {
      if (score > entry.score) break;
      position++;
    }
    return position;
  },

  submitScore() {
    const quizId = GameState.config.quizId;
    const playerName = $('player-name-input').value.trim() || 'Anonymous';
    const finalScore = ScoreManager.calculateFinal();
    
    const totalQ = GameState.questionsData.length;
    const found = GameState.questionsData.filter(q => q.found).length;
    const totalHints = GameState.questionsData.reduce((s, q) => s + q.hintsUsed, 0);
    const elapsed = Math.round((Date.now() - GameState.startTime) / 1000);

    LeaderboardManager.addScore(quizId, playerName, finalScore.total, {
      found,
      totalQ,
      totalHints,
      elapsed,
      accuracy: totalQ ? Math.round(found/totalQ*100) : 0
    });

    $('name-entry-section').style.display = 'none';
    this.updateLeaderboardDisplay(quizId);
    showToast('Score submitted!', 'success');
  },

  updateLeaderboardDisplay(quizId) {
    const board = LeaderboardManager.getLeaderboard(quizId);
    const tbody = $('leaderboard-body');
    tbody.innerHTML = '';

    if (board.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#8899a6;padding:20px">No scores yet. Be the first!</td></tr>';
      return;
    }

    board.slice(0, 5).forEach((entry, i) => {
      const tr = document.createElement('tr');
      const date = new Date(entry.date);
      const dateStr = date.toLocaleDateString();
      
      tr.innerHTML = `
        <td><strong>${i + 1}</strong></td>
        <td>${esc(entry.name)}</td>
        <td>${entry.score}</td>
        <td>${entry.stats.found}/${entry.stats.totalQ} (${entry.stats.accuracy}%)</td>
        <td>${dateStr}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  viewFullLeaderboard() {
    const quizId = GameState.config.quizId;
    const board = LeaderboardManager.getLeaderboard(quizId);
    
    if (board.length === 0) {
      showToast('No scores yet!', '');
      return;
    }

    const tbody = $('leaderboard-body');
    tbody.innerHTML = '';

    board.forEach((entry, i) => {
      const tr = document.createElement('tr');
      const date = new Date(entry.date);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      tr.innerHTML = `
        <td><strong>${i + 1}</strong></td>
        <td>${esc(entry.name)}</td>
        <td>${entry.score}</td>
        <td>${entry.stats.found}/${entry.stats.totalQ} (${entry.stats.accuracy}%)</td>
        <td>${dateStr}</td>
      `;
      tbody.appendChild(tr);
    });

    // Hide the "View All" button after showing all scores
    $('view-all-btn').style.display = 'none';
  }
};

// Initialize on load
App.init();

// Block Ctrl+F / Cmd+F to prevent finding answers in the grid
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
  }
});