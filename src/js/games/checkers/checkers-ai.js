/**
 * Checkers AI - Minimax algorithm implementation
 * Phase 10: Checkers Implementation
 * 
 * Provides AI opponent for checkers using minimax with alpha-beta pruning
 */

export class CheckersAI {
  constructor(gameEngine, skillLevel = 5) {
    this.gameEngine = gameEngine;
    this.skillLevel = Math.max(1, Math.min(10, skillLevel));
    this.maxDepth = Math.floor(this.skillLevel / 2) + 2; // 3-7 depth levels
    this.evaluatedPositions = 0;
  }
  
  /**
   * Get the best move for the AI
   * @param {string} color - AI color ('red' or 'black')
   * @returns {Object|null} Best move or null if no moves available
   */
  async getBestMove(color) {
    this.evaluatedPositions = 0;
    const startTime = performance.now();
    
    // Get all possible moves for the AI
    const allMoves = this.getAllMovesForColor(color);
    if (allMoves.length === 0) {
      return null;
    }
    
    // If only one move, return it
    if (allMoves.length === 1) {
      return allMoves[0];
    }
    
    // Use minimax with alpha-beta pruning
    let bestMove = null;
    let bestScore = color === 'red' ? -Infinity : Infinity;
    
    for (const move of allMoves) {
      // Make the move
      const originalBoard = this.gameEngine.board.map(row => [...row]);
      const originalTurn = this.gameEngine.currentTurn;
      const originalStatus = this.gameEngine.gameStatus;
      
      this.gameEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
      
      // Evaluate the position
      const score = this.minimax(this.maxDepth - 1, false, -Infinity, Infinity);
      
      // Restore the board
      this.gameEngine.board = originalBoard;
      this.gameEngine.currentTurn = originalTurn;
      this.gameEngine.gameStatus = originalStatus;
      
      // Update best move
      if (color === 'red') {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
    
    const endTime = performance.now();
    console.log(`[CheckersAI] Evaluated ${this.evaluatedPositions} positions in ${(endTime - startTime).toFixed(2)}ms`);
    
    return bestMove;
  }
  
  /**
   * Minimax algorithm with alpha-beta pruning
   * @param {number} depth - Remaining depth
   * @param {boolean} isMaximizing - Whether this is a maximizing player
   * @param {number} alpha - Alpha value for pruning
   * @param {number} beta - Beta value for pruning
   * @returns {number} Evaluation score
   */
  minimax(depth, isMaximizing, alpha, beta) {
    this.evaluatedPositions++;
    
    // Terminal conditions
    if (depth === 0) {
      return this.evaluatePosition();
    }
    
    const currentColor = isMaximizing ? 'red' : 'black';
    const allMoves = this.getAllMovesForColor(currentColor);
    
    if (allMoves.length === 0) {
      // No moves available - check if it's a win/loss
      const status = this.gameEngine.getGameStatus();
      if (status === 'checkmate') {
        return isMaximizing ? -1000 : 1000;
      }
      return 0; // Stalemate
    }
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      
      for (const move of allMoves) {
        // Make move
        const originalBoard = this.gameEngine.board.map(row => [...row]);
        const originalTurn = this.gameEngine.currentTurn;
        const originalStatus = this.gameEngine.gameStatus;
        
        this.gameEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
        
        // Recurse
        const eval = this.minimax(depth - 1, false, alpha, beta);
        maxEval = Math.max(maxEval, eval);
        
        // Restore board
        this.gameEngine.board = originalBoard;
        this.gameEngine.currentTurn = originalTurn;
        this.gameEngine.gameStatus = originalStatus;
        
        // Alpha-beta pruning
        alpha = Math.max(alpha, eval);
        if (beta <= alpha) {
          break;
        }
      }
      
      return maxEval;
    } else {
      let minEval = Infinity;
      
      for (const move of allMoves) {
        // Make move
        const originalBoard = this.gameEngine.board.map(row => [...row]);
        const originalTurn = this.gameEngine.currentTurn;
        const originalStatus = this.gameEngine.gameStatus;
        
        this.gameEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
        
        // Recurse
        const eval = this.minimax(depth - 1, true, alpha, beta);
        minEval = Math.min(minEval, eval);
        
        // Restore board
        this.gameEngine.board = originalBoard;
        this.gameEngine.currentTurn = originalTurn;
        this.gameEngine.gameStatus = originalStatus;
        
        // Alpha-beta pruning
        beta = Math.min(beta, eval);
        if (beta <= alpha) {
          break;
        }
      }
      
      return minEval;
    }
  }
  
  /**
   * Evaluate the current board position
   * @returns {number} Evaluation score (positive favors red, negative favors black)
   */
  evaluatePosition() {
    let score = 0;
    
    // Count pieces and their values
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.gameEngine.board[row][col];
        if (!piece) continue;
        
        const isRed = piece.startsWith('red');
        const isKing = piece.includes('king');
        const pieceValue = isKing ? 3 : 1; // Kings are worth more
        const positionValue = this.getPositionValue(row, col, isRed);
        
        if (isRed) {
          score += pieceValue + positionValue;
        } else {
          score -= pieceValue + positionValue;
        }
      }
    }
    
