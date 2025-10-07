/**
 * URL Encoder
 * Compresses chess game state into short, SMS-friendly URLs
 * 
 * Format: mate.523.life/m/g4f2-e4-e5-Nf3
 *         ├─────────────┤ │  │    └─ Moves in algebraic notation
 *         │              │  └────── Game ID (4 chars, Base36)
 *         │              └───────── 'm' = multiplayer prefix
 *         └────────────────────── Domain
 */

export class URLEncoder {
  constructor() {
    this.base36Chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  }

  /**
   * Generate a unique game ID (4 characters, Base36)
   * @returns {string} Game ID like "g4f2"
   */
  generateGameId() {
    const timestamp = Date.now() % 1679616; // Keep it within 4 chars of base36
    return this.toBase36(timestamp, 4);
  }

  /**
   * Convert number to base36
   */
  toBase36(num, minLength = 1) {
    let result = '';
    let n = num;
    
    do {
      result = this.base36Chars[n % 36] + result;
      n = Math.floor(n / 36);
    } while (n > 0);
    
    // Pad with zeros if needed
    while (result.length < minLength) {
      result = '0' + result;
    }
    
    return result;
  }

  /**
   * Convert base36 to number
   */
  fromBase36(str) {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      const digit = this.base36Chars.indexOf(str[i].toLowerCase());
      if (digit === -1) throw new Error('Invalid base36 character');
      result = result * 36 + digit;
    }
    return result;
  }

  /**
   * Encode move to compact notation
   * @param {Object} move - Move object from game history
   * @returns {string} Compact move notation (e.g., "e4", "Nf3", "O-O", "e8Q")
   */
  encodeMove(move) {
    // Handle castling
    if (move.castle) {
      return move.castle === 'kingside' || move.notation === 'O-O' ? 'O-O' : 'O-O-O';
    }

    // Use the algebraic notation from the move history
    if (move.notation) {
      return move.notation;
    }

    // Fallback: construct from move data
    const fromSquare = this.positionToSquare(move.from.row, move.from.col);
    const toSquare = this.positionToSquare(move.to.row, move.to.col);
    const piece = move.piece[1]; // K, Q, R, B, N, P
    const capture = move.captured ? 'x' : '';
    
    if (piece === 'P') {
      // Pawn moves
      if (capture) {
        return fromSquare[0] + capture + toSquare; // exd5
      }
      return toSquare; // e4
    }
    
    // Piece moves
    return piece + capture + toSquare; // Nf3, Bxe5
  }

  /**
   * Decode move from compact notation
   * @param {string} notation - Compact notation (e.g., "e4", "Nf3")
   * @returns {Object} Move descriptor {from, to, piece, promotion}
   */
  decodeMove(notation, board, currentTurn) {
    // Handle castling
    if (notation === 'O-O' || notation === 'O-O-O') {
      const row = currentTurn === 'white' ? 7 : 0;
      return {
        type: 'castle',
        side: notation === 'O-O' ? 'kingside' : 'queenside',
        from: { row, col: 4 },
        to: { row, col: notation === 'O-O' ? 6 : 2 }
      };
    }

    // Parse algebraic notation
    const color = currentTurn[0];
    let piece = 'P';
    let toSquare = '';
    let fromFile = null;
    let fromRank = null;
    let promotion = null;
    
    // Check for promotion (e8Q, e8=Q)
    const promotionMatch = notation.match(/([a-h][18])=?([QRBN])/);
    if (promotionMatch) {
      toSquare = promotionMatch[1];
      promotion = promotionMatch[2];
      piece = 'P';
    } else {
      // Piece move: Nf3, Bxe5, exd5
      const moveMatch = notation.match(/^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])$/);
      if (moveMatch) {
        piece = moveMatch[1] || 'P';
        fromFile = moveMatch[2];
        fromRank = moveMatch[3];
        toSquare = moveMatch[5];
      } else {
        // Simple pawn move: e4
        toSquare = notation;
      }
    }

    const to = this.squareToPosition(toSquare);
    
    // Find which piece can make this move
    const from = this.findPieceForMove(board, color + piece, to, fromFile, fromRank);
    
    return { from, to, piece: color + piece, promotion };
  }

  /**
   * Find which piece of the given type can move to the target square
   */
  findPieceForMove(board, piece, to, fromFile, fromRank) {
    // Scan board for matching pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = board.getPiece(row, col);
        if (p !== piece) continue;
        
        // Check file/rank disambiguation
        if (fromFile && String.fromCharCode(97 + col) !== fromFile) continue;
        if (fromRank && (8 - row).toString() !== fromRank) continue;
        
        // Check if this piece can move to target
        // (This is simplified - in production, use full legal move validation)
        return { row, col };
      }
    }
    
    throw new Error(`Cannot find ${piece} that can move to target`);
  }

  /**
   * Convert position to square notation (e.g., e2)
   */
  positionToSquare(row, col) {
    const file = String.fromCharCode(97 + col); // a-h
    const rank = 8 - row; // 1-8
    return file + rank;
  }

  /**
   * Convert square notation to position
   */
  squareToPosition(square) {
    const file = square.charCodeAt(0) - 97; // a-h → 0-7
    const rank = 8 - parseInt(square[1]); // 1-8 → 7-0
    return { row: rank, col: file };
  }

  /**
   * Encode entire game state to URL
   * @param {Array} moveHistory - Array of move objects
   * @param {string} gameId - Optional game ID (generates if not provided)
   * @returns {string} Shareable URL
   */
  encodeGameState(moveHistory, gameId = null) {
    if (!gameId) {
      gameId = this.generateGameId();
    }

    // Encode moves
    const moves = moveHistory.map(move => this.encodeMove(move)).join('-');
    
    // Build URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/m/${gameId}-${moves}`;
  }

  /**
   * Decode game state from URL
   * @param {string} url - Full URL or path
   * @returns {Object} {gameId, moves: Array<string>}
   */
  decodeGameState(url) {
    // Extract path from URL
    let path = url;
    if (url.includes('://')) {
      const urlObj = new URL(url);
      path = urlObj.pathname;
    }

    // Parse path: /m/g4f2-e4-e5-Nf3
    const match = path.match(/\/m\/([a-z0-9]{4})(?:-(.+))?$/);
    if (!match) {
      throw new Error('Invalid game URL format');
    }

    const gameId = match[1];
    const movesStr = match[2] || '';
    const moves = movesStr ? movesStr.split('-') : [];

    return { gameId, moves };
  }

  /**
   * Create shareable text for messaging
   */
  createShareMessage(url, currentTurn) {
    const opponent = currentTurn === 'white' ? 'Black' : 'White';
    return `♟️ Your turn! ${opponent} to move.\n\nPlay here: ${url}`;
  }

  /**
   * Estimate URL length
   */
  estimateUrlLength(moveCount) {
    // Base: mate.523.life/m/g4f2 = ~26 chars
    // Each move: ~3-5 chars + 1 dash
    const baseLength = 26;
    const avgMoveLength = 4;
    return baseLength + (moveCount * avgMoveLength);
  }
}

