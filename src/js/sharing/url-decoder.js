/**
 * URL Decoder
 * Restores chess game state from shared URLs
 */

import { ChessEngine } from '../game/chess-engine.js';

export class URLDecoder {
  constructor() {
    this.engine = new ChessEngine();
  }

  /**
   * Decode and validate game from URL
   * @param {string} gameId - Game ID
   * @param {Array<string>} moves - Array of move notations
   * @returns {Object} {valid: boolean, engine: ChessEngine, error: string}
   */
  decodeGame(gameId, moves) {
    try {
      // Create fresh game
      this.engine.newGame();

      // Replay all moves
      for (let i = 0; i < moves.length; i++) {
        const notation = moves[i];
        
        // Handle castling
        if (notation === 'O-O' || notation === 'O-O-O') {
          const success = this.applyCastling(notation);
          if (!success) {
            return {
              valid: false,
              error: `Invalid castling at move ${i + 1}: ${notation}`,
              engine: null
            };
          }
          continue;
        }

        // Parse and apply regular move
        const success = this.applyMoveFromNotation(notation);
        if (!success) {
          return {
            valid: false,
            error: `Invalid move at position ${i + 1}: ${notation}`,
            engine: null
          };
        }
      }

      return {
        valid: true,
        engine: this.engine,
        gameId: gameId,
        moveCount: moves.length,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        engine: null
      };
    }
  }

  /**
   * Apply castling move
   */
  applyCastling(notation) {
    const currentTurn = this.engine.getCurrentTurn();
    const row = currentTurn === 'white' ? 7 : 0;
    const side = notation === 'O-O' ? 'kingside' : 'queenside';
    
    // Try to execute castling
    return this.engine.makeMove(row, 4, row, side === 'kingside' ? 6 : 2);
  }

  /**
   * Apply move from algebraic notation
   */
  applyMoveFromNotation(notation) {
    const currentTurn = this.engine.getCurrentTurn();
    const board = this.engine.getBoard();
    const color = currentTurn[0];

    // Check for promotion (e8Q, e8=Q, e1=Q)
    const promotionMatch = notation.match(/([a-h][18])=?([QRBN])/);
    if (promotionMatch) {
      const toSquare = promotionMatch[1];
      const promotion = promotionMatch[2];
      const to = this.squareToPosition(toSquare);
      
      // Find the pawn
      const fromCol = toSquare.charCodeAt(0) - 97;
      const fromRow = currentTurn === 'white' ? 1 : 6;
      
      return this.engine.makeMove(fromRow, fromCol, to.row, to.col, promotion);
    }

    // Parse move components
    let piece = 'P';
    let toSquare = '';
    let fromFile = null;
    let fromRank = null;
    let isCapture = false;

    // Handle pawn captures (exd5)
    const pawnCaptureMatch = notation.match(/^([a-h])x([a-h][1-8])$/);
    if (pawnCaptureMatch) {
      piece = 'P';
      fromFile = pawnCaptureMatch[1];
      toSquare = pawnCaptureMatch[2];
      isCapture = true;
    } else {
      // Regular piece move (Nf3, Bxe5, Nbd2, R1a3)
      const moveMatch = notation.match(/^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])$/);
      if (moveMatch) {
        piece = moveMatch[1] || 'P';
        fromFile = moveMatch[2];
        fromRank = moveMatch[3];
        isCapture = !!moveMatch[4];
        toSquare = moveMatch[5];
      } else {
        // Simple pawn move (e4, d5)
        if (notation.match(/^[a-h][1-8]$/)) {
          toSquare = notation;
          piece = 'P';
        } else {
          console.error('Cannot parse notation:', notation);
          return false;
        }
      }
    }

    const to = this.squareToPosition(toSquare);
    
    // Find the piece that can make this move
    const from = this.findPieceForMove(
      board,
      color + piece,
      to,
      fromFile,
      fromRank,
      currentTurn
    );

    if (!from) {
      console.error('Cannot find piece for move:', notation);
      return false;
    }

    // Make the move
    return this.engine.makeMove(from.row, from.col, to.row, to.col);
  }

  /**
   * Find piece that can make the specified move
   */
  findPieceForMove(board, pieceType, to, fromFile, fromRank, currentTurn) {
    const candidates = [];

    // Scan board for matching pieces
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board.getPiece(row, col);
        if (piece !== pieceType) continue;

        // Check file/rank disambiguation
        if (fromFile && String.fromCharCode(97 + col) !== fromFile) continue;
        if (fromRank && (8 - row).toString() !== fromRank) continue;

        // Check if this piece can legally move to target
        const legalMoves = this.engine.getLegalMoves(row, col);
        const canMove = legalMoves.some(m => m.row === to.row && m.col === to.col);

        if (canMove) {
          candidates.push({ row, col });
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    // Multiple candidates - need disambiguation
    console.warn('Multiple candidates for move, using first:', candidates);
    return candidates[0];
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
   * Validate game URL format
   */
  static isValidGameUrl(url) {
    return /\/m\/[a-z0-9]{4}(?:-[a-zA-Z0-9\-]+)?$/.test(url);
  }

  /**
   * Extract game info from URL without full decode
   */
  static getGameInfo(url) {
    const match = url.match(/\/m\/([a-z0-9]{4})(?:-(.+))?$/);
    if (!match) return null;

    const gameId = match[1];
    const movesStr = match[2] || '';
    const moves = movesStr ? movesStr.split('-') : [];

    return {
      gameId,
      moveCount: moves.length,
      lastMove: moves[moves.length - 1] || null
    };
  }
}

