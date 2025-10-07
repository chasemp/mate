/**
 * Base Game Engine - Abstract interface for all board games
 * Phase 9: Multi-Game Foundation
 * 
 * Defines the common interface that all game engines must implement
 */

export class BaseGameEngine {
  constructor() {
    if (this.constructor === BaseGameEngine) {
      throw new Error('BaseGameEngine is abstract and cannot be instantiated directly');
    }
  }
  
  // ============================================================================
  // CORE GOVE METHODS (Must be implemented by all games)
  // ============================================================================
  
  /**
   * Initialize a new game
   * @returns {Object} Initial game state
   */
  newGame() {
    throw new Error('newGame() must be implemented by subclass');
  }
  
  /**
   * Get the current board state
   * @returns {Object} Board representation
   */
  getBoard() {
    throw new Error('getBoard() must be implemented by subclass');
  }
  
  /**
   * Get the current player's turn
   * @returns {string} Current turn (e.g., 'white', 'black')
   */
  getCurrentTurn() {
    throw new Error('getCurrentTurn() must be implemented by subclass');
  }
  
  /**
   * Make a move
   * @param {number} fromRow - Source row
   * @param {number} fromCol - Source column
   * @param {number} toRow - Destination row
   * @param {number} toCol - Destination column
   * @param {string} promotionPiece - Promotion piece (if applicable)
   * @returns {boolean|string} Move result (true, false, or special result)
   */
  makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    throw new Error('makeMove() must be implemented by subclass');
  }
  
  /**
   * Get legal moves for a piece
   * @param {number} row - Piece row
   * @param {number} col - Piece column
   * @returns {Array} Array of legal moves
   */
  getLegalMoves(row, col) {
    throw new Error('getLegalMoves() must be implemented by subclass');
  }
  
  /**
   * Get game status
   * @returns {string} Game status ('playing', 'check', 'checkmate', 'stalemate', 'draw')
   */
  getGameStatus() {
    throw new Error('getGameStatus() must be implemented by subclass');
  }
  
  /**
   * Get move history
   * @returns {Array} Array of moves
   */
  getMoveHistory() {
    throw new Error('getMoveHistory() must be implemented by subclass');
  }
  
  /**
   * Get captured pieces
   * @returns {Object} Captured pieces by color
   */
  getCapturedPieces() {
    throw new Error('getCapturedPieces() must be implemented by subclass');
  }
  
  /**
   * Undo last move
   * @returns {boolean} Success status
   */
  undoMove() {
    throw new Error('undoMove() must be implemented by subclass');
  }
  
  // ============================================================================
  // GAME METADATA (Must be implemented by all games)
  // ============================================================================
  
  /**
   * Get game name
   * @returns {string} Game name
   */
  getGameName() {
    throw new Error('getGameName() must be implemented by subclass');
  }
  
  /**
   * Get game description
   * @returns {string} Game description
   */
  getGameDescription() {
    throw new Error('getGameDescription() must be implemented by subclass');
  }
  
  /**
   * Get board dimensions
   * @returns {Object} {rows: number, cols: number}
   */
  getBoardDimensions() {
    throw new Error('getBoardDimensions() must be implemented by subclass');
  }
  
  /**
   * Get piece types
   * @returns {Array} Array of piece type strings
   */
  getPieceTypes() {
    throw new Error('getPieceTypes() must be implemented by subclass');
  }
  
  /**
   * Get player colors
   * @returns {Array} Array of player color strings
   */
  getPlayerColors() {
    throw new Error('getPlayerColors() must be implemented by subclass');
  }
  
  // ============================================================================
  // RENDERING SUPPORT (Must be implemented by all games)
  // ============================================================================
  
  /**
   * Get piece at position
   * @param {number} row - Row
   * @param {number} col - Column
   * @returns {string|null} Piece identifier or null
   */
  getPieceAt(row, col) {
    throw new Error('getPieceAt() must be implemented by subclass');
  }
  
  /**
   * Check if position is valid
   * @param {number} row - Row
   * @param {number} col - Column
   * @returns {boolean} Valid position
   */
  isValidPosition(row, col) {
    throw new Error('isValidPosition() must be implemented by subclass');
  }
  
  /**
   * Get square color (for alternating pattern)
   * @param {number} row - Row
   * @param {number} col - Column
   * @returns {string} Square color ('light' or 'dark')
   */
  getSquareColor(row, col) {
    throw new Error('getSquareColor() must be implemented by subclass');
  }
  
  // ============================================================================
  // AI SUPPORT (Optional - can be overridden)
  // ============================================================================
  
  /**
   * Get AI move (if supported)
   * @param {string} color - AI color
   * @param {number} skillLevel - AI skill level
   * @returns {Promise<Object>} AI move
   */
  async getAIMove(color, skillLevel) {
    throw new Error('AI not supported for this game');
  }
  
  /**
   * Check if AI is supported
   * @returns {boolean} AI support status
   */
  isAISupported() {
    return false;
  }
  
  // ============================================================================
  // SERIALIZATION (Must be implemented by all games)
  // ============================================================================
  
  /**
   * Serialize game state
   * @returns {Object} Serialized state
   */
  serialize() {
    throw new Error('serialize() must be implemented by subclass');
  }
  
  /**
   * Deserialize game state
   * @param {Object} state - Serialized state
   */
  deserialize(state) {
    throw new Error('deserialize() must be implemented by subclass');
  }
  
  // ============================================================================
  // URL SHARING (Must be implemented by all games)
  // ============================================================================
  
  /**
   * Encode game state for URL
   * @returns {string} Encoded state
   */
  encodeForURL() {
    throw new Error('encodeForURL() must be implemented by subclass');
  }
  
  /**
   * Decode game state from URL
   * @param {string} encoded - Encoded state
   * @returns {boolean} Success status
   */
  decodeFromURL(encoded) {
    throw new Error('decodeFromURL() must be implemented by subclass');
  }
  
  // ============================================================================
  // UTILITY METHODS (Common implementations)
  // ============================================================================
  
  /**
   * Get last move
   * @returns {Object|null} Last move or null
   */
  getLastMove() {
    const history = this.getMoveHistory();
    return history.length > 0 ? history[history.length - 1] : null;
  }
  
  /**
   * Check if game is over
   * @returns {boolean} Game over status
   */
  isGameOver() {
    const status = this.getGameStatus();
    return status !== 'playing' && status !== 'check';
  }
  
  /**
   * Get winner (if game is over)
   * @returns {string|null} Winner color or null
   */
  getWinner() {
    const status = this.getGameStatus();
    if (status === 'checkmate') {
      return this.getCurrentTurn() === 'white' ? 'black' : 'white';
    }
    return null;
  }
  
  /**
   * Get game result
   * @returns {string} Game result ('white-wins', 'black-wins', 'draw', 'playing')
   */
  getGameResult() {
    const status = this.getGameStatus();
    switch (status) {
      case 'checkmate':
        return this.getCurrentTurn() === 'white' ? 'black-wins' : 'white-wins';
      case 'stalemate':
      case 'draw':
        return 'draw';
      default:
        return 'playing';
    }
  }
}
