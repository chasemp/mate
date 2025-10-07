/**
 * Checkers Game Engine - Checkers implementation of BaseGameEngine
 * Phase 10: Checkers Implementation
 * 
 * Implements the complete checkers game logic
 */

import { BaseGameEngine } from '../base-game-engine.js';

export class CheckersGameEngine extends BaseGameEngine {
  constructor() {
    super();
    this.board = null;
    this.currentTurn = 'red';
    this.moveHistory = [];
    this.capturedPieces = { red: [], black: [] };
    this.gameStatus = 'playing';
    this.lastMove = null;
    
    this.newGame();
  }
  
  // ============================================================================
  // CORE GAME METHODS
  // ============================================================================
  
  newGame() {
    // Initialize 8x8 board
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place red pieces (top 3 rows)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          this.board[row][col] = 'red';
        }
      }
    }
    
    // Place black pieces (bottom 3 rows)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          this.board[row][col] = 'black';
        }
      }
    }
    
    this.currentTurn = 'red';
    this.moveHistory = [];
    this.capturedPieces = { red: [], black: [] };
    this.gameStatus = 'playing';
    this.lastMove = null;
    
    return this.getBoard();
  }
  
  getBoard() {
    return {
      getPiece: (row, col) => this.board[row][col],
      setPiece: (row, col, piece) => { this.board[row][col] = piece; },
      serialize: () => this.board.map(row => [...row]),
      deserialize: (data) => { this.board = data.map(row => [...row]); }
    };
  }
  
  getCurrentTurn() {
    return this.currentTurn;
  }
  
  makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    // Validate move
    if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
      return false;
    }
    
    // Check for captures
    const capturedPiece = this.getCapturedPiece(fromRow, fromCol, toRow, toCol);
    
    // Make the move
    const piece = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = null;
    this.board[toRow][toCol] = piece;
    
    // Handle captures
    if (capturedPiece) {
      this.capturedPieces[this.currentTurn].push(capturedPiece);
    }
    
    // Check for king promotion
    if (this.shouldPromoteToKing(toRow, toCol)) {
      this.board[toRow][toCol] = this.currentTurn + '_king';
    }
    
    // Record move
    const move = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: piece,
      captured: capturedPiece,
      timestamp: Date.now()
    };
    
    this.moveHistory.push(move);
    this.lastMove = move;
    
    // Check for multiple captures
    if (capturedPiece && this.hasMoreCaptures(toRow, toCol)) {
      // Player must continue capturing
      this.gameStatus = 'capturing';
      return 'continue_capture';
    }
    
    // Switch turns
    this.currentTurn = this.currentTurn === 'red' ? 'black' : 'red';
    this.gameStatus = 'playing';
    
    // Check win condition
    this.checkWinCondition();
    
    return true;
  }
  
  getLegalMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece || !piece.startsWith(this.currentTurn)) {
      return [];
    }
    
    const moves = [];
    const isKing = piece.includes('king');
    
    // Get all possible moves
    const directions = isKing ? 
      [[-1, -1], [-1, 1], [1, -1], [1, 1]] : // Kings can move in all directions
      this.currentTurn === 'red' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]; // Regular pieces
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      // Check simple move
      if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === null) {
        moves.push({ row: newRow, col: newCol, type: 'move' });
      }
      
      // Check capture move
      const captureRow = row + dr * 2;
      const captureCol = col + dc * 2;
      const middleRow = row + dr;
      const middleCol = col + dc;
      
      if (this.isValidPosition(captureRow, captureCol) && 
          this.board[captureRow][captureCol] === null &&
          this.board[middleRow][middleCol] !== null &&
          !this.board[middleRow][middleCol].startsWith(this.currentTurn)) {
        moves.push({ 
          row: captureRow, 
          col: captureCol, 
          type: 'capture',
          captured: { row: middleRow, col: middleCol }
        });
      }
    }
    
    return moves;
  }
  
  getGameStatus() {
    return this.gameStatus;
  }
  
  getMoveHistory() {
    return this.moveHistory;
  }
  
  getCapturedPieces() {
    return this.capturedPieces;
  }
  
  undoMove() {
    if (this.moveHistory.length === 0) {
      return false;
    }
    
    const lastMove = this.moveHistory.pop();
    const { from, to, piece, captured } = lastMove;
    
    // Restore piece
    this.board[to.row][to.col] = null;
    this.board[from.row][from.col] = piece;
    
    // Restore captured piece
    if (captured) {
      this.board[captured.row][captured.col] = captured.piece;
      this.capturedPieces[this.currentTurn].pop();
    }
    
    // Switch turns back
    this.currentTurn = this.currentTurn === 'red' ? 'black' : 'red';
    this.gameStatus = 'playing';
    
    // Update last move
    this.lastMove = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
    
    return true;
  }
  
  // ============================================================================
  // GAME METADATA
  // ============================================================================
  
  getGameName() {
    return 'Checkers';
  }
  
  getGameDescription() {
    return 'Classic strategy game where pieces capture by jumping over opponents';
  }
  
  getBoardDimensions() {
    return { rows: 8, cols: 8 };
  }
  
  getPieceTypes() {
    return ['red', 'black', 'red_king', 'black_king'];
  }
  
  getPlayerColors() {
    return ['red', 'black'];
  }
  
  // ============================================================================
  // RENDERING SUPPORT
  // ============================================================================
  
  getPieceAt(row, col) {
    return this.board[row][col];
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
    // This will be implemented with minimax algorithm
    throw new Error('AI not yet implemented for checkers');
  }
  
  isAISupported() {
    return true;
  }
  
  // ============================================================================
  // SERIALIZATION
  // ============================================================================
  
  serialize() {
    return {
      gameType: 'checkers',
      board: this.board.map(row => [...row]),
      currentTurn: this.currentTurn,
      moveHistory: this.moveHistory,
      capturedPieces: { ...this.capturedPieces },
      gameStatus: this.gameStatus
    };
  }
  
  deserialize(state) {
    if (state.gameType !== 'checkers') {
      throw new Error('Invalid game type for checkers engine');
    }
    
    this.board = state.board.map(row => [...row]);
    this.currentTurn = state.currentTurn;
    this.moveHistory = state.moveHistory;
    this.capturedPieces = { ...state.capturedPieces };
    this.gameStatus = state.gameStatus;
  }
  
  // ============================================================================
  // URL SHARING
  // ============================================================================
  
  encodeForURL() {
    // This will be implemented with URL encoding
    throw new Error('URL encoding not yet implemented for checkers');
  }
  
  decodeFromURL(encoded) {
    // This will be implemented with URL decoding
    throw new Error('URL decoding not yet implemented for checkers');
  }
  
  // ============================================================================
  // CHECKERS-SPECIFIC METHODS
  // ============================================================================
  
  isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece || !piece.startsWith(this.currentTurn)) {
      return false;
    }
    
    // Check if destination is valid
    if (!this.isValidPosition(toRow, toCol) || this.board[toRow][toCol] !== null) {
      return false;
    }
    
    // Check if move is diagonal
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if (rowDiff !== colDiff) {
      return false;
    }
    
    const isKing = piece.includes('king');
    
    // Check direction for non-kings
    if (!isKing) {
      const direction = this.currentTurn === 'red' ? 1 : -1;
      if ((toRow - fromRow) * direction <= 0) {
        return false;
      }
    }
    
    // Check distance
    if (rowDiff === 1) {
      // Simple move
      return true;
    } else if (rowDiff === 2) {
      // Capture move
      const middleRow = fromRow + (toRow - fromRow) / 2;
      const middleCol = fromCol + (toCol - fromCol) / 2;
      const middlePiece = this.board[middleRow][middleCol];
      
      return middlePiece !== null && !middlePiece.startsWith(this.currentTurn);
    }
    
    return false;
  }
  
  getCapturedPiece(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    if (rowDiff !== 2) {
      return null;
    }
    
    const middleRow = fromRow + (toRow - fromRow) / 2;
    const middleCol = fromCol + (toCol - fromCol) / 2;
    const middlePiece = this.board[middleRow][middleCol];
    
    if (middlePiece && !middlePiece.startsWith(this.currentTurn)) {
      // Remove captured piece
      this.board[middleRow][middleCol] = null;
      return middlePiece;
    }
    
    return null;
  }
  
  shouldPromoteToKing(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.includes('king')) {
      return false;
    }
    
    return (this.currentTurn === 'red' && row === 7) || 
           (this.currentTurn === 'black' && row === 0);
  }
  
  hasMoreCaptures(row, col) {
    const moves = this.getLegalMoves(row, col);
    return moves.some(move => move.type === 'capture');
  }
  
  checkWinCondition() {
    // Check if current player has any pieces
    let hasPieces = false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] && this.board[row][col].startsWith(this.currentTurn)) {
          hasPieces = true;
          break;
        }
      }
      if (hasPieces) break;
    }
    
    if (!hasPieces) {
      this.gameStatus = 'checkmate';
      return;
    }
    
    // Check if current player has any legal moves
    let hasMoves = false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] && this.board[row][col].startsWith(this.currentTurn)) {
          const moves = this.getLegalMoves(row, col);
          if (moves.length > 0) {
            hasMoves = true;
            break;
          }
        }
      }
      if (hasMoves) break;
    }
    
    if (!hasMoves) {
      this.gameStatus = 'stalemate';
    }
  }
}