    // Bonus for captures
    const redCaptures = this.gameEngine.capturedPieces.red.length;
    const blackCaptures = this.gameEngine.capturedPieces.black.length;
    score += (redCaptures - blackCaptures) * 0.5;
    
    // Bonus for center control
    score += this.getCenterControl('red') * 0.3;
    score -= this.getCenterControl('black') * 0.3;
    
    // Bonus for king promotion
    score += this.getKingPromotionBonus('red') * 2;
    score -= this.getKingPromotionBonus('black') * 2;
    
    return score;
  }
  
  /**
   * Get position value for a piece
   * @param {number} row - Row
   * @param {number} col - Column
   * @param {boolean} isRed - Whether piece is red
   * @returns {number} Position value
   */
  getPositionValue(row, col, isRed) {
    // Center positions are more valuable
    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
    const centerValue = (7 - centerDistance) * 0.1;
    
    // Back row is valuable for defense
    const backRowValue = (isRed && row === 0) || (!isRed && row === 7) ? 0.2 : 0;
    
    // Side positions are less valuable (can be trapped)
    const sideValue = (col === 0 || col === 7) ? -0.1 : 0;
    
    return centerValue + backRowValue + sideValue;
  }
  
  /**
   * Get center control bonus
   * @param {string} color - Piece color
   * @returns {number} Center control value
   */
  getCenterControl(color) {
    let control = 0;
    const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
    
    for (const [row, col] of centerSquares) {
      const piece = this.gameEngine.board[row][col];
      if (piece && piece.startsWith(color)) {
        control += 1;
      }
    }
    
    return control;
  }
  
  /**
   * Get king promotion bonus
   * @param {string} color - Piece color
   * @returns {number} Promotion bonus
   */
  getKingPromotionBonus(color) {
    let bonus = 0;
    const promotionRow = color === 'red' ? 7 : 0;
    
    for (let col = 0; col < 8; col++) {
      const piece = this.gameEngine.board[promotionRow][col];
      if (piece === color) {
        bonus += 1;
      }
    }
    
    return bonus;
  }
  
  /**
   * Get all possible moves for a color
   * @param {string} color - Piece color
   * @returns {Array} Array of moves
   */
  getAllMovesForColor(color) {
    const moves = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.gameEngine.board[row][col];
        if (piece && piece.startsWith(color)) {
          const legalMoves = this.gameEngine.getLegalMoves(row, col);
          for (const move of legalMoves) {
            moves.push({
              from: { row, col },
              to: { row: move.row, col: move.col },
              type: move.type,
              captured: move.captured
            });
          }
        }
      }
    }
    
    return moves;
  }
  
  /**
   * Set AI skill level
   * @param {number} level - Skill level (1-10)
   */
  setSkillLevel(level) {
    this.skillLevel = Math.max(1, Math.min(10, level));
    this.maxDepth = Math.floor(this.skillLevel / 2) + 2;
  }
  
  /**
   * Get AI statistics
   * @returns {Object} AI statistics
   */
  getStats() {
    return {
      skillLevel: this.skillLevel,
      maxDepth: this.maxDepth,
      evaluatedPositions: this.evaluatedPositions
    };
  }
}
