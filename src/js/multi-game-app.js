/**
 * Multi-Game App - Main application for multi-game platform
 * Phase 9: Multi-Game Foundation
 * 
 * Manages game selection, switching, and common functionality
 */

import { gameRegistry } from './games/game-registry.js';
import { ChessGameEngine } from './games/chess/chess-game-engine.js';
import { CheckersGameEngine } from './games/checkers/checkers-game-engine.js';

export class MultiGameApp {
  constructor() {
    this.currentGame = null;
    this.currentGameId = null;
    this.gameEngine = null;
    
    // Initialize game registry
    this.initializeGameRegistry();
    
    // Load saved game preference
    this.loadGamePreference();
  }
  
  /**
   * Initialize the game registry with available games
   */
  initializeGameRegistry() {
    // Register Chess
    gameRegistry.register('chess', ChessGameEngine, {
      name: 'Chess',
      description: 'Classic strategy game with kings, queens, rooks, bishops, knights, and pawns',
      icon: '♟️',
      category: 'strategy',
      minPlayers: 2,
      maxPlayers: 2,
      aiSupported: true,
      difficultyLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      isDefault: true
    });
    
    // Register Checkers
    gameRegistry.register('checkers', CheckersGameEngine, {
      name: 'Checkers',
      description: 'Classic strategy game where pieces capture by jumping over opponents',
      icon: '🔴',
      category: 'strategy',
      minPlayers: 2,
      maxPlayers: 2,
      aiSupported: true,
      difficultyLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      isDefault: false
    });
    
    console.log('[MultiGameApp] Game registry initialized with', gameRegistry.getGameCount(), 'games');
  }
  
  /**
   * Load saved game preference
   */
  loadGamePreference() {
    const savedGame = localStorage.getItem('mate-current-game-type');
    if (savedGame && gameRegistry.isRegistered(savedGame)) {
      this.currentGameId = savedGame;
    } else {
      this.currentGameId = gameRegistry.getDefaultGame();
    }
  }
  
  /**
   * Save game preference
   */
  saveGamePreference() {
    if (this.currentGameId) {
      localStorage.setItem('mate-current-game-type', this.currentGameId);
    }
  }
  
  /**
   * Get all available games
   * @returns {Array} Array of game info objects
   */
  getAvailableGames() {
    return gameRegistry.getAllGames();
  }
  
  /**
   * Get current game info
   * @returns {Object|null} Current game info
   */
  getCurrentGameInfo() {
    return gameRegistry.getGameInfo(this.currentGameId);
  }
  
  /**
   * Switch to a different game
   * @param {string} gameId - Game identifier
   * @returns {boolean} Success status
   */
  switchGame(gameId) {
    if (!gameRegistry.isRegistered(gameId)) {
      console.error(`[MultiGameApp] Game '${gameId}' is not registered`);
      return false;
    }
    
    if (this.currentGameId === gameId) {
      console.log(`[MultiGameApp] Already playing ${gameId}`);
      return true;
    }
    
    try {
      // Create new game engine
      const newGameEngine = gameRegistry.createGameEngine(gameId);
      
      // Update current game
      this.currentGameId = gameId;
      this.gameEngine = newGameEngine;
      
      // Save preference
      this.saveGamePreference();
      
      console.log(`[MultiGameApp] Switched to ${gameId}`);
      return true;
      
    } catch (error) {
      console.error(`[MultiGameApp] Failed to switch to ${gameId}:`, error);
      return false;
    }
  }
  
  /**
   * Get current game engine
   * @returns {BaseGameEngine|null} Current game engine
   */
  getCurrentGameEngine() {
    if (!this.gameEngine && this.currentGameId) {
      try {
        this.gameEngine = gameRegistry.createGameEngine(this.currentGameId);
      } catch (error) {
        console.error('[MultiGameApp] Failed to create game engine:', error);
        return null;
      }
    }
    return this.gameEngine;
  }
  
  /**
   * Start a new game
   * @param {string} gameId - Game identifier (optional, uses current if not provided)
   * @returns {boolean} Success status
   */
  startNewGame(gameId = null) {
    if (gameId && gameId !== this.currentGameId) {
      if (!this.switchGame(gameId)) {
        return false;
      }
    }
    
    const engine = this.getCurrentGameEngine();
    if (!engine) {
      console.error('[MultiGameApp] No game engine available');
      return false;
    }
    
    try {
      engine.newGame();
      console.log(`[MultiGameApp] Started new ${this.currentGameId} game`);
      return true;
    } catch (error) {
      console.error('[MultiGameApp] Failed to start new game:', error);
      return false;
    }
  }
  
  /**
   * Get games by category
   * @param {string} category - Game category
   * @returns {Array} Array of game info objects
   */
  getGamesByCategory(category) {
    return gameRegistry.getGamesByCategory(category);
  }
  
  /**
   * Get games that support AI
   * @returns {Array} Array of game info objects
   */
  getAIGames() {
    return gameRegistry.getAIGames();
  }
  
  /**
   * Check if current game supports AI
   * @returns {boolean} AI support status
   */
  currentGameSupportsAI() {
    const engine = this.getCurrentGameEngine();
    return engine ? engine.isAISupported() : false;
  }
  
  /**
   * Get current game difficulty levels
   * @returns {Array} Array of difficulty levels
   */
  getCurrentGameDifficultyLevels() {
    const gameInfo = this.getCurrentGameInfo();
    return gameInfo ? gameInfo.difficultyLevels : [];
  }
  
  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  getStats() {
    return gameRegistry.getStats();
  }
  
  /**
   * Get current game ID
   * @returns {string|null} Current game ID
   */
  getCurrentGameId() {
    return this.currentGameId;
  }
  
  /**
   * Check if a game is available
   * @param {string} gameId - Game identifier
   * @returns {boolean} Availability status
   */
  isGameAvailable(gameId) {
    return gameRegistry.isRegistered(gameId);
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.multiGameApp = new MultiGameApp();
}
