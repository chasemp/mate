/**
 * Game Registry - Central registry for all board games
 * Phase 9: Multi-Game Foundation
 * 
 * Manages registration, discovery, and instantiation of game engines
 */

export class GameRegistry {
  constructor() {
    this.games = new Map();
    this.defaultGame = null;
  }
  
  /**
   * Register a game engine
   * @param {string} gameId - Unique game identifier
   * @param {Class} GameEngine - Game engine class
   * @param {Object} metadata - Game metadata
   */
  register(gameId, GameEngine, metadata = {}) {
    if (this.games.has(gameId)) {
      console.warn(`[GameRegistry] Game '${gameId}' is already registered`);
      return;
    }
    
    // Validate that GameEngine extends BaseGameEngine
    if (!this.isValidGameEngine(GameEngine)) {
      throw new Error(`Game engine for '${gameId}' must extend BaseGameEngine`);
    }
    
    const gameInfo = {
      id: gameId,
      name: metadata.name || gameId,
      description: metadata.description || '',
      icon: metadata.icon || '🎮',
      category: metadata.category || 'board',
      minPlayers: metadata.minPlayers || 2,
      maxPlayers: metadata.maxPlayers || 2,
      aiSupported: metadata.aiSupported || false,
      difficultyLevels: metadata.difficultyLevels || [],
      GameEngine,
      metadata
    };
    
    this.games.set(gameId, gameInfo);
    console.log(`[GameRegistry] Registered game: ${gameId} (${gameInfo.name})`);
    
    // Set as default if specified or if it's the first game
    if (metadata.isDefault || this.games.size === 1) {
      this.defaultGame = gameId;
    }
  }
  
  /**
   * Unregister a game
   * @param {string} gameId - Game identifier
   */
  unregister(gameId) {
    if (this.games.delete(gameId)) {
      console.log(`[GameRegistry] Unregistered game: ${gameId}`);
      
      // Reset default if it was the default game
      if (this.defaultGame === gameId) {
        this.defaultGame = this.games.size > 0 ? this.games.keys().next().value : null;
      }
    }
  }
  
  /**
   * Get all registered games
   * @returns {Array} Array of game info objects
   */
  getAllGames() {
    return Array.from(this.games.values());
  }
  
  /**
   * Get game info by ID
   * @param {string} gameId - Game identifier
   * @returns {Object|null} Game info or null
   */
  getGameInfo(gameId) {
    return this.games.get(gameId) || null;
  }
  
  /**
   * Get default game ID
   * @returns {string|null} Default game ID
   */
  getDefaultGame() {
    return this.defaultGame;
  }
  
  /**
   * Set default game
   * @param {string} gameId - Game identifier
   */
  setDefaultGame(gameId) {
    if (this.games.has(gameId)) {
      this.defaultGame = gameId;
      console.log(`[GameRegistry] Set default game to: ${gameId}`);
    } else {
      throw new Error(`Game '${gameId}' is not registered`);
    }
  }
  
  /**
   * Create game engine instance
   * @param {string} gameId - Game identifier
   * @returns {BaseGameEngine} Game engine instance
   */
  createGameEngine(gameId) {
    const gameInfo = this.games.get(gameId);
    if (!gameInfo) {
      throw new Error(`Game '${gameId}' is not registered`);
    }
    
    const GameEngine = gameInfo.GameEngine;
    return new GameEngine();
  }
  
  /**
   * Get games by category
   * @param {string} category - Game category
   * @returns {Array} Array of game info objects
   */
  getGamesByCategory(category) {
    return this.getAllGames().filter(game => game.category === category);
  }
  
  /**
   * Get games that support AI
   * @returns {Array} Array of game info objects
   */
  getAIGames() {
    return this.getAllGames().filter(game => game.aiSupported);
  }
  
  /**
   * Check if game is registered
   * @param {string} gameId - Game identifier
   * @returns {boolean} Registration status
   */
  isRegistered(gameId) {
    return this.games.has(gameId);
  }
  
  /**
   * Get game count
   * @returns {number} Number of registered games
   */
  getGameCount() {
    return this.games.size;
  }
  
  /**
   * Validate game engine class
   * @param {Class} GameEngine - Game engine class
   * @returns {boolean} Valid status
   */
  isValidGameEngine(GameEngine) {
    // Check if it has the required methods
    const requiredMethods = [
      'newGame', 'getBoard', 'getCurrentTurn', 'makeMove', 'getLegalMoves',
      'getGameStatus', 'getMoveHistory', 'getCapturedPieces', 'undoMove',
      'getGameName', 'getGameDescription', 'getBoardDimensions',
      'getPieceTypes', 'getPlayerColors', 'getPieceAt', 'isValidPosition',
      'getSquareColor', 'serialize', 'deserialize', 'encodeForURL', 'decodeFromURL'
    ];
    
    const prototype = GameEngine.prototype;
    return requiredMethods.every(method => typeof prototype[method] === 'function');
  }
  
  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  getStats() {
    const games = this.getAllGames();
    const categories = [...new Set(games.map(g => g.category))];
    const aiGames = games.filter(g => g.aiSupported);
    
    return {
      totalGames: games.length,
      categories: categories.length,
      aiSupported: aiGames.length,
      defaultGame: this.defaultGame,
      categories: categories.sort()
    };
  }
  
  /**
   * Clear all games
   */
  clear() {
    this.games.clear();
    this.defaultGame = null;
    console.log('[GameRegistry] Cleared all games');
  }
}

// Create global registry instance
export const gameRegistry = new GameRegistry();

// Auto-register games when they're imported
if (typeof window !== 'undefined') {
  window.gameRegistry = gameRegistry;
}
