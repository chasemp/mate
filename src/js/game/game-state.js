/**
 * Game State Management
 * Tracks current game state, move history, and game status
 */

import { ChessBoard } from './board.js';
import { MoveValidator } from './move-validator.js';
import { SpecialMoves } from './special-moves.js';

export class GameState {
  constructor() {
    this.board = new ChessBoard();
    this.currentTurn = 'white'; // 'white' or 'black'
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.gameStatus = 'active'; // 'active', 'check', 'checkmate', 'stalemate'
    this.gameId = null; // For multiplayer games
    this.pieceMoveTracker = new Set(); // Track which pieces have moved (for castling)
    this.pendingPromotion = null; // Track pawn awaiting promotion
  }
  
  /**
   * Make a move
   * Returns true if successful, false if illegal
   * Returns 'promotion' if pawn promotion dialog needed
   */
  makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    // Handle pending promotion
    if (this.pendingPromotion) {
      if (!promotionPiece) {
        return 'promotion'; // Need to choose promotion piece
      }
      const result = SpecialMoves.executePromotion(
        this.board, 
        this.pendingPromotion.row, 
        this.pendingPromotion.col, 
        promotionPiece
      );
      this.moveHistory[this.moveHistory.length - 1].promotion = result;
      this.pendingPromotion = null;
      
      // Switch turns after promotion
      this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
      this.updateGameStatus();
      return true;
    }
    
    // Validate move
    const isLegal = MoveValidator.isLegalMove(
      this.board, fromRow, fromCol, toRow, toCol, this.currentTurn
    );
    
    if (!isLegal) {
      // Check for castling
      const piece = this.board.getPiece(fromRow, fromCol);
      if (piece && piece[1] === 'K') {
        const color = piece[0];
        // Kingside castling
        if (toCol === fromCol + 2 && SpecialMoves.canCastle(this.board, this, color, 'kingside')) {
          return this.executeCastling(color, 'kingside');
        }
        // Queenside castling
        if (toCol === fromCol - 2 && SpecialMoves.canCastle(this.board, this, color, 'queenside')) {
          return this.executeCastling(color, 'queenside');
        }
      }
      
      console.warn('Illegal move attempted:', { fromRow, fromCol, toRow, toCol });
      return false;
    }
    
    // Get piece being moved
    const piece = this.board.getPiece(fromRow, fromCol);
    const capturedPiece = this.board.getPiece(toRow, toCol);
    
    // Check for en passant
    let enPassantCapture = null;
    if (piece[1] === 'P' && SpecialMoves.canEnPassant(this.board, this, fromRow, fromCol, toRow, toCol)) {
      enPassantCapture = SpecialMoves.executeEnPassant(this.board, fromRow, fromCol, toRow, toCol);
    } else {
      // Normal move
      this.board.setPiece(toRow, toCol, piece);
      this.board.setPiece(fromRow, fromCol, null);
    }
    
    // Track that this piece has moved (for castling)
    this.markPieceMoved(fromRow, fromCol);
    
