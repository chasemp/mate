/**
 * Game UI Manager - Common UI functionality for all games
 * Phase 9: Multi-Game Foundation
 * 
 * Provides shared UI components and functionality
 */

export class GameUIManager {
  constructor() {
    this.currentGame = null;
    this.gameContainer = null;
    this.gameInfo = null;
  }
  
  /**
   * Initialize UI manager
   * @param {string} gameId - Current game ID
   * @param {Object} gameInfo - Game information
   */
  init(gameId, gameInfo) {
    this.currentGame = gameId;
    this.gameInfo = gameInfo;
    this.gameContainer = document.getElementById('game-container');
    
    this.updateGameTitle();
    this.updateGameDescription();
  }
  
  /**
   * Update game title in UI
   */
  updateGameTitle() {
    const titleElement = document.getElementById('game-title');
    if (titleElement && this.gameInfo) {
      titleElement.textContent = this.gameInfo.name;
    }
  }
  
  /**
   * Update game description in UI
   */
  updateGameDescription() {
    const descElement = document.getElementById('game-description');
    if (descElement && this.gameInfo) {
      descElement.textContent = this.gameInfo.description;
    }
  }
  
  /**
   * Show game selection modal
   * @param {Array} games - Available games
   * @param {Function} onSelect - Selection callback
   */
  showGameSelection(games, onSelect) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('game-selection-modal');
    if (!modal) {
      modal = this.createGameSelectionModal();
      document.body.appendChild(modal);
    }
    
    // Populate games
    this.populateGameSelection(games);
    
    // Show modal
    modal.style.display = 'flex';
    
    // Set up selection handler
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.hideGameSelection();
      }
    };
    
    // Store callback
    modal._onSelect = onSelect;
  }
  
  /**
   * Hide game selection modal
   */
  hideGameSelection() {
    const modal = document.getElementById('game-selection-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  /**
   * Create game selection modal
   * @returns {HTMLElement} Modal element
   */
  createGameSelectionModal() {
    const modal = document.createElement('div');
    modal.id = 'game-selection-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>🎮 Choose a Game</h2>
          <button class="modal-close" onclick="this.closest('.modal').style.display='none'">&times;</button>
        </div>
        <div class="modal-body">
          <div id="game-selection-grid" class="game-selection-grid">
            <!-- Games will be populated here -->
          </div>
        </div>
      </div>
    `;
    
    return modal;
  }
  
  /**
   * Populate game selection grid
   * @param {Array} games - Available games
   */
  populateGameSelection(games) {
    const grid = document.getElementById('game-selection-grid');
    if (!grid) return;
    
    grid.innerHTML = games.map(game => `
      <div class="game-card" data-game-id="${game.id}">
        <div class="game-icon">${game.icon}</div>
        <div class="game-name">${game.name}</div>
        <div class="game-description">${game.description}</div>
        <div class="game-meta">
          <span class="game-players">👥 ${game.minPlayers}-${game.maxPlayers} players</span>
          ${game.aiSupported ? '<span class="game-ai">🤖 AI</span>' : ''}
        </div>
      </div>
    `).join('');
    
    // Add click handlers
    grid.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        const gameId = card.dataset.gameId;
        const modal = document.getElementById('game-selection-modal');
        if (modal._onSelect) {
          modal._onSelect(gameId);
        }
        this.hideGameSelection();
      });
    });
  }
  
  /**
   * Update game info display
   * @param {Object} gameState - Current game state
   */
  updateGameInfo(gameState) {
    // Update turn indicator
    const turnElement = document.getElementById('current-turn');
    if (turnElement) {
      turnElement.textContent = gameState.currentTurn;
    }
    
    // Update move count
    const moveCountElement = document.getElementById('move-count');
    if (moveCountElement) {
      moveCountElement.textContent = gameState.moveHistory.length;
    }
    
    // Update game status
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
      statusElement.textContent = this.formatGameStatus(gameState.status);
    }
  }
  
  /**
   * Format game status for display
   * @param {string} status - Game status
   * @returns {string} Formatted status
   */
  formatGameStatus(status) {
    const statusMap = {
      'playing': 'Playing',
      'check': 'Check!',
      'checkmate': 'Checkmate!',
      'stalemate': 'Stalemate',
      'draw': 'Draw'
    };
    
    return statusMap[status] || status;
  }
  
  /**
   * Show game-specific settings
   * @param {Object} gameInfo - Game information
   */
  showGameSettings(gameInfo) {
    // This would show game-specific settings
    // For now, just log
    console.log('[GameUIManager] Game settings for:', gameInfo.name);
  }
  
  /**
   * Update board dimensions for different games
   * @param {Object} dimensions - Board dimensions
   */
  updateBoardDimensions(dimensions) {
    const canvas = document.getElementById('chess-board');
    if (canvas) {
      // Update canvas size based on game dimensions
      const squareSize = Math.min(400, 500) / Math.max(dimensions.rows, dimensions.cols);
      canvas.width = dimensions.cols * squareSize;
      canvas.height = dimensions.rows * squareSize;
    }
  }
}
