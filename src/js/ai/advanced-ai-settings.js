/**
 * Advanced AI Settings - Enhanced AI configuration
 * Phase 11: Advanced Features
 * 
 * Manages advanced AI settings and customization
 */

export class AdvancedAISettings {
  constructor() {
    this.settings = this.loadSettings();
    this.aiEngines = this.initializeAIEngines();
  }
  
  /**
   * Initialize AI engines
   */
  initializeAIEngines() {
    return {
      'stockfish': {
        name: 'Stockfish',
        description: 'World-class chess engine',
        gameTypes: ['chess'],
        maxLevel: 20,
        features: ['depth', 'time', 'threads', 'hash', 'contempt'],
        isDefault: true
      },
      'minimax': {
        name: 'Minimax',
        description: 'Classic minimax algorithm',
        gameTypes: ['chess', 'checkers'],
        maxLevel: 10,
        features: ['depth', 'time', 'evaluation'],
        isDefault: false
      },
      'random': {
        name: 'Random',
        description: 'Random move selection',
        gameTypes: ['chess', 'checkers'],
        maxLevel: 1,
        features: [],
        isDefault: false
      }
    };
  }
  
  /**
   * Get AI settings for a game type
   */
  getAISettings(gameType) {
    return this.settings[gameType] || this.getDefaultSettings(gameType);
  }
  
  /**
   * Get default AI settings
   */
  getDefaultSettings(gameType) {
    if (gameType === 'chess') {
      return {
        engine: 'stockfish',
        level: 5,
        depth: 15,
        time: 1000,
        threads: 1,
        hash: 16,
        contempt: 0,
        evaluation: 'standard',
        personality: 'balanced',
        openingBook: true,
        endgameTablebase: false,
        ponder: false,
        multiPV: 1,
        skillLevel: 5
      };
    } else if (gameType === 'checkers') {
      return {
        engine: 'minimax',
        level: 5,
        depth: 6,
        time: 1000,
        evaluation: 'standard',
        personality: 'balanced',
        openingBook: false,
        endgameTablebase: false,
        ponder: false
      };
    }
    
    return {};
  }
  
  /**
   * Update AI settings
   */
  updateAISettings(gameType, updates) {
    if (!this.settings[gameType]) {
      this.settings[gameType] = this.getDefaultSettings(gameType);
    }
    
    this.settings[gameType] = {
      ...this.settings[gameType],
      ...updates
    };
    
    this.saveSettings();
  }
  
  /**
   * Get AI engine info
   */
  getAIEngine(engineId) {
    return this.aiEngines[engineId] || null;
  }
  
  /**
   * Get available AI engines for game type
   */
  getAvailableEngines(gameType) {
    return Object.values(this.aiEngines).filter(engine => 
      engine.gameTypes.includes(gameType)
    );
  }
  
  /**
   * Get AI personality settings
   */
  getAIPersonalities() {
    return {
      'aggressive': {
        name: 'Aggressive',
        description: 'Prefers attacking moves and sacrifices',
        settings: {
          contempt: 50,
          evaluation: 'tactical',
          openingBook: false
        }
      },
      'defensive': {
        name: 'Defensive',
        description: 'Prefers solid, safe moves',
        settings: {
          contempt: -50,
          evaluation: 'positional',
          openingBook: true
        }
      },
      'balanced': {
        name: 'Balanced',
        description: 'Balanced between attack and defense',
        settings: {
          contempt: 0,
          evaluation: 'standard',
          openingBook: true
        }
      },
      'tactical': {
        name: 'Tactical',
        description: 'Focuses on tactics and combinations',
        settings: {
          contempt: 25,
          evaluation: 'tactical',
          openingBook: false,
          multiPV: 3
        }
      },
      'positional': {
        name: 'Positional',
        description: 'Focuses on long-term positional play',
        settings: {
          contempt: -25,
          evaluation: 'positional',
          openingBook: true,
          multiPV: 1
        }
      }
    };
  }
  
  /**
   * Apply AI personality
   */
  applyAIPersonality(gameType, personality) {
    const personalities = this.getAIPersonalities();
    const personalitySettings = personalities[personality];
    
    if (personalitySettings) {
      this.updateAISettings(gameType, {
        personality,
        ...personalitySettings.settings
      });
    }
  }
  
  /**
   * Get AI difficulty levels
   */
  getDifficultyLevels(gameType, engine) {
    const engineInfo = this.getAIEngine(engine);
    if (!engineInfo) return [];
    
    const levels = [];
    for (let i = 1; i <= engineInfo.maxLevel; i++) {
      levels.push({
        level: i,
        name: `Level ${i}`,
        description: this.getDifficultyDescription(i, engineInfo.maxLevel),
        depth: this.calculateDepth(i, engineInfo.maxLevel),
        time: this.calculateTime(i, engineInfo.maxLevel)
      });
    }
    
    return levels;
  }
  
