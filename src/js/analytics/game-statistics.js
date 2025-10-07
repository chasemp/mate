/**
 * Game Statistics - Comprehensive analytics system
 * Phase 11: Advanced Features
 * 
 * Tracks game performance, statistics, and analytics
 */

export class GameStatistics {
  constructor() {
    this.stats = this.loadStats();
    this.currentGame = null;
    this.gameStartTime = null;
    this.moveCount = 0;
    this.captureCount = 0;
    this.checkCount = 0;
    this.checkmateCount = 0;
    this.undoCount = 0;
    this.hintCount = 0;
  }
  
  /**
   * Initialize statistics for a new game
   */
  startGame(gameType, gameMode, aiDifficulty = null, playerColor = null) {
    this.currentGame = {
      gameType,
      gameMode,
      aiDifficulty,
      playerColor,
      startTime: Date.now(),
      endTime: null,
      moves: [],
      captures: [],
      checks: [],
      checkmates: [],
      undos: 0,
      hints: 0,
      result: null,
      winner: null
    };
    
    this.gameStartTime = Date.now();
    this.moveCount = 0;
    this.captureCount = 0;
    this.checkCount = 0;
    this.checkmateCount = 0;
    this.undoCount = 0;
    this.hintCount = 0;
  }
  
  /**
   * Record a move
   */
  recordMove(from, to, piece, captured = null, special = null) {
    if (!this.currentGame) return;
    
    const move = {
      from,
      to,
      piece,
      captured,
      special,
      timestamp: Date.now(),
      moveNumber: this.moveCount + 1
    };
    
    this.currentGame.moves.push(move);
    this.moveCount++;
    
    if (captured) {
      this.captureCount++;
      this.currentGame.captures.push({
        piece: captured,
        moveNumber: this.moveCount,
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Record a check
   */
  recordCheck(kingPosition, checkingPiece) {
    if (!this.currentGame) return;
    
    this.checkCount++;
    this.currentGame.checks.push({
      kingPosition,
      checkingPiece,
      moveNumber: this.moveCount,
      timestamp: Date.now()
    });
  }
  
  /**
   * Record a checkmate
   */
  recordCheckmate(kingPosition, matingPiece) {
    if (!this.currentGame) return;
    
    this.checkmateCount++;
    this.currentGame.checkmates.push({
      kingPosition,
      matingPiece,
      moveNumber: this.moveCount,
      timestamp: Date.now()
    });
  }
  
  /**
   * Record an undo
   */
  recordUndo() {
    if (!this.currentGame) return;
    
    this.undoCount++;
    this.currentGame.undos++;
  }
  
  /**
   * Record a hint
   */
  recordHint() {
    if (!this.currentGame) return;
    
    this.hintCount++;
    this.currentGame.hints++;
  }
  
  /**
   * End the current game
   */
  endGame(result, winner = null) {
    if (!this.currentGame) return;
    
    this.currentGame.endTime = Date.now();
    this.currentGame.result = result;
    this.currentGame.winner = winner;
    this.currentGame.duration = this.currentGame.endTime - this.currentGame.startTime;
    
    // Update overall statistics
    this.updateOverallStats();
    
    // Save to history
    this.saveGameToHistory();
    
    // Clear current game
    this.currentGame = null;
  }
  
  /**
   * Update overall statistics
   */
  updateOverallStats() {
    if (!this.currentGame) return;
    
    const gameType = this.currentGame.gameType;
    const gameMode = this.currentGame.gameMode;
    
    // Initialize game type stats if needed
    if (!this.stats.games[gameType]) {
      this.stats.games[gameType] = {
        total: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        totalTime: 0,
        totalMoves: 0,
        totalCaptures: 0,
        totalChecks: 0,
        totalCheckmates: 0,
        totalUndos: 0,
        totalHints: 0,
        bestTime: null,
        worstTime: null,
        averageTime: 0,
        averageMoves: 0,
        winRate: 0,
        streaks: {
          current: 0,
          longest: 0
        }
      };
    }
    
    const gameStats = this.stats.games[gameType];
    
    // Update basic counts
    gameStats.total++;
    gameStats.totalTime += this.currentGame.duration;
    gameStats.totalMoves += this.moveCount;
    gameStats.totalCaptures += this.captureCount;
    gameStats.totalChecks += this.checkCount;
    gameStats.totalCheckmates += this.checkmateCount;
    gameStats.totalUndos += this.undoCount;
    gameStats.totalHints += this.hintCount;
    
    // Update win/loss/draw counts
    if (this.currentGame.result === 'win') {
      gameStats.wins++;
      gameStats.streaks.current++;
      if (gameStats.streaks.current > gameStats.streaks.longest) {
        gameStats.streaks.longest = gameStats.streaks.current;
      }
    } else if (this.currentGame.result === 'loss') {
      gameStats.losses++;
      gameStats.streaks.current = 0;
    } else if (this.currentGame.result === 'draw') {
      gameStats.draws++;
      gameStats.streaks.current = 0;
    }
    
    // Update best/worst times
    if (gameStats.bestTime === null || this.currentGame.duration < gameStats.bestTime) {
      gameStats.bestTime = this.currentGame.duration;
    }
    if (gameStats.worstTime === null || this.currentGame.duration > gameStats.worstTime) {
      gameStats.worstTime = this.currentGame.duration;
    }
    
    // Update averages
    gameStats.averageTime = gameStats.totalTime / gameStats.total;
    gameStats.averageMoves = gameStats.totalMoves / gameStats.total;
    gameStats.winRate = (gameStats.wins / gameStats.total) * 100;
    
    // Update overall stats
    this.stats.overall.totalGames++;
    this.stats.overall.totalTime += this.currentGame.duration;
    this.stats.overall.totalMoves += this.moveCount;
    
    // Update daily stats
    this.updateDailyStats();
    
    // Save stats
    this.saveStats();
  }
  
  /**
   * Update daily statistics
   */
  updateDailyStats() {
    const today = new Date().toDateString();
    
    if (!this.stats.daily[today]) {
      this.stats.daily[today] = {
        games: 0,
        time: 0,
        moves: 0,
        wins: 0,
        losses: 0,
        draws: 0
      };
    }
    
    const dailyStats = this.stats.daily[today];
    dailyStats.games++;
    dailyStats.time += this.currentGame.duration;
    dailyStats.moves += this.moveCount;
    
    if (this.currentGame.result === 'win') dailyStats.wins++;
    else if (this.currentGame.result === 'loss') dailyStats.losses++;
    else if (this.currentGame.result === 'draw') dailyStats.draws++;
  }
  
  /**
   * Save game to history
   */
  saveGameToHistory() {
    if (!this.currentGame) return;
    
    const gameHistory = this.loadGameHistory();
    gameHistory.unshift({
      ...this.currentGame,
      id: Date.now().toString()
    });
    
    // Keep only last 100 games
    if (gameHistory.length > 100) {
      gameHistory.splice(100);
    }
    
    localStorage.setItem('mate-game-history', JSON.stringify(gameHistory));
  }
  
  /**
   * Get current game statistics
   */
  getCurrentGameStats() {
    if (!this.currentGame) return null;
    
    return {
      gameType: this.currentGame.gameType,
      gameMode: this.currentGame.gameMode,
      duration: Date.now() - this.currentGame.startTime,
      moves: this.moveCount,
      captures: this.captureCount,
      checks: this.checkCount,
      checkmates: this.checkmateCount,
      undos: this.undoCount,
      hints: this.hintCount
    };
  }
  
  /**
   * Get overall statistics
   */
  getOverallStats() {
    return this.stats.overall;
  }
  
  /**
   * Get game type statistics
   */
  getGameTypeStats(gameType) {
    return this.stats.games[gameType] || null;
  }
  
  /**
   * Get daily statistics
   */
  getDailyStats(days = 7) {
    const dailyStats = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      dailyStats.unshift({
        date: dateString,
        ...(this.stats.daily[dateString] || {
          games: 0,
          time: 0,
          moves: 0,
          wins: 0,
          losses: 0,
          draws: 0
        })
      });
    }
    
    return dailyStats;
  }
  
  /**
   * Get game history
   */
  getGameHistory(limit = 20) {
    const history = this.loadGameHistory();
    return history.slice(0, limit);
  }
  
  /**
   * Get achievements
   */
  getAchievements() {
    const achievements = [];
    
    // Game count achievements
    if (this.stats.overall.totalGames >= 1) {
      achievements.push({ id: 'first-game', name: 'First Game', description: 'Played your first game', unlocked: true });
    }
    if (this.stats.overall.totalGames >= 10) {
      achievements.push({ id: 'ten-games', name: 'Getting Started', description: 'Played 10 games', unlocked: true });
    }
    if (this.stats.overall.totalGames >= 100) {
      achievements.push({ id: 'hundred-games', name: 'Century', description: 'Played 100 games', unlocked: true });
    }
    
    // Win streak achievements
    const chessStats = this.stats.games.chess;
    if (chessStats && chessStats.streaks.longest >= 3) {
      achievements.push({ id: 'win-streak-3', name: 'Hot Streak', description: 'Won 3 games in a row', unlocked: true });
    }
    if (chessStats && chessStats.streaks.longest >= 10) {
      achievements.push({ id: 'win-streak-10', name: 'Unstoppable', description: 'Won 10 games in a row', unlocked: true });
    }
    
    // Time achievements
    if (chessStats && chessStats.bestTime && chessStats.bestTime < 60000) {
      achievements.push({ id: 'quick-win', name: 'Lightning', description: 'Won a game in under 1 minute', unlocked: true });
    }
    
    return achievements;
  }
  
  /**
   * Load statistics from localStorage
   */
  loadStats() {
    const saved = localStorage.getItem('mate-game-stats');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      overall: {
        totalGames: 0,
        totalTime: 0,
        totalMoves: 0,
        firstGame: null,
        lastGame: null
      },
      games: {},
      daily: {},
      achievements: []
    };
  }
  
  /**
   * Load game history from localStorage
   */
  loadGameHistory() {
    const saved = localStorage.getItem('mate-game-history');
    return saved ? JSON.parse(saved) : [];
  }
  
  /**
   * Save statistics to localStorage
   */
  saveStats() {
    localStorage.setItem('mate-game-stats', JSON.stringify(this.stats));
  }
  
  /**
   * Clear all statistics
   */
  clearStats() {
    this.stats = {
      overall: {
        totalGames: 0,
        totalTime: 0,
        totalMoves: 0,
        firstGame: null,
        lastGame: null
      },
      games: {},
      daily: {},
      achievements: []
    };
    
    localStorage.removeItem('mate-game-stats');
    localStorage.removeItem('mate-game-history');
  }
  
  /**
   * Export statistics as JSON
   */
  exportStats() {
    return {
      stats: this.stats,
      history: this.loadGameHistory(),
      exportDate: new Date().toISOString()
    };
  }
  
  /**
   * Import statistics from JSON
   */
  importStats(data) {
    if (data.stats) {
      this.stats = data.stats;
      this.saveStats();
    }
    
    if (data.history) {
      localStorage.setItem('mate-game-history', JSON.stringify(data.history));
    }
  }
}
