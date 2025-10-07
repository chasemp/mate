/**
 * Chess Engine
 * Main orchestrator for the chess game logic
 */

import { GameState } from './game-state.js';

export class ChessEngine {
  constructor() {
    this.gameState = new GameState();
  }
  
  /**
   * Start a new game
   */
  newGame(gameId = null) {
    this.gameState.reset();
    if (gameId) {
      this.gameState.gameId = gameId;
    }
    return this.gameState;
  }
  
  /**
   * Make a move
   */
  makeMove(fromRow, fromCol, toRow, toCol) {
    return this.gameState.makeMove(fromRow, fromCol, toRow, toCol);
  }
  
  /**
   * Get legal moves for a piece
   */
  getLegalMoves(row, col) {
    return this.gameState.getLegalMoves(row, col);
  }
  
  /**
   * Undo last move
   */
  undoMove() {
    return this.gameState.undoMove();
  }
  
  /**
   * Get current board state
   */
  getBoard() {
    return this.gameState.board;
  }
  
  /**
   * Get current turn
   */
  getCurrentTurn() {
    return this.gameState.currentTurn;
  }
  
  /**
   * Get game status
   */
  getGameStatus() {
    return this.gameState.gameStatus;
  }
  
  /**
   * Get move history
   */
  getMoveHistory() {
    return this.gameState.moveHistory;
  }
  
  /**
   * Get captured pieces
   */
  getCapturedPieces() {
    return this.gameState.capturedPieces;
  }
  
  /**
   * Get last move
   */
  getLastMove() {
    return this.gameState.getLastMove();
  }
  
  /**
   * Load game from state
   */
  loadGameState(gameState) {
    this.gameState = gameState;
  }
}

