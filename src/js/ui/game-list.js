/**
 * Game List UI Component
 * Shows all active games with opponent names
 */

import { MultiGameStorage } from '../storage/multi-game-storage.js';

export class GameListUI {
  constructor(chessApp) {
    this.app = chessApp;
    this.storage = new MultiGameStorage();
  }
  
  /**
   * Show game list modal
   */
  show() {
    let modal = document.getElementById('game-list-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'game-list-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }
    
    const games = this.storage.getGamesList();
    const myTurnGames = this.storage.getMyTurnGames();
    const waitingGames = this.storage.getWaitingGames();
    const activeGameId = this.storage.getActiveGameId();
    
    modal.innerHTML = `
      <div class="modal-content game-list-content">
        <div class="modal-header">
          <h2>🎮 Your Chess Games</h2>
          <button class="modal-close" onclick="document.getElementById('game-list-modal').style.display='none'">×</button>
        </div>
        
        <div class="game-stats">
          <div class="stat">
            <span class="stat-number">${myTurnGames.length}</span>
            <span class="stat-label">Your Turn</span>
          </div>
          <div class="stat">
            <span class="stat-number">${waitingGames.length}</span>
            <span class="stat-label">Waiting</span>
          </div>
          <div class="stat">
            <span class="stat-number">${games.length}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        
        ${games.length === 0 ? `
          <div class="empty-state">
            <p style="font-size: 48px;">♟️</p>
            <p>No active games yet!</p>
            <button class="btn-primary" onclick="window.app.gameListUI.startNewGame(); document.getElementById('game-list-modal').style.display='none';">Start Your First Game</button>
          </div>
        ` : `
          <div class="games-container">
            ${games.map(game => this.renderGameCard(game, activeGameId)).join('')}
          </div>
        `}
        
        <div class="modal-actions">
          <button class="btn-primary" onclick="window.app.gameListUI.startNewGame()">+ New Game</button>
          <button class="btn-secondary" onclick="document.getElementById('game-list-modal').style.display='none'">Close</button>
        </div>
      </div>
    `;
    
    modal.style.display = 'flex';
  }
  
  /**
   * Render individual game card
   */
  renderGameCard(game, activeGameId) {
    const isActive = game.id === activeGameId;
    const displayName = this.storage.getGameDisplayName(game);
    const timeSince = this.storage.getTimeSinceUpdate(game);
    
    // Status indicators
    let statusIcon = game.myTurn ? '🎮' : '⏳';
    let statusText = game.myTurn ? 'Your turn!' : 'Waiting for opponent';
    let statusClass = game.myTurn ? 'my-turn' : 'waiting';
    
    if (game.status === 'check') {
      statusIcon = '⚠️';
      statusText = game.myTurn ? 'You are in check!' : 'Opponent in check';
      statusClass = 'check';
    } else if (game.status === 'checkmate') {
      statusIcon = '🏆';
      statusText = 'Game over - Checkmate';
      statusClass = 'finished';
    } else if (game.status === 'stalemate') {
      statusIcon = '🤝';
      statusText = 'Game over - Draw';
      statusClass = 'finished';
    }
    
    // Color indicator
    const colorEmoji = game.myColor === 'white' ? '♔' : '♚';
    
    return `
      <div class="game-card ${isActive ? 'active' : ''} ${statusClass}" 
           onclick="window.app.gameListUI.switchToGame('${game.id}')">
        <div class="game-card-header">
          <div class="game-opponent">
            <span class="opponent-name">${displayName}</span>
            <button class="edit-name-btn" 
                    onclick="event.stopPropagation(); window.app.gameListUI.editOpponentName('${game.id}')">
              ✏️
            </button>
          </div>
          <span class="game-time">${timeSince}</span>
        </div>
        
        <div class="game-card-body">
          <div class="game-info">
            <span class="game-color">${colorEmoji} ${game.myColor}</span>
            <span class="game-moves">Move ${game.moveCount}</span>
            <span class="game-id">#${game.id}</span>
          </div>
          
          <div class="game-status ${statusClass}">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-text">${statusText}</span>
          </div>
        </div>
        
        <div class="game-card-actions">
          ${isActive ? '<span class="active-badge">▶ Active</span>' : ''}
          <button class="btn-danger-small" 
                  onclick="event.stopPropagation(); window.app.gameListUI.deleteGame('${game.id}')">
            🗑️
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Switch to different game
   */
  switchToGame(gameId) {
    this.storage.setActiveGame(gameId);
    const game = this.storage.getGame(gameId);
    
    if (game) {
      // Load game state into engine
      this.app.loadGameFromStorage(game);
      
      // Close modal
      document.getElementById('game-list-modal').style.display = 'none';
      
      this.app.showNotification(`Switched to game vs ${game.opponentName}`);
    }
  }
  
  /**
   * Edit opponent name
   */
  editOpponentName(gameId) {
    const game = this.storage.getGame(gameId);
    if (!game) return;
    
    const currentName = game.opponentName || 'Opponent';
    const newName = prompt(`Enter nickname for your opponent:`, currentName);
    
    if (newName && newName.trim()) {
      // Optional: also let them pick an emoji
      const emoji = prompt(`Choose an emoji (optional):`, game.opponentEmoji || '🎮');
      
      this.storage.setOpponentName(gameId, newName.trim(), emoji);
      this.show(); // Refresh the list
      
      this.app.showNotification(`Opponent renamed to ${emoji} ${newName.trim()}`);
    }
  }
  
  /**
   * Delete game with confirmation
   */
  deleteGame(gameId) {
    const game = this.storage.getGame(gameId);
    if (!game) return;
    
    const displayName = this.storage.getGameDisplayName(game);
    
    if (confirm(`Delete game vs ${displayName}?\n\nThis cannot be undone!`)) {
      this.storage.deleteGame(gameId);
      this.show(); // Refresh the list
      
      this.app.showNotification(`Game vs ${game.opponentName} deleted`);
    }
  }
  
  /**
   * Start new game from list
   */
  startNewGame() {
    document.getElementById('game-list-modal').style.display = 'none';
    
    // Ask for opponent name upfront
    const opponentName = prompt('Who are you playing against?', '');
    const emoji = prompt('Pick an emoji for them (optional):', '🎮');
    
    const myColor = confirm('Do you want to play as White?\n\nOK = White, Cancel = Black') 
      ? 'white' : 'black';
    
    const game = this.storage.createGame(myColor, opponentName || 'Opponent');
    
    if (emoji) {
      this.storage.setOpponentName(game.id, game.opponentName, emoji);
    }
    
    // Reset board for new game
    this.app.engine.newGame();
    this.app.lastMove = null;
    this.app.selectedSquare = null;
    this.app.legalMoves = [];
    this.app.render();
    
    const displayName = this.storage.getGameDisplayName(game);
    this.app.showNotification(`New game started vs ${displayName}! Game ID: ${game.id}`);
  }
  
  /**
   * Hide game list
   */
  hide() {
    const modal = document.getElementById('game-list-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}

