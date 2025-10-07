/**
 * Games Selection Page
 * Dedicated page for choosing game types
 */

import { MultiGameApp } from './multi-game-app.js';

class GamesApp {
  constructor() {
    this.multiGameApp = new MultiGameApp();
    this.init();
  }
  
  init() {
    this.loadGames();
    this.setupEventListeners();
  }
  
  /**
   * Load and display available games
   */
  loadGames() {
    const games = this.multiGameApp.getAvailableGames();
    this.renderGames(games);
  }
  
  /**
   * Render games in the grid
   */
  renderGames(games) {
    const grid = document.getElementById('game-selection-grid');
    if (!grid) return;
    
    grid.innerHTML = games.map(game => this.renderGameCard(game)).join('');
    
    // Add click handlers
    grid.querySelectorAll('.game-card').forEach(card => {
      this.addTouchEvents(card, () => {
        const gameId = card.dataset.gameId;
        this.selectGame(gameId);
      });
    });
  }
  
  /**
   * Render individual game card
   */
  renderGameCard(game) {
    return `
      <div class="game-card" data-game-id="${game.id}">
        <div class="game-icon">${game.icon}</div>
        <div class="game-name">${game.name}</div>
        <div class="game-description">${game.description}</div>
        <div class="game-meta">
          <span class="game-players">${game.players} players</span>
          ${game.ai ? '<span class="game-ai">AI available</span>' : ''}
        </div>
      </div>
    `;
  }
  
  /**
   * Handle game selection
   */
  selectGame(gameId) {
    // Store the selected game in localStorage
    localStorage.setItem('mate-selected-game', gameId);
    
    // Navigate back to main game
    window.location.href = '/';
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Back button
    this.addTouchEvents('back-btn', () => {
      window.location.href = '/';
    });
  }
  
  /**
   * Add both click and touch events for mobile compatibility
   */
  addTouchEvents(elementId, handler) {
    const element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
    if (!element) return;
    
    // Add click event
    element.addEventListener('click', handler);
    
    // Add touch events for mobile
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handler();
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      // Prevent double-firing by only handling touchend
    }, { passive: false });
  }
}

// Initialize the games app
document.addEventListener('DOMContentLoaded', () => {
  new GamesApp();
});
