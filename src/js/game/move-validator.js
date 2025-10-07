/**
 * Move Validation
 * Checks if moves are legal (including check detection)
 */

import { PieceRules } from './pieces.js';

export class MoveValidator {
  /**
   * Check if a move is legal (doesn't leave king in check)
   */
  static isLegalMove(board, fromRow, fromCol, toRow, toCol, currentTurn) {
    const piece = board.getPiece(fromRow, fromCol);
    
    // Basic validation
    if (!piece) return false;
    if (piece[0] !== currentTurn[0]) return false; // Wrong color
    if (!board.isValidSquare(toRow, toCol)) return false;
    
    // Check if move is in the piece's possible moves
    const possibleMoves = PieceRules.getPossibleMoves(board, fromRow, fromCol);
    const moveExists = possibleMoves.some(m => m.row === toRow && m.col === toCol);
    
    if (!moveExists) return false;
    
    // Make the move on a temporary board to check if it leaves king in check
    const testBoard = board.clone();
    testBoard.setPiece(toRow, toCol, piece);
    testBoard.setPiece(fromRow, fromCol, null);
    
    // Check if own king is in check after this move
    const kingInCheck = this.isInCheck(testBoard, currentTurn[0]);
    
    return !kingInCheck;
  }
  
  /**
   * Check if a king is in check
   */
  static isInCheck(board, color) {
    const kingPos = board.findKing(color);
    if (!kingPos) return false; // No king (shouldn't happen)
    
    const enemyColor = color === 'w' ? 'b' : 'w';
    
    // Check if any enemy piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece(row, col);
        if (piece && piece[0] === enemyColor) {
          const moves = PieceRules.getPossibleMoves(board, row, col);
          if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
            return true; // King is under attack
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Check if it's checkmate
   */
  static isCheckmate(board, color) {
    // Must be in check first
    if (!this.isInCheck(board, color)) return false;
    
    // Check if there are any legal moves
    return !this.hasLegalMoves(board, color);
  }
  
  /**
   * Check if it's stalemate (not in check but no legal moves)
   */
  static isStalemate(board, color) {
    // Must NOT be in check
    if (this.isInCheck(board, color)) return false;
    
    // Check if there are no legal moves
    return !this.hasLegalMoves(board, color);
  }
  
  /**
   * Check if a color has any legal moves
   */
  static hasLegalMoves(board, color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece(row, col);
        if (piece && piece[0] === color) {
          const possibleMoves = PieceRules.getPossibleMoves(board, row, col);
          
          // Check each possible move to see if it's legal
          for (const move of possibleMoves) {
            if (this.isLegalMove(board, row, col, move.row, move.col, color)) {
              return true; // Found at least one legal move
            }
          }
        }
      }
    }
    
    return false; // No legal moves found
  }
  
  /**
   * Get all legal moves for a piece
   */
  static getLegalMoves(board, row, col, currentTurn) {
    const piece = board.getPiece(row, col);
    if (!piece || piece[0] !== currentTurn[0]) return [];
    
    const possibleMoves = PieceRules.getPossibleMoves(board, row, col);
    
    // Filter to only legal moves (don't leave king in check)
    return possibleMoves.filter(move => 
      this.isLegalMove(board, row, col, move.row, move.col, currentTurn)
    );
  }
}

