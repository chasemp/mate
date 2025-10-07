/**
 * Special Chess Moves
 * Castling, En Passant, Pawn Promotion
 */

export class SpecialMoves {
  /**
   * Check if castling is possible
   */
  static canCastle(board, gameState, color, side) {
    // side: 'kingside' or 'queenside'
    const row = color === 'w' ? 7 : 0;
    const king = board.getPiece(row, 4);
    
    // King must be in starting position
    if (!king || king !== `${color}K`) return false;
    
    // Check if king or rook has moved
    if (gameState.hasPieceMoved(row, 4)) return false;
    
    if (side === 'kingside') {
      const rook = board.getPiece(row, 7);
      if (!rook || rook !== `${color}R`) return false;
      if (gameState.hasPieceMoved(row, 7)) return false;
      
      // Squares between must be empty
      if (!board.isEmpty(row, 5) || !board.isEmpty(row, 6)) return false;
      
      // King cannot be in check, move through check, or end in check
      // Check current position
      if (this.isSquareAttacked(board, row, 4, color)) return false;
      // Check square king moves through
      if (this.isSquareAttacked(board, row, 5, color)) return false;
      // Check final position
      if (this.isSquareAttacked(board, row, 6, color)) return false;
      
      return true;
    } else { // queenside
      const rook = board.getPiece(row, 0);
      if (!rook || rook !== `${color}R`) return false;
      if (gameState.hasPieceMoved(row, 0)) return false;
      
      // Squares between must be empty
      if (!board.isEmpty(row, 1) || !board.isEmpty(row, 2) || !board.isEmpty(row, 3)) return false;
      
      // King cannot be in check, move through check, or end in check
      if (this.isSquareAttacked(board, row, 4, color)) return false;
      if (this.isSquareAttacked(board, row, 3, color)) return false;
      if (this.isSquareAttacked(board, row, 2, color)) return false;
      
      return true;
    }
  }
  
  /**
   * Execute castling move
   */
  static executeCastle(board, color, side) {
    const row = color === 'w' ? 7 : 0;
    
    if (side === 'kingside') {
      // Move king from e1/e8 to g1/g8
      board.setPiece(row, 6, `${color}K`);
      board.setPiece(row, 4, null);
      // Move rook from h1/h8 to f1/f8
      board.setPiece(row, 5, `${color}R`);
      board.setPiece(row, 7, null);
      
      return {
        type: 'castle',
        side: 'kingside',
        kingMove: { from: { row, col: 4 }, to: { row, col: 6 } },
        rookMove: { from: { row, col: 7 }, to: { row, col: 5 } }
      };
    } else { // queenside
      // Move king from e1/e8 to c1/c8
      board.setPiece(row, 2, `${color}K`);
      board.setPiece(row, 4, null);
      // Move rook from a1/a8 to d1/d8
      board.setPiece(row, 3, `${color}R`);
      board.setPiece(row, 0, null);
      
      return {
        type: 'castle',
        side: 'queenside',
        kingMove: { from: { row, col: 4 }, to: { row, col: 2 } },
        rookMove: { from: { row, col: 0 }, to: { row, col: 3 } }
      };
    }
  }
  
  /**
   * Check if en passant is possible
   */
  static canEnPassant(board, gameState, fromRow, fromCol, toRow, toCol) {
    const piece = board.getPiece(fromRow, fromCol);
    if (!piece || piece[1] !== 'P') return false;
    
    const color = piece[0];
    const direction = color === 'w' ? -1 : 1;
    
    // Must be moving diagonally to an empty square
    if (toRow !== fromRow + direction) return false;
    if (Math.abs(toCol - fromCol) !== 1) return false;
    if (!board.isEmpty(toRow, toCol)) return false;
    
    // There must be an enemy pawn on the same rank
    const enemyPawn = board.getPiece(fromRow, toCol);
    if (!enemyPawn || enemyPawn[1] !== 'P') return false;
    if (enemyPawn[0] === color) return false;
    
    // That pawn must have just moved two squares
    const lastMove = gameState.getLastMove();
    if (!lastMove) return false;
    
    // Check if last move was the adjacent pawn moving two squares
    const enemyStartRow = color === 'w' ? 1 : 6;
    const enemyCurrentRow = fromRow;
    
    if (lastMove.to.row !== enemyCurrentRow || lastMove.to.col !== toCol) return false;
    if (lastMove.from.row !== enemyStartRow) return false;
    if (Math.abs(lastMove.to.row - lastMove.from.row) !== 2) return false;
    
    return true;
  }
  
