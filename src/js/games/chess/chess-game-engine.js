/**
 * Chess Game Engine - Chess implementation of BaseGameEngine
 * Phase 9: Multi-Game Foundation
 * 
 * Wraps the existing chess engine to implement the new interface
 */

import { BaseGameEngine } from '../base-game-engine.js';
import { ChessEngine } from '../../game/chess-engine.js';

export class ChessGameEngine extends BaseGameEngine {
  constructor() {
    super();
    this.engine = new ChessEngine();
  }
  
  // ============================================================================
  // CORE GAME METHODS
  // ============================================================================
  
  newGame() {
    this.engine.newGame();
    return this.engine.getBoard();
  }
  
  getBoard() {
    return this.engine.getBoard();
  }
  
  getCurrentTurn() {
    return this.engine.getCurrentTurn();
  }
  
  makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    return this.engine.makeMove(fromRow, fromCol, toRow, toCol, promotionPiece);
  }
  
  getLegalMoves(row, col) {
    return this.engine.getLegalMoves(row, col);
  }
  
  getGameStatus() {
    return this.engine.getGameStatus();
  }
  
  getMoveHistory() {
    return this.engine.getMoveHistory();
  }
  
  getCapturedPieces() {
    return this.engine.getCapturedPieces();
  }
  
  undoMove() {
    return this.engine.undoMove();
  }
  
  // ============================================================================
  // GAME METADATA
  // ============================================================================
  
  getGameName() {
    return 'Chess';
  }
  
  getGameDescription() {
    return 'Classic strategy game with kings, queens, rooks, bishops, knights, and pawns';
  }
  
  getBoardDimensions() {
    return { rows: 8, cols: 8 };
  }
  
  getPieceTypes() {
    return ['K', 'Q', 'R', 'B', 'N', 'P'];
  }
  
  getPlayerColors() {
    return ['white', 'black'];
  }
  
  // ============================================================================
  // RENDERING SUPPORT
  // ============================================================================
  
  getPieceAt(row, col) {
    const board = this.getBoard();
    return board.getPiece(row, col);
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
  
  getSquareColor(row, col) {
    return (row + col) % 2 === 0 ? 'light' : 'dark';
  }
  
  // ============================================================================
  // AI SUPPORT
  // ============================================================================
  
  async getAIMove(color, skillLevel) {
    // This would integrate with the existing AI manager
    // For now, return a placeholder
    throw new Error('AI integration not yet implemented in new architecture');
  }
  
  isAISupported() {
    return true;
  }
  
  // ============================================================================
  // SERIALIZATION
  // ============================================================================
  
  serialize() {
    return {
      gameType: 'chess',
      board: this.engine.getBoard().serialize(),
      currentTurn: this.getCurrentTurn(),
      moveHistory: this.getMoveHistory(),
      capturedPieces: this.getCapturedPieces(),
      gameStatus: this.getGameStatus()
    };
  }
  
  deserialize(state) {
    if (state.gameType !== 'chess') {
      throw new Error('Invalid game type for chess engine');
    }
    
    this.engine.getBoard().deserialize(state.board);
    this.engine.gameState.currentTurn = state.currentTurn;
    this.engine.gameState.moveHistory = state.moveHistory;
    this.engine.gameState.capturedPieces = state.capturedPieces;
    this.engine.gameState.gameStatus = state.gameStatus;
  }
  
  // ============================================================================
  // URL SHARING
  // ============================================================================
  
  encodeForURL() {
    // This would use the existing URL encoder
    // For now, return a placeholder
    throw new Error('URL encoding not yet implemented in new architecture');
  }
  
  decodeFromURL(encoded) {
    // This would use the existing URL decoder
    // For now, return a placeholder
    throw new Error('URL decoding not yet implemented in new architecture');
  }
}
