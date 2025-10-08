/**
 * Competitors Page Application
 * Manages ongoing and completed games with opponents
 */
class CompetitorsApp {
  constructor() {
    this.games = [];
    this.filteredGames = [];
    this.currentGameId = null;
    
    this.init();
  }

  init() {
    this.loadGames();
    this.setupEventListeners();
    this.renderGames();
  }

  /**
   * Load games from localStorage
   */
  loadGames() {
    const gamesData = localStorage.getItem('mate-games');
    if (gamesData) {
      try {
        this.games = JSON.parse(gamesData);
      } catch (error) {
        console.error('Error loading games:', error);
        this.games = [];
      }
    }
    
    // Sort by last played date (most recent first)
    this.games.sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
    this.filteredGames = [...this.games];
  }

  /**
   * Save games to localStorage
   */
  saveGames() {
    localStorage.setItem('mate-games', JSON.stringify(this.games));
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Filter controls
    document.getElementById('game-type-filter').addEventListener('change', () => this.applyFilters());
    document.getElementById('status-filter').addEventListener('change', () => this.applyFilters());
    document.getElementById('sort-by').addEventListener('change', () => this.applyFilters());

    // New game button
    document.getElementById('new-game-btn').addEventListener('click', () => {
      window.location.href = '/games.html';
    });

    // Start first game button
    document.getElementById('start-first-game').addEventListener('click', () => {
      window.location.href = '/games.html';
    });

    // Modal controls
    document.getElementById('close-game-details').addEventListener('click', () => {
      this.closeGameDetailsModal();
    });

    // Game action buttons
    document.getElementById('resume-game').addEventListener('click', () => this.resumeGame());
    document.getElementById('replay-game').addEventListener('click', () => this.replayGame());
    document.getElementById('share-game').addEventListener('click', () => this.shareGame());
    document.getElementById('delete-game').addEventListener('click', () => this.deleteGame());

    // Close modal on backdrop click
    document.getElementById('game-details-modal').addEventListener('click', (e) => {
      if (e.target.id === 'game-details-modal') {
        this.closeGameDetailsModal();
      }
    });
  }