  /**
   * Execute en passant capture
   */
  static executeEnPassant(board, fromRow, fromCol, toRow, toCol) {
    const piece = board.getPiece(fromRow, fromCol);
    
    // Move pawn to target square
    board.setPiece(toRow, toCol, piece);
    board.setPiece(fromRow, fromCol, null);
    
    // Remove captured pawn (on the same rank as the moving pawn)
    const capturedPawn = board.getPiece(fromRow, toCol);
    board.setPiece(fromRow, toCol, null);
    
    return {
      type: 'enpassant',
      capturedPawn: capturedPawn,
      capturedAt: { row: fromRow, col: toCol }
    };
  }
  
  /**
   * Check if pawn should be promoted
   */
  static shouldPromote(board, row, col) {
    const piece = board.getPiece(row, col);
    if (!piece || piece[1] !== 'P') return false;
    
    const color = piece[0];
    const promotionRow = color === 'w' ? 0 : 7;
    
    return row === promotionRow;
  }
  
  /**
   * Execute pawn promotion
   */
  static executePromotion(board, row, col, promoteTo = 'Q') {
    const piece = board.getPiece(row, col);
    if (!piece) return false;
    
    const color = piece[0];
    const newPiece = `${color}${promoteTo}`;
    board.setPiece(row, col, newPiece);
    
    return {
      type: 'promotion',
      from: piece,
      to: newPiece,
      position: { row, col }
    };
  }
  
  /**
   * Helper: Check if a square is attacked by opponent
   * Simple version without using PieceRules to avoid circular dependency
   */
  static isSquareAttacked(board, row, col, defendingColor) {
    const attackingColor = defendingColor === 'w' ? 'b' : 'w';
    
    // Check for attacking pawns
    const pawnDir = defendingColor === 'w' ? -1 : 1;
    const pawnAttackRow = row + pawnDir;
    for (const dcol of [-1, 1]) {
      const c = col + dcol;
      if (board.isValidSquare(pawnAttackRow, c)) {
        const piece = board.getPiece(pawnAttackRow, c);
        if (piece === `${attackingColor}P`) return true;
      }
    }
    
    // Check for attacking knights
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
      const r = row + dr, c = col + dc;
      if (board.isValidSquare(r, c)) {
        const piece = board.getPiece(r, c);
        if (piece === `${attackingColor}N`) return true;
      }
    }
    
    // Check for attacking king
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr, c = col + dc;
        if (board.isValidSquare(r, c)) {
          const piece = board.getPiece(r, c);
          if (piece === `${attackingColor}K`) return true;
        }
      }
    }
    
    // Check for attacking bishops/queens (diagonal)
    const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagonals) {
      let r = row + dr, c = col + dc;
      while (board.isValidSquare(r, c)) {
        const piece = board.getPiece(r, c);
        if (piece) {
          if (piece[0] === attackingColor && (piece[1] === 'B' || piece[1] === 'Q')) {
            return true;
          }
          break; // Blocked
        }
        r += dr;
        c += dc;
      }
    }
    
    // Check for attacking rooks/queens (straight lines)
    const lines = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of lines) {
      let r = row + dr, c = col + dc;
      while (board.isValidSquare(r, c)) {
        const piece = board.getPiece(r, c);
        if (piece) {
          if (piece[0] === attackingColor && (piece[1] === 'R' || piece[1] === 'Q')) {
            return true;
          }
          break; // Blocked
        }
        r += dr;
        c += dc;
      }
    }
    
    return false;
  }
}

