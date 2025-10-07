/**
 * Multi-Game Storage Manager
 * Handles multiple concurrent chess games with opponent aliases
 */

import { GameIDGenerator } from '../game/game-id-generator.js';

export class MultiGameStorage {
  constructor() {
    this.storageKey = 'chess-games';
    this.activeKey = 'chess-active-game';
  }
  
  /**
   * Create new game
   */
  createGame(myColor = 'white', opponentName = null) {
    const gameId = GameIDGenerator.generate();
    
    const gameData = {
      id: gameId,
      myColor: myColor,
      opponentName: opponentName || 'Opponent',
      opponentEmoji: this.getRandomEmoji(),
      created: Date.now(),
      lastUpdate: Date.now(),
      moveCount: 0,
      moveHistory: [],
      myTurn: myColor === 'white', // White goes first
      status: 'active' // active, check, checkmate, stalemate
    };
    
    this.saveGame(gameId, gameData);
    this.setActiveGame(gameId);
    
    return gameData;
  }
  
  /**
   * Get all games
   */
  getAllGames() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }
  
  /**
   * Get specific game
   */
  getGame(gameId) {
    const games = this.getAllGames();
    return games[gameId] || null;
  }
  
  /**
   * Save game
   */
  saveGame(gameId, gameData) {
    const games = this.getAllGames();
    games[gameId] = {
      ...gameData,
      id: gameId,
      lastUpdate: Date.now()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(games));
  }
  
  /**
   * Update opponent name (local alias)
   */
  setOpponentName(gameId, name, emoji = null) {
    const game = this.getGame(gameId);
    if (!game) return false;
    
    game.opponentName = name || 'Opponent';
    if (emoji) {
      game.opponentEmoji = emoji;
    }
    
    this.saveGame(gameId, game);
    return true;
  }
  
  /**
   * Update game with move
   */
  updateGameWithMove(gameId, move, switchTurn = true) {
    const game = this.getGame(gameId);
    if (!game) return false;
    
    game.moveHistory.push(move);
    game.moveCount = game.moveHistory.length;
    game.lastUpdate = Date.now();
    
    if (switchTurn) {
      game.myTurn = !game.myTurn;
    }
    
    this.saveGame(gameId, game);
    return true;
  }
  
  /**
   * Update game status (check, checkmate, etc)
   */
  updateGameStatus(gameId, status) {
    const game = this.getGame(gameId);
    if (!game) return false;
    
    game.status = status;
    this.saveGame(gameId, game);
    return true;
  }
  
  /**
   * Set active game (currently viewing)
   */
  setActiveGame(gameId) {
    localStorage.setItem(this.activeKey, gameId);
  }
  
  /**
   * Get active game ID
   */
  getActiveGameId() {
    return localStorage.getItem(this.activeKey);
  }
  
  /**
   * Get active game data
   */
  getActiveGame() {
    const gameId = this.getActiveGameId();
    return gameId ? this.getGame(gameId) : null;
  }
  
  /**
   * Delete game
   */
  deleteGame(gameId) {
    const games = this.getAllGames();
    delete games[gameId];
    localStorage.setItem(this.storageKey, JSON.stringify(games));
    
    // If this was the active game, clear active
    if (this.getActiveGameId() === gameId) {
      localStorage.removeItem(this.activeKey);
    }
  }
  
  /**
   * Archive completed game (keep history but mark as done)
   */
  archiveGame(gameId) {
    const game = this.getGame(gameId);
    if (!game) return false;
    
    game.archived = true;
    game.archivedDate = Date.now();
    this.saveGame(gameId, game);
    return true;
  }
  
  /**
   * Get games list for UI (sorted by last update)
   */
  getGamesList(includeArchived = false) {
    const games = this.getAllGames();
    return Object.values(games)
      .filter(game => includeArchived || !game.archived)
      .sort((a, b) => b.lastUpdate - a.lastUpdate);
  }
  
  /**
   * Get games by status
   */
  getGamesByStatus(status) {
    return this.getGamesList().filter(game => game.status === status);
  }
  
  /**
   * Get games where it's my turn
   */
  getMyTurnGames() {
    return this.getGamesList().filter(game => game.myTurn && game.status === 'active');
  }
  
  /**
   * Get games waiting for opponent
   */
  getWaitingGames() {
    return this.getGamesList().filter(game => !game.myTurn && game.status === 'active');
  }
  
  /**
   * Get game count
   */
  getGameCount() {
    return this.getGamesList().length;
  }
  
  /**
   * Get display name for game
   */
  getGameDisplayName(game) {
    const emoji = game.opponentEmoji || '🎮';
    const name = game.opponentName || 'Opponent';
    return `${emoji} ${name}`;
  }
  
  /**
   * Get time since last update (human readable)
   */
  getTimeSinceUpdate(game) {
    const now = Date.now();
    const diff = now - game.lastUpdate;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }
  
  /**
   * Get random emoji for new opponent
   */
  getRandomEmoji() {
    const emojis = [
      '🎮', '♟️', '👤', '🤺', '🎯', '🎲', '🃏', 
      '👨', '👩', '🧑', '👶', '🧔', '👴', '👵',
      '🤖', '👽', '🦄', '🐉', '🦁', '🐯', '🐻'
    ];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }
  
  /**
   * Export game for sharing/backup
   */
  exportGame(gameId) {
    const game = this.getGame(gameId);
    if (!game) return null;
    
    return {
      id: game.id,
      opponent: game.opponentName,
      created: game.created,
      moveHistory: game.moveHistory,
      status: game.status
    };
  }
  
  /**
   * Import game from shared data
   */
  importGame(gameData, opponentName = null) {
    const gameId = gameData.id || GameIDGenerator.generate();
    
    // Check if game already exists
    const existing = this.getGame(gameId);
    if (existing) {
      // Update existing game
      this.saveGame(gameId, {
        ...existing,
        moveHistory: gameData.moveHistory,
        status: gameData.status,
        lastUpdate: Date.now()
      });
    } else {
      // Create new game
      this.saveGame(gameId, {
        id: gameId,
        opponentName: opponentName || gameData.opponent || 'Opponent',
        opponentEmoji: this.getRandomEmoji(),
        created: gameData.created || Date.now(),
        lastUpdate: Date.now(),
        moveHistory: gameData.moveHistory || [],
        moveCount: (gameData.moveHistory || []).length,
        status: gameData.status || 'active',
        myTurn: true // Assume it's our turn when importing
      });
    }
    
    return gameId;
  }
}