  /**
   * Get difficulty description
   */
  getDifficultyDescription(level, maxLevel) {
    const percentage = (level / maxLevel) * 100;
    
    if (percentage <= 20) return 'Beginner - Makes basic mistakes';
    if (percentage <= 40) return 'Novice - Understands basic tactics';
    if (percentage <= 60) return 'Intermediate - Good tactical awareness';
    if (percentage <= 80) return 'Advanced - Strong positional play';
    if (percentage <= 90) return 'Expert - Master-level play';
    return 'Master - Near-perfect play';
  }
  
  /**
   * Calculate search depth based on level
   */
  calculateDepth(level, maxLevel) {
    const baseDepth = 3;
    const maxDepth = 20;
    const depthRange = maxDepth - baseDepth;
    const levelRatio = level / maxLevel;
    
    return Math.floor(baseDepth + (depthRange * levelRatio));
  }
  
  /**
   * Calculate thinking time based on level
   */
  calculateTime(level, maxLevel) {
    const baseTime = 500;
    const maxTime = 5000;
    const timeRange = maxTime - baseTime;
    const levelRatio = level / maxLevel;
    
    return Math.floor(baseTime + (timeRange * levelRatio));
  }
  
  /**
   * Get AI performance metrics
   */
  getAIPerformanceMetrics(gameType) {
    const stats = this.settings[gameType]?.performance || {};
    
    return {
      gamesPlayed: stats.gamesPlayed || 0,
      winRate: stats.winRate || 0,
      averageTime: stats.averageTime || 0,
      averageDepth: stats.averageDepth || 0,
      nodesPerSecond: stats.nodesPerSecond || 0,
      bestMoveAccuracy: stats.bestMoveAccuracy || 0
    };
  }
  
  /**
   * Update AI performance metrics
   */
  updateAIPerformanceMetrics(gameType, metrics) {
    if (!this.settings[gameType]) {
      this.settings[gameType] = this.getDefaultSettings(gameType);
    }
    
    if (!this.settings[gameType].performance) {
      this.settings[gameType].performance = {};
    }
    
    this.settings[gameType].performance = {
      ...this.settings[gameType].performance,
      ...metrics
    };
    
    this.saveSettings();
  }
  
  /**
   * Get AI analysis settings
   */
  getAnalysisSettings(gameType) {
    return this.settings[gameType]?.analysis || {
      showBestMove: true,
      showEvaluation: true,
      showVariations: 3,
      showDepth: true,
      showTime: true,
      showNodes: false,
      showPV: true,
      showScore: true
    };
  }
  
  /**
   * Update analysis settings
   */
  updateAnalysisSettings(gameType, updates) {
    if (!this.settings[gameType]) {
      this.settings[gameType] = this.getDefaultSettings(gameType);
    }
    
    this.settings[gameType].analysis = {
      ...this.settings[gameType].analysis,
      ...updates
    };
    
    this.saveSettings();
  }
  
  /**
   * Get AI opening book settings
   */
  getOpeningBookSettings(gameType) {
    return this.settings[gameType]?.openingBook || {
      enabled: true,
      book: 'standard',
      depth: 12,
      variety: 0.1,
      learning: true
    };
  }
  
  /**
   * Update opening book settings
   */
  updateOpeningBookSettings(gameType, updates) {
    if (!this.settings[gameType]) {
      this.settings[gameType] = this.getDefaultSettings(gameType);
    }
    
    this.settings[gameType].openingBook = {
      ...this.settings[gameType].openingBook,
      ...updates
    };
    
    this.saveSettings();
  }
  
  /**
   * Reset AI settings to default
   */
  resetAISettings(gameType) {
    this.settings[gameType] = this.getDefaultSettings(gameType);
    this.saveSettings();
  }
  
  /**
   * Load settings from localStorage
   */
  loadSettings() {
    const saved = localStorage.getItem('mate-ai-settings');
    return saved ? JSON.parse(saved) : {};
  }
  
  /**
   * Save settings to localStorage
   */
  saveSettings() {
    localStorage.setItem('mate-ai-settings', JSON.stringify(this.settings));
  }
  
  /**
   * Export AI settings
   */
  exportAISettings() {
    return {
      settings: this.settings,
      exportDate: new Date().toISOString()
    };
  }
  
  /**
   * Import AI settings
   */
  importAISettings(data) {
    if (data.settings) {
      this.settings = { ...this.settings, ...data.settings };
      this.saveSettings();
    }
  }
}
