/**
 * Chess Board Representation
 * Simple 8x8 array with piece notation
 */

export class ChessBoard {
  constructor() {
    this.board = this.initializeBoard();
  }
  
  /**
   * Initialize board with starting position
   * Notation: 'wP' = white pawn, 'bK' = black king, null = empty
   */
  initializeBoard() {
    return [
      // Row 0 (rank 8) - Black pieces
      ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
      // Row 1 (rank 7) - Black pawns
      ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
      // Rows 2-5 - Empty squares
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      // Row 6 (rank 2) - White pawns
      ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
      // Row 7 (rank 1) - White pieces
      ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];
  }
  
  /**
   * Get piece at position
   */
  getPiece(row, col) {
    if (!this.isValidSquare(row, col)) return null;
    return this.board[row][col];
  }
  
  /**
   * Set piece at position
   */
  setPiece(row, col, piece) {
    if (!this.isValidSquare(row, col)) return false;
    this.board[row][col] = piece;
    return true;
  }
  
  /**
   * Check if square is empty
   */
  isEmpty(row, col) {
    return this.getPiece(row, col) === null;
  }
  
  /**
   * Check if square is valid (on board)
   */
  isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
  
  /**
   * Get piece color ('w' or 'b')
   */
  getPieceColor(row, col) {
    const piece = this.getPiece(row, col);
    return piece ? piece[0] : null;
  }
  
  /**
   * Get piece type ('P', 'N', 'B', 'R', 'Q', 'K')
   */
  getPieceType(row, col) {
    const piece = this.getPiece(row, col);
    return piece ? piece[1] : null;
  }
  
  /**
   * Clone the board (for move validation)
   */
  clone() {
    const newBoard = new ChessBoard();
    newBoard.board = this.board.map(row => [...row]);
    return newBoard;
  }
  
  /**
   * Clear the board
   */
  clear() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
  }
  
  /**
   * Find king position for a color
   */
  findKing(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece === `${color}K`) {
          return { row, col };
        }
      }
    }
    return null; // Should never happen in valid game
  }
}