    // Record move in history
    const move = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: piece,
      captured: enPassantCapture ? enPassantCapture.capturedPawn : capturedPiece,
      enPassant: enPassantCapture,
      timestamp: Date.now(),
      notation: this.moveToNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece || enPassantCapture?.capturedPawn)
    };
    
    this.moveHistory.push(move);
    
    // Update captured pieces
    const finalCapturedPiece = enPassantCapture ? enPassantCapture.capturedPawn : capturedPiece;
    if (finalCapturedPiece) {
      const capturedColor = finalCapturedPiece[0] === 'w' ? 'white' : 'black';
      this.capturedPieces[capturedColor].push(finalCapturedPiece);
    }
    
    // Check for pawn promotion
    if (piece[1] === 'P' && SpecialMoves.shouldPromote(this.board, toRow, toCol)) {
      this.pendingPromotion = { row: toRow, col: toCol };
      return 'promotion'; // Pause for promotion selection
    }
    
    // Switch turns
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    
    // Update game status
    this.updateGameStatus();
    
    return true;
  }
  
  /**
   * Execute castling move
   */
  executeCastling(color, side) {
    const result = SpecialMoves.executeCastle(this.board, color, side);
    
    // Mark king and rook as moved
    this.markPieceMoved(result.kingMove.from.row, result.kingMove.from.col);
    this.markPieceMoved(result.rookMove.from.row, result.rookMove.from.col);
    
    // Record move
    const notation = side === 'kingside' ? 'O-O' : 'O-O-O';
    const move = {
      from: result.kingMove.from,
      to: result.kingMove.to,
      piece: `${color}K`,
      captured: null,
      castle: result,
      timestamp: Date.now(),
      notation: notation
    };
    
    this.moveHistory.push(move);
    
    // Switch turns
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    
    // Update game status
    this.updateGameStatus();
    
    return true;
  }
  
  /**
   * Mark that a piece at this position has moved (for castling tracking)
   */
  markPieceMoved(row, col) {
    this.pieceMoveTracker.add(`${row},${col}`);
  }
  
  /**
   * Check if a piece at this position has ever moved
   */
  hasPieceMoved(row, col) {
    return this.pieceMoveTracker.has(`${row},${col}`);
  }
  
  /**
   * Update game status (check, checkmate, stalemate)
   */
  updateGameStatus() {
    const color = this.currentTurn[0]; // 'w' or 'b'
    
    if (MoveValidator.isCheckmate(this.board, color)) {
      this.gameStatus = 'checkmate';
      const winner = this.currentTurn === 'white' ? 'Black' : 'White';
      console.log(`Checkmate! ${winner} wins!`);
    } else if (MoveValidator.isStalemate(this.board, color)) {
      this.gameStatus = 'stalemate';
      console.log('Stalemate! Game is a draw.');
    } else if (MoveValidator.isInCheck(this.board, color)) {
      this.gameStatus = 'check';
      console.log(`${this.currentTurn} is in check!`);
    } else {
      this.gameStatus = 'active';
    }
  }
  
  /**
   * Convert move to algebraic notation (simple version)
   */
  moveToNotation(fromRow, fromCol, toRow, toCol, piece, captured) {
    const pieceType = piece[1];
    const files = 'abcdefgh';
    const ranks = '87654321';
    
    const fromSquare = files[fromCol] + ranks[fromRow];
    const toSquare = files[toCol] + ranks[toRow];
    
    // Simple notation: piece + destination (e.g., "Nf3", "e4")
    if (pieceType === 'P') {
      // Pawns don't show piece letter
      return captured ? `${files[fromCol]}x${toSquare}` : toSquare;
    }
    
    return captured ? `${pieceType}x${toSquare}` : `${pieceType}${toSquare}`;
  }
  
  /**
   * Get legal moves for a piece
   */
  getLegalMoves(row, col) {
    return MoveValidator.getLegalMoves(this.board, row, col, this.currentTurn);
  }
  
  /**
   * Undo last move
   */
  undoMove() {
    if (this.moveHistory.length === 0) return false;
    
    const lastMove = this.moveHistory.pop();
    
    // Restore piece to original position
    this.board.setPiece(lastMove.from.row, lastMove.from.col, lastMove.piece);
    
    // Restore captured piece or clear destination
    this.board.setPiece(lastMove.to.row, lastMove.to.col, lastMove.captured);
    
    // Remove from captured pieces if there was one
    if (lastMove.captured) {
      const capturedColor = lastMove.captured[0] === 'w' ? 'white' : 'black';
      this.capturedPieces[capturedColor].pop();
    }
    
    // Switch turns back
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    
    // Update game status
    this.updateGameStatus();
    
    return true;
  }
  
  /**
   * Reset game to starting position
   */
  reset() {
    this.board = new ChessBoard();
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.gameStatus = 'active';
    this.pieceMoveTracker = new Set();
    this.pendingPromotion = null;
  }
  
  /**
   * Get last move
   */
  getLastMove() {
    return this.moveHistory.length > 0 
      ? this.moveHistory[this.moveHistory.length - 1] 
      : null;
  }
}