  /**
   * Apply filters and sorting
   */
  applyFilters() {
    const gameTypeFilter = document.getElementById('game-type-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const sortBy = document.getElementById('sort-by').value;

    // Filter games
    this.filteredGames = this.games.filter(game => {
      const gameTypeMatch = gameTypeFilter === 'all' || game.gameType === gameTypeFilter;
      const statusMatch = statusFilter === 'all' || game.status === statusFilter;
      return gameTypeMatch && statusMatch;
    });

    // Sort games
    this.filteredGames.sort((a, b) => {
      switch (sortBy) {
        case 'opponent':
          return a.opponent.localeCompare(b.opponent);
        case 'game-name':
          return a.gameName.localeCompare(b.gameName);
        case 'created':
          return new Date(b.created) - new Date(a.created);
        case 'moves':
          return b.moveCount - a.moveCount;
        case 'last-played':
        default:
          return new Date(b.lastPlayed) - new Date(a.lastPlayed);
      }
    });

    this.renderGames();
  }

  /**
   * Render games list
   */
  renderGames() {
    const gamesList = document.getElementById('games-list');
    const emptyState = document.getElementById('empty-state');

    if (this.filteredGames.length === 0) {
      gamesList.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    gamesList.style.display = 'block';
    emptyState.style.display = 'none';

    gamesList.innerHTML = this.filteredGames.map(game => this.createGameCard(game)).join('');
  }

  /**
   * Create game card HTML
   */
  createGameCard(game) {
    const statusClass = `status-${game.status}`;
    const gameIcon = this.getGameIcon(game.gameType);
    const lastPlayed = this.formatDate(game.lastPlayed);
    const created = this.formatDate(game.created);

    return `
      <div class="game-card ${statusClass}" data-game-id="${game.id}">
        <div class="game-card-header">
          <div class="game-icon">${gameIcon}</div>
          <div class="game-info">
            <h3 class="game-name">${game.gameName}</h3>
            <p class="game-opponent">vs ${game.opponent}</p>
          </div>
          <div class="game-status">
            <span class="status-badge ${statusClass}">${this.getStatusText(game.status)}</span>
          </div>
        </div>
        
        <div class="game-card-body">
          <div class="game-details">
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${this.getGameTypeName(game.gameType)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Moves:</span>
              <span class="detail-value">${game.moveCount || 0}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Last Played:</span>
              <span class="detail-value">${lastPlayed}</span>
            </div>
          </div>
        </div>
        
        <div class="game-card-actions">
          <button class="btn-small btn-primary" onclick="competitorsApp.showGameDetails('${game.id}')">
            View Details
          </button>
          <button class="btn-small btn-secondary" onclick="competitorsApp.resumeGame('${game.id}')">
            ${game.status === 'completed' ? 'Replay' : 'Resume'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Show game details modal
   */
  showGameDetails(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    this.currentGameId = gameId;

    // Populate modal with game data
    document.getElementById('modal-game-name').textContent = game.gameName;
    document.getElementById('modal-opponent').textContent = game.opponent;
    document.getElementById('modal-game-type').textContent = this.getGameTypeName(game.gameType);
    document.getElementById('modal-status').textContent = this.getStatusText(game.status);
    document.getElementById('modal-moves').textContent = game.moveCount || 0;
    document.getElementById('modal-last-played').textContent = this.formatDate(game.lastPlayed);
    document.getElementById('modal-created').textContent = this.formatDate(game.created);

    // Show/hide action buttons based on game status
    const resumeBtn = document.getElementById('resume-game');
    const replayBtn = document.getElementById('replay-game');
    
    if (game.status === 'completed') {
      resumeBtn.style.display = 'none';
      replayBtn.style.display = 'inline-block';
      replayBtn.textContent = 'Replay Game';
    } else {
      resumeBtn.style.display = 'inline-block';
      replayBtn.style.display = 'none';
    }

    // Show modal
    document.getElementById('game-details-modal').style.display = 'flex';
  }

  /**
   * Close game details modal
   */
  closeGameDetailsModal() {
    document.getElementById('game-details-modal').style.display = 'none';
    this.currentGameId = null;
  }

  /**
   * Resume a game
   */
  resumeGame(gameId = null) {
    const id = gameId || this.currentGameId;
    if (!id) return;

    const game = this.games.find(g => g.id === id);
    if (!game) return;

    // Set current game in localStorage
    localStorage.setItem('mate-current-game-id', id);
    localStorage.setItem('mate-current-game-name', game.gameName);
    localStorage.setItem('mate-current-opponent', game.opponent);
    localStorage.setItem('mate-game-mode', 'remote');

    // Navigate to game
    window.location.href = '/';
  }

  /**
   * Replay a completed game
   */
  replayGame() {
    if (!this.currentGameId) return;

    const game = this.games.find(g => g.id === this.currentGameId);
    if (!game) return;

    // Set up replay mode
    localStorage.setItem('mate-replay-game-id', this.currentGameId);
    localStorage.setItem('mate-replay-mode', 'true');

    // Navigate to game
    window.location.href = '/';
  }

  /**
   * Share a game
   */
  shareGame() {
    if (!this.currentGameId) return;

    const game = this.games.find(g => g.id === this.currentGameId);
    if (!game) return;

    // Generate share URL
    const shareUrl = `${window.location.origin}/?shared-game=${game.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Chess Game: ${game.gameName}`,
        text: `Check out this ${this.getGameTypeName(game.gameType)} game: ${game.gameName}`,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Game link copied to clipboard!');
      });
    }
  }

  /**
   * Delete a game
   */
  deleteGame() {
    if (!this.currentGameId) return;

    if (confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      this.games = this.games.filter(g => g.id !== this.currentGameId);
      this.saveGames();
      this.applyFilters();
      this.closeGameDetailsModal();
    }
  }

  /**
   * Get game icon
   */
  getGameIcon(gameType) {
    const icons = {
      chess: '♔',
      checkers: '●',
      othello: '⚫',
      breakthrough: '♟',
      go: '⚫'
    };
    return icons[gameType] || '🎮';
  }

  /**
   * Get game type display name
   */
  getGameTypeName(gameType) {
    const names = {
      chess: 'Chess',
      checkers: 'Checkers',
      othello: 'Othello',
      breakthrough: 'Breakthrough',
      go: 'Go'
    };
    return names[gameType] || gameType;
  }

  /**
   * Get status display text
   */
  getStatusText(status) {
    const statuses = {
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'paused': 'Paused'
    };
    return statuses[status] || status;
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Initialize the app when the page loads
let competitorsApp;
document.addEventListener('DOMContentLoaded', () => {
  competitorsApp = new CompetitorsApp();
});
