/**
 * Chess Piece Movement Rules
 * Defines legal moves for each piece type
 */

export class PieceRules {
  /**
   * Get all possible moves for a piece (without checking for check)
   */
  static getPossibleMoves(board, row, col) {
    const piece = board.getPiece(row, col);
    if (!piece) return [];
    
    const type = piece[1]; // P, N, B, R, Q, K
    const color = piece[0]; // w, b
    
    switch(type) {
      case 'P': return this.getPawnMoves(board, row, col, color);
      case 'N': return this.getKnightMoves(board, row, col, color);
      case 'B': return this.getBishopMoves(board, row, col, color);
      case 'R': return this.getRookMoves(board, row, col, color);
      case 'Q': return this.getQueenMoves(board, row, col, color);
      case 'K': return this.getKingMoves(board, row, col, color);
      default: return [];
    }
  }
  
  /**
   * Pawn moves (most complex due to special rules)
   */
  static getPawnMoves(board, row, col, color) {
    const moves = [];
    const direction = color === 'w' ? -1 : 1; // White moves up (-), black moves down (+)
    const startRow = color === 'w' ? 6 : 1;
    
    // Forward one square
    const newRow = row + direction;
    if (board.isEmpty(newRow, col)) {
      moves.push({ row: newRow, col, type: 'move' });
      
      // Forward two squares from starting position
      if (row === startRow) {
        const twoSquares = row + 2 * direction;
        if (board.isEmpty(twoSquares, col)) {
          moves.push({ row: twoSquares, col, type: 'move' });
        }
      }
    }
    
    // Captures (diagonal)
    for (const dcol of [-1, 1]) {
      const newCol = col + dcol;
      if (board.isValidSquare(newRow, newCol)) {
        const targetPiece = board.getPiece(newRow, newCol);
        if (targetPiece && targetPiece[0] !== color) {
          moves.push({ row: newRow, col: newCol, type: 'capture' });
        }
        // TODO: En passant (Phase 1.3)
      }
    }
    
    // TODO: Pawn promotion (Phase 1.3)
    
    return moves;
  }
  
  /**
   * Knight moves (L-shape)
   */
  static getKnightMoves(board, row, col, color) {
    const moves = [];
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [drow, dcol] of offsets) {
      const newRow = row + drow;
      const newCol = col + dcol;
      
      if (board.isValidSquare(newRow, newCol)) {
        const targetPiece = board.getPiece(newRow, newCol);
        if (!targetPiece || targetPiece[0] !== color) {
          moves.push({ 
            row: newRow, 
            col: newCol, 
            type: targetPiece ? 'capture' : 'move' 
          });
        }
      }
    }
    
    return moves;
  }
  
  /**
   * Bishop moves (diagonal)
   */
  static getBishopMoves(board, row, col, color) {
    return this.getSlidingMoves(board, row, col, color, [
      [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal directions
    ]);
  }
  
  /**
   * Rook moves (straight lines)
   */
  static getRookMoves(board, row, col, color) {
    return this.getSlidingMoves(board, row, col, color, [
      [-1, 0], [1, 0], [0, -1], [0, 1] // Horizontal/vertical directions
    ]);
  }
  
  /**
   * Queen moves (combination of rook + bishop)
   */
  static getQueenMoves(board, row, col, color) {
    return this.getSlidingMoves(board, row, col, color, [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]);
  }
  
  /**
   * King moves (one square in any direction + castling)
   */
  static getKingMoves(board, row, col, color) {
    const moves = [];
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [drow, dcol] of offsets) {
      const newRow = row + drow;
      const newCol = col + dcol;
      
      if (board.isValidSquare(newRow, newCol)) {
        const targetPiece = board.getPiece(newRow, newCol);
        if (!targetPiece || targetPiece[0] !== color) {
          moves.push({ 
            row: newRow, 
            col: newCol, 
            type: targetPiece ? 'capture' : 'move' 
          });
        }
      }
    }
    
    // Castling moves (will be validated separately)
    // King must be on starting square
    const startRow = color === 'w' ? 7 : 0;
    if (row === startRow && col === 4) {
      // Kingside castling (king moves 2 squares right)
      moves.push({ row: startRow, col: 6, type: 'castle-kingside' });
      // Queenside castling (king moves 2 squares left)
      moves.push({ row: startRow, col: 2, type: 'castle-queenside' });
    }
    
    return moves;
  }
  
  /**
   * Helper: Get moves for sliding pieces (bishop, rook, queen)
   */
  static getSlidingMoves(board, row, col, color, directions) {
    const moves = [];
    
    for (const [drow, dcol] of directions) {
      let currentRow = row + drow;
      let currentCol = col + dcol;
      
      // Slide in this direction until blocked
      while (board.isValidSquare(currentRow, currentCol)) {
        const targetPiece = board.getPiece(currentRow, currentCol);
        
        if (!targetPiece) {
          // Empty square - can move here
          moves.push({ row: currentRow, col: currentCol, type: 'move' });
        } else if (targetPiece[0] !== color) {
          // Enemy piece - can capture
          moves.push({ row: currentRow, col: currentCol, type: 'capture' });
          break; // Can't move past captured piece
        } else {
          // Own piece - blocked
          break;
        }
        
        currentRow += drow;
        currentCol += dcol;
      }
    }
    
    return moves;
  }
}

